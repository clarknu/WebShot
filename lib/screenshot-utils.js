// 截图工具库

/**
 * 获取页面完整尺寸信息
 * @returns {Object} 包含页面尺寸信息的对象
 */
function getPageDimensions() {
  return {
    width: Math.max(
      document.body.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.clientWidth,
      document.documentElement.scrollWidth,
      document.documentElement.offsetWidth
    ),
    height: Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    )
  };
}

/**
 * 捕获当前视口的截图
 * @returns {Promise<string>} 包含截图数据的Data URL
 */
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
      
      // 尝试使用html2canvas（如果可用）
      if (typeof html2canvas !== 'undefined') {
        html2canvas(document.body, {
          canvas: canvas,
          width: window.innerWidth,
          height: window.innerHeight,
          x: window.scrollX,
          y: window.scrollY,
          useCORS: true,
          allowTaint: true
        }).then(canvas => {
          resolve(canvas.toDataURL('image/png'));
        }).catch(() => {
          // 如果html2canvas失败，返回空白画布
          resolve(canvas.toDataURL('image/png'));
        });
      } else {
        // 如果html2canvas不可用，尝试其他方法或返回空白画布
        // 这里我们简单地返回一个空白画布作为占位符
        resolve(canvas.toDataURL('image/png'));
      }
    } catch (error) {
      // 如果出现错误，返回空白画布
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      resolve(canvas.toDataURL('image/png'));
    }
  });
}

/**
 * 合并多张截图
 * @param {Array} screenshots 截图数据数组
 * @param {number} fullHeight 页面完整高度
 * @param {number} viewportHeight 视口高度
 * @param {number} viewportWidth 视口宽度
 * @returns {Promise<string>} 合并后的截图Data URL
 */
function mergeScreenshots(screenshots, fullHeight, viewportHeight, viewportWidth) {
  return new Promise((resolve) => {
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
      // 如果没有截图数据，返回空白画布
      resolve(canvas.toDataURL('image/png'));
      return;
    }
    
    screenshots.forEach((screenshot) => {
      const img = new Image();
      img.onload = function() {
        ctx.drawImage(img, 0, screenshot.position);
        processed++;
        
        // 所有图像处理完成
        if (processed === screenshots.length) {
          // 返回合并后的Data URL
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.src = screenshot.dataUrl;
    });
  });
}

// 导出函数
window.ScreenshotUtils = {
  getPageDimensions,
  captureViewport,
  mergeScreenshots
};