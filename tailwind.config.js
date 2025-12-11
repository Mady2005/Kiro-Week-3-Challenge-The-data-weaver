/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cosmic: {
          dark: '#0a0a0a',
          purple: '#6b46c1',
          'purple-light': '#8b5cf6',
          'purple-dark': '#553c9a',
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      }
    },
  },
  plugins: [],
}