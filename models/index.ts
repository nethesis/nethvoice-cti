// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Models } from '@rematch/core'
import { authentication } from './authentication'
import { user } from './user'
import { sideDrawer } from './sideDrawer'
import { phonebook } from './phonebook'
import { speedDial } from './speedDial'
import { darkTheme } from './darkTheme'
import { operators } from './operators'
import { notifications } from './notifications'
import { globalSearch } from './globalSearch'
import { queues } from './queues'
import { queueManagerQueues } from './queueManager'
import { ctiStatus } from './ctiStatus'
import { lines } from './lines'
import { phoneLines } from './phoneLines'
import { announcement } from './announcement'
import { profiling } from './profiling'
import { customerCards } from './customerCards'
import { toast } from './toast'
import { userActions } from './userActions'
import { lastCalls } from './lastCalls'
import { park } from './park'
import { rightSideMenu } from './rightSideMenu'

export interface RootModel extends Models<RootModel> {
  authentication: typeof authentication
  user: typeof user
  sideDrawer: typeof sideDrawer
  phonebook: typeof phonebook
  speedDial: typeof speedDial
  darkTheme: typeof darkTheme
  operators: typeof operators
  notifications: typeof notifications
  globalSearch: typeof globalSearch
  queues: typeof queues
  queueManagerQueues: typeof queueManagerQueues
  ctiStatus: typeof ctiStatus
  lines: typeof lines
  phoneLines: typeof phoneLines
  announcement: typeof announcement
  profiling: typeof profiling
  customerCards: typeof customerCards
  toast: typeof toast
  userActions: typeof userActions
  lastCalls: typeof lastCalls
  park: typeof park
  rightSideMenu: typeof rightSideMenu
}

export const models: RootModel = {
  authentication,
  user,
  sideDrawer,
  phonebook,
  speedDial,
  darkTheme,
  operators,
  notifications,
  globalSearch,
  queues,
  queueManagerQueues,
  ctiStatus,
  lines,
  phoneLines,
  announcement,
  profiling,
  customerCards,
  toast,
  userActions,
  lastCalls,
  park,
  rightSideMenu,
}
