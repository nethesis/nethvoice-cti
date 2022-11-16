/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [require('@tailwindcss/forms')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#16a34a', // green-600
        primaryLighter: '#dcfce7', // green-100
        primaryLight: '#22c55e', // green-500
        primaryDark: '#15803d', // green-700
        primaryDarker: '#14532d', // green-900
      },
    },
  },
}
