// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the request to the APIs of the authentication
 */

import axios, { AxiosResponse } from 'axios'
import { handleNetworkError } from '../lib/utils'
import { APITokenType } from './types'

/**
 * The path to the user endpoints
 */
const PATH = '/authentication'

export const getAPIToken = async () => {
  try {
    const res: AxiosResponse = await axios.post(`${PATH}/api_token`)
    const data: APITokenType = res.data
    return data || []
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
