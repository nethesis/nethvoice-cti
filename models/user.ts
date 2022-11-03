// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { StatusTypes } from '../theme/Types'

interface DefaultState {
  name: string
  mainextension: string
  mainPresence: StatusTypes
}

const defaultState: DefaultState = {
  name: '',
  mainextension: '',
  mainPresence: 'offline'
}

export const user = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    update: (state, payload: DefaultState) => {
      state.name = payload.name
      state.mainextension = payload.mainextension
      state.mainPresence = payload.mainPresence
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
