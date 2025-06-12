// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the request to the APIs of the authentication
 */

import axios, { AxiosResponse } from 'axios'
import { handleNetworkError } from '../lib/utils'
import { APITokenType, PhoneIslandCheckType } from './types'

/**
 * The path to the user endpoints
 */
const PATH = '/authentication'

export const getPhoneIslandToken = async () => {
  try {
    const res: AxiosResponse = await axios.post(`${PATH}/phone_island_token_login`, { subtype: 'web' })
    const data: APITokenType = res.data
    return data || []
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Checks if the island token exists for the user
 *
 * @returns An object with the exists boolean property
 */
export const phoneIslandTokenCheck = async () => {
  try {
    const res: AxiosResponse = await axios.get(`${PATH}/phone_island_token_check/web`)
    const data: PhoneIslandCheckType = res.data
    return data || []
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Checks if the island token exists for the user
 *
 * @returns An object with the exists boolean property
 */
export const removePhoneIslandToken = async () => {
  try {
    const res: AxiosResponse = await axios.post(`${PATH}/persistent_token_remove`, {
      type: 'phone-island',
      subtype: 'web',
    })
    const data: {} = res.data
    return data ? true : false
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Generate a persistent authentication token
 *
 * @returns The username and the token
 */

export const generateQRcodeToken = async () => {
  try {
    const res = await axios.post(`${PATH}/persistent_token_login`)
    return res.data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
