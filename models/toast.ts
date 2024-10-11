// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  isShown: boolean
  contentType: any
  message: any
  tytle: any
}

const defaultState: DefaultState = {
  isShown: false,
  contentType: '',
  message: '',
  tytle: '',
}

export const toast = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    updateToast: (state, payload: DefaultState) => {
      state.isShown = payload.isShown
      state.contentType = payload.contentType

      state.message = payload.message
      state.tytle = payload.tytle
      return state
    },
    setShownToast: (state, isShown: boolean) => {
      state.isShown = isShown
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
