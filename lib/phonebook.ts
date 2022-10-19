// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'

export async function getPhonebook() {
  try {
    //// handle offset, limit & view (person / company)
    const stringCredentials = localStorage.getItem('credentials')
    if (!stringCredentials) {
      console.error('No credentials in local storage')
      return
    }

    const { username, token } = JSON.parse(stringCredentials)
    const { data, status } = await axios.get(
      'https://nethvoice.nethesis.it/webrest/phonebook/searchstartswith/A?offset=0&limit=20&view=all',
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
