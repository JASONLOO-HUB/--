/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f3e8e2',
          200: '#e8d5cb',
          300: '#d4b5a4',
          400: '#c09279',
          500: '#a8785c',
          600: '#926448',
          700: '#7a5240',
          800: '#654338',
          900: '#503530',
        },
        warm: {
          50: '#faf9f7',
          100: '#f5f3f0',
          200: '#e8e4df',
          300: '#d6d0c8',
          400: '#b8b0a4',
          500: '#9a9184',
          600: '#7c7368',
          700: '#635b52',
          800: '#4a443d',
          900: '#332f2a',
          950: '#1c1a17',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans SC"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
