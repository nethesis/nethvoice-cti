// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

const defaultState = {
  webRtcError: false,
  isPhoneRinging: false,
  idInterval: 0,
}

export const ctiStatus = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setWebRtcError: (state, webRtcError: boolean) => {
      state.webRtcError = webRtcError
      return state
    },
    setPhoneRinging: (state, isPhoneRinging: boolean) => {
      state.isPhoneRinging = isPhoneRinging
      return state
    },
    setIdInterval: (state, idInterval: any) => {
      state.idInterval = idInterval
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
