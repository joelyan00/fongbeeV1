/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Inter"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
      },
      colors: {
        primary: {
          50: '#effcf6',
          100: '#cbf7e4',
          200: '#9beace',
          300: '#5cdbb5',
          400: '#26c59b',
          500: '#00a980', // Slightly darker, more premium green
          600: '#008a6a', // Your main brand color
          700: '#006e56',
          800: '#005846',
          900: '#00493b',
          950: '#002923',
        },
        secondary: {
          50: '#f4f6f8',
          100: '#e4e7eb',
          200: '#c9ced6',
          300: '#a6adb9',
          400: '#7e889a',
          500: '#606a7b',
          600: '#4b5362',
          700: '#3e4451',
          800: '#353a45',
          900: '#2f333c',
          950: '#1e2025',
        }
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px rgba(0, 0, 0, 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
