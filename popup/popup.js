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