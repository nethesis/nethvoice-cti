// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  reloadCommand: boolean
}

const defaultState: DefaultState = {
  reloadCommand: false,
}

export const operators = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    reload: (state) => {
      state.reloadCommand = !state.reloadCommand
      return state
    },
  },
})