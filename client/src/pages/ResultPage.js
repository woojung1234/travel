import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import "./ResultPage.css";

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { place } = location.state;
  const [analysis, setAnalysis] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const calculatePositivePercentage = (rating) => {
    return Math.min(Math.max((rating / 5) * 100, 0), 100);
  };

  useEffect(() => {
    const fetchDetailsAndAnalysis = async () => {
      try {
        const detailsResponse = await axios.get("/api/places/details", {
          params: { place_id: place.place_id },
        });

        const details = detailsResponse.data;
        setDetails(details);

        const reviews = details.reviews?.map((review) => review.text) || [];

        if (reviews.length === 0) {
          setAnalysis({
            summary: "한국어 리뷰가 없습니다.",
            advantages: [],
            disadvantages: [],
            usefulInfo: [],
          });
          setLoading(false);
          return;
        }

        const analysisResponse = await axios.post("/api/openai/analyze", {
          reviews,
        });

        const { summary, advantages, disadvantages, usefulInfo } =
            analysisResponse.data;

        setAnalysis({
          summary,
          advantages,
          disadvantages,
          usefulInfo,
        });
      } catch (error) {
        console.error("분석 에러:", error);
        setAnalysis({
          summary: "분석 중 오류가 발생했습니다.",
          advantages: [],
          disadvantages: [],
          usefulInfo: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDetailsAndAnalysis();
  }, [place.place_id]);

  return (
      <div className="result-page">
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate("/")}>
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
                {details && (
                    <div className="place-details">
                      <img
                          className="place-photo"
                          src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${details.photos[0]?.photo_reference}&key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY}`}
                          alt={details.name}
                      />
                      <h2 className="place-name">{details.name}</h2>
                      <p className="place-address">{details.formatted_address}</p>
                      <div className="place-stats">
                        <span>⭐ {details.rating} / 5</span>
                        <span>📋 리뷰 수: {details.user_ratings_total}</span>
                      </div>
                      {/* 긍정/부정 비율 그래프 */}
                      <div className="rating-chart">
                        <div className="rating-bar-container">
                          <div
                              className="positive-bar"
                              style={{
                                width: `${calculatePositivePercentage(
                                    details.rating
                                )}%`,
                              }}
                          ></div>
                          <div
                              className="negative-bar"
                              style={{
                                width: `${
                                    100 - calculatePositivePercentage(details.rating)
                                }%`,
                              }}
                          ></div>
                        </div>
                        <div className="rating-labels">
                          <span>긍정</span>
                          <span>부정</span>
                        </div>
                      </div>
                    </div>
                )}
                {analysis && (
                    <>
                      <div className="analysis-summary">
                        <h3>3줄 요약</h3>
                        <ul>
                          {analysis.summary.map((item, index) => (
                              <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      {/* 장점 */}
                      <div className="advantages">
                        <h3>🌞 장점</h3>
                        <ul>
                          {analysis.advantages.map((adv, index) => (
                              <li key={index}>
                                <strong>{adv.advantage}</strong>
                                <ul>
                                  {adv.reasons.map((reason, i) => (
                                      <li key={i}>{reason}</li>
                                  ))}
                                </ul>
                              </li>
                          ))}
                        </ul>
                      </div>

                      {/* 단점 */}
                      <div className="disadvantages">
                        <h3>⚠️ 단점</h3>
                        <ul>
                          {analysis.disadvantages.map((disadv, index) => (
                              <li key={index}>
                                <strong>{disadv.disadvantage}</strong>
                                <ul>
                                  {disadv.reasons.map((reason, i) => (
                                      <li key={i}>{reason}</li>
                                  ))}
                                </ul>
                              </li>
                          ))}
                        </ul>
                      </div>
                      <div className="useful-info">
                        <h3>📌 유용한 정보</h3>
                        <ul>
                          {analysis.usefulInfo.map((info, index) => (
                              <li key={index}>{info}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                )}
              </div>
          )}
        </div>
        <div className="right-pane">
          <ChatWindow/>
        </div>
      </div>
  );
}

export default ResultPage;


