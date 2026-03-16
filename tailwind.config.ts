import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f8f1',
          100: '#eaf0da',
          200: '#d4e2b5',
          300: '#b5cd81',
          400: '#99b35c',
          500: '#7e9645',
          600: '#657838',
          700: '#4f5d2e',
          800: '#434d2a',
          900: '#3b4227'
        },
        slateish: '#1f2a32',
        paper: '#f9f7f2'
      },
      boxShadow: {
        panel: '0 12px 30px rgba(32, 45, 57, 0.12)'
      }
    },
  },
  plugins: [],
} satisfies Config;
