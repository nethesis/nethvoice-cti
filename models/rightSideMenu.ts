// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { createModel } from '@rematch/core'
import type { RootModel } from '.'
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
  },
})
