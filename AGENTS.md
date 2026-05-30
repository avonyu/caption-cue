# CaptionCue Agent Guide

`prototype/APP_FLOW_PROPOSAL.md` 中的内容为该产品的设计规格，用于指导后续代码代理在本仓库内实现和维护

## 产品目标

CaptionCue - 幕听是一个基于在线视频字幕学习英语的浏览器插件。
核心体验是：用户打开视频页面后，插件自动识别当前视频和字幕，展示可交互的字幕学习面板；用户可以点击字幕跳转到对应时间点、按句循环、查看翻译、AI 解释、生词和语法分析。

## 技术栈

- Plasmo：浏览器扩展框架，Manifest V3。
- TypeScript：核心逻辑、数据模型、扩展消息协议。
- React：Popup、Side Panel、Options Page、页面浮层。
- Zustand：React UI 和学习状态管理。
- Tailwind CSS：React UI 样式、暗色学习模式、响应式布局。
- `chrome.storage.local`：配置和轻量学习状态。
- IndexedDB：字幕、AI 结果和长文本缓存。
- lucide：图标库

## 架构边界

- Content Script 只负责页面探测、视频控制和必要 DOM 注入。
- React UI 不直接操作页面 `video`，统一通过消息调用 content script 的 video-controller 能力。
- AI API 调用优先放在 Background Service Worker，避免页面上下文泄露密钥。
- API Key 不进入 content script。
- Zustand store 只保存可序列化状态；音频 Blob、MediaStream、AbortController 等对象由任务模块内部管理。
- Content Script 与 Side Panel / Popup 通过 Plasmo messaging 同步必要状态。

## 验证

- 常规构建：`bun run build`。
- 修改 content script 后，检查生成的 manifest 中 `content_scripts` 是否包含期望的 `matches`。
- 在抖音页面验证时，应测试动态切换视频、SPA 路由变化、多个 `video` 元素和播放器 DOM 重渲染。
