# Chrome扩展截图工具设计文档

## 1. 概述

### 1.1 项目目标
开发一个Chrome浏览器扩展程序，允许用户对当前浏览的网页进行截图，并提供基本的编辑和保存功能。

### 1.2 核心功能
- 手动触发截图，确保动态内容加载完成
- 支持完整网页滚动截图，精确处理滚动位移和图像合并
- 自动保存截图到固定位置，自动命名和合并
- 可配置参数控制截图行为
- 用户友好的界面交互和设置选项

### 1.3 项目结构
```
webshot-extension/
├── manifest.json
├── background.js
├── content.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/
│   ├── options.html
│   ├── options.css
│   └── options.js
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── lib/
    └── screenshot-utils.js
```

## 2. 技术架构

### 2.1 技术栈
- Chrome Extension API
- HTML/CSS/JavaScript
- Manifest V3
- Canvas API（用于图像处理）

### 2.2 扩展结构
- manifest.json：扩展配置文件
- popup.html/js/css：弹出界面
- content script：内容脚本，用于访问网页内容
- background script：后台脚本，处理截图逻辑
- options.html/js/css：设置页面（可选）
- lib/screenshot-utils.js：截图工具库

## 3. 核心组件设计

### 3.1 Manifest配置
```json
{
  "manifest_version": 3,
  "name": "WebShot - 网页截图工具",
  "version": "1.0",
  "description": "一个强大的网页截图工具，支持完整网页截图、自动保存和简单编辑功能",
  "permissions": [
    "activeTab",
    "storage",
    "downloads",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_title": "WebShot 网页截图",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["icons/*.png"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 3.2 内容脚本（Content Script）
- 获取页面完整尺寸信息
- 处理滚动截图逻辑
- 与background script通信

### 3.3 后台脚本（Background Script）
- 接收截图指令
- 调用Chrome API执行截图
- 处理图像数据

### 3.4 弹出界面（Popup）
- 用户交互界面
- 触发截图功能
- 显示截图结果
- 提供编辑和保存选项

### 3.2 内容脚本（Content Script）
- 获取页面完整尺寸信息
- 处理滚动截图逻辑
- 与background script通信

### 3.3 后台脚本（Background Script）
- 接收截图指令
- 调用Chrome API执行截图
- 处理图像数据

### 3.4 弹出界面（Popup）
- 用户交互界面
- 触发截图功能
- 显示截图结果
- 提供编辑和保存选项

## 4. 功能实现方案

### 4.1 截图实现方式
#### 方案一：Chrome API截图
- 使用chrome.tabCapture或chrome.desktopCapture API
- 直接获取标签页图像数据

#### 方案二：Canvas合成截图（推荐）
- 通过content script获取页面DOM信息
- 使用Canvas绘制页面内容
- 处理滚动区域拼接
- 精确记录滚动位移，确保图像合并时位置匹配
- 等待动态内容加载完成后再进行截图

##### 4.1.1 滚动截图实现细节
1. 获取页面完整高度：`document.body.scrollHeight`
2. 记录视口高度：`window.innerHeight`
3. 逐屏滚动并截图：
   - 滚动到指定位置 `window.scrollTo(0, y)`
   - 等待页面渲染完成
   - 使用Canvas捕获当前视口图像
4. 图像拼接算法：
   - 创建完整画布
   - 按照滚动位置将各截图绘制到对应位置
   - 处理重叠区域和非整数高度的最后一页

### 4.2 图像处理功能
- 基本裁剪功能
- 添加文本标注
- 添加形状标注（矩形、圆形、箭头等）
- 图像滤镜效果

### 4.3 自动保存机制
- 生成文件名：基于时间戳或网页标题
- 保存格式：PNG/JPG可配置
- 保存位置：用户可配置的默认下载目录
- 自动触发下载：无需用户确认

### 4.4 配置参数
- 延迟截图时间（等待动态内容加载）
- 滚动步长设置
- 图像质量参数
- 默认保存格式
- 自动保存开关

### 4.3 保存和导出
- 自动保存为PNG/JPG格式到固定位置
- 自动命名（基于时间戳或网页标题）
- 自动合并滚动截图
- 复制到剪贴板（可选）
- 分享到社交媒体（可选）

### 4.4 核心代码示例

#### 4.4.1 Background Script (background.js)
```javascript
chrome.action.onClicked.addListener((tab) => {
  // 发送消息到内容脚本开始截图
  chrome.tabs.sendMessage(tab.id, {action: "capture"});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveScreenshot") {
    // 自动生成文件名
    const filename = `screenshot_${Date.now()}.png`;
    
    // 自动保存到默认下载目录
    chrome.downloads.download({
      url: request.dataUrl,
      filename: filename,
      saveAs: false
    });
    
    sendResponse({success: true});
  }
});
```

#### 4.4.2 Content Script (content.js)
```javascript
// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    captureFullPage();
  }
});

function captureFullPage() {
  // 获取页面完整尺寸
  const fullHeight = document.body.scrollHeight;
  const viewportHeight = window.innerHeight;
  
  // 计算需要滚动的次数
  const scrolls = Math.ceil(fullHeight / viewportHeight);
  
  // 存储截图数据
  const screenshots = [];
  
  // 逐屏滚动并截图
  let scrollCount = 0;
  
  function captureNext() {
    if (scrollCount < scrolls) {
      // 滚动到指定位置
      window.scrollTo(0, scrollCount * viewportHeight);
      
      // 等待页面渲染完成
      setTimeout(() => {
        // 使用Canvas捕获当前视口
        chrome.runtime.sendMessage({
          action: "captureViewport",
          scrollPosition: scrollCount * viewportHeight
        }, (response) => {
          screenshots.push({
            dataUrl: response.dataUrl,
            position: scrollCount * viewportHeight
          });
          
          scrollCount++;
          captureNext();
        });
      }, 500); // 等待500ms确保动态内容加载完成
    } else {
      // 所有截图完成，开始合并
      mergeScreenshots(screenshots, fullHeight, viewportHeight);
    }
  }
  
  captureNext();
}

function mergeScreenshots(screenshots, fullHeight, viewportHeight) {
  // 创建完整画布
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth;
  canvas.height = fullHeight;
  
  const ctx = canvas.getContext('2d');
  
  // 按照滚动位置将各截图绘制到对应位置
  let processed = 0;
  
  screenshots.forEach((screenshot) => {
    const img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, screenshot.position);
      processed++;
      
      // 所有图像处理完成
      if (processed === screenshots.length) {
        // 将完整截图发送给background script保存
        chrome.runtime.sendMessage({
          action: "saveScreenshot",
          dataUrl: canvas.toDataURL('image/png')
        });
      }
    };
    img.src = screenshot.dataUrl;
  });
}
```

## 5. 用户界面设计

### 5.1 Popup界面
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h3>WebShot 网页截图</h3>
    <button id="captureBtn">截图当前页面</button>
    <div class="options">
      <label>
        <input type="checkbox" id="fullPageCheckbox" checked>
        完整页面截图
      </label>
      <button id="settingsBtn">设置</button>
    </div>
    <div id="status">准备就绪</div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

### 5.2 编辑界面
- 工具栏（裁剪、文本、形状）
- 预览区域
- 操作按钮（保存、取消、下载）

### 5.4 Popup界面逻辑 (popup.js)
```javascript
document.addEventListener('DOMContentLoaded', function() {
  const captureBtn = document.getElementById('captureBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const statusEl = document.getElementById('status');
  
  // 截图按钮点击事件
  captureBtn.addEventListener('click', function() {
    statusEl.textContent = '正在准备截图...';
    
    // 获取当前活动标签页
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // 发送截图指令到内容脚本
      chrome.tabs.sendMessage(tabs[0].id, {action: "capture"}, function(response) {
        if (chrome.runtime.lastError) {
          statusEl.textContent = '截图失败，请刷新页面后重试';
        } else {
          statusEl.textContent = '截图已保存到下载目录';
        }
      });
    });
  });
  
  // 设置按钮点击事件
  settingsBtn.addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
});
```

### 5.3 设置界面
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <div class="container">
    <h3>WebShot 设置</h3>
    <form id="settingsForm">
      <div class="setting-group">
        <label for="delayTime">延迟时间（毫秒）:</label>
        <input type="number" id="delayTime" min="0" max="10000" value="500">
      </div>
      <div class="setting-group">
        <label for="imageFormat">图像格式:</label>
        <select id="imageFormat">
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
        </select>
      </div>
      <div class="setting-group">
        <label for="autoSave">自动保存:</label>
        <input type="checkbox" id="autoSave" checked>
      </div>
      <div class="setting-group">
        <label for="quality">图像质量 (JPEG):</label>
        <input type="range" id="quality" min="0.1" max="1" step="0.1" value="0.9">
      </div>
      <button type="submit">保存设置</button>
    </form>
  </div>
  <script src="options.js"></script>
</body>
</html>
```

### 5.5 设置界面逻辑 (options.js)
```javascript
// 默认设置
const defaultSettings = {
  delayTime: 500,
  imageFormat: 'png',
  autoSave: true,
  quality: 0.9
};

// 页面加载时读取保存的设置
document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get(defaultSettings, function(items) {
    document.getElementById('delayTime').value = items.delayTime;
    document.getElementById('imageFormat').value = items.imageFormat;
    document.getElementById('autoSave').checked = items.autoSave;
    document.getElementById('quality').value = items.quality;
  });
});

// 保存设置
document.getElementById('settingsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const settings = {
    delayTime: parseInt(document.getElementById('delayTime').value),
    imageFormat: document.getElementById('imageFormat').value,
    autoSave: document.getElementById('autoSave').checked,
    quality: parseFloat(document.getElementById('quality').value)
  };
  
  chrome.storage.sync.set(settings, function() {
    // 显示保存成功的提示
    const status = document.createElement('div');
    status.textContent = '设置已保存';
    status.className = 'success-message';
    document.body.appendChild(status);
    
    // 3秒后移除提示
    setTimeout(() => {
      document.body.removeChild(status);
    }, 3000);
  });
});
```

## 6. 权限和安全

### 6.1 所需权限
- "activeTab"：访问当前活动标签页
- "storage"：保存用户设置
- "downloads"：下载截图文件
- "scripting"：执行内容脚本
- "clipboardWrite"：复制图像到剪贴板

### 6.2 安全考虑
- 限制内容脚本访问范围
- 数据本地处理，不上传用户数据
- 权限最小化原则
- 使用HTTPS通信（如需要）

## 7. 测试策略

### 7.1 单元测试
- 各功能模块独立测试
- API调用模拟测试
- 滚动截图算法测试
- 图像处理功能测试

### 7.2 集成测试
- 扩展整体功能测试
- 不同浏览器版本兼容性测试
- 不同类型网站截图测试（静态页面、动态页面、SPA应用）

### 7.3 用户体验测试
- 界面交互流畅性测试
- 截图准确性验证
- 自动保存功能测试

## 8. 部署和发布

### 8.1 打包流程
- 代码压缩和优化
- 生成扩展包(.zip)
- 在Chrome开发者仪表板上传

### 8.2 发布渠道
- Chrome Web Store
- 其他第三方扩展商店

### 8.3 版本管理
- 遵循语义化版本控制（SemVer）
- 更新日志记录

## 9. 未来扩展功能

### 9.1 高级编辑功能
- 更多图像编辑工具
- 模板和贴纸功能
- 延迟截图配置（针对动态网站）
- OCR文字识别
- 图像压缩优化

### 9.2 云同步功能
- 截图历史记录云同步
- 跨设备访问截图
- 截图分类和标签管理

### 9.3 协作功能
- 截图分享和评论
- 团队协作工具集成
- 截图比较功能（版本对比）