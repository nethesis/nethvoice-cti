// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'

export const PAGE_SIZE = 10

export async function getPhonebook(pageNum: number, contactType: string, sortBy: string) {
  try {
    const stringCredentials = localStorage.getItem('credentials')
    if (!stringCredentials) {
      return null
    }

    const { username, token } = JSON.parse(stringCredentials)

    //// remove?
    if (window !== undefined) {
      const { data, status } = await axios.get(
        // @ts-ignore
        `${window.CONFIG.API_ENDPOINT}/webrest/phonebook/searchstartswith/A?offset=${pageNum}&limit=${PAGE_SIZE}&view=${contactType}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `${username}:${token}`,
          },
        },
      )
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
