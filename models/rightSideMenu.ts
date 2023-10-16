// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { createModel } from '@rematch/core'
import type { RootModel } from '.'
interface DefaultState {
  isShown: boolean
  actualTab: string
}
const defaultState: DefaultState = {
  isShown: true,
  actualTab: ''
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
  },
})
