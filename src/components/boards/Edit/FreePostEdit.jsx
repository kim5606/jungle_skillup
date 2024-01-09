// FreePostEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import Header from "../../common/Header/Header";
import "react-quill/dist/quill.snow.css";
import "../Create/FreePostCreate.css";
import axios from "axios";
import jwt from "jsonwebtoken";

const FreePostEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const toolbarOptions = [
    ["bold", "italic", "strike"],
    ["link", "color"],
    ["code", "code-block", "blockquote", "image"],
  ];

  const modules = {
    toolbar: toolbarOptions,
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    const decoded = jwt.decode(token);

    if (decoded.nickname !== author) {
      throw new Error("You are not authorized to edit this post");
    }

    try {
      await axios.put(`http://localhost:4000/board/posts/${id}`, {
        title,
        content,
      });

      navigate(`/FreePostList`);
    } catch (error) {
      console.error("Failed to edit post", error);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    const decoded = jwt.decode(token);

    if (decoded.nickname !== author) {
      throw new Error("You are not authorized to delete this post");
    }

    try {
      await axios.delete(`http://localhost:4000/board/posts/${id}`);
      navigate(`/FreePostList`);
    } catch (error) {
      console.error("Failed to delete post", error);
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      const response = await axios.get(
        `http://localhost:4000/board/posts/${id}`
      );
      setTitle(response.data.title);
      setContent(response.data.content);
      setAuthor(response.data.author);
    };

    fetchPost();
  }, [id]);

  return (
    <div>
      <Header />
      <ReactQuill
        value={content}
        onChange={handleContentChange}
        modules={modules}
        placeholder="본문을 입력하세요"
        theme="snow"
      />
      <div className="container">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="제목을 입력하세요"
          className="title-input"
        />

        <button className="button-cancel" onClick={handleDelete}>
          삭제
        </button>
        <button className="button-register" onClick={handleEditSubmit}>
          수정 완료
        </button>
      </div>
    </div>
  );
};

export default FreePostEdit;
