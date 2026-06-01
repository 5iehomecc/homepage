# 5iehome.cc 科技感首页

> **当前版本：V2.0.0** | 2026-05-26

为 **5iehome.cc** 打造的未来科技感纯 HTML 首页，集成插件化特效架构、设计令牌系统、动态星空背景、玻璃拟态 UI、趣味互动特效与 Live2D 看板娘。

## 🚀 项目概览

- **核心架构**: HTML5 / CSS3 / 原生 JavaScript（零框架依赖）
- **特效架构**: `App.register` 插件注册中心，新增特效只需 3 步
- **样式架构**: 6 层 CSS（设计令牌 → 重置 → 工具类 → 组件 → 响应式 → 无障碍）
- **视觉风格**: 未来科技 / 玻璃拟态 (Glassmorphism) / 深色系
- **性能优化**: 内联关键 CSS、defer 脚本、对象池粒子系统、图片压缩、Retina 适配

---

## ✨ 功能特性

### 界面与布局
- **玻璃拟态卡片**: `backdrop-filter` 半透明磨砂质感
- **2×2 导航网格**: CSS Grid 紧凑排列，hover 发光上浮
- **响应式设计**: `clamp()` 流体字号、`100dvh` 移动端视口、极小屏适配（≤360px）
- **动态流光背景**: `radial-gradient` 径向渐变 + Canvas 星空闪烁
- **设计令牌系统**: 颜色、间距、字号、圆角、阴影、过渡、z-index 全部变量化，一键换肤

### 交互特效
- **🐱 小猫追踪 (oneko)**: 基于 [adryd325/oneko.js](https://github.com/adryd325/oneko.js)，像素小猫追踪鼠标，闲置时随机挠痒/睡觉，支持墙壁挠痒、位置持久化（localStorage）、触摸事件、`prefers-reduced-motion` 自动禁用
- **✨ 仙女棒 (fairywand)**: Canvas 粒子拖尾，对象池预分配 + swap-and-pop O(1) 删除零 GC，Retina 适配，300 粒子上限防内存泄漏
- **🌟 星空闪烁 (stars)**: Canvas 渲染 200 颗独立闪烁星星，每颗星随机相位/速度，`sin` 波形明暗变化
- **🎎 Live2D 看板娘**: 页面加载完成后异步加载，不阻塞首屏

### 性能优化
- CSS 全部内联，消除外部样式表请求和冗余下载
- Google Fonts `text=` 子集化，仅加载页面所需14个汉字（CSS ~29→1 KiB，字体 ~168→~15 KiB）
- `preconnect` 预连接 Google Fonts（精简至2个，移除冗余 CDN preconnect）
- `preload` + `fetchpriority="high"` 预加载 LCP 图片
- 所有装饰脚本 `defer` 加载，Live2D 延迟到 `window.load` 后
- `content-visibility: auto` + `contain-intrinsic-size` 优化页脚渲染
- `decoding="async"` 图片异步解码
- Logo 240×240 WebP（7.9KB）、Favicon 32×32+16×16 ICO（3.0KB）
- Friends Banner 900×310 WebP（28.8KB，合成深色背景去除 alpha 通道）

### 无障碍
- `prefers-reduced-motion` 媒体查询，尊重减少动画偏好
- `:focus-visible` 键盘焦点样式
- `aria-hidden` 屏幕阅读器跳过装饰元素
- 版权年份自动更新

---

## 🏗️ 架构说明

### 插件注册系统

`app.js` 是全局命名空间与插件注册中心，所有特效通过 `App.register(name, initFn)` 注册，在 `DOMContentLoaded` 时统一初始化。

**新增特效只需 3 步：**
1. 创建 `js/your-effect.js`
2. 在文件末尾调用 `App.register('yourEffect', initFn)`
3. 在 `index.html` 中添加 `<script defer src="js/your-effect.js">`

**配置系统：**
- `App.config` 存放全局配置，各插件可读取
- 可通过 `window.__APP_CONFIG__` 覆盖默认值（用于动态配置）
- 每个插件可通过 `App.config.插件名` 读取专属配置

### CSS 6 层架构

| 层级 | 名称 | 说明 |
|------|------|------|
| Layer 1 | Design Tokens | 所有可主题化的 CSS 变量（颜色、间距、字号、圆角、阴影、过渡、z-index） |
| Layer 2 | Reset & Base | 全局重置与基础样式 |
| Layer 3 | Utilities | Tailwind 风格工具类（`.u-flex-center`、`.u-sr-only` 等） |
| Layer 4 | Components | 组件样式（`.glass-card`、`.nav-grid`、`.nav-item` 等） |
| Layer 5 | Responsive | 响应式覆盖（≤360px 适配） |
| Layer 6 | Accessibility | 无障碍覆盖（`prefers-reduced-motion`） |

### Z-index 层级

| 变量 | 值 | 用途 |
|------|----|------|
| `--z-bg` | -1 | 背景渐变层 |
| `--z-canvas` | 0 | 星空画布 |
| `--z-content` | 10 | 页面内容 |
| `--z-effect` | 999 | 仙女棒粒子 |
| `--z-top` | 2147483647 | 小猫（最顶层） |

---

## 📁 文件结构

```
├── index.html              # 网站入口（V2.0.0 | 含内联 CSS + 设计令牌）
├── 5iehome_cc_logo.webp    # Logo（240×240 WebP, 7.9KB）
├── favicon.ico             # 浏览器标签图标（32×32 + 16×16, 3.0KB）
├── css/
│   ├── friends.webp        # Friends 横幅（900×310 WebP, 28.8KB）
│   └── style.css           # 旧版样式表（已内联，保留作参考）
└── js/
    ├── app.js              # 全局插件注册中心 + 配置 + 运行时间 + 版权年份
    ├── oneko.js            # 小猫追踪（App.register 插件）
    ├── oneko.gif           # 小猫精灵图
    ├── oneko_white.gif     # 白色小猫精灵图
    ├── fairywand.js        # 仙女棒粒子拖尾（App.register 插件）
    └── stars.js            # 星空闪烁背景（App.register 插件）
```

---

## 📖 使用指南

1. 将所有文件放置于网站根目录
2. 确保 `js/oneko.gif` 路径正确
3. 直接在浏览器中打开 `index.html` 即可

### 自定义

- **替换 Logo**: 替换 `5iehome_cc_logo.webp`（建议 240×240 WebP 格式）
- **替换图标**: 替换 `favicon.ico`（建议包含 32×32 和 16×16 两种尺寸）
- **切换小猫样式**: 修改 `<script defer src="js/oneko.js" data-cat="js/oneko_white.gif">` 可使用白色小猫
- **调整星星数量**: 在 `index.html` 中添加 `window.__APP_CONFIG__ = { stars: { count: 300 } }` 或直接修改 `js/stars.js` 中 `count` 值
- **调整粒子数量**: 同理修改 `App.config.fairywand.maxParticles` 或 `js/fairywand.js` 中 `maxParticles` 值
- **修改主题色**: 修改 CSS 变量 `--c-primary` 和 `--c-primary-rgb` 即可全局换色
- **修改建站日期**: 修改 `app.js` 中 `defaultConfig.startTime` 或通过 `window.__APP_CONFIG__.startTime` 覆盖
- **禁用位置持久化**: 修改 `<script defer src="js/oneko.js" data-persist-position="false">`

---

## 📋 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| V2.0.0 | 2026-05-26 | PageSpeed 全面优化：CSS 内联化、Google Fonts 子集化、图片压缩（friends.webp 缩尺+去alpha）、preconnect 精简、decoding=async |
| V1.0.0 | 2026-05-09 | 初始版本：插件架构、设计令牌、玻璃拟态 UI、星空/小猫/仙女棒特效、Live2D |

---

> 更新日期：2026年5月26日
