// ResultPage.js

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AnalysisResult from '../components/AnalysisResult/AnalysisResult';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './ResultPage.css';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { place } = location.state;
  const [analysis, setAnalysis] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailsAndAnalysis = async () => {
      try {
        // 장소 상세 정보 가져오기
        const detailsResponse = await axios.get('/api/places/details', {
          params: { place_id: place.place_id },
        });

        const details = detailsResponse.data;
        setDetails(details);

        // 한국어 리뷰 추출
        const reviews = details.reviews?.map((review) => review.text) || [];

        // 리뷰가 없을 경우 처리
        if (reviews.length === 0) {
          setAnalysis('한국어 리뷰가 없습니다.');
          setLoading(false);
          return;
        }

        // 리뷰 분석 요청
        const analysisResponse = await axios.post('/api/openai/analyze', {
          reviews,
        });
        setAnalysis(analysisResponse.data.analysis);
      } catch (error) {
        console.error('분석 에러:', error);
        setAnalysis('분석 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndAnalysis();
  }, [place.place_id]);

  return (
      <div className="result-page">
        {/* 검색창으로 돌아가기 버튼 */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/')}>
            검색창으로 돌아가기
          </button>
        </div>

        <div className="left-pane">
          {loading ? (
              <div className="loader">
                <ClipLoader color="#ffffff" loading={loading} size={50} />
              </div>
          ) : (
              <div>
                {/* 장소 정보 렌더링 */}
                {details && (
                    <div className="place-details">
                      <img
                          className="place-photo"
                          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${details.photos[0]?.photo_reference}&key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}`}

                          alt={details.name}
                      />
                      <h2>{details.name}</h2>
                      <p>{details.formatted_address}</p>
                      <div className="ratings">
                        <span>평점: {details.rating} / 5</span>
                        <span>리뷰 수: {details.user_ratings_total}</span>
                      </div>
                    </div>
                )}
                {/* 분석 결과 렌더링 */}
                <AnalysisResult analysis={analysis} />
              </div>
          )}
        </div>
        <div className="right-pane">
          <ChatWindow />
        </div>
      </div>
  );
}

export default ResultPage;

