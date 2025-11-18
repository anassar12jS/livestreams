/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#09090b',
          card: '#18181b',
          border: '#27272a',
          accent: '#2563eb',
          live: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}