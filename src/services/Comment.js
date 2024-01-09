const express = require("express");
const router = express.Router();
const db = require("./DataBase"); // 데이터베이스 연결 설정 파일
const cors = require("cors");
const util = require("util");
const bodyParser = require("body-parser");

db.query = util.promisify(db.query);
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cors());
router.get("/comments", async (req, res) => {
  let queryResult;
  const postId = Number(req.query.postId);

  if (postId) {
    queryResult = await db.query("SELECT * FROM comments WHERE post_id = ?", [
      postId,
    ]);
  } else {
    queryResult = await db.query("SELECT * FROM comments");
    console.log("Else part is running");
  }

  const comments = await Promise.all(
    queryResult.map(async (comment) => {
      const [authorImageResult] = await db.query(
        "SELECT picture FROM users WHERE nickname = ?",
        [comment.author]
      );

      return {
        id: comment.id,
        content: comment.content,
        author: comment.author,
        created_at: comment.created_at,
        postId: comment.post_id,
        authorImage: authorImageResult.picture
          ? authorImageResult.picture
          : null,
      };
    })
  );
  res.json(comments);
});

// 댓글 작성
router.post("/comments", async (req, res) => {
  const { content, author, post_id } = req.body;

  // 댓글을 추가하는 쿼리
  const insertResult = await db.query(
    "INSERT INTO comments (content, author, post_id) VALUES (?, ?, ?)",
    [content, author, post_id]
  );

  // 댓글 수를 증가시키는 쿼리
  await db.query("UPDATE posts SET comments = comments + 1 WHERE id = ?", [
    post_id,
  ]);

  // 새로 생성된 댓글의 필요한 부분만 반환
  const newComment = {
    id: insertResult.insertId,
    content: content,
    author: author,
    created_at: new Date(),
    postId: post_id,
  };

  res.json(newComment);
});

module.exports = router;
