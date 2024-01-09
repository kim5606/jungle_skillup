//API.JS
const express = require("express");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const connection = require("./DataBase"); // 데이터베이스 연결 설정 파일
const passport = require("passport"); // passport 모듈 import 추가
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // 상단에 jwt 라이브러리를 추가합니다.
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.listen(3001, () => {
  console.log("서버가 시작되었습니다.");
});
passport.use(
  new GoogleStrategy(
    {
      clientID: "Google_Client_ID",
      clientSecret: "Google_Client_Secret",
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
  )
);

// 구글 로그인 부분
app.post("/auth/google/login", async (req, res) => {
  try {
    const { token } = req.body; // Request body에서 token 받기
    const decoded = jwt.decode(token);
    if (!decoded) {
      res.status(401).json({ message: "토큰이 유효하지 않습니다." });
      return;
    }
    // decoded 객체에서 필요한 정보를 추출합니다.
    const { email } = decoded;

    const query = `SELECT * FROM users WHERE email = ?`;
    connection.query(query, [email], async (error, results) => {
      if (error) {
        console.error("쿼리 실행 오류:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
      } else {
        if (results.length > 0) {
          const user = results[0];
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
            .status(404)
            .json({ message: "해당 이메일을 가진 사용자를 찾을 수 없습니다." });
        }
      }
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

app.post("/auth/google/signup", async (req, res) => {
  try {
    const { token } = req.body; // Request body에서 token 받기

    const decoded = jwt.decode(token);
    if (!decoded) {
      res.status(401).json({ message: "토큰이 유효하지 않습니다." });
      return;
    }
    // decoded 객체에서 필요한 정보를 추출합니다.
    const { email, name, picture } = decoded; // name을 nickname으로 사용

    // 중복 회원가입 체크
    const selectQuery = "SELECT * FROM users WHERE email = ?"; // Email 중복 체크
    connection.query(selectQuery, [email], (error, results) => {
      if (error) {
        console.error("회원가입 오류:", error);
        res.status(500).json({ message: "서버 오류가 발생했습니다." });
      } else {
        if (results.length > 0) {
          res.status(409).json({ message: "이미 존재하는 사용자입니다." });
        } else {
          // 회원가입 로직 작성
          const insertQuery =
            "INSERT INTO users (email, nickname, picture) VALUES (?, ?, ?)";
          connection.query(
            insertQuery,
            [email, name, picture],
            (error, results) => {
              // name을 nickname으로 저장
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
