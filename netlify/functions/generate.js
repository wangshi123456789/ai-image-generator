const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const resp = await axios({
      method: 'POST',
      url: 'https://api.fal.ai/v1/flux-dev',
      headers: {
        'Authorization': `Bearer ${process.env.FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      data: { prompt },
      responseType: 'arraybuffer'
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