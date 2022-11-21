// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { setStringItem, getStringItem, removeItem } from './storage'
import { store } from '../store'

const addDarkClassToDocument = () => {
  document.documentElement.classList.add('dark')
}

const removeDarkClassFromDocument = () => {
  document.documentElement.classList.remove('dark')
}

/**
 * Read theme from local storage and update global store
 */
export const checkDarkTheme = () => {
  let theme = 'system'

  if (getStringItem('theme') === 'dark') {
    theme = 'dark'
    addDarkClassToDocument()
  } else if (getStringItem('theme') === 'light') {
    theme = 'light'
    removeDarkClassFromDocument()
  } else {
    // system theme
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      addDarkClassToDocument()
    } else {
      removeDarkClassFromDocument()
    }
  }

  // update global store
  store.dispatch.darkTheme.update(theme)
}

export const setTheme = (theme: string) => {
  if (theme === 'system') {
    // remove entry from local storage
    removeItem('theme')
  } else {
    // set entry on local storage
    setStringItem('theme', theme)
  }
  checkDarkTheme()
}
