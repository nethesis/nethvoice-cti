// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the request to the APIs consumed by the Login
 */

import router from 'next/router'
import { removeItem } from '../lib/storage'
import { store } from '../store'
import { isEmpty } from 'lodash'
import { clearLocalStorageAndCache } from '../lib/utils'

/**
 * This method performs the logout action
 */
export const logout = async () => {
  try {
    const { username, token } = store.getState().authentication
    const res = await fetch(
      // @ts-ignore
      window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT + '/webrest/authentication/logout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${username}:${token}`,
        },
      },
    )
    return res
  } catch (error) {
    console.error(error)
  }
}

export const doLogout = async (isLogoutError?: any) => {
  const res = await logout()
  //// TODO logout api is currently authenticated. For this reason we must not check res.ok (this is a temporary workaround)

  // if (res && res.ok) {
  // Remove credentials from localstorage
  removeItem('credentials')
  // Reset the authentication store
  store.dispatch.authentication.reset()
  // Redirect to login page
  if (!isEmpty(isLogoutError)) {
    if (isLogoutError.isUserInformationMissing) {
      router.push(`/login#isUserInformationMissing`)
      let isLogoutError: any = {
        isUserInformationMissing: true,
      }
      clearLocalStorageAndCache(isLogoutError)
    } else {
      router.push(`/login#webrtcError`)
    }
  } else {
    router.push('/login')
  }

  // } ////
}
