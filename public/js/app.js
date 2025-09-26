// 全局变量
const API_BASE_URL = '/api';
let API_KEY = localStorage.getItem('fluxApiKey') || '';
let currentImage = null;
let generationStartTime = null;
let availableModels = [];
let availablePresets = [];

// DOM元素
const statusIcon = document.getElementById('status-icon');
const statusText = document.getElementById('status-text');
const modelSelect = document.getElementById('model');
const stylePresetSelect = document.getElementById('style-preset');
const promptInput = document.getElementById('prompt');
const negativePromptInput = document.getElementById('negative-prompt');
const widthSelect = document.getElementById('width');
const heightSelect = document.getElementById('height');
const guidanceInput = document.getElementById('guidance-scale');
const guidanceValueDisplay = document.getElementById('guidance-value');
const seedInput = document.getElementById('seed');
const randomSeedBtn = document.getElementById('random-seed');
const generateBtn = document.getElementById('generate-btn');
const imageResult = document.getElementById('image-result');
const saveBtn = document.getElementById('save-btn');
const copyBtn = document.getElementById('copy-btn');
const shareBtn = document.getElementById('share-btn');
const generationStatus = document.getElementById('generation-status');
const generationTime = document.getElementById('generation-time');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingMessage = document.getElementById('loading-message');
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('main section');
const themeSelect = document.getElementById('theme-select');
const apiKeyInput = document.getElementById('api-key');
const testApiBtn = document.getElementById('test-api');
const saveSettingsBtn = document.getElementById('save-settings');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 加载设置
    loadSettings();
    
    // 检查API连接状态
    checkApiStatus();
    
    // 加载模型和预设
    loadModelsAndPresets();
    
    // 设置引导强度滑块
    setupGuidanceSlider();
    
    // 设置事件监听器
    setupEventListeners();
});

// 检查API状态
function checkApiStatus() {
    fetch(`${API_BASE_URL}/status`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                statusIcon.className = 'status-icon connected';
                statusText.textContent = '已连接';
                statusText.className = 'connected';
                enableInterface();
            } else {
                statusIcon.className = 'status-icon disconnected';
                statusText.textContent = '未连接';
                statusText.className = 'disconnected';
                disableInterface();
            }
        })
        .catch(error => {
            console.error('API状态检查失败:', error);
            statusIcon.className = 'status-icon disconnected';
            statusText.textContent = '未连接';
            statusText.className = 'disconnected';
            disableInterface();
        });
}

// 加载模型和预设
function loadModelsAndPresets() {
    // 加载模型
    fetch(`${API_BASE_URL}/models`)
        .then(response => response.json())
        .then(data => {
            availableModels = data.models || [];
            populateSelect(modelSelect, availableModels);
        })
        .catch(error => {
            console.error('加载模型失败:', error);
        });
    
    // 加载预设
    fetch(`${API_BASE_URL}/presets`)
        .then(response => response.json())
        .then(data => {
            availablePresets = data.presets || [];
            populateSelect(stylePresetSelect, availablePresets);
        })
        .catch(error => {
            console.error('加载预设失败:', error);
        });
}

// 填充选择框
function populateSelect(selectElement, options) {
    if (!selectElement) return;
    
    // 清空现有选项
    selectElement.innerHTML = '';
    
    // 添加新选项
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value || option;
        optionElement.textContent = option.label || option;
        selectElement.appendChild(optionElement);
    });
}

// 设置引导强度滑块
function setupGuidanceSlider() {
    if (guidanceInput) {
        guidanceInput.addEventListener('input', () => {
            if (guidanceValueDisplay) {
                guidanceValueDisplay.textContent = guidanceInput.value;
            }
        });
    }
}
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 导航切换
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            sections.forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(targetId).style.display = 'block';
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // 随机种子
    if (randomSeedBtn) {
        randomSeedBtn.addEventListener('click', () => {
            if (seedInput) {
                seedInput.value = Math.floor(Math.random() * 4294967295);
            }
        });
    }
    
    // 生成按钮
    if (generateBtn) {
        generateBtn.addEventListener('click', generateImage);
    }
    
    // 保存按钮
    if (saveBtn) {
        saveBtn.addEventListener('click', saveGeneratedImage);
    }
    
    // 复制参数按钮
    if (copyBtn) {
        copyBtn.addEventListener('click', copyGenerationParams);
    }
    
    // 分享按钮
    if (shareBtn) {
        shareBtn.addEventListener('click', shareGeneratedImage);
    }
    
    // 测试API连接按钮
    if (testApiBtn) {
        testApiBtn.addEventListener('click', testApiConnection);
    }
    
    // 保存设置按钮
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
}

// 加载设置
function loadSettings() {
    // 加载API密钥
    if (apiKeyInput) {
        apiKeyInput.value = localStorage.getItem('fluxApiKey') || '';
    }
    
    // 加载主题设置
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (themeSelect) {
        themeSelect.value = savedTheme;
    }
    document.body.setAttribute('data-theme', savedTheme);
}

// 保存设置
function saveSettings() {
    // 保存API密钥
    if (apiKeyInput) {
        localStorage.setItem('fluxApiKey', apiKeyInput.value);
        API_KEY = apiKeyInput.value;
    }
    
    // 保存主题设置
    if (themeSelect) {
        localStorage.setItem('theme', themeSelect.value);
        document.body.setAttribute('data-theme', themeSelect.value);
    }
    
    showNotification('设置已保存');
    
    // 重新检查API状态
    checkApiStatus();
}

// 测试API连接
function testApiConnection() {
    const apiKey = apiKeyInput ? apiKeyInput.value : '';
    
    showLoadingOverlay('正在测试API连接...');
    
    fetch(`${API_BASE_URL}/status?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            hideLoadingOverlay();
            if (data.status === 'ok') {
                showNotification('API连接成功！');
            } else {
                showNotification('API连接失败: ' + (data.message || '未知错误'), 'error');
            }
        })
        .catch(error => {
            hideLoadingOverlay();
            showNotification('API连接失败: ' + error.message, 'error');
        });
}
    // 生成图像
function generateImage() {
    if (!promptInput || !promptInput.value.trim()) {
        showNotification('请输入提示词', 'error');
        return;
    }
    
    // 显示加载中
    showLoadingOverlay('正在生成图像...');
    generationStartTime = Date.now();
    
    // 获取参数
    const params = {
        prompt: promptInput.value,
        negative_prompt: negativePromptInput ? negativePromptInput.value : '',
        model: modelSelect ? modelSelect.value : 'flux1-dev',
        style_preset: stylePresetSelect ? stylePresetSelect.value : '',
        width: widthSelect ? parseInt(widthSelect.value) : 768,
        height: heightSelect ? parseInt(heightSelect.value) : 768,
        guidance_scale: guidanceInput ? parseFloat(guidanceInput.value) : 7.5,
        seed: seedInput && seedInput.value ? parseInt(seedInput.value) : -1,
        api_key: API_KEY
    };
    
    // 发送请求
    fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideLoadingOverlay();
        
        if (data.error) {
            showNotification(`生成失败: ${data.error}`, 'error');
            return;
        }
        
        // 显示生成的图像
        displayGeneratedImage(data.image_url, data.params);
        
        // 添加到图库
        addToGallery(data.image_url, data.params);
        
        // 更新生成状态
        updateGenerationStatus('成功', (Date.now() - generationStartTime) / 1000);
    })
    .catch(error => {
        hideLoadingOverlay();
        showNotification(`生成失败: ${error.message}`, 'error');
        updateGenerationStatus('失败', 0);
    });
}

// 显示生成的图像
function displayGeneratedImage(imageUrl, params) {
    if (!imageResult) return;
    
    currentImage = {
        url: imageUrl,
        params: params
    };
    
    imageResult.innerHTML = `<img src="${imageUrl}" alt="生成的图像">`;
    
    // 启用相关按钮
    if (saveBtn) saveBtn.disabled = false;
    if (copyBtn) copyBtn.disabled = false;
    if (shareBtn) shareBtn.disabled = false;
}

// 保存生成的图像
function saveGeneratedImage() {
    if (!currentImage) {
        showNotification('没有可保存的图像', 'error');
        return;
    }
    
    showLoadingOverlay('正在保存图像...');
    
    fetch(`${API_BASE_URL}/save-image`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            image_url: currentImage.url,
            params: currentImage.params
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingOverlay();
        if (data.success) {
            showNotification('图像已保存到本地');
        } else {
            showNotification(`保存失败: ${data.error}`, 'error');
        }
    })
    .catch(error => {
        hideLoadingOverlay();
        showNotification(`保存失败: ${error.message}`, 'error');
    });
}

// 复制生成参数
function copyGenerationParams() {
    if (!currentImage || !currentImage.params) {
        showNotification('没有可复制的参数', 'error');
        return;
    }
    
    const params = currentImage.params;
    const text = `提示词: ${params.prompt}\n负面提示词: ${params.negative_prompt}\n模型: ${params.model}\n风格预设: ${params.style_preset}\n尺寸: ${params.width}x${params.height}\n引导强度: ${params.guidance_scale}\n种子: ${params.seed}`;
    
    navigator.clipboard.writeText(text)
        .then(() => {
            showNotification('参数已复制到剪贴板');
        })
        .catch(error => {
            showNotification(`复制失败: ${error.message}`, 'error');
        });
}

// 分享生成的图像
function shareGeneratedImage() {
    if (!currentImage) {
        showNotification('没有可分享的图像', 'error');
        return;
    }
    
    // 在实际应用中，这里可以实现社交媒体分享功能
    // 目前仅显示提示
    showNotification('分享功能将在完整版本中提供');
}

// 添加到图库
function addToGallery(imageUrl, params) {
    const galleryContainer = document.getElementById('gallery-container');
    if (!galleryContainer) return;
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    galleryItem.innerHTML = `
        <img src="${imageUrl}" alt="生成的图像">
        <div class="gallery-item-overlay">
            <span class="badge">本地保存</span>
            <div class="gallery-item-actions">
                <button class="btn btn-sm btn-light gallery-copy" title="复制参数"><i class="fas fa-copy"></i></button>
                <button class="btn btn-sm btn-light gallery-share" title="分享"><i class="fas fa-share-alt"></i></button>
            </div>
        </div>
    `;
    
    // 添加点击事件
    galleryItem.querySelector('img').addEventListener('click', () => {
        displayGeneratedImage(imageUrl, params);
    });
    
    // 添加复制参数事件
    galleryItem.querySelector('.gallery-copy').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImage = { url: imageUrl, params: params };
        copyGenerationParams();
    });
    
    // 添加分享事件
    galleryItem.querySelector('.gallery-share').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImage = { url: imageUrl, params: params };
        shareGeneratedImage();
    });
    
    // 添加到图库
    galleryContainer.prepend(galleryItem);
}

// 更新生成状态
function updateGenerationStatus(status, time) {
    if (generationStatus) {
        generationStatus.textContent = status;
        generationStatus.className = status === '成功' ? 'success' : 'error';
    }
    
    if (generationTime && time > 0) {
        generationTime.textContent = `${time.toFixed(2)}秒`;
    }
}

// 显示加载中遮罩
function showLoadingOverlay(message) {
    if (loadingOverlay) {
        loadingMessage.textContent = message || '加载中...';
        loadingOverlay.style.display = 'flex';
    }
}

// 隐藏加载中遮罩
function hideLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// 显示通知
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 2秒后自动消失
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 启用界面
function enableInterface() {
    if (generateBtn) generateBtn.disabled = false;
    // 启用其他输入元素
    [promptInput, negativePromptInput, modelSelect, stylePresetSelect, 
     widthSelect, heightSelect, guidanceInput, seedInput].forEach(el => {
        if (el) el.disabled = false;
    });
}

// 禁用界面
function disableInterface() {
    if (generateBtn) generateBtn.disabled = true;
    // 禁用其他输入元素
    [promptInput, negativePromptInput, modelSelect, stylePresetSelect, 
     widthSelect, heightSelect, guidanceInput, seedInput].forEach(el => {
        if (el) el.disabled = true;
    });
}
    themeSelect.value = theme;
    applyTheme(theme);
    
    if (localStorage.getItem('comfyUrl')) {
        comfyUrlInput.value = localStorage.getItem('comfyUrl');
    }
    
    if (localStorage.getItem('defaultWidth')) {
        document.getElementById('default-width').value = localStorage.getItem('defaultWidth');
        widthInput.value = localStorage.getItem('defaultWidth');
    }
    
    if (localStorage.getItem('defaultHeight')) {
        document.getElementById('default-height').value = localStorage.getItem('defaultHeight');
        heightInput.value = localStorage.getItem('defaultHeight');
    }
    
    if (localStorage.getItem('defaultSteps')) {
        document.getElementById('default-steps').value = localStorage.getItem('defaultSteps');
        stepsInput.value = localStorage.getItem('defaultSteps');
    }
    
    document.getElementById('auto-save').checked = localStorage.getItem('autoSave') !== 'false';
}

// 应用主题
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// 检查ComfyUI状态
async function checkComfyStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/status`);
        if (response.ok) {
            statusIcon.className = 'status-online';
            statusText.textContent = '已连接';
            return true;
        } else {
            throw new Error('连接失败');
        }
    } catch (error) {
        statusIcon.className = 'status-offline';
        statusText.textContent = '未连接';
        console.error('ComfyUI连接错误:', error);
        return false;
    }
}

// 加载模型和采样器
async function loadModelsAndSamplers() {
    try {
        const response = await fetch(`${API_BASE_URL}/models`);
        if (!response.ok) throw new Error('获取模型信息失败');
        
        const data = await response.json();
        
        // 提取模型
        if (data.CheckpointLoaderSimple) {
            availableModels = Object.keys(data.CheckpointLoaderSimple.input.required.ckpt_name[0]);
            populateSelect(modelSelect, availableModels);
        }
        
        // 提取采样器
        if (data.KSampler) {
            availableSamplers = Object.keys(data.KSampler.input.required.sampler_name[0]);
            populateSelect(samplerSelect, availableSamplers);
        }
    } catch (error) {
        console.error('加载模型和采样器失败:', error);
        modelSelect.innerHTML = '<option value="error">加载失败</option>';
        samplerSelect.innerHTML = '<option value="error">加载失败</option>';
    }
}

// 填充选择框
function populateSelect(selectElement, options) {
    selectElement.innerHTML = '';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 导航切换
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // CFG滑块
    cfgScaleInput.addEventListener('input', () => {
        cfgValueDisplay.textContent = cfgScaleInput.value;
    });
    
    // 随机种子
    randomSeedBtn.addEventListener('click', () => {
        seedInput.value = Math.floor(Math.random() * 2147483647);
    });
    
    // 生成图像
    generateBtn.addEventListener('click', generateImage);
    
    // 保存图像
    saveBtn.addEventListener('click', saveImage);
    
    // 复制参数
    copyBtn.addEventListener('click', copyParameters);
    
    // 放大图像
    upscaleBtn.addEventListener('click', upscaleImage);
    
    // 测试连接
    testConnectionBtn.addEventListener('click', async () => {
        const url = comfyUrlInput.value.trim();
        if (!url) return;
        
        loadingOverlay.classList.remove('hidden');
        loadingMessage.textContent = '测试连接中...';
        
        try {
            const response = await fetch(`${url}/system_stats`);
            if (response.ok) {
                alert('连接成功！');
            } else {
                throw new Error('连接失败');
            }
        } catch (error) {
            alert('连接失败: ' + error.message);
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });
    
    // 保存设置
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // 主题切换
    themeSelect.addEventListener('change', () => {
        applyTheme(themeSelect.value);
    });
}

// 保存设置
function saveSettings() {
    localStorage.setItem('theme', themeSelect.value);
    localStorage.setItem('comfyUrl', comfyUrlInput.value);
    localStorage.setItem('defaultWidth', document.getElementById('default-width').value);
    localStorage.setItem('defaultHeight', document.getElementById('default-height').value);
    localStorage.setItem('defaultSteps', document.getElementById('default-steps').value);
    localStorage.setItem('autoSave', document.getElementById('auto-save').checked);
    
    alert('设置已保存');
}

// 生成图像
async function generateImage() {
    if (!await checkComfyStatus()) {
        alert('ComfyUI未连接，请检查连接设置');
        return;
    }
    
    // 获取参数
    const prompt = promptInput.value.trim();
    if (!prompt) {
        alert('请输入提示词');
        return;
    }
    
    const negativePrompt = negativePromptInput.value.trim();
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const steps = parseInt(stepsInput.value);
    const cfgScale = parseFloat(cfgScaleInput.value);
    const seed = parseInt(seedInput.value) || -1;
    const model = modelSelect.value;
    const sampler = samplerSelect.value;
    
    // 显示加载状态
    loadingOverlay.classList.remove('hidden');
    loadingMessage.textContent = '正在生成图像...';
    generationStatus.textContent = '生成中...';
    generationStartTime = Date.now();
    
    // 创建工作流
    const workflow = createBasicWorkflow(prompt, negativePrompt, width, height, steps, cfgScale, seed, model, sampler);
    
    try {
        // 提交工作流
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ workflow })
        });
        
        if (!response.ok) throw new Error('生成请求失败');
        
        const data = await response.json();
        const promptId = data.prompt_id;
        
        // 轮询结果
        pollGenerationResult(promptId);
    } catch (error) {
        console.error('生成图像失败:', error);
        loadingOverlay.classList.add('hidden');
        generationStatus.textContent = '失败: ' + error.message;
    }
}

// 创建基本工作流
function createBasicWorkflow(prompt, negativePrompt, width, height, steps, cfgScale, seed, model, sampler) {
    // 这是一个简化的工作流，实际应用中可能需要更复杂的配置
    return {
        "3": {
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfgScale,
                "sampler_name": sampler,
                "scheduler": "normal",
                "denoise": 1,
                "model": ["1", 0],
                "positive": ["2", 0],
                "negative": ["5", 0],
                "latent_image": ["4", 0]
            },
            "class_type": "KSampler"
        },
        "1": {
            "inputs": {
                "ckpt_name": model
            },
            "class_type": "CheckpointLoaderSimple"
        },
        "2": {
            "inputs": {
                "text": prompt,
                "clip": ["1", 1]
            },
            "class_type": "CLIPTextEncode"
        },
        "4": {
            "inputs": {
                "width": width,
                "height": height,
                "batch_size": 1
            },
            "class_type": "EmptyLatentImage"
        },
        "5": {
            "inputs": {
                "text": negativePrompt,
                "clip": ["1", 1]
            },
            "class_type": "CLIPTextEncode"
        },
        "6": {
            "inputs": {
                "samples": ["3", 0],
                "vae": ["1", 2]
            },
            "class_type": "VAEDecode"
        },
        "7": {
            "inputs": {
                "filename_prefix": "generated",
                "images": ["6", 0]
            },
            "class_type": "SaveImage"
        }
    };
}

// 轮询生成结果
async function pollGenerationResult(promptId) {
    try {
        const response = await fetch(`${API_BASE_URL}/result/${promptId}`);
        if (!response.ok) throw new Error('获取结果失败');
        
        const data = await response.json();
        
        // 检查是否完成
        if (data[promptId] && data[promptId].outputs) {
            const outputs = data[promptId].outputs;
            
            // 查找SaveImage节点的输出
            for (const nodeId in outputs) {
                if (outputs[nodeId].images) {
                    const image = outputs[nodeId].images[0];
                    displayGeneratedImage(image.filename, image.subfolder);
                    return;
                }
            }
            
            throw new Error('未找到生成的图像');
        }
        
        // 继续轮询
        setTimeout(() => pollGenerationResult(promptId), 1000);
    } catch (error) {
        console.error('轮询结果失败:', error);
        loadingOverlay.classList.add('hidden');
        generationStatus.textContent = '失败: ' + error.message;
    }
}

// 显示生成的图像
function displayGeneratedImage(filename, subfolder) {
    const imageUrl = `${COMFY_API_URL}/view?filename=${filename}&subfolder=${subfolder || ''}`;
    currentImage = {
        url: imageUrl,
        filename: filename,
        subfolder: subfolder
    };
    
    const img = new Image();
    img.onload = () => {
        // 清除占位符
        imageResult.innerHTML = '';
        imageResult.appendChild(img);
        
        // 更新UI
        loadingOverlay.classList.add('hidden');
        generationStatus.textContent = '完成';
        const elapsedTime = ((Date.now() - generationStartTime) / 1000).toFixed(1);
        generationTime.textContent = `${elapsedTime}秒`;
        
        // 启用按钮
        saveBtn.disabled = false;
        copyBtn.disabled = false;
        upscaleBtn.disabled = false;
        
        // 自动保存
        if (document.getElementById('auto-save').checked) {
            saveImage();
        }
    };
    
    img.onerror = () => {
        loadingOverlay.classList.add('hidden');
        generationStatus.textContent = '加载图像失败';
        imageResult.innerHTML = '<div class="placeholder"><i class="fas fa-exclamation-triangle"></i><p>加载图像失败</p></div>';
    };
    
    img.src = imageUrl;
}

// 保存图像
function saveImage() {
    if (!currentImage) return;
    
    const a = document.createElement('a');
    a.href = currentImage.url;
    a.download = currentImage.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 复制参数
function copyParameters() {
    const params = {
        prompt: promptInput.value,
        negative_prompt: negativePromptInput.value,
        width: widthInput.value,
        height: heightInput.value,
        steps: stepsInput.value,
        cfg_scale: cfgScaleInput.value,
        seed: seedInput.value,
        model: modelSelect.value,
        sampler: samplerSelect.value
    };
    
    navigator.clipboard.writeText(JSON.stringify(params, null, 2))
        .then(() => alert('参数已复制到剪贴板'))
        .catch(err => console.error('复制失败:', err));
}

// 放大图像
function upscaleImage() {
    alert('放大功能尚未实现');
    // 这里可以实现调用ComfyUI的放大节点
}

// 辅助函数：显示错误
function showError(message) {
    alert(`错误: ${message}`);
}