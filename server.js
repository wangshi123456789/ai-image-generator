const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;
const FLUX_API_URL = 'https://api.fal.ai/v1/flux1-dev';
const DEFAULT_API_KEY = process.env.FLUX_API_KEY || ''; // 设置默认API密钥，可通过环境变量配置

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 文件上传配置
const upload = multer({ dest: 'uploads/' });

// 路由
// 测试API连接
app.get('/api/status', async (req, res) => {
  try {
    // 只返回API状态，不实际调用API
    res.json({ status: 'ok', message: 'Flux1 Dev API ready' });
  } catch (error) {
    console.error('Error checking API status:', error);
    res.status(500).json({ error: 'Failed to check API status' });
  }
});

// 获取可用的模型和预设
app.get('/api/models', async (req, res) => {
  // 返回Flux1 Dev支持的模型和预设
  res.json({
    models: [
      { id: 'flux1-dev', name: 'Flux1 Dev' },
      { id: 'flux1-schnell', name: 'Flux1 Schnell' }
    ],
    presets: [
      { id: 'none', name: '无' },
      { id: 'anime', name: '动漫风格' },
      { id: 'photographic', name: '摄影风格' },
      { id: 'cinematic', name: '电影风格' },
      { id: 'fantasy', name: '奇幻风格' },
      { id: 'realistic', name: '写实风格' }
    ]
  });
});

// 生成图像
app.post('/api/generate', async (req, res) => {
  try {
    const { 
      prompt, 
      negative_prompt, 
      model_id = 'flux1-dev',
      style_preset = 'none',
      width = 768,
      height = 768,
      guidance_scale = 7.5,
      seed = -1,
      api_key = ''
    } = req.body;

    // 使用用户提供的API密钥或默认密钥
    const apiKey = api_key || DEFAULT_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API密钥未提供。请在设置中添加您的Flux1 API密钥。' });
    }

    // 准备请求头
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // 准备请求体
    const requestBody = {
      prompt: prompt,
      negative_prompt: negative_prompt || '',
      style_preset: style_preset !== 'none' ? style_preset : undefined,
      width: parseInt(width),
      height: parseInt(height),
      guidance_scale: parseFloat(guidance_scale),
      seed: seed !== -1 ? parseInt(seed) : undefined
    };

    // 调用Flux1 API
    const response = await axios.post(FLUX_API_URL, requestBody, { headers });
    
    // 返回生成的图像URL和其他信息
    res.json({
      success: true,
      image_url: response.data.image_url,
      seed: response.data.seed || seed,
      generation_time: response.data.generation_time || 0
    });
  } catch (error) {
    console.error('Error generating image:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate image', 
      details: error.response?.data || error.message 
    });
  }
});

// 保存图像到本地
app.post('/api/save', async (req, res) => {
  try {
    const { image_url, prompt } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'No image URL provided' });
    }
    
    // 下载图像
    const response = await axios.get(image_url, { responseType: 'arraybuffer' });
    
    // 创建文件名
    const timestamp = Date.now();
    const filename = `flux1_${timestamp}.png`;
    
    // 保存图像
    const targetPath = path.join(__dirname, 'public', 'uploads', filename);
    fs.writeFileSync(targetPath, response.data);
    
    res.json({ 
      success: true, 
      filename: filename,
      path: `/uploads/${filename}`
    });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`FluxPic 服务器运行在 http://localhost:${PORT}`);
  console.log(`使用 Flux1 Dev API: ${FLUX_API_URL}`);
  console.log(`API密钥状态: ${DEFAULT_API_KEY ? '已配置' : '未配置 - 用户需要在设置中提供'}`);
});