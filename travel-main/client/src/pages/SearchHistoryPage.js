import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SearchHistoryPage() {
    const [history, setHistory] = useState([]);
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // LocalStorage에서 검색 기록 가져오기
        const storedHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        setHistory(storedHistory);
    }, []);

    const handleSearch = async (query) => {
        if (!query.trim()) return;

        try {
            const response = await axios.get('/api/places/search', {
                params: { query },
            });
            const place = response.data.results[0];
            navigate('/results', { state: { query, place } });
        } catch (error) {
            console.error('검색 에러:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch(input);
    };

    const handleHistoryClick = (query) => {
        handleSearch(query);
    };

    return (
        <div className="search-history-page">
            <h1>검색 기록</h1>
            <form className="search-bar" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="검색어를 입력하세요"
                />
                <button type="submit">검색</button>
            </form>
            {history.length > 0 ? (
                <ul className="history-list">
                    {history.map((item, index) => (
                        <li key={index} onClick={() => handleHistoryClick(item)}>
                            {item}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>검색 기록이 없습니다.</p>
            )}
            <button className="clear-button" onClick={() => localStorage.removeItem('searchHistory')}>
                검색 기록 삭제
            </button>
        </div>
    );
}

export default SearchHistoryPage;
