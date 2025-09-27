const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);

    // ① 免费模型 endpoint（官方公版，无需登录）
    const url = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';

    // ② 用 Hugging Face 免费 Token
    const hfToken = process.env.HF_TOKEN;   // 等会儿在 Netlify 里填

    const resp = await axios({
      method: 'POST',
      url,
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      data: { inputs: prompt },   // HF 标准格式
      responseType: 'arraybuffer',
      timeout: 60000   // 公版模型冷启动慢，给 60 秒
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      body: Buffer.from(resp.data).toString('base64'),
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
};