// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the axios configuration methods
 */

import axios from 'axios'
import { store } from '../store'

/**
 * Set the default parameters for axios
 */
export const axiosInit = () => {
  const { username, token } = store.getState().authentication

  // @ts-ignore
  axios.defaults.baseURL = window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT + '/webrest'
  axios.defaults.headers.common['Authorization'] = `${username}:${token}`
  axios.defaults.headers.post['Content-Type'] = 'application/json'
}
