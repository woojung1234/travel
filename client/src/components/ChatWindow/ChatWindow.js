import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChatWindow.css';

function ChatWindow({ placeName }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '안녕하세요! 궁금한 점을 물어보세요.' },
  ]);
  const [input, setInput] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  // 추천 질문 가져오기
  useEffect(() => {
    const fetchSuggestedQuestions = async () => {
      try {
        console.log("Fetching suggestions for placeName:", placeName); // 디버깅 로그 추가
        const response = await axios.post('/api/openai/get-suggestions', {
          placeName,
        });
        console.log("Suggestions received:", response.data.questions); // 응답 데이터 확인
        setSuggestedQuestions(response.data.questions);
      } catch (error) {
        console.error('추천 질문 가져오기 에러:', error);
        setSuggestedQuestions(["추천 질문을 불러오는 데 실패했습니다."]); // 기본값 설정
      }
    };

    if (placeName) {
      fetchSuggestedQuestions();
    } else {
      console.warn("placeName is not provided to ChatWindow.");
    }
  }, [placeName]);

  // 메시지 전송
  const sendMessage = async (message) => {
    // 사용자 메시지를 추가
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);

    try {
      // AI 응답 요청
      const response = await axios.post('/api/openai/chat', {
        message,
        placeName,
      });
      const botMessage = response.data.reply;

      // 봇 메시지를 추가
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botMessage }]);
    } catch (error) {
      console.error('챗봇 에러:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: '응답을 받을 수 없습니다.' },
      ]);
    }
  };

  // 입력창에서 메시지 전송
  const handleSend = () => {
    if (input.trim() === '') return;
    const userMessage = input;
    setInput('');
    sendMessage(userMessage); // AI와 대화 시작
  };

  // 추천 질문 클릭 시 자동 전송
  const handleSuggestedQuestionClick = (question) => {
    sendMessage(question); // AI와 대화 시작
  };

  return (
      <div className="chat-window">
        <h2>챗봇과 대화하기</h2>
        <div className="suggested-questions">
          <h4>추천 질문</h4>
          <ul>
            {suggestedQuestions.map((question, index) => (
                <li key={index} onClick={() => handleSuggestedQuestionClick(question)}>
                  {question}
                </li>
            ))}
          </ul>
        </div>
        <div className="messages">
          {messages.map((msg, index) => (
              <div
                  key={index}
                  className={`message ${msg.sender === 'user' ? 'user' : 'bot'}`}
              >
                <p>
                  <strong>{msg.sender === 'user' ? '나' : '봇'}</strong>: {msg.text}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend}>전송</button>
        </div>
      </div>
  );
}

export default ChatWindow;


