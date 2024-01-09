import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import logo from "../../../assets/Logo.png";

axios.defaults.baseURL = "http://localhost:4000";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuActive, setMenuActive] = useState(false);
  const [picture, setPicture] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const token = localStorage.getItem("token");

        let picturePath;

        const response = await axios.get("/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        picturePath = response.data.picture;

        setPicture(picturePath);
      } catch (error) {
        console.error("Failed to fetch profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, []);

  const isActive = (pathname) => {
    return location.pathname.startsWith(pathname);
  };

  return (
    <div className="header">
      <img
        src={logo}
        className="logo"
        alt="Logo"
        onClick={() => navigate("/FreePostList")}
      />
      <div className="nav">
        <div
          className={`link ${isActive("/FreePost") ? "active" : ""}`}
          onClick={() => navigate("/FreePostList")}
        >
          자유게시판
        </div>
      </div>
      <img
        src={picture}
        className="profile"
        alt="Profile"
        onClick={() => setMenuActive(!menuActive)}
      />
      <div className={`dropdown-menu ${menuActive ? "active" : ""}`}>
        <div id="close-button" onClick={() => setMenuActive(false)}>
          X
        </div>
        <div className="menu-item" onClick={() => navigate("/profile")}>
          프로필
        </div>
        <div className="menu-item" onClick={() => navigate("/write")}>
          내가 쓴 글
        </div>
        <div className="menu-item" onClick={() => navigate("/logout")}>
          로그아웃
        </div>
      </div>
    </div>
  );
};

export default Header;
