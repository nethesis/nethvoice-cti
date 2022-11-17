// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '../styles/globals.css'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const toggleTheme = () => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark')
  } else {
    document.documentElement.classList.add('dark')
  }
}

export const decorators = [
  (Story) => (
    <div className='bg-gray-100 dark:bg-gray-800 p-8'>
      <Story />
      <button
        onClick={toggleTheme}
        className='flex content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:z-20 focus:ring-offset-2 disabled:opacity-75 border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-green-600 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-green-700 rounded-md px-3 py-2 text-sm leading-4 mt-8'
      >
        Toggle dark theme
      </button>
    </div>
  ),
]
