// src/pages/HomePage.js
import React from 'react';
import SearchBar from '../components/SearchBar/SearchBar';
import PopularDestinations from '../components/PopularDestinations/PopularDestinations';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1 className="title">K-World Reviews</h1>
      <h2 className="subtitle">한국인들의 솔직한 리뷰들로 여행의 실패 확률 제로!</h2>
      <p className="description">
        궁금한 여행지와 맛집 들을 입력하고 한국인의 엄격한 시선을 확인해보세요
      </p>
      <SearchBar />
      <div className="hot-destinations-title">
        <span role="img" aria-label="fire">
          🔥
        </span>{' '}
        지금 핫한 여행장소
      </div>
      <PopularDestinations />
    </div>
  );
}

export default HomePage;
