// ChatWindow.js

import React, { useState } from 'react';
import axios from 'axios';
import './ChatWindow.css';

function ChatWindow() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '안녕하세요! 궁금한 점을 물어보세요.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = input;
    setMessages([...messages, { sender: 'user', text: userMessage }]);
    setInput('');

    try {
      // OpenAI 챗봇 API 호출
      const response = await axios.post('/api/openai/chat', {
        message: userMessage,
      });
      const botMessage = response.data.reply;
      setMessages((msgs) => [...msgs, { sender: 'bot', text: botMessage }]);
    } catch (error) {
      console.error('챗봇 에러:', error);
      setMessages((msgs) => [...msgs, { sender: 'bot', text: '응답을 받을 수 없습니다.' }]);
    }
  };

  return (
    <div className="chat-window">
      <h2>챗봇과 대화하기</h2>
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
