import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 宣传站专用：在「网站」目录执行 npm run build，将产品前端（Mock）打进 ./demo/
 * 源码仍来自上级目录的 frontend（与主应用同源）；部署时只需上传本文件夹（含已构建的 demo/）。
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, '../frontend');

/** GitHub Pages 项目站为 /<repo>/，本地/Vercel 根路径用 /demo/；构建前可设 VITE_PAGES_BASE */
function pagesBase(): string {
  const raw = process.env.VITE_PAGES_BASE?.trim();
  if (!raw) return '/demo/';
  const withSlash = raw.endsWith('/') ? raw : `${raw}/`;
  return withSlash.startsWith('/') ? withSlash : `/${withSlash}`;
}

export default defineConfig({
  root: frontendRoot,
  plugins: [react()],
  base: pagesBase(),
  envDir: __dirname,
  envPrefix: 'VITE_',
  css: {
    postcss: path.join(__dirname, 'postcss.config.js'),
  },
  build: {
    outDir: path.resolve(__dirname, 'demo'),
    emptyOutDir: true,
  },
  server: {
    port: 5176,
    proxy: {
      '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
