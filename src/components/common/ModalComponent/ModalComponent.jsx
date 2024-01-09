import React, { useState } from "react";
import Modal from "react-modal";
import Login from "../../../components/landing/Login/Login";
import SignUp from "../../../components/landing/SignUp/SignUp";
import BackgroundImage from "../../../assets/Login.png";

const ModalComponent = ({ modalIsOpen, setModalIsOpen }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToSignUp = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      className="modal-content"
      style={{
        overlay: {
          backdropFilter: "blur(70%)",
        },
        content: {
          overflow: "auto",
          width: "40%",
          height: "80%",
          margin: "auto",
          background: `url(${BackgroundImage}) no-repeat center center fixed`,
          backgroundSize: "100% 110%",
          borderRadius: "10px",
          padding: "20px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
          transform: "translate(0%,10%)",
        },
      }}
    >
      {isLogin ? (
        <Login switchToSignUp={switchToSignUp} />
      ) : (
        <SignUp switchToLogin={switchToLogin} />
      )}
    </Modal>
  );
};

export default ModalComponent;
