import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./Login.css";

const LoginView = ({ switchToSignUp }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const clientId =
    "1062617276966-l6bavhmfi6u172b97uksr5je1uibh800.apps.googleusercontent.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        console.log("로그인에 성공하였습니다.");
        const tokenData = await response.json();
        localStorage.setItem("token", tokenData.token);
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        console.log("로그인에 실패하였습니다: " + errorData.message);
      }
    } catch (error) {
      console.log("서버 오류가 발생했습니다: " + error);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-container-logintext">로그인</h2>
      <form onSubmit={handleLogin}>
        <div className="input-field-id">
          <label htmlFor="id">ID</label>
          <input
            type="text"
            id="id"
            name="id"
            placeholder="ID를 입력해주세요"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="input-field-pw">
          <label htmlFor="pw">PW</label>
          <input
            type="password"
            id="pw"
            name="pw"
            placeholder="PW를 입력해주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="buttons">
          <input
            type="submit"
            value="로그인"
            className="button submit-button"
          />
          <button className="button signup-button" onClick={switchToSignUp}>
            회원가입
          </button>
        </div>
        <GoogleOAuthProvider clientId={clientId}>
          <div
            style={{
              position: "relative",
              top: "50px",
              right: "-20px",
            }}
          >
            <GoogleLogin
              onSuccess={async (res) => {
                try {
                  const response = await fetch(
                    "http://localhost:3001/auth/google/login",
                    {
                      method: "POST",
                      mode: "cors",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        token: res.credential,
                      }),
                    }
                  );

                  if (response.ok) {
                    console.log("구글 로그인에 성공하였습니다.");
                    const tokenData = await response.json();
                    localStorage.setItem("token", tokenData.token);
                    navigate("/FreePostList");
                  } else {
                    const errorData = await response.json();
                    console.log(
                      "구글 로그인에 실패하였습니다: " + errorData.message
                    );
                  }
                } catch (error) {
                  console.log("서버 오류가 발생했습니다: " + error);
                }
              }}
              onFailure={(err) => {
                console.log("구글 로그인에 실패하였습니다: " + err);
              }}
            />
          </div>
        </GoogleOAuthProvider>
      </form>
    </div>
  );
};

export default LoginView;
