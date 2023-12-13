// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the request to the APIs of the user
 */

import axios from 'axios'

/**
 * The path to the user endpoints
 */
const PATH = '/user'

/**
 *
 * Get the user info from the server
 *
 * @returns The user info
 */

export function getLoginUrl() {
  if (window == undefined) {
    return ''
  }
  // @ts-ignore
  return `${window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT}`
}

export const getUserInfo = async () => {
  try {
    const res = await axios.get(`${PATH}/me`)
    return res
  } catch (error) {
    console.error(error)
  }
}

export const loginBeforeDashboard = async (username: any, token: any) => {
  try {
    let apiUrl = getLoginUrl()
    let userUrlApi = apiUrl + '/webrest' + PATH

    const res = await axios.get(`${userUrlApi}/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${username}:${token}`,
      },
    })

    return res.data
  } catch (error) {
    console.error(error)

    throw new Error('Error')
  }
}
