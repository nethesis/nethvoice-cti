// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  queues: any
  isLoaded: boolean
  isLoading: boolean
  errorMessage: string
  favorites: string[]
}

const defaultState: DefaultState = {
  queues: {},
  isLoaded: false,
  isLoading: false,
  errorMessage: '',
  favorites: [],
}

export const queues = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setQueues: (state, queues: Object) => {
      state.queues = queues
      return state
    },
    setLoaded: (state, isLoaded: boolean) => {
      state.isLoaded = isLoaded
      return state
    },
    setLoading: (state, isLoading: boolean) => {
      state.isLoading = isLoading
      return state
    },
    setErrorMessage: (state, errorMessage: string) => {
      state.errorMessage = errorMessage
      return state
    },
    setFavorites: (state, favorites: string[]) => {
      state.favorites = favorites
      return state
    },
    setQueueExpanded: (state, queueId: string, expanded: boolean) => {
      const queue = state.queues[queueId]
      queue.expanded = expanded
      return state
    },
    setQueueFavorite: (state, queueId: string, favorite: boolean) => {
      const queue = state.queues[queueId]
      queue.favorite = favorite
      return state
    },
  },
})
