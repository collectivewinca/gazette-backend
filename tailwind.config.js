/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#FDF8EF', dark: '#F5EDD8' },
        ink: { DEFAULT: '#1A1510', soft: '#3D362B', muted: '#8A8070' },
        rule: { DEFAULT: '#C4B8A0', light: '#E0D8C6' },
        gold: { DEFAULT: '#B8963E', dark: '#8A6E2A' },
        gazette: { red: '#8B2020', nfc: '#7B5EA7', blue: '#2A4A7A' },
      },
      fontFamily: {
        masthead: ['Playfair Display', 'Georgia', 'serif'],
        headline: ['Libre Baskerville', 'Georgia', 'serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
