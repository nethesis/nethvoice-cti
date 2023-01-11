// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Containes methods used inside the TopBar
 */

import axios from 'axios'

export async function changeStatusPresence(status: any) {
    let linkPresence = '/user/presence'
  try {
    const { data } =  await axios.post(linkPresence, {
      status,
    })
    return data
  } catch (error) {
    console.error(error)
  }
}
