/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [require('@tailwindcss/forms')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#059669', // emerald-600
        primaryLighter: '#ecfdf5', // emerald-100
        primaryLight: '#10b981', // emerald-500
        primaryDark: '#047857', // emerald-700
        primaryDarker: '#064e3b', // emerald-900
      },
      screens: {
        '3xl': '1792px'
      }
    },
  },
}
