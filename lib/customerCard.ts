// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'

export const PAGE_SIZE = 10
export const DEFAULT_CALL_TYPE_FILTER = 'user'

export async function getCustomerCardsList() {
  try {
    const { data, status } = await axios.get('/custcard/list')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function setUserSettings(ccardObject:any) {
  try {
    const { data, status } = await axios.post('/user/settings', ccardObject)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getCustomerCards(companyExtension:any) {
  try {
    const { data, status } = await axios.get('/custcard/getbynum/' + companyExtension + '/html')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
