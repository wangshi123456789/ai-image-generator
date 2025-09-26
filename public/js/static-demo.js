// Flux1 Dev 图片生成网站 - 静态演示版本
// 全局变量
const API_ENDPOINT = "https://api.fal.ai/v1/flux1-dev";
const API_KEY = ""; // 用户可以在设置中填写自己的API密钥
let currentImage = null;
let isGenerating = false;
const demoImages = [
    "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
    "https://images.unsplash.com/photo-1682687221213-56e250b36fdd",
    "https://images.unsplash.com/photo-1682687220063-4742bd7fd538"
];

document.addEventListener('DOMContentLoaded', () => {
    // 设置导航切换
    setupNavigation();
    
    // 设置主题切换
    setupThemeToggle();
    
    // 设置按钮事件
    setupButtonEvents();
    
    // 设置引导强度滑块
    setupGuidanceSlider();
    
    // 显示提示信息
    setTimeout(() => {
        alert('欢迎使用FluxPic免费AI图片生成网站！\n\n这是静态演示版本，您可以体验界面效果。在实际版本中，您可以使用Flux1 Dev模型免费生成高质量图片。');
    }, 500);
});

// 生成图像函数
function generateImage() {
    // 显示加载状态
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    
    // 获取参数
    const prompt = document.getElementById('prompt').value;
    const negativePrompt = document.getElementById('negative-prompt').value;
    const model = document.getElementById('model-select').value;
    const stylePreset = document.getElementById('style-preset').value;
    const seed = document.getElementById('seed').value || Math.floor(Math.random() * 2147483647);
    const guidanceStrength = document.getElementById('guidance-strength').value;
    const width = document.getElementById('width-select').value;
    const height = document.getElementById('height-select').value;
    
    // 在实际应用中，这里会调用Flux1 API
    console.log('生成图像，参数：', {prompt, negativePrompt, model, stylePreset, seed, guidanceStrength, width, height});
    
    // 模拟API调用延迟
    setTimeout(() => {
        // 随机选择一张演示图片
        const randomIndex = Math.floor(Math.random() * demoImages.length);
        const imageUrl = demoImages[randomIndex];
        
        // 显示生成结果
        displayGeneratedImage(imageUrl);
        
        // 隐藏加载状态
        if (loadingOverlay) loadingOverlay.style.display = 'none';
        
        // 添加到图库
        addToGallery(imageUrl, prompt);
    }, 2000);
}

// 显示生成的图像
function displayGeneratedImage(imageUrl) {
    const resultImage = document.getElementById('result-image');
    if (resultImage) {
        resultImage.src = imageUrl;
        resultImage.style.display = 'block';
        currentImage = imageUrl;
    }
    
    // 显示生成信息
    const generationInfo = document.getElementById('generation-info');
    if (generationInfo) {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        generationInfo.textContent = `生成时间: ${timeString} | 模型: Flux1 Dev`;
    }
}

// 保存生成的图像
function saveGeneratedImage() {
    if (!currentImage) {
        alert('请先生成一张图像');
        return;
    }
    
    // 在实际应用中，这里会下载图像
    alert('图像已保存到您的设备');
}

// 复制生成参数
function copyGenerationParams() {
    const prompt = document.getElementById('prompt').value;
    const negativePrompt = document.getElementById('negative-prompt').value;
    const model = document.getElementById('model-select').value;
    const stylePreset = document.getElementById('style-preset').value;
    const seed = document.getElementById('seed').value;
    const guidanceStrength = document.getElementById('guidance-strength').value;
    
    const params = `提示词: ${prompt}\n负面提示词: ${negativePrompt}\n模型: ${model}\n风格预设: ${stylePreset}\n种子: ${seed}\n引导强度: ${guidanceStrength}`;
    
    // 在实际应用中，这里会复制到剪贴板
    console.log('复制参数:', params);
    alert('参数已复制到剪贴板');
}

// 分享生成的图像
function shareGeneratedImage() {
    if (!currentImage) {
        alert('请先生成一张图像');
        return;
    }
    
    // 在实际应用中，这里会打开分享对话框
    alert('分享功能在实际应用中可用');
}

// 放大图像
function upscaleImage() {
    if (!currentImage) {
        alert('请先生成一张图像');
        return;
    }
    
    // 在实际应用中，这里会放大图像
    alert('图像放大功能在实际应用中可用');
}

// 测试Flux1 API连接
function testFluxApiConnection() {
    const apiKey = document.getElementById('api-key').value;
    
    if (!apiKey) {
        alert('API密钥为空，将使用免费配额。在实际应用中，您可以使用自己的API密钥获得更多生成次数。');
        return;
    }
    
    // 在实际应用中，这里会测试API连接
    setTimeout(() => {
        alert('API连接成功！您可以开始生成图像了。');
    }, 1000);
}

// 保存设置
function saveSettings() {
    const apiKey = document.getElementById('api-key').value;
    const width = document.getElementById('width-select').value;
    const height = document.getElementById('height-select').value;
    const guidanceStrength = document.getElementById('guidance-strength').value;
    
    // 在实际应用中，这里会保存设置
    console.log('保存设置:', {apiKey, width, height, guidanceStrength});
    alert('设置已保存');
}

// 添加图像到图库
function addToGallery(imageUrl, prompt) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = prompt;
    
    const info = document.createElement('div');
    info.className = 'gallery-item-info';
    
    const now = new Date();
    const dateString = now.toLocaleDateString();
    const timeString = now.toLocaleTimeString();
    
    info.innerHTML = `
        <p class="prompt-text">${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}</p>
        <p class="date-text">${dateString} ${timeString}</p>
        <div class="badge local-badge">本地保存</div>
    `;
    
    galleryItem.appendChild(img);
    galleryItem.appendChild(info);
    
    // 添加到图库的开头
    if (gallery.firstChild) {
        gallery.insertBefore(galleryItem, gallery.firstChild);
    } else {
        gallery.appendChild(galleryItem);
    }
}

// 设置导航切换
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');
    
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
}

// 设置主题切换
function setupThemeToggle() {
    const themeSelect = document.getElementById('theme-select');
    
    themeSelect.addEventListener('change', () => {
        if (themeSelect.value === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    });
}

// 设置引导强度滑块
function setupGuidanceSlider() {
    const guidanceInput = document.getElementById('guidance-strength');
    const guidanceValueDisplay = document.getElementById('guidance-value');
    if (guidanceInput && guidanceValueDisplay) {
        guidanceInput.addEventListener('input', () => {
            guidanceValueDisplay.textContent = guidanceInput.value;
        });
    }
}

// 设置按钮事件
function setupButtonEvents() {
    // 生成按钮
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateImage);
    }
    
    // 随机种子按钮
    const randomSeedBtn = document.getElementById('random-seed');
    if (randomSeedBtn) {
        randomSeedBtn.addEventListener('click', () => {
            const seedInput = document.getElementById('seed');
            if (seedInput) {
                seedInput.value = Math.floor(Math.random() * 2147483647);
            }
        });
    }
    
    // 移除CFG滑块相关代码，因为我们使用引导强度滑块替代
    
    // 保存按钮
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveGeneratedImage();
        });
    }
    
    // 复制参数按钮
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyGenerationParams();
        });
    }
    
    // 放大按钮
    const upscaleBtn = document.getElementById('upscale-btn');
    if (upscaleBtn) {
        upscaleBtn.addEventListener('click', () => {
            upscaleImage();
        });
    }
    
    // 分享按钮
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            shareGeneratedImage();
        });
    }
    
    // 测试API连接按钮
    const testConnectionBtn = document.getElementById('test-connection');
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', () => {
            testFluxApiConnection();
        });
    }
    
    // 保存设置按钮
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveSettings();
        });
    }
    
    // 移除工作流相关功能，因为我们使用Flux1 API
}

// 模拟生成过程
function simulateGeneration() {
    // 显示加载状态
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    const generationStatus = document.getElementById('generation-status');
    
    loadingOverlay.classList.remove('hidden');
    loadingMessage.textContent = '正在生成图像...';
    generationStatus.textContent = '生成中...';
    
    // 模拟生成延迟
    setTimeout(() => {
        // 随机选择一张演示图片
        const demoImages = [
            'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1618826411640-d6df44dd3f7a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
        ];
        
        const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)];
        const imageResult = document.getElementById('image-result');
        imageResult.innerHTML = `<img src="${randomImage}" alt="生成的图像">`;
        
        // 更新状态
        loadingOverlay.classList.add('hidden');
        generationStatus.textContent = '完成 (演示)';
        
        // 随机生成时间
        const generationTime = (Math.random() * 5 + 2).toFixed(1);
        document.getElementById('generation-time').textContent = `${generationTime}秒 (演示)`;
    }, 2000);
}