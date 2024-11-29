// server/routes/openai.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const keys = require('../config/keys');

// 리뷰 분석 API
router.post('/analyze', async (req, res) => {
    const { reviews } = req.body;

    try {
        const prompt = `
다음 리뷰들을 분석하여 요약, 장점, 단점을 반환해줘:

리뷰들:
${reviews.join('\n\n')}
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

        const content = response.data.choices[0].message.content;

        // OpenAI 응답을 JSON 형태로 변환
        const analysis = {
            summary: extractSection(content, '요약'),
            advantages: extractSection(content, '장점'),
            disadvantages: extractSection(content, '단점'),
        };

        res.json(analysis);
    } catch (error) {
        console.error('리뷰 분석 에러:', error.response?.data || error.message);
        res.status(500).json({ error: '리뷰 분석에 실패했습니다.' });
    }
});

// OpenAI 응답을 섹션별로 추출하는 헬퍼 함수
function extractSection(content, sectionName) {
    const regex = new RegExp(`${sectionName}:\\s*(.*?)(\\n\\n|$)`, 's');
    const match = content.match(regex);
    return match ? match[1].split('\n').map((item) => item.trim()) : [];
}

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
          'Authorization': `Bearer ${keys.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('챗봇 응답 에러:', error.response?.data || error.message);
    res.status(500).json({ error: '챗봇 응답에 실패했습니다.' });
  }
});

module.exports = router;
