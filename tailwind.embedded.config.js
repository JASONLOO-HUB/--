import path from 'node:path';
import { fileURLToPath } from 'node:url';
import frontendTw from './frontend/tailwind.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.join(__dirname, 'frontend');

/** @type {import('tailwindcss').Config} */
export default {
  ...frontendTw,
  content: [
    path.join(frontendRoot, 'index.html').replace(/\\/g, '/'),
    path.join(frontendRoot, 'src/**/*.{js,ts,jsx,tsx}').replace(/\\/g, '/'),
  ],
};
