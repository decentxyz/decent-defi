/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-monument)']
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, #ACACAC51 0deg, #F1F1F151 360deg)',
        'gradient-grid-white': 'linear-gradient(transparent 49.5%, white 50%, transparent 50.5%), linear-gradient(90deg, transparent 49.5%, white 50%, transparent 50.5%)',
        'gradient-grid-black': 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
      },
      colors: {
        'primary': '#9969FF',
        'primary-light': '#C7ACFF',
        'orange': '#FFCAA4',
        'green': '#D1F279',
      },

      fontSize: {
        giant: ['234px', '324px'],
      },
      spacing: {
        '15': '3.75rem',
        '1/8': '12.5%',
      },
    },
  },
  plugins: [],
}
