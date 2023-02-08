// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState = {
  isOpen: false,
  isFocused: false,
}

export const globalSearch = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setOpen: (state, isOpen: boolean) => {
      state.isOpen = isOpen
      return state
    },
    setFocused: (state, isFocused: boolean) => {
      state.isFocused = isFocused
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
