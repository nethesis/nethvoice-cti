/** @type {import('tailwindcss').Config} */

module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
    './stories/**/*.{js,jsx,ts,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar')({ nocompatible: true, preferredStrategy: 'pseudoelements' }),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#047857', // emerald-700
        primaryHover: '#065f46', // emerald-800
        primaryFocus: '#10b981', // emerald-500
        primaryLighter: '#ecfdf5', // emerald-100
        primaryLight: '#10b981', // emerald-500
        primaryDark: '#10b981', // emerald-500
        primaryDarkHover: '#6ee7b7', // emerald-300
        primaryDarkFocus: '#a7f3d0', // emerald-200
        primaryDarker: '#064e3b', // emerald-900

        //main page light
        body: '#E5E7EB', // gray-200
        //main page dark
        bodyDark: '#111827', // gray-900

        //left/right sidebar light
        sidebar: '#fff', // white
        sidebarButtonSelected: '#E5E7EB', // gray-200
        sidebarIconText: '#4B5563', // gray-600
        currentSidebarIconText: '#111827', // gray-900
        sidebarIconBackground: '#f3f4f6', // gray-100
        currentBadgePrimary: '#047857', // emerald-700
        //left/right sidebar dark
        sidebarDark: '#030712', // gray-950
        sidebarButtonSelectedDark: '#1F2937', // gray-800
        sidebarIconTextDark: '#D1D5DB', // gray-300
        currentSidebarIconTextDark: '#F9FAFB', // gray-50
        sidebarIconBackgroundDark: '#1F2937', // gray-800
        currentBadgePrimaryDark: '#10b981', // emerald-500

        //topbar light
        topbar: '#fff', // white
        topBarText: '#9ca3af', // gray-400

        //topbar dark
        topbarDark: '#030712', // gray-950
        topBarTextDark: '#E5E7EB', // gray-200
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
