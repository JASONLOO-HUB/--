import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 宣传站专用：在「网站」目录执行 npm run build，将产品前端（Mock）打进 ./demo/
 * 优先使用本仓库内 ./frontend；仍兼容旧布局（与「网站」同级的 ../frontend）。
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const embeddedFrontend = path.join(__dirname, 'frontend');
const siblingFrontend = path.resolve(__dirname, '../frontend');
const frontendRoot = fs.existsSync(path.join(embeddedFrontend, 'package.json'))
  ? embeddedFrontend
  : siblingFrontend;

/**
 * 相对 base：demo/index.html 引用的 JS/CSS 随当前目录解析。
 * 避免 GitHub Pages 项目站（/repo/）下误请求域名根路径的 /demo/assets/* 导致 iframe 白屏。
 */
export default defineConfig({
  root: frontendRoot,
  plugins: [react()],
  base: './',
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
