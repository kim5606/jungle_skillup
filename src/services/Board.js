const express = require("express");
const router = express.Router();
const db = require("./DataBase"); // 데이터베이스 연결 설정 파일
const cors = require("cors");
const bodyParser = require("body-parser");
const util = require("util");
const sanitizeHtml = require("sanitize-html");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());

router.get("/posts", (req, res) => {
  db.query("SELECT * FROM posts", (error, results, fields) => {
    if (error) {
      console.log(error);
      res.status(500).send("Server error");
    } else {
      res.json(results);
    }
  });
});

// 게시글 작성
router.post("/posts", async (req, res) => {
  let { title, content, user_id, author } = req.body; // 'const'를 'let'으로 변경합니다.
  const currentTime = new Date().toISOString().slice(0, 19).replace("T", " ");

  // 살균 과정
  content = sanitizeHtml(content, {
    allowedTags: ["p"],
    allowedAttributes: {},
  });

  const result = await db.query(
    "INSERT INTO posts (title, content, user_id, author, created_at, updated_at, views, likes, comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [title, content, user_id, author, currentTime, currentTime, 0, 0, 0]
  );

  // 필요한 정보만 추출
  const response = {
    author: result.author,
    content: result.content,
  };

  res.json(response);
});

// 추천 기능 (중복 방지)
router.post("/likes", async (req, res) => {
  const { user_id, post_id } = req.body;
  const check = await db.query(
    "SELECT * FROM likes WHERE user_id = ? AND post_id = ?",
    [user_id, post_id]
  );
  if (check.length > 0) {
    res.json({ message: "이미 추천하였습니다." });
  } else {
    await db.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [
      user_id,
      post_id,
    ]);

    const result = await db.query(
      "UPDATE posts SET likes = likes + 1 WHERE id = ?",
      [post_id]
    );

    res.json(result);
  }
});
// 게시물 수정
router.put("/posts/:id", async (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;

  db.query(
    "UPDATE posts SET title = ?, content = ? WHERE id = ?",
    [title, content, id],
    (error, results) => {
      if (error) {
        console.error(`An error occurred while updating the post: ${error}`);
        res.status(500).send("Server error");
      } else {
        res.json({ message: "Post updated successfully" });
      }
    }
  );
});

// 게시물 삭제
router.delete("/posts/:id", async (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM posts WHERE id = ?", [id], (error, results) => {
    if (error) {
      console.error(`An error occurred while deleting the post: ${error}`);
      res.status(500).send("Server error");
    } else {
      res.json({ message: "Post deleted successfully" });
    }
  });
});

router.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM posts WHERE id = ?", [id], async (error, results) => {
    if (error) {
      res.status(500).send("Server error");
    } else {
      if (results.length > 0) {
        const post = {
          id: results[0].id,
          title: results[0].title,
          content: results[0].content,
          author: results[0].author,
          created_at: results[0].created_at,
          views: results[0].views,
        };

        const newViews = post.views + 1;
        try {
          await db.query("UPDATE posts SET views = ? WHERE id = ?", [
            newViews,
            id,
          ]);

          // 작성자의 이미지를 가져오는 쿼리
          db.query(
            "SELECT picture FROM users WHERE nickname = ?",
            [post.author],
            (error, results) => {
              if (error) {
                res.status(500).send("Server error");
              } else {
                if (results.length > 0) {
                  // 작성자의 이미지를 post 객체에 추가
                  post.authorImage = results[0].picture;
                  post.views = newViews; // Updated views
                  res.json(post);
                } else {
                  res.status(404).send("Author not found");
                }
              }
            }
          );
        } catch (error) {
          console.error(`An error occurred while updating the views: ${error}`);
          res.status(500).send("Server error");
        }
      } else {
        res.status(404).send("Post not found");
      }
    }
  });
});

module.exports = router;
