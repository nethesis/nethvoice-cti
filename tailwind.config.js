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
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        primaryFocus: '#10b981', // emerald-500
        primaryLighter: '#ecfdf5', // emerald-100
        primaryLight: '#10b981', // emerald-500

        primaryDarkFocus: '#a7f3d0', // emerald-200
        primaryDarker: '#064e3b', // emerald-900

        //primary
        primary: '#047857', // emerald-700
        primaryHover: '#065f46', // emerald-800
        primaryRing: '#10b981', // emerald-500
        //primary dark
        primaryDark: '#10b981', // emerald-500
        primaryDarkHover: '#6ee7b7', // emerald-300
        primaryRingDark: '#a7f3d0', // emerald-200

        //primaryIndigo
        primaryIndigo: '#3730a3', // indigo-800
        //primaryIndigo dark
        primaryIndigoDark: '#a5b4fc', // indigo-300

        //text
        textLight: '#374151', // gray-700
        //text dark
        textDark: '#E5E7EB', // gray-200

        //page title
        title: '#111827', // gray-900
        //page title dark
        titleDark: '#F9FAFB', // gray-50

        //buttonPrimary
        primaryButtonText: '#fff', // white
        //buttonPrimaryDark
        primaryButtonTextDark: '#030712', // gray-950

        //card
        cardBackgroud: '#fff', // white
        cardText: '#111827', // gray-900
        cardTextBusy: '#b91c1c', // red-700
        cardIcon: '#9ca3af', // gray-400
        //cardDark
        cardBackgroudDark: '#030712', // gray-950
        cardTextDark: '#F9FAFB', // gray-50
        cardTextBusy: '#EF4444', // red-500
        cardIconDark: '#9ca3af', // gray-400

        //dropdown
        dropdownBg: '#fff', // white
        dropdownBgHover: '#F9FAFB', // gray-50
        dropdownText: '#374151', // gray-700
        //dropDown dark
        dropdownBgDark: '#111827', // gray-900
        dropdownBgHoverDark: '#374151', // gray-700
        dropdownTextDark: '#F9FAFB', // gray-50

        //input
        bgInput: '#fff', // white
        inputText: '#374151', // gray-700
        inputLabelTitle: '#374151', // gray-700
        placeHolderInputText: '#6b7280', // gray-500
        inputIcon: '#9ca3af', // gray-400
        //input dark
        bgInputDark: '#030712', // gray-950
        inputTextDark: '#F9FAFB', // gray-50
        inputLabelTitleDark: '#E5E7EB', // gray-200
        placeHolderInputTextDark: '#d1d5db', // gray-300
        inputIconDark: '#F9FAFB', // gray-50

        //main page light
        body: '#f8fafc', // gray-50
        //main page dark
        bodyDark: '#111827', // gray-900

        //left/right sidebar light
        sidebar: '#fff', // white
        sidebarButtonSelected: '#E5E7EB', // gray-200
        sidebarIconText: '#374151', // gray-700
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

        //Refactoring

        //Text
        //primaryNeutral
        primaryNeutral: '#111827', // gray-900
        primaryNeutralDark: '#F9FAFB', // gray-50

        //primary invert
        primaryInvertNeutral: '#F9FAFB', // gray-50
        primaryInvertNeutralDark: '#111827', // gray-900

        //secondary
        secondaryNeutral: '#374151', // gray-700
        secondaryNeutralDark: '#E5E7EB', // gray-200

        //tertiary
        tertiaryNeutral: '#4b5563', // gray-600
        tertiaryNeutralDark: '#D1D5DB', // gray-300

        //danger
        danger: '#b91c1c', // red-700
        dangerDark: '#EF4444', // red-500

        //primary active
        primaryActive: '#047857', // emerald-700
        primaryActiveDark: '#10b981', // emerald-500

        //primary hover
        primaryHover: '#065f46', // emerald-800
        primaryHoverDark: '#6ee7b7', // emerald-300

        //primary focus
        primaryFocus: '#10b981', // emerald-500
        primaryFocusDark: '#a7f3d0', // emerald-200

        //textStatus
        //textStatusOnline
        textStatusOnline: '#15803D', // green-700
        textStatusOnlineDark: '#22C55E', // green-500

        //textStatusBusy
        textStatusBusy: '#b91c1c', // red-700
        textStatusBusyDark: '#EF4444', // red-500

        //textStatusOffline
        textStatusOffline: '#374151', // gray-700
        textStatusOfflineDark: '#9CA3AF', // gray-400

        //Icon call status
        //iconStatusOnline
        iconStatusOnline: '#15803D', // green-700
        iconStatusOnlineDark: '#22C55E', // green-500

        //iconStatusBusy
        iconStatusBusy: '#b91c1c', // red-700
        iconStatusBusyDark: '#EF4444', // red-500

        //iconStatusOffline
        iconStatusOffline: '#374151', // gray-700
        iconStatusOfflineDark: '#9CA3AF', // gray-400

        //iconStatusPause
        iconStatusPause: '#B45309', // amber-700
        iconStatusPauseDark: '#FBBF24', // amber-500
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
