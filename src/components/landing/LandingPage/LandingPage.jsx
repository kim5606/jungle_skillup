import React, { useState, useEffect } from "react";
import ModalComponent from "../../common/ModalComponent/ModalComponent";
import BackgroundVideo from "../../../assets/background.mp4";
import buttonImage from "../../../assets/Button.png"; // 이미지를 import 합니다.
import confetti from "canvas-confetti";
import "./LandingPage.css";

const useTypingEffect = (fullText, typingSpeed) => {
  const [text, setText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < fullText.length) {
        setText((prevText) => prevText + fullText[i]);
        i++;
      } else {
        setIsCompleted(true);
        clearInterval(typing);
      }
    }, typingSpeed);
    return () => clearInterval(typing);
  }, [fullText, typingSpeed]);

  return [text, isCompleted];
};

const LandingPage = () => {
  const fullText1 = "개발을 잘 하고 싶은";
  const fullText2 = "개발자 커뮤니티";
  const typingSpeed = 150;

  const [text1, isText1Completed] = useTypingEffect(fullText1, typingSpeed);
  const [text2] = useTypingEffect(
    isText1Completed ? fullText2 : "",
    typingSpeed
  );

  const firework = () => {
    var duration = 500; // 0.5초 지속시간
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 25, spread: 90, ticks: 28, zIndex: 0 };

    var interval = setInterval(function () {
      var now = Date.now();
      var timeLeft = animationEnd - now;

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 5 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: 0.5, y: 0.6 },
        })
      );
    }, 50);
  };

  const [modalIsOpen, setModalIsOpen] = useState(false);

  return (
    <div className="landingPage">
      <video autoPlay loop muted className="backgroundVideo">
        <source src={BackgroundVideo} type="video/mp4" />
        비디오가 지원되지 않는 브라우저입니다.
      </video>
      <div className="serviceIntro">
        {text1}
        {isText1Completed && <br />}
        {isText1Completed && text2}
      </div>
      <div className="enterButton">
        <img
          src={buttonImage}
          alt="입장하기"
          className="imageButton"
          onMouseEnter={firework}
          onClick={() => setModalIsOpen(true)}
        />
      </div>
      <ModalComponent
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
      />
    </div>
  );
};

export default LandingPage;
