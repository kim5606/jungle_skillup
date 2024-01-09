import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../common/Header/Header";
import Quill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./FreePostDetail.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import jwt from "jsonwebtoken";

const FreePostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState(null);

  const navigate = useNavigate();
  const modules = {
    toolbar: [
      ["bold", "italic", "strike"],
      ["link", "color"],
      ["code", "code-block", "blockquote", "image"],
    ],
  };

  useEffect(() => {
    const token = localStorage.getItem("token"); // 실제 토큰을 저장하는 key 값으로 수정하세요
    if (token) {
      const decoded = jwt.decode(token);
      setUserId(decoded.id); // 토큰에 저장된 사용자 ID의 key 값으로 수정하세요
    }
  }, []);

  const handleLike = async () => {
    try {
      const response = await axios.post("http://localhost:4000/Board/likes", {
        // 수정됨
        user_id: userId,
        post_id: id,
      });

      if (response.data.message === "이미 추천하였습니다.") {
        alert("이미 추천하였습니다!"); // 중복 추천 시 알림
      } else {
        alert("추천하였습니다!"); // 추천 성공 시 알림
        setLiked(true);
      }
    } catch (error) {
      console.error("Failed to like the post", error);
    }
  };

  const fetchPostAndComments = useCallback(async () => {
    try {
      const postResponse = await axios.get(
        `http://localhost:4000/board/posts/${id}`
      );
      const commentsResponse = await axios.get(
        `http://localhost:4000/comment/comments?postId=${id}`
      );

      setPost(postResponse.data);
      setComments(commentsResponse.data);
    } catch (error) {
      console.error("Failed to fetch post and comments", error);
    }
  }, [id]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleCommentSubmit = async () => {
    try {
      await axios.post(
        // 'response' 변수 할당 부분을 제거합니다.
        `http://localhost:4000/comment/comments?postId=${id}`,
        {
          post_id: id,
          content: newComment,
          author: post.author,
        }
      );

      setNewComment("");
      fetchPostAndComments(); // 댓글 등록 후 게시글과 댓글을 다시 불러옵니다.
    } catch (error) {
      console.error("Failed to submit comment", error);
    }
  };

  const handleEdit = () => {
    navigate(`/FreePostEdit/${id}`);
  };

  return (
    <div>
      <Header />
      <button
        className="detail-button-back"
        onClick={() => navigate("/FreePostList")}
      >
        ←
      </button>
      <div className="card-container">
        {post && (
          <>
            <div className="post-container">
              <h1 className="post-title">제목 : {post.title}</h1>
              <p
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            <div className="post-card-container">
              <img
                className="author-image"
                src={post.authorImage}
                alt={post.author}
              />
              <p className="post-author">{post.author}</p>
              <p className="post-time">
                작성 시간 :
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
              <p className="post-view-count">조회수 : {post.views}</p>
              <div className="post-detail-button-container">
                <button className="button-thumbs-up" onClick={handleLike}>
                  {liked ? "추천 완료" : "추천"}
                </button>
                <button className="detail-button-edit" onClick={handleEdit}>
                  수정하기
                </button>
              </div>
            </div>
          </>
        )}
        {comments.map((comment, index) => (
          <div key={index} className="comment-container">
            <img
              src={comment.authorImage}
              alt={comment.author}
              className="comment-author-image"
            />
            <h2 className="comment-author">{comment.author}</h2>
            <p
              className="comment-content"
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            <p className="comment-time">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ko,
              })}
            </p>
          </div>
        ))}
        <div className="quill-and-buttons">
          <div className="background" />
          <div className="comment-count">댓글</div>
        </div>
        <Quill
          className="customQuillEditor"
          value={newComment}
          onChange={setNewComment}
          modules={modules}
        />
        <button
          className="detail-button-register"
          onClick={handleCommentSubmit}
        >
          댓글 등록
        </button>
      </div>
    </div>
  );
};

export default FreePostDetail;
