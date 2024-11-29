import React, { useState } from "react";
import axios from "axios";
import "./ChatWindow.css";

function ChatWindow({ placeDetails }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 궁금한 점을 물어보세요." },
  ]);
  const [input, setInput] = useState("");
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);
  const [isQuestionsVisible, setIsQuestionsVisible] = useState(false); // 추천 질문 버튼 클릭 상태

// 추천 질문 가져오기
  const fetchRecommendedQuestions = async () => {
    try {
      const response = await axios.post("/api/openai/recommend-questions", {
        placeDetails,
      });
      setRecommendedQuestions(response.data.questions || []);
    } catch (error) {
      console.error("추천 질문 에러:", error);
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = input;
    setMessages([...messages, { sender: "user", text: userMessage }]);
    setInput("");

    try {
      const response = await axios.post("/api/openai/chat", {
        message: userMessage,
        placeDetails,
      });
      const botMessage = response.data.reply;
      setMessages((msgs) => [...msgs, { sender: "bot", text: botMessage }]);
    } catch (error) {
      console.error("챗봇 에러:", error);
      setMessages((msgs) => [...msgs, { sender: "bot", text: "응답을 받을 수 없습니다." }]);
    }
  };

  // 추천 질문 클릭 시 자동 입력
  const handleQuestionClick = (question) => {
    setInput(question);
  };

  return (
      <div className="chat-window">
        <h2>챗봇과 대화하기</h2>
        <button onClick={fetchRecommendedQuestions} className="recommend-button">
          추천 질문 보기
        </button>
        <div className="recommend-questions">
          {recommendedQuestions.map((question, index) => (
              <button
                  key={index}
                  className="question-button"
                  onClick={() => handleQuestionClick(question)}
              >
                {question}
              </button>
          ))}
        </div>
        <div className="messages">
          {messages.map((msg, index) => (
              <div
                  key={index}
                  className={`message ${msg.sender === "user" ? "user" : "bot"}`}
              >
                <p>
                  <strong>{msg.sender === "user" ? "나" : "봇"}</strong>: {msg.text}
                </p>
              </div>
          ))}
        </div>
        <div className="input-area">
          <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="메시지를 입력하세요"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>전송</button>
        </div>
      </div>
  );
}

export default ChatWindow;
