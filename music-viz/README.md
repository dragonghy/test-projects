# Music Visualizer - PRD

## 项目概述

一个纯前端音乐可视化 Web 应用。用户可上传音频文件或使用内置示例音频，在 Canvas 上实时看到动态可视化效果。

- **技术栈**: 纯 HTML + CSS + JS（无框架）
- **核心 API**: Web Audio API (AnalyserNode) + Canvas API
- **部署**: Vercel 静态部署
- **在线演示**: https://music-viz-wheat.vercel.app
- **代码目录**: `projects/music-viz/`
- **文件结构**: `index.html`, `style.css`, `app.js`

## 用户体验目标

1. 打开页面即可看到深色背景的炫酷界面
2. 上传音频文件后自动开始播放并显示可视化
3. 可随时切换不同可视化模式
4. 播放控制直观易用（播放/暂停/进度/音量）
5. 支持全屏沉浸式体验
6. 移动端也能正常使用

## Milestone 进度

- [x] **Milestone 1**: 基础可视化 (Ticket #293 → ✅ 验收通过)
- [x] **Milestone 2**: 增强功能 (Ticket #295 → ✅ 验收通过)

**🎉 项目已全部完成！** (2026-03-15)

---

## Milestone 1: 基础可视化

### 功能需求

#### 1. 音频播放器
- 支持上传 MP3/WAV 文件并播放
- 播放/暂停按钮
- 进度条（可拖动跳转）
- 音量控制滑块

#### 2. 频谱柱状图可视化
- 使用 Web Audio API 的 AnalyserNode 获取频率数据
- Canvas 绘制动态柱状图（bars）
- 柱状图高度实时跟随音频频率变化
- 炫彩渐变色效果

#### 3. 波形可视化
- 使用 AnalyserNode 的 getByteTimeDomainData
- Canvas 绘制实时波形线条
- 平滑流畅的动画效果

#### 4. 可视化模式切换
- 至少 2 种模式：频谱柱状图 + 波形
- 切换按钮清晰可见，切换流畅无闪烁

#### 5. Canvas 全屏
- 可视化区域尽量大，占据主要屏幕空间
- 支持浏览器全屏 API（Fullscreen API）
- 全屏按钮

#### 6. 响应式设计
- 桌面端和移动端均可正常使用
- Canvas 自适应窗口大小
- 控制栏在小屏幕上合理布局

#### 7. 视觉风格
- 深色背景（接近黑色）
- 可视化元素使用炫彩颜色（霓虹风格渐变）
- 整体科技感/赛博朋克风格

### 验收标准

1. 上传 MP3/WAV 文件后能正常播放，播放控制正常工作
2. 频谱柱状图实时响应音频，动画流畅（≥30fps）
3. 波形可视化实时响应音频，动画流畅
4. 可在两种可视化模式间切换
5. 全屏功能正常工作
6. 在 Chrome/Firefox 桌面端测试通过
7. 在移动端视口下布局合理
8. 深色背景 + 炫彩效果呈现

---

## Milestone 2: 增强功能

### 功能需求

#### 1. 更多可视化模式
- 圆形频谱（circular spectrum）
- 粒子效果（particle effect）
- 至少新增 2 种模式（总计 ≥4 种）

#### 2. 颜色主题
- 至少 3 种可选主题：Rainbow / Ocean / Neon
- 主题切换按钮或下拉菜单
- 切换后实时生效

#### 3. 灵敏度调节
- 可调 FFT 大小或平滑系数
- 滑块或选择器控制
- 实时影响可视化效果

#### 4. 内置示例音频
- 使用 Web Audio API（OscillatorNode / AudioBuffer）合成简单节拍
- 用户无需上传文件即可体验可视化
- "Play Demo" 按钮

#### 5. 截图功能
- 一键保存当前 Canvas 画面为 PNG
- 使用 canvas.toDataURL() + download
- "Save Screenshot" 按钮

#### 6. 歌曲信息显示
- 显示文件名
- 显示总时长和当前播放时间
- 格式化为 mm:ss

### 验收标准

1. 总共至少 4 种可视化模式，均能正常工作
2. 3 种颜色主题可切换，实时生效
3. 灵敏度调节功能可用，对可视化有明显影响
4. 内置示例音频可播放且触发可视化
5. 截图功能可保存 PNG 文件
6. 歌曲信息准确显示

---

## 技术架构

```
index.html          - 页面结构、控制栏、Canvas
style.css           - 深色主题样式、响应式布局
app.js              - 音频处理、可视化渲染、UI 交互
```

### 核心技术点
- `AudioContext` + `AnalyserNode` 获取音频频率/波形数据
- `requestAnimationFrame` 驱动 Canvas 动画循环
- `canvas.getContext('2d')` 绑制可视化图形
- `Fullscreen API` 实现全屏
- `canvas.toDataURL('image/png')` 实现截图
- `OscillatorNode` 合成示例音频
