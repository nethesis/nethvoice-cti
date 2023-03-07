// Copyright (C) 2023 Nethesis S.r.l.
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

interface ProfileTypes {
  id: string
  macro_permissions: any
  name: string
  outbound_routes_permissions: any[]
}
interface DefaultState {
  name: string
  username: string
  mainextension: string
  mainPresence: StatusTypes
  endpoints: EndpointsTypes
  profile: ProfileTypes
  avatar: string
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
  profile: {
    id: '',
    macro_permissions: {},
    name: '',
    outbound_routes_permissions: [],
  },
  avatar: '',
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
      state.profile = payload.profile
      state.avatar = payload.avatar
      return state
    },
    updateMainPresence: (state, mainPresence) => {
      state.mainPresence = mainPresence
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
