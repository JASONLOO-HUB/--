# UI/UX 设计规范（浅色优先）

本文件用于约束 `Bento Grid + Glassmorphism + Modern SaaS` 的实现细节，作为前端迭代基线。

## 1. 布局与容器规范

- 页面外层统一使用 `page-shell`。
- 内容容器统一使用 `page-container`，最大宽度为 `max-w-7xl`。
- 大区块优先使用 `bento-grid`，避免平均分栏导致信息同权。
- 主卡片使用 `card`，次级面板使用 `glass-card`。

## 2. 视觉 Token（浅色）

- 背景：页面为浅灰渐变底，卡片为半透明白。
- 边框：优先 `border-slate-200/80`。
- 圆角：页面/主卡 `rounded-3xl`，控件 `rounded-xl`。
- 阴影：默认 `shadow-soft`，玻璃卡 `shadow-glass`。
- 文字：标题 `font-semibold`，正文 `font-normal`，辅助 `text-slate-500/600`。

## 3. 核心组件状态规范

### 按钮

- 主按钮：`btn-primary`
  - 默认：主色背景 + 白字
  - Hover：加深为 `primary-700`
  - Focus：可见 `focus-visible:ring`
  - Disabled：`opacity-55 + cursor-not-allowed`
- 次按钮：`btn-secondary`
  - 默认：白底细边框
  - Hover：浅灰背景
  - Focus：中性 ring
  - Disabled：同上

### 输入框

- 统一使用 `input-field`
  - 默认：白底 + `border-slate-200`
  - Focus：`border-primary-400 + ring-primary-500/20`
  - Placeholder：`text-slate-400`

### 分段选择器

- 默认态：`seg-pill`
- 激活态：`seg-pill-active`
- 禁用态：显式 `cursor-not-allowed` 与低对比文本

### 长选项卡（追问）

- 默认：`long-option-card`
- 选中：`long-option-card selected`
- 交互：禁止跳变，保持边框/背景渐变过渡

## 4. 页面实现约束

- `InputPage`：上传与岗位输入采用双区块 Bento 结构，保持单主 CTA。
- `AnalysisPage`：摘要、图表、模块概览采用不等高卡片，JD 切换使用 pill。
- `RewritePage`：原文、追问、改写结果分区明确，状态与反馈前置。
- `PlanPage`：进度、节奏、里程碑、建议、避坑采用 dashboard 式分块。

## 5. UX 验收清单（发布前）

- [ ] 四页视觉语言统一（Bento + Glass + Modern SaaS）
- [ ] 所有主流程按钮都具备 hover/focus/disabled 状态
- [ ] 输入组件焦点态明显且不依赖颜色单一提示
- [ ] 关键卡片圆角与边框风格一致（避免混用）
- [ ] 加载时有明确反馈（spinner 或文本进度）
- [ ] 错误提示靠近输入区域并提供恢复动作
- [ ] 触控目标不小于 44px
- [ ] 页面在移动端与桌面端无横向滚动
- [ ] 文本层级清晰（标题/正文/辅助信息）
- [ ] 主流程路径稳定：上传 → 分析 → 改写 → 规划

