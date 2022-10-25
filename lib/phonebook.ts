// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'

export const PAGE_SIZE = 10

export async function getPhonebook(
  pageNum: number,
  filterText: string,
  contactType: string,
  sortBy: string,
) {
  try {
    const stringCredentials = localStorage.getItem('credentials')
    if (!stringCredentials) {
      return null
    }

    const { username, token } = JSON.parse(stringCredentials)

    //// remove?
    if (window !== undefined) {
      // @ts-ignore
      let apiUrl = `${window.CONFIG.API_ENDPOINT}/webrest/phonebook/`

      if (filterText.trim()) {
        apiUrl += `search/${filterText.trim()}`
      } else {
        apiUrl += `searchstartswith/A`
      }
      const offset = (pageNum - 1) * PAGE_SIZE
      apiUrl += `?offset=${offset}&limit=${PAGE_SIZE}&view=${contactType}`

      const { data, status } = await axios.get(apiUrl, {
        headers: {
          Accept: 'application/json',
          Authorization: `${username}:${token}`,
        },
      })
      // console.log(JSON.stringify(data, null, 4)) ////
      return data
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('error message: ', error.message)
      return null
    } else {
      console.error('unexpected error: ', error)
      return null
    }
  }
}
