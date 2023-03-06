// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

interface DefaultState {
  queues: any
  isLoaded: boolean
  isLoading: boolean
  errorMessage: string
}

const defaultState: DefaultState = {
  queues: {},
  isLoaded: false,
  isLoading: false,
  errorMessage: '',
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
    setWaitingCallsExpanded: (state, queueId: string, expanded: boolean) => {
      const queue = state.queues[queueId]
      queue.waitingCallsExpanded = expanded
      return state
    },
    setConnectedCallsExpanded: (state, queueId: string, expanded: boolean) => {
      const queue = state.queues[queueId]
      queue.connectedCallsExpanded = expanded
      return state
    },
    setOperatorsExpanded: (state, queueId: string, expanded: boolean) => {
      const queue = state.queues[queueId]
      queue.operatorsExpanded = expanded
      return state
    },
  },
})
