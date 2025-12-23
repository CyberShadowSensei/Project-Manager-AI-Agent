/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        muted: 'var(--muted)',
      },
      boxShadow: {
        dashboard: '0 24px 60px rgba(0,0,0,0.7)',
      },
      borderRadius: {
        dashboard: '2rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
