// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  isShown: boolean
  contentType: string
  config: any
}

const defaultState: DefaultState = {
  isShown: false,
  contentType: '',
  config: null,
}

export const sideDrawer = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    update: (state, payload: DefaultState) => {
      state.isShown = payload.isShown
      state.contentType = payload.contentType
      state.config = payload.config
      return state
    },
    setShown: (state, isShown: boolean) => {
      state.isShown = isShown
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
