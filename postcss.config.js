import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const embedded = path.join(__dirname, 'frontend', 'package.json');
const tailwindConfig = fs.existsSync(embedded)
  ? path.join(__dirname, 'tailwind.embedded.config.js')
  : path.join(__dirname, 'tailwind.sibling.config.js');

export default {
  plugins: {
    tailwindcss: { config: tailwindConfig },
    autoprefixer: {},
  },
};
