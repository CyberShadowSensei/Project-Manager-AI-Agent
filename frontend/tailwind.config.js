/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#A855F7',
        secondary: '#EC4899',
        muted: 'rgba(255,255,255,0.6)',
      },
      boxShadow: {
        dashboard: '0 24px 60px rgba(0,0,0,0.7)',
        'glow': '0 0 15px rgba(168, 85, 247, 0.15)', // New glow effect
      },
      borderRadius: {
        dashboard: '2rem',
      },
      animation: {
        'shimmer': 'shimmer 4s infinite linear', // New shimmer animation
      },
      keyframes: {
        'shimmer': { // New shimmer keyframes
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backgroundSize: {
        'shimmer-size': '1000px 100%', // Adjust size for shimmer effect
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
