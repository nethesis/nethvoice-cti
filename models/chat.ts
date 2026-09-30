// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createModel } from '@rematch/core'
import type { RootModel } from '.'

// Conversation list published by chat-island.
export interface ChatConversation {
  peer: string
  kind: 'chat' | 'group'
  name: string
  avatar?: string
  online: boolean
  mobile?: boolean
  owner?: boolean
  unread: number
  members?: string[]
  last?: { body: string; ts: number; mine: boolean; oob?: string; nick?: string }
}

interface DefaultState {
  status: string
  unread: number
  conversations: ChatConversation[]
}

const defaultState: DefaultState = {
  status: 'offline',
  unread: 0,
  conversations: [],
}

export const chat = createModel<RootModel>()({
  state: defaultState,
  reducers: {
    setStatus: (state, status: string) => {
      state.status = status
      return state
    },
    setUnread: (state, unread: number) => {
      state.unread = unread
      return state
    },
    setConversations: (state, conversations: ChatConversation[]) => {
      state.conversations = conversations
      return state
    },
  },
})
