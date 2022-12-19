// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  operators: Object
  isOperatorsLoaded: boolean
  isLoading: boolean
  userEndpoints: Object
  isUserEndpointsLoaded: boolean
  groups: Object
  isGroupsLoaded: boolean
  errorMessage: string
  extensions: Object
  isExtensionsLoaded: boolean
  avatars: Object
  isAvatarsLoaded: boolean
  favorites: string[]
  isFavoritesLoaded: boolean
}

const defaultState: DefaultState = {
  operators: {},
  isOperatorsLoaded: false,
  isLoading: false,
  userEndpoints: {},
  isUserEndpointsLoaded: false,
  groups: {},
  isGroupsLoaded: false,
  errorMessage: '',
  extensions: {},
  isExtensionsLoaded: false,
  avatars: {},
  isAvatarsLoaded: false,
  favorites: [],
  isFavoritesLoaded: false,
}

export const operators = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setOperators: (state, operators: Object) => {
      state.operators = operators
      return state
    },
    setOperatorsLoaded: (state, isOperatorsLoaded: boolean) => {
      state.isOperatorsLoaded = isOperatorsLoaded
      return state
    },
    setLoading: (state, isLoading: boolean) => {
      state.isLoading = isLoading
      return state
    },
    setUserEndpoints: (state, userEndpoints: Object) => {
      state.userEndpoints = userEndpoints
      return state
    },
    setUserEndpointsLoaded: (state, isUserEndpointsLoaded: boolean) => {
      state.isUserEndpointsLoaded = isUserEndpointsLoaded
      return state
    },
    setGroups: (state, groups: Object) => {
      state.groups = groups
      return state
    },
    setGroupsLoaded: (state, isGroupsLoaded: boolean) => {
      state.isGroupsLoaded = isGroupsLoaded
      return state
    },
    setErrorMessage: (state, errorMessage: string) => {
      state.errorMessage = errorMessage
      return state
    },
    setExtensions: (state, extensions: Object) => {
      state.extensions = extensions
      return state
    },
    setExtensionsLoaded: (state, isExtensionsLoaded: boolean) => {
      state.isExtensionsLoaded = isExtensionsLoaded
      return state
    },
    setAvatars: (state, avatars: Object) => {
      state.avatars = avatars
      return state
    },
    setAvatarsLoaded: (state, isAvatarsLoaded: boolean) => {
      state.isAvatarsLoaded = isAvatarsLoaded
      return state
    },
    setFavorites: (state, favorites: string[]) => {
      state.favorites = favorites
      return state
    },
    setFavoritesLoaded: (state, isFavoritesLoaded: boolean) => {
      state.isFavoritesLoaded = isFavoritesLoaded
      return state
    },
  },
})
