// ResultPage.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AnalysisResult from '../components/AnalysisResult/AnalysisResult';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import './ResultPage.css';

function ResultPage() {
  const location = useLocation();
  const { place } = location.state;
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetailsAndAnalysis = async () => {
      try {
        // 장소 상세 정보 가져오기
        const detailsResponse = await axios.get('/api/places/details', {
          params: { place_id: place.place_id },
        });

        const details = detailsResponse.data;

        // 한국어 리뷰 추출
        const reviews = details.reviews.map((review) => review.text);

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
      <div className="left-pane">
      {loading ? (
        <div className="loader">
            <ClipLoader color="#ffffff" loading={loading} size={50} />
        </div>
        ) : (
            <AnalysisResult analysis={analysis} />
       )}
      </div>
      <div className="right-pane">
        <ChatWindow />
      </div>
    </div>
  );
}

export default ResultPage;
