// SearchBar.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SearchBar.css';

function SearchBar() {
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    try {
      // 백엔드의 검색 API 호출
      const response = await axios.get('/api/places/search', {
        params: { query: input },
      });
      const place = response.data.results[0];
      navigate('/results', { state: { query: input, place } });
    } catch (error) {
      console.error('검색 에러:', error);
      // 에러 처리 로직 추가 (예: 사용자에게 에러 메시지 표시)
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="여행지, 맛집 등 정보를 입력하세요."
        onFocus={(e) => (e.target.placeholder = '')}
        onBlur={(e) => (e.target.placeholder = '여행지, 맛집 등 정보를 입력하세요.')}
      />
      <button type="submit">검색</button>
    </form>
  );
}

export default SearchBar;
