/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#e8f5f2',
          100: '#c5e8e1',
          200: '#9dd6cb',
          300: '#72c4b5',
          400: '#4ab4a2',
          500: '#238370',
          600: '#1e7363',
          700: '#185e50',
          800: '#12493e',
          900: '#0c342c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
