const express = require("express");
const router = express.Router();
const axios = require("axios");
const keys = require("../config/keys");

// 리뷰 분석 API
router.post("/analyze", async (req, res) => {
    const { reviews } = req.body;

    try {
        const prompt = `
리뷰를 분석하여 다음 JSON 형식으로 반환해주세요. 긍정 및 부정 리뷰 개수를 포함해야 합니다.

리뷰:
${reviews.join("\n")}

응답 형식(JSON):
{
  "summary": ["첫 번째 요약", "두 번째 요약", "세 번째 요약"],
  "advantages": [{"advantage": "장점 1", "reasons": ["이유 1", "이유 2"]}],
  "disadvantages": [{"disadvantage": "단점 1", "reasons": ["이유 1", "이유 2"]}],
  "usefulInfo": ["유용한 정보 1", "유용한 정보 2"],
  "sentiments": {"positive": 긍정 개수, "negative": 부정 개수}
}`;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${keys.openai.apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // OpenAI 응답 파싱
        let data;
        try {
            data = JSON.parse(response.data.choices[0].message.content);
        } catch (parseError) {
            console.error("JSON 파싱 에러:", parseError.message);
            console.error("OpenAI 응답 데이터:", response.data.choices[0].message.content);
            return res.status(500).json({ error: "JSON 형식 파싱 오류" });
        }

        // 반환 데이터 구성
        res.json({
            summary: data.summary || ["요약 데이터가 없습니다."],
            advantages: data.advantages || [],
            disadvantages: data.disadvantages || [],
            usefulInfo: data.usefulInfo || [],
            sentiments: data.sentiments || { positive: 0, negative: 0 },
        });
    } catch (error) {
        console.error("리뷰 분석 에러:", error.response?.data || error.message);
        res.status(500).json({ error: "리뷰 분석 실패" });
    }
});

// 추천 질문 생성 API
router.post('/recommend-questions', async (req, res) => {
    const { placeDetails } = req.body;

    // placeDetails 유효성 검사
    if (!placeDetails || !placeDetails.name) {
        return res.status(400).json({ error: '장소 이름이 누락되었습니다.' });
    }

    try {
        const prompt = `
"${placeDetails.name}"에 대해 사용자가 궁금해할 만한 5개의 질문을 제공해줘. 장소의 이름과 관련된 질문이어야 하며, 각 질문은 문자열 형태로만 제공하고, JSON 배열로 반환해줘.

예시 응답:
[
  "질문 1",
  "질문 2",
  "질문 3",
  "질문 4",
  "질문 5"
]
`;

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${keys.openai.apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // OpenAI 응답에서 추천 질문 파싱
        const suggestions = JSON.parse(response.data.choices[0].message.content);

        // 클라이언트에 추천 질문 반환
        res.json({ questions: suggestions });
    } catch (error) {
        console.error('추천 질문 생성 에러:', error.response?.data || error.message);
        res.status(500).json({ error: '추천 질문 생성에 실패했습니다.' });
    }
});


// 챗봇 대화 API
router.post("/chat", async (req, res) => {
    const { message, placeDetails } = req.body;

    if (!message) {
        return res.status(400).json({ error: "메시지가 누락되었습니다." });
    }

    try {
        const context = placeDetails
            ? `장소: ${placeDetails.name}, 주소: ${placeDetails.address}`
            : "";

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "너는 장소 기반 질문에 답변하는 챗봇입니다." },
                    { role: "user", content: `${context}\n${message}` },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${keys.openai.apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (error) {
        console.error("챗봇 응답 에러:", error.response?.data || error.message);
        res.status(500).json({ error: "챗봇 응답에 실패했습니다." });
    }
});

module.exports = router;
