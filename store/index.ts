// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { init, RematchDispatch, RematchRootState } from '@rematch/core'
import { models, RootModel } from '../models'
import immerPlugin from '@rematch/immer'

export const store = init<RootModel>({
  models,
  plugins: [immerPlugin()],
})

export type Store = typeof store
export type Dispatch = RematchDispatch<RootModel>
export type RootState = RematchRootState<RootModel>
