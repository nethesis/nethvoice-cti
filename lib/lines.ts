// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError, getApiEndpoint, getApiScheme } from './utils'

export const PAGE_SIZE = 10
const apiEnpoint = getApiEndpoint()
const apiScheme = getApiScheme()
const apiUrl = apiScheme + apiEnpoint 

export async function retrieveLines() {
  let userUrlApi = apiUrl + '/webrest/offhour/list_announcement'

  try {
    const { data, status } = await axios.get(userUrlApi)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
