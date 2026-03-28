# 前端 Preview 脚本结构与清理指南

本文档用于记录“无后端独立预览”能力的代码结构，确保后续可以完整、可控地移除该能力。

## 目标能力

- 通过脚本直接启动某个页面预览，不依赖后端。
- 默认主流程保持不变（`npm run dev` 仍走真实接口）。
- 仅当指定 preview 模式时启用 mock 数据和页面自动跳转。

## 入口与开关

### 1) npm 脚本入口

文件：`frontend/package.json`

新增脚本：

- `dev:preview:input`
- `dev:preview:analysis`
- `dev:preview:rewrite`
- `dev:preview:plan`
- `dev:preview:followup`（追问补充 / 提问用户，路由同改写页；由 `VITE_PREVIEW_FOLLOWUP` 驱动）
- `dev:preview:followup:3004`（同上，固定 3004 端口）

这些脚本通过 `vite --mode preview-*` 读取对应 `.env.preview-*` 文件。

### 2) 环境变量开关

文件：

- `frontend/.env.preview-input`
- `frontend/.env.preview-analysis`
- `frontend/.env.preview-rewrite`
- `frontend/.env.preview-plan`
- `frontend/.env.preview-followup`

关键变量：

- `VITE_USE_MOCK=true`：启用 mock API 适配层
- `VITE_PREVIEW_PAGE=...`：指定启动后自动跳转页面
- `VITE_PREVIEW_FOLLOWUP=true`（仅 `preview-followup`）：改写页加载后直达「追问补充」区块

## 代码结构（核心改动点）

### A. API 切换层

文件：`frontend/src/api/index.ts`

职责：

- 保留真实 API 实现（`realSessionApi` 等）
- 根据 `VITE_USE_MOCK` 在导出层切换：
  - `true` -> `mockApi.*`
  - `false` -> `real*.`

关键标识（用于全局检索）：

- `USE_MOCK`
- `mockApi`
- `realSessionApi`

### B. Mock 数据实现

文件：`frontend/src/api/mock.ts`

职责：

- 提供与真实 API 对齐的前端 mock 返回结构
- 覆盖 Input / Analysis / Rewrite / Plan 页面所需数据
- 包含固定 ID：
  - `mock-session`
  - `mock-resume`

关键标识（用于全局检索）：

- `MOCK_SESSION_ID`
- `MOCK_RESUME_ID`
- `export const mockApi`

### C. 路由自动跳转

文件：`frontend/src/App.tsx`

职责：

- 读取 `VITE_PREVIEW_PAGE`
- 在 `/` 路由下自动跳转到对应页面：
  - `input` -> `/`
  - `analysis` -> `/analysis/mock-session`
  - `rewrite` -> `/rewrite/mock-session/mock-resume`
  - `followup` -> `/rewrite/mock-session/mock-resume`
  - `plan` -> `/plan/mock-session`

关键标识（用于全局检索）：

- `previewPathMap`
- `VITE_PREVIEW_PAGE`
- `Navigate`

### D. 文档说明

文件：`README.md`

职责：

- 记录 preview 使用方式
- 明确说明“不影响默认 dev 联调流程”

### E. 追问补充预览（与改写页同路由）

文件：`frontend/src/pages/RewritePage.tsx`

职责：

- 在 Mock 且 `VITE_PREVIEW_FOLLOWUP=true` 时，加载实习/项目模块并注入种子数据，直接进入「追问补充」区块

文件：`frontend/src/preview/followupPreviewSeed.ts`

- 导出 `FOLLOWUP_PREVIEW_SEED`；`voiceApi.summarize`（mock）与改写页预览共用同一套问题数据

文件：`frontend/scripts/preview-followup.sh`（可选）

- 一键启动追问预览，默认端口 3004

## 完整清除方案（按顺序）

如果未来要完全移除该能力，按以下步骤执行：

1. 删除脚本入口：`frontend/package.json` 中全部 `dev:preview:*`
2. 删除环境文件：
   - `.env.preview-input`
   - `.env.preview-analysis`
   - `.env.preview-rewrite`
   - `.env.preview-plan`
   - `.env.preview-followup`
3. 删除 mock 文件：`frontend/src/api/mock.ts`
4. 回退 API 切换：
   - `frontend/src/api/index.ts` 中移除 `mockApi` 与 `USE_MOCK` 相关代码
   - 直接恢复导出真实 API（`sessionApi` 等）
5. 回退路由与追问直达逻辑：
   - `frontend/src/App.tsx` 移除 `Navigate`、`previewPathMap`、`previewPage` 逻辑（含 `followup` 项）
   - `frontend/src/pages/RewritePage.tsx` 移除 `FOLLOWUP_PREVIEW_SEED` 导入、`loadSections` 的 `seedFollowupPreview` 分支，以及 `loadData` 中 `VITE_PREVIEW_FOLLOWUP` 分支
   - 删除 `frontend/src/preview/followupPreviewSeed.ts`、`frontend/scripts/preview-followup.sh`（若存在）
6. 删除 README 中 preview 说明段落
7. 删除本文档：`frontend/PREVIEW_CLEANUP_GUIDE.md`

## 清除校验清单

完成清除后，执行以下确认：

- `rg "dev:preview:" frontend/package.json` 无结果
- `rg "VITE_PREVIEW_PAGE|VITE_USE_MOCK" frontend` 仅允许出现在你保留的文档中（若文档也删，则应无结果）
- `rg "VITE_PREVIEW_FOLLOWUP|FOLLOWUP_PREVIEW_SEED|seedFollowupPreview" frontend/src` 无结果
- `rg "mock-session|mock-resume|mockApi" frontend/src` 无结果
- `npm run dev` 可正常启动
- `npm run build` 可通过

## 备注

- 这套方案是“按环境启用”，不修改主业务流的交互顺序。
- 若未来需要保留部分能力（例如只保留 mock，不保留自动跳转），可只删除 `App.tsx` 的 preview 路由逻辑。
