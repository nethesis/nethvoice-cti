// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the request to the APIs of the user
 */

import axios from 'axios'

/**
 * The path to the user endpoints
 */
const USER_PATH = '/user'

/**
 * 
 * Get the user info from the server
 * 
 * @returns The user info
 */

export const getUserInfo = async () => {
  try {
    const res = await axios.get(`${USER_PATH}/me`)
    return res
  } catch (error) {
    console.error(error)
  }
}
