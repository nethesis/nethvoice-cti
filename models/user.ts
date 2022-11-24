// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'
import type { StatusTypes } from '../theme/Types'

interface EndpointsTypes {
  cellphone: any[]
  email: any[]
  extension: any[]
  jabber: any[]
  mainextension: any[]
  voicemail: any[]
}
interface DefaultState {
  name: string
  username: string
  mainextension: string
  mainPresence: StatusTypes
  endpoints: EndpointsTypes
}

const defaultState: DefaultState = {
  name: '',
  username: '',
  mainextension: '',
  mainPresence: 'offline',
  endpoints: {
    cellphone: [],
    email: [],
    extension: [],
    jabber: [],
    mainextension: [],
    voicemail: [],
  },
}

export const user = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    update: (state, payload: DefaultState) => {
      state.name = payload.name
      state.username = payload.username
      state.mainextension = payload.mainextension
      state.mainPresence = payload.mainPresence
      state.endpoints = payload.endpoints
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
