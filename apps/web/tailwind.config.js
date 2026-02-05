/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexo: {
          bg: '#0B0E14',
          surface: '#111827',
          elevated: '#161E2E',
          border: 'rgba(255, 255, 255, 0.06)',
          accent: '#3B82F6',
          muted: '#9CA3AF',
        }
      },
    },
  },
  plugins: [],
}
