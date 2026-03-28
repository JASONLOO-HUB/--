import path from 'node:path';
import { fileURLToPath } from 'node:url';
import frontendTw from '../frontend/tailwind.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '../frontend');

/** 从「网站」目录构建时 cwd 不是 frontend，在此用绝对路径指向源码 */
/** @type {import('tailwindcss').Config} */
export default {
  ...frontendTw,
  content: [
    path.join(frontendDir, 'index.html').replace(/\\/g, '/'),
    path.join(frontendDir, 'src/**/*.{js,ts,jsx,tsx}').replace(/\\/g, '/'),
  ],
};
