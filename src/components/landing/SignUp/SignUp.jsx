import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./SignUp.css";
const SignUpView = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    pwConfirm: "",
    email: "",
    nickname: "",
    picture: null,
  });
  const [idCheck, setIdCheck] = useState("");
  const [emailCheck, setEmailCheck] = useState("");
  const [uploadStatus, setUploadStatus] = useState(
    "확장자: png, jpg, jpeg / 용량: 1MB 이하"
  );

  // Username 중복 체크 함수
  const checkDuplicateId = async () => {
    const response = await fetch(
      `http://localhost:4000/checkId/${formData.username}`
    );
    if (response.ok) {
      const result = await response.json();
      if (result.duplicate) {
        setIdCheck(<span id="checkid1">이미 가입된 회원입니다.</span>);
      } else {
        setIdCheck(<span id="checkid2">사용 가능합니다.</span>);
      }
    }
  };

  // Email 중복 체크 함수
  const checkDuplicateEmail = async () => {
    const response = await fetch(
      `http://localhost:4000/checkEmail/${formData.email}`
    );
    if (response.ok) {
      const result = await response.json();
      if (result.duplicate) {
        setEmailCheck(<span id="checkemail1">이미 가입된 회원입니다.</span>);
      } else {
        setEmailCheck(<span id="checkemail2">사용 가능합니다.</span>);
      }
    }
  };

  const clientId =
    "1062617276966-l6bavhmfi6u172b97uksr5je1uibh800.apps.googleusercontent.com";

  const handleChange = (e) => {
    if (e.target.name === "picture") {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };
  // 이미지 업로드 핸들러
  const handleImageUpload = (e) => {
    // 파일 선택 창 열기
    document.getElementById("signup-picture").click();

    const file = e.target.files[0];
    if (!file) return;
    const fileSizeMB = file.size / 1024 / 1024; // 파일 크기를 MB 단위로 변환
    const fileType = file.name.split(".").pop().toLowerCase(); // 파일 확장자 추출

    // 확장자 검증: png, jpg, jpeg만 허용
    if (!["png", "jpg", "jpeg"].includes(fileType)) {
      alert(
        "지원하지 않는 확장자입니다. png, jpg, jpeg 파일만 업로드 가능합니다."
      );
      return;
    }

    // 용량 검증: 1MB 이하만 허용
    if (fileSizeMB > 1) {
      alert("파일 용량이 1MB를 초과합니다.");
      return;
    }

    // 모든 검증을 통과한 경우 formData에 추가
    setFormData({ ...formData, picture: file });
    setUploadStatus(`'${file.name}' 업로드 완료`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 파일 업로드를 위한 FormData 생성
    const data = new FormData();
    data.append("username", formData.username);
    data.append("password", formData.password);
    data.append("email", formData.email);
    data.append("nickname", formData.nickname);
    data.append("picture", formData.picture);

    const response = await fetch("http://localhost:4000/signup", {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      if (response.status === 409) {
        window.alert("이미 존재하는 사용자입니다.");
      } else {
        window.alert("회원가입에 실패했습니다.");
      }
      return;
    }

    window.alert("회원가입에 성공했습니다.");
    switchToLogin();
  };

  return (
    <div className="signupPage-container">
      <h2 className="signupPage-container-signup">회원가입</h2>
      <button id="switch-to-login-button" onClick={switchToLogin}></button>
      <form onSubmit={handleSubmit}>
        <div className="input-field-signup-id">
          <label htmlFor="signup-id">ID*</label>
          <input
            type="text"
            id="signup-id"
            name="username"
            placeholder="ID를 입력해주세요"
            onChange={handleChange}
          />
          <button
            id="id-check-button"
            onClick={(event) => {
              event.preventDefault();
              checkDuplicateId();
            }}
          >
            중복 체크
          </button>
          <p>{idCheck}</p>
        </div>
        <div className="input-field-signup-pw">
          <label htmlFor="signup-pw">PW*</label>
          <input
            type="password"
            id="signup-pw"
            name="password"
            placeholder="PW를 입력해주세요"
            onChange={handleChange}
          />
        </div>
        <div className="input-field-signup-pw-confirm">
          <label htmlFor="signup-pw-confirm">PW 확인*</label>
          <input
            type="password"
            id="signup-pw-confirm"
            name="pwConfirm"
            placeholder="PW를 다시 입력해주세요"
            onChange={handleChange}
          />
        </div>
        <div className="input-field-signup-email">
          <label htmlFor="signup-email">Email*</label>
          <input
            type="text"
            id="signup-email"
            name="email"
            placeholder="Email을 입력해주세요"
            onChange={handleChange}
          />
          <button
            id="email-check-button"
            onClick={(event) => {
              event.preventDefault();
              checkDuplicateEmail();
            }}
          >
            중복 체크
          </button>
          <p>{emailCheck}</p>
        </div>
        <div className="input-field-signup-nickname">
          <label htmlFor="signup-nickname">별명</label>
          <input
            type="text"
            id="signup-nickname"
            name="nickname"
            placeholder="별명을 입력해주세요"
            onChange={handleChange}
          />
        </div>
        <div className="input-field-signup-picture">
          <label htmlFor="signup-picture">프로필 사진</label>
          <input
            type="file"
            id="signup-picture"
            name="picture"
            style={{ display: "none" }}
            onChange={handleImageUpload} // 파일 선택이 완료되면 handleImageUpload 함수를 호출
          />
          <button
            id="file-upload-button"
            name="picture"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("signup-picture").click(); // '업로드' 버튼 클릭 시 파일 선택 창을 열음
            }}
          >
            업로드
          </button>
          <p id="upload-complete">{uploadStatus}</p>
        </div>

        <div className="buttons">
          <input
            type="submit"
            value="Submit"
            id="submit-button" // id 추가
            className="button signup-submit-button"
          />
        </div>

        <GoogleOAuthProvider clientId={clientId}>
          <div
            style={{
              position: "relative",
              top: "350px",
              right: "-20px",
            }}
          >
            <GoogleLogin
              onSuccess={async (res) => {
                try {
                  const response = await fetch(
                    "http://localhost:3001/auth/google/signup",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        token: res.credential,
                      }),
                    }
                  );
                  if (response.ok) {
                    window.alert("구글을 통한 회원가입에 성공하였습니다.");
                  } else {
                    const errorData = await response.json();
                    window.alert(
                      "구글을 통한 회원가입에 실패하였습니다: " +
                        errorData.message
                    );
                  }
                } catch (error) {
                  window.alert("서버 오류가 발생했습니다: " + error);
                }
              }}
              onFailure={(err) => {
                window.alert("구글을 통한 회원가입에 실패하였습니다: " + err);
              }}
            />
          </div>
        </GoogleOAuthProvider>
      </form>
    </div>
  );
};

export default SignUpView;
