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