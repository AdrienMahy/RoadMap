import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#fafafa',
          100: '#f1f1f1',
          200: '#dedede',
          300: '#bcbcbc',
          400: '#929292',
          500: '#6d6d6d',
          600: '#464646',
          700: '#303030',
          800: '#202020',
          900: '#151515',
          950: '#0a0a0a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
