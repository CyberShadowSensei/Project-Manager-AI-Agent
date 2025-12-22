/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#A855F7',
        secondary: '#EC4899',
        muted: 'rgba(255,255,255,0.6)',
      },
      boxShadow: {
        dashboard: '0 24px 60px rgba(0,0,0,0.7)',
      },
      borderRadius: {
        dashboard: '2rem',
      },
    },
  },
  plugins: [],
}

