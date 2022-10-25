// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the request to the APIs consumed by the Login
 */

import { store } from '../store'

/**
 * This method performs the logout action
 */
 export const logout = async () => {
  try {
    const state = store.getState()
    const res = await fetch(
      // @ts-ignore
      window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT + '/webrest/authentication/logout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${state.authentication.username}:${state.authentication.token}`,
        },
      },
    )
    return res
  } catch (error) {
    console.error(error)
  }
}