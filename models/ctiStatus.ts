// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState = {
  webRtcError: false,
  isPhoneRinging: false
}

export const ctiStatus = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setConnected: (state, webRtcError: boolean) => {
      state.webRtcError = webRtcError
      return state
    },
    setRinging: (state, isPhoneRinging: boolean) => {
      state.isPhoneRinging = isPhoneRinging
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
