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
  } else if (request.action === "captureViewport") {
    // 这里应该捕获当前视口的截图
    // 但在扩展中，我们无法直接访问页面内容进行截图
    // 我们需要修改方法，让content script自己处理截图
    
    // 发送响应告知content script继续下一步
    sendResponse({dataUrl: null});
  }
});