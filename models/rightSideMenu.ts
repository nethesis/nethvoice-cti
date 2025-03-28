// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import { getJSONItem, setJSONItem } from '../lib/storage'

interface DefaultState {
  isShown: boolean
  actualTab: string
  isSideMenuOpened: boolean
}
const defaultState: DefaultState = {
  isShown: false,
  actualTab: '',
  isSideMenuOpened: true,
}
export const rightSideMenu = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setShown: (state, isShown: boolean) => {
      state.isShown = isShown
      return state
    },
    updateTab: (state, actualTab: string) => {
      state.actualTab = actualTab
      return state
    },
    setRightSideMenuOpened: (state, isSideMenuOpened: boolean) => {
      state.isSideMenuOpened = isSideMenuOpened
      return state
    },
    toggleSideMenu: (state, payload: { tabName: string; username: string; force?: boolean }) => {
      const { tabName, username, force } = payload

      // Update the tab name
      state.actualTab = tabName

      // Calculate the new state for the menu
      let newIsOpen
      if (force !== undefined) {
        // If force parameter is provided, use it directly
        newIsOpen = force
      } else if (state.actualTab === tabName && state.isSideMenuOpened) {
        // If clicking on the same tab and menu is open, close it
        newIsOpen = false
      } else {
        // Otherwise open it
        newIsOpen = true
      }

      // Update both states
      state.isShown = newIsOpen
      state.isSideMenuOpened = newIsOpen

      // Save to localStorage
      const preferences = getJSONItem(`preferences-${username}`) || {}
      preferences['userSideBarTab'] = tabName
      preferences['rightTabStatus'] = newIsOpen
      setJSONItem(`preferences-${username}`, preferences)

      return state
    },
  },
})
