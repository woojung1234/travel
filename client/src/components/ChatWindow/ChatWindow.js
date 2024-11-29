import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ChatWindow.css";

function ChatWindow({ placeDetails }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 궁금한 점을 물어보세요." },
  ]);
  const [input, setInput] = useState("");
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // 추천 질문 가져오기
  const fetchRecommendedQuestions = async () => {
    if (!placeDetails || !placeDetails.name || !placeDetails.address) {
      console.error("placeDetails 정보가 부족합니다:", placeDetails);
      setRecommendedQuestions([
        "이 장소의 위치는 어디인가요?",
        "이 장소는 어떤 시설이 있나요?",
        "이 장소에서 주의할 점은 무엇인가요?",
      ]); // 기본값 설정
      return;
    }

    setLoadingQuestions(true);
    try {
      const response = await axios.post("/api/openai/recommend-questions", {
        placeDetails,
      });
      const questions = response.data.questions || [];
      if (questions.length === 0) {
        // 질문이 비어 있으면 기본값 제공
        setRecommendedQuestions([
          "이 장소의 위치는 어디인가요?",
          "이 장소는 어떤 시설이 있나요?",
          "이 장소에서 주의할 점은 무엇인가요?",
        ]);
      } else {
        setRecommendedQuestions(questions);
      }
    } catch (error) {
      console.error("추천 질문 에러:", error);
      setRecommendedQuestions([
        "추천 질문을 불러오는 데 실패했습니다.",
        "이 장소에 대한 정보는 어떻게 얻을 수 있나요?",
        "이 장소의 주변 명소는 무엇인가요?",
      ]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (placeDetails) {
      fetchRecommendedQuestions();
    }
  }, [placeDetails]);

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
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "응답을 받을 수 없습니다." },
      ]);
    }
  };

  // 추천 질문 클릭 시 자동 입력
  const handleQuestionClick = (question) => {
    setInput(question);
  };

  return (
      <div className="chat-window">
        <h2>챗봇과 대화하기</h2>
        <div className="recommend-questions">
          {loadingQuestions ? (
              <p>추천 질문을 불러오는 중입니다...</p>
          ) : (
              recommendedQuestions.map((question, index) => (
                  <div
                      key={index}
                      className="question-item"
                      onClick={() => handleQuestionClick(question)}
                  >
                    {question}
                  </div>
              ))
          )}
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


