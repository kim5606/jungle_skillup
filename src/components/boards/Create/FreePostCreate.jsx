import React, { useState } from "react";
import ReactQuill from "react-quill";
import Header from "../../common/Header/Header";
import jwt from "jsonwebtoken";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "react-quill/dist/quill.snow.css";
import "./FreePostCreate.css";

const FreePostCreate = () => {
  const [text, setText] = useState("");
  const handleChange = (value) => {
    setText(value);
  };

  const [title, setTitle] = useState("");
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate("/FreePostList");
  };

  const handleRegister = () => {
    const token = localStorage.getItem("token");

    const decoded = jwt.decode(token);

    if (!decoded) {
      alert("토큰이 유효하지 않습니다. 다시 로그인 해주세요.");
      return;
    }

    const author = decoded.nickname;
    const user_id = decoded.user_id;

    const postData = {
      title: title,
      content: text,
      author: author,
      user_id: user_id,
    };

    axios
      .post("http://localhost:4000/board/posts", postData)
      .then((response) => {
        if (response.status === 200) {
          alert("게시글이 작성됐습니다.");
          navigate("/FreePostList");
        }
      })
      .catch((error) => {
        alert(error.response.data.message);
      });
  };

  const toolbarOptions = [
    ["bold", "italic", "strike"],
    ["link", "color"],
    ["code", "code-block", "blockquote", "image"],
  ];

  const modules = {
    toolbar: toolbarOptions,
  };

  return (
    <div>
      <Header />
      <ReactQuill
        value={text}
        onChange={handleChange}
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

        <button className="button-cancel" onClick={handleCancel}>
          취소
        </button>
        <button className="button-register" onClick={handleRegister}>
          등록
        </button>
      </div>
    </div>
  );
};

export default FreePostCreate;
