// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  reloadVoicemailValue: boolean
}

const defaultState: DefaultState = {
  reloadVoicemailValue: false,
}

export const voicemail = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    reload: (state) => {
      state.reloadVoicemailValue = !state.reloadVoicemailValue
      return state
    },
  },
})
