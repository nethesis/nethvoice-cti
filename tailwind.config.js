/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx}',
    './.storybook/**/*.{js,jsx,ts,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
  ],
  plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar')({ nocompatible: true })],
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
        '3xl': '1792px',
        '4xl': '2048px',
        '5xl': '2560px',
        '6xl': '3072px',
        '7xl': '3584px',
      },
    },
  },
}
