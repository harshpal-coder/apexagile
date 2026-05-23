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
        // Linear & Jira-inspired harmonic colors
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#072b43',
        },
        darkBg: '#0b0f19',      // Deep slate black
        darkSurface: '#161c2c', // Sleek card gray
        darkBorder: '#242f47',  // Clean grid line
        lightBg: '#f8fafc',     // Off-white light mode bg
        lightSurface: '#ffffff',
        lightBorder: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'premium': '0 4px 20px -2px rgba(14, 165, 233, 0.15)',
        'premium-hover': '0 10px 25px -4px rgba(14, 165, 233, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
