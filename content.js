// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture") {
    captureFullPage().then(() => {
      // 截图完成，发送响应给popup
      sendResponse({success: true});
    }).catch((error) => {
      console.error('Capture failed:', error);
      sendResponse({success: false, error: error.message});
    });
    
    // 返回true以保持消息通道开放，直到sendResponse被调用
    return true;
  }
});

function captureFullPage() {
  return new Promise((resolve, reject) => {
    try {
      // 获取页面完整尺寸
      const dimensions = ScreenshotUtils.getPageDimensions();
      const fullHeight = dimensions.height;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
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
            // 捕获当前视口截图
            ScreenshotUtils.captureViewport().then(dataUrl => {
              screenshots.push({
                dataUrl: dataUrl,
                position: scrollCount * viewportHeight
              });
              
              scrollCount++;
              captureNext();
            }).catch(reject);
          }, 500); // 等待500ms确保动态内容加载完成
        } else {
          // 所有截图完成，开始合并
          ScreenshotUtils.mergeScreenshots(screenshots, fullHeight, viewportHeight, viewportWidth).then(dataUrl => {
            // 将完整截图发送给background script保存
            chrome.runtime.sendMessage({
              action: "saveScreenshot",
              dataUrl: dataUrl
            });
            
            // 截图完成
            resolve();
          }).catch(reject);
        }
      }
      
      captureNext();
    } catch (error) {
      reject(error);
    }
  });
}

function captureViewport() {
  return new Promise((resolve) => {
    try {
      // 创建canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 设置canvas尺寸为视口尺寸
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // 填充白色背景（处理透明背景）
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 尝试绘制页面内容
      // 注意：由于安全限制，我们无法直接捕获页面的精确视觉表示
      // 这里我们提供一个简化的实现
      drawPageContent(ctx);
      
      resolve(canvas.toDataURL('image/png'));
    } catch (error) {
      // 如果出现错误，返回空白画布
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      resolve(canvas.toDataURL('image/png'));
    }
  });
}

function drawPageContent(ctx) {
  // 绘制页面背景
  ctx.fillStyle = document.body.style.backgroundColor || '#ffffff';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // 绘制页面文本内容（简化实现）
  ctx.fillStyle = document.body.style.color || '#000000';
  ctx.font = getComputedStyle(document.body).font || '16px Arial';
  
  // 获取页面文本内容
  const text = document.body.innerText || document.body.textContent;
  const words = text.split(' ');
  
  // 简单的文本绘制
  let x = 10;
  let y = 30;
  const maxWidth = ctx.canvas.width - 20;
  
  words.forEach(word => {
    const wordWidth = ctx.measureText(word).width;
    
    if (x + wordWidth > maxWidth) {
      x = 10;
      y += 20;
    }
    
    ctx.fillText(word, x, y);
    x += wordWidth + 5; // 添加空格
  });
}

function mergeScreenshots(screenshots, fullHeight, viewportHeight, viewportWidth) {
  // 创建完整画布
  const canvas = document.createElement('canvas');
  canvas.width = viewportWidth;
  canvas.height = fullHeight;
  
  const ctx = canvas.getContext('2d');
  
  // 填充白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 按照滚动位置将各截图绘制到对应位置
  let processed = 0;
  
  if (screenshots.length === 0) {
    // 如果没有截图数据，发送空的截图给background script保存
    chrome.runtime.sendMessage({
      action: "saveScreenshot",
      dataUrl: canvas.toDataURL('image/png')
    });
    return;
  }
  
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