// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Models } from '@rematch/core'
import { authentication } from './authentication'

export interface RootModel extends Models<RootModel> {
  authentication: typeof authentication
}

export const models: RootModel = {
  authentication,
}
