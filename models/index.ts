// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Models } from '@rematch/core'
import { authentication } from './authentication'
import { user } from './user'

export interface RootModel extends Models<RootModel> {
  authentication: typeof authentication
  user: typeof user
}

export const models: RootModel = {
  authentication,
  user,
}
