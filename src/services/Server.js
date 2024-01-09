require("dotenv").config();
const jwt = require("jsonwebtoken");
const express = require("express");
const crypto = require("crypto");

const axios = require("axios");
const app = express();
const db = require("./DataBase.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const { googleAuth } = require("./API.js");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
const path = require("path");
const boardRouter = require("./Board.js"); // 게시판 라우터
const commentRouter = require("./Comment.js"); // 댓글 라우터

app.use("/board", boardRouter); // '/board' 경로로 들어오는 요청을 boardRouter가 처리
app.use("/comment", commentRouter); // '/comment' 경로로 들어오는 요청을 commentRouter가 처리
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const connection = db;

connection.connect((error) => {
  if (error) {
    console.error("MySQL 연결 오류:", error);
  } else {
    console.log("MySQL에 연결되었습니다.");
  }
});

app.listen(4000, () => {
  console.log("서버가 시작되었습니다.");
});

// Users 테이블 생성
const createUsersTable = () => {
  const query = `
    CREATE TABLE IF NOT EXISTS Users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      nickname VARCHAR(255) NOT NULL,
      picture VARCHAR(255)
    )
  `;
  connection.query(query, (error) => {
    if (error) {
      console.error("Users 테이블 생성 오류:", error);
    } else {
      console.log("Users 테이블이 생성되었습니다.");
    }
  });
};

createUsersTable();

// 로그인 API
app.post("/login", (req, res) => {
  if (!req.body.username) {
    res.status(400).json({ message: "username이 제공되지 않았습니다." });
    return;
  }

  const { username, password } = req.body;

  // MySQL 데이터베이스 쿼리 실행 예시
  const query = `SELECT * FROM users WHERE username = ?`;
  connection.query(query, [username], async (error, results) => {
    if (error) {
      console.error("쿼리 실행 오류:", error);
      res.status(500).json({ message: "서버 오류가 발생했습니다." });
    } else {
      if (results.length > 0) {
        const user = results[0];
        const hashedPassword = crypto
          .createHash("sha256")
          .update(password)
          .digest("hex");
        const match = hashedPassword === user.password;
        if (match) {
          const token = jwt.sign(
            { id: user.id, nickname: user.nickname },
            "secret_key",
            {
              expiresIn: "24h",
            }
          );
          res.status(200).json({ message: "로그인 성공", token });
        } else {
          res
            .status(401)
            .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
        }
      } else {
        res
          .status(401)
          .json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
      }
    }
  });
});

app.post("/signup", upload.single("picture"), async (req, res) => {
  try {
    const { username, password, email, nickname } = req.body;
    const picture = `http://localhost:4000/${req.file.path.replace(
      /\\/g,
      "/"
    )}`;
    const picturestore = req.file.path; // 원본 파일 정보를 JSON 문자열로 변환

    // 서버 실행 위치와 'uploads' 디렉토리 위치 로그
    const selectQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
    connection.query(selectQuery, [username, email], async (error, results) => {
      if (error) {
        console.error("회원가입 오류:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
      } else {
        if (results.length > 0) {
          res.status(409).json({ message: "이미 존재하는 사용자입니다." });
        } else {
          console.log("입력 비밀번호:", password);
          const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

          const insertQuery =
            "INSERT INTO users (username, password, email, nickname, picture, picturestore) VALUES (?, ?, ?, ?, ?, ?)";
          connection.query(
            insertQuery,
            [username, hashedPassword, email, nickname, picture, picturestore],
            (error, results) => {
              if (error) {
                console.error("회원가입 오류:", error);
                res.status(500).json({ message: "서버 오류가 발생했습니다." });
              } else {
                res.status(201).json({ message: "회원가입 성공" });
              }
            }
          );
        }
      }
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 프로필 사진 가져오는 API
app.get("/profile", async (req, res) => {
  try {
    // JWT 토큰 검증
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "토큰이 필요합니다." });
    }

    jwt.verify(token, "secret_key", async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
      }

      const query = "SELECT picture FROM Users WHERE id = ?";
      connection.query(query, [decoded.id], (error, results) => {
        if (error) {
          res.status(500).json({ message: "서버 오류가 발생했습니다." });
        } else {
          if (results.length > 0) {
            const picture = results[0].picture;
            res.status(200).json({ picture });
          } else {
            res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
          }
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// ID 중복 확인
app.get("/checkId/:id", (req, res) => {
  const sql = `SELECT * FROM users WHERE username = ?`;
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (result.length > 0) {
      res.json({ duplicate: true });
    } else {
      res.json({ duplicate: false });
    }
  });
});

// 이메일 중복 확인
app.get("/checkEmail/:email", (req, res) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [req.params.email], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (result.length > 0) {
      res.json({ duplicate: true });
    } else {
      res.json({ duplicate: false });
    }
  });
});
module.exports = app;
