const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt, negative_prompt = '', width = 1024, height = 1024 } = JSON.parse(event.body);
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing HF_TOKEN' }) };
    }

    const resp = await axios({
      method: 'POST',
      url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        inputs: prompt,
        parameters: { negative_prompt, width, height, num_inference_steps: 30, guidance_scale: 7.5 }
      },
      responseType: 'arraybuffer',
      timeout: 60000
    });

    const base64 = Buffer.from(resp.data, 'binary').toString('base64');
    const mime = resp.headers['content-type'] || 'image/jpeg';
    const imageUrl = `data:${mime};base64,${base64}`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};