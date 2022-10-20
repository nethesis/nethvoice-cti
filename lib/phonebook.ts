// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'

export const PAGE_SIZE = 10

export async function getPhonebook(pageNum: number) {
  try {
    //// handle view (person / company)
    const stringCredentials = localStorage.getItem('credentials')
    if (!stringCredentials) {
      return null
    }

    const { username, token } = JSON.parse(stringCredentials)
    const { data, status } = await axios.get(
      `https://nethvoice.nethesis.it/webrest/phonebook/searchstartswith/A?offset=${pageNum}&limit=${PAGE_SIZE}&view=all`,
      {
        headers: {
          Accept: 'application/json',
          //// take from local storage
          Authorization: `${username}:${token}`,
        },
      },
    )
    // console.log(JSON.stringify(data, null, 4)) ////

    // 👇️ "response status is: 200"
    // console.log('response status is: ', status) ////

    return data
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
