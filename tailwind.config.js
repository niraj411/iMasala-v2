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
            50: '#fef7ee',
            100: '#fdedd7',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            900: '#78350f',
          },
          masala: {
            50: '#f8f7f4',
            100: '#eeede6',
            500: '#8b7355',
            600: '#6d5a43',
            700: '#554633',
            900: '#2d2318',
          }
        },
      },
    },
    plugins: [],
  }