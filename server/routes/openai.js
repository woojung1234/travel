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
다음 리뷰들을 분석하여 3줄 요약, 장점, 단점, 주차 가능 여부, 휠체어 접근성을 알려줘.

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
          'Authorization': `Bearer ${keys.openai.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const analysis = response.data.choices[0].message.content;
    res.json({ analysis });
  } catch (error) {
    console.error('리뷰 분석 에러:', error.response?.data || error.message);
    res.status(500).json({ error: '리뷰 분석에 실패했습니다.' });
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
