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

interface SettingsTypes {
  auto_dndoff_login: any
  auto_dndon_logout: any
  call_ringtone: any
  ccard_order: []
  chat_notifications: any
  default_extension: string
  desktop_notifications: any
  open_ccard: any
  open_param_url: any
  queue_auto_login: any
  queue_auto_logout: any
  company_extension: any
  caller_info: any
}
interface DefaultState {
  name: string
  username: string
  mainextension: string
  mainPresence: StatusTypes
  endpoints: EndpointsTypes
  profile: ProfileTypes
  avatar: string
  settings: SettingsTypes
  recallOnBusy: any
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
  settings: {
    auto_dndoff_login: '',
    auto_dndon_logout: '',
    call_ringtone: '',
    ccard_order: [],
    chat_notifications: '',
    default_extension: '',
    desktop_notifications: '',
    open_ccard: '',
    open_param_url: '',
    queue_auto_login: '',
    queue_auto_logout: '',
    company_extension: '',
    caller_info: '',
  },
  recallOnBusy: '',
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
      state.settings = payload.settings
      state.recallOnBusy = payload.recallOnBusy
      return state
    },
    updateMainPresence: (state, mainPresence) => {
      state.mainPresence = mainPresence
      return state
    },
    updateSettings: (state, ccardSettingsUpdate) => {
      state.settings.open_ccard = ccardSettingsUpdate.open_ccard
      state.settings.ccard_order = ccardSettingsUpdate.ccard_order
      return state
    },
    updateCompanyExtension: (state, companyExtension) => {
      state.settings.company_extension = companyExtension
      return state
    },
    updateCallerCustomerCardInformation: (state, callerInformations) => {
      state.settings.caller_info = callerInformations
      return state
    },
    reset: () => {
      return defaultState
    },
  },
})
