/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mpesa: {
          50: '#e6f9ed',
          100: '#c2f2d2',
          500: '#00c300',
          600: '#00a300',
          700: '#008400',
        },
        escrow: {
          dark: '#0b0f19',
          card: '#151c2c',
          border: '#232d42',
          brand: '#059669',
          accent: '#10b981',
          gold: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'glow-mpesa': '0 0 25px -5px rgba(0, 195, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
