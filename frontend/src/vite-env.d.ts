/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_PREVIEW_PAGE?: string
  /** 为 true 时改写页在 Mock 下直达「追问补充」区块（仅 preview-followup 模式） */
  readonly VITE_PREVIEW_FOLLOWUP?: string
  /** 为 true 时改写页在 Mock 下直达「改写对比确认」区块（仅 preview-diff 模式） */
  readonly VITE_PREVIEW_DIFF?: string
  /** 宣传站嵌入构建：隐藏各页主标题与副标题 */
  readonly VITE_EMBED_CHROME?: string
  /** 宣传站 / GitHub Pages：使用 HashRouter，避免 /demo/ 深链 404 */
  readonly VITE_HASH_ROUTER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
