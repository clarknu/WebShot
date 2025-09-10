# WebShot - Chrome扩展截图工具

## 项目概述

WebShot是一个Chrome浏览器扩展程序，允许用户对当前浏览的网页进行截图，并提供基本的编辑和保存功能。

## 功能特性

- 手动触发截图，确保动态内容加载完成
- 支持完整网页滚动截图，精确处理滚动位移和图像合并
- 自动保存截图到固定位置，自动命名和合并
- 可配置参数控制截图行为
- 用户友好的界面交互和设置选项

## 项目结构

```
webshot-extension/
├── manifest.json          # 扩展配置文件
├── background.js          # 后台脚本
├── content.js             # 内容脚本
├── popup/
│   ├── popup.html         # 弹出界面HTML
│   ├── popup.css          # 弹出界面样式
│   └── popup.js           # 弹出界面逻辑
├── options/
│   ├── options.html       # 设置页面HTML
│   ├── options.css        # 设置页面样式
│   └── options.js         # 设置页面逻辑
├── icons/                 # 扩展图标（已自动生成）
├── lib/                   # 工具库
│   └── screenshot-utils.js # 截图工具函数
└── libs/                  # 第三方库（如html2canvas）
    └── html2canvas.min.js  # 网页截图库
```

## 安装和使用

1. 在Chrome浏览器中打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择本项目目录
5. 点击扩展图标即可使用截图功能

## 使用说明

1. 点击浏览器工具栏中的WebShot图标打开弹出界面
2. 点击"截图当前页面"按钮开始截图
3. 扩展会自动滚动页面并捕获完整内容
4. 截图完成后会自动保存到浏览器的默认下载目录

## 配置选项

通过点击弹出界面中的"设置"按钮可以访问配置页面，可以配置以下选项：
- 延迟时间：等待动态内容加载的时间
- 图像格式：保存的图像格式（PNG或JPEG）
- 自动保存：是否自动保存截图
- 图像质量：JPEG格式的图像质量

## 技术实现

- 使用Chrome Extension API
- 使用html2canvas库进行高质量网页截图
- 使用Canvas API进行图像处理
- 支持滚动截图的完整页面捕获
- 使用Chrome存储API保存用户设置

## 注意事项

- 由于浏览器安全限制，某些网站可能无法正确截图
- 扩展需要访问所有网站的权限才能正常工作
- 截图功能在某些动态内容较多的网站上可能需要调整延迟时间

## 图标文件

为了使扩展能够正常工作，您需要在icons目录中添加以下PNG格式的图标文件：
- icon16.png (16x16)
- icon32.png (32x32)
- icon48.png (48x48)
- icon128.png (128x128)

这些图标已通过自动化脚本生成，设计融合了相机和网页元素，体现了截图工具的功能特性。

## 第三方库

本项目使用了以下第三方库：

1. **html2canvas** - 用于高质量网页截图
   - 版本：1.4.1
   - 文件位置：[libs/html2canvas.min.js](file:///d:/Work/WebShot/libs/html2canvas.min.js)
   - CDN链接：https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
   - 已自动下载到项目中，无需额外安装

## 未来改进

- 集成更强大的截图库（如html2canvas）
- 添加图像编辑功能
- 支持截图历史记录
- 添加云同步功能