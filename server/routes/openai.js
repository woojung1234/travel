const express = require('express');
const router = express.Router();
const axios = require('axios');
const keys = require('../config/keys');

// 리뷰 분석 API
router.post('/analyze', async (req, res) => {
    const { reviews } = req.body;

    try {
        const prompt = `
다음 리뷰들을 분석하여 아래 형식에 맞게 3줄 요약, 장점, 단점, 그리고 유용한 정보를 반환해줘:

리뷰들:
${reviews.join('\n\n')}

응답 형식(JSON 형식으로만 반환):
{
  "summary": [
    "1. 첫 번째 요약 문장",
    "2. 두 번째 요약 문장",
    "3. 세 번째 요약 문장"
  ],
  "advantages": [
    {
      "advantage": "장점 1 (짧은 문장)",
      "reasons": ["이유 1", "이유 2"]
    },
    {
      "advantage": "장점 2 (짧은 문장)",
      "reasons": ["이유 1", "이유 2"]
    },
    {
      "advantage": "장점 3 (짧은 문장)",
      "reasons": ["이유 1", "이유 2"]
    }
  ],
  "disadvantages": [
    {
      "disadvantage": "단점 1 (짧은 문장)",
      "reasons": ["이유 1", "이유 2"]
    },
    {
      "disadvantage": "단점 2 (짧은 문장)",
      "reasons": ["이유 1", "이유 2"]
    },
    {
      "disadvantage": "단점 3 (짧은 문장)",
      "reasons": ["이유 1", "이유 2"]
    }
  ],
  "usefulInfo": [
    "1. 첫 번째 유용한 정보",
    "2. 두 번째 유용한 정보",
    "3. 세 번째 유용한 정보",
    "4. 네 번째 유용한 정보",
    "5. 다섯 번째 유용한 정보"
  ]
}
JSON 형식 외의 다른 내용을 추가하지 마세요.
`;

        // OpenAI API 호출
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

        const content = response.data.choices?.[0]?.message?.content;
        console.log('OpenAI 응답 데이터:', content);

        // JSON 파싱
        const parsedResponse = JSON.parse(content);

        // JSON 형식 데이터 구성
        const analysis = {
            summary: parsedResponse.summary || ["요약 데이터가 없습니다."],
            advantages: parsedResponse.advantages || ["장점 데이터가 없습니다."],
            disadvantages: parsedResponse.disadvantages || ["단점 데이터가 없습니다."],
            usefulInfo: parsedResponse.usefulInfo || ["유용한 정보 데이터가 없습니다."],
        };

        // 클라이언트로 응답
        res.json(analysis);
    } catch (error) {
        console.error('리뷰 분석 에러:', error.response?.data || error.message);

        // 응답 파싱 실패 시 처리
        res.status(500).json({ error: '리뷰 분석에 실패했습니다. OpenAI 응답 확인 필요.' });
    }
});

// 챗봇 대화 API
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message }],
            },
            {
                headers: {
                    Authorization: `Bearer ${keys.openai.apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const reply = response.data.choices?.[0]?.message?.content;
        res.json({ reply });
    } catch (error) {
        console.error('챗봇 응답 에러:', error.response?.data || error.message);
        res.status(500).json({ error: '챗봇 응답에 실패했습니다.' });
    }
});
// 추천 질문 생성 API (새로운 기능 추가)
router.post('/recommend-questions', async (req, res) => {
    const { placeDetails } = req.body;

    try {
        const prompt = `
다음 장소 정보를 기반으로 사용자가 궁금해할 만한 5개의 추천 질문을 만들어줘:

장소 정보:
${JSON.stringify(placeDetails)}

응답 형식(JSON 형식으로만 반환):
{
  "questions": [
    "1. 질문 1",
    "2. 질문 2",
    "3. 질문 3",
    "4. 질문 4",
    "5. 질문 5"
  ]
}
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

        const content = response.data.choices?.[0]?.message?.content;
        console.log('추천 질문 응답:', content);

        const parsedResponse = JSON.parse(content);
        res.json(parsedResponse);
    } catch (error) {
        console.error('추천 질문 생성 에러:', error.response?.data || error.message);
        res.status(500).json({ error: '추천 질문 생성에 실패했습니다.' });
    }
});

module.exports = router;
