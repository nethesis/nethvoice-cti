// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * It's used to check if the token 
 * is already stored in the browser
 */
 export function isTokenStored() {
    let savedToken = localStorage.getItem('credentials')
    if (savedToken) {
      return true
    } else {
      return false
    }
  }
  
  /**
   * It's used to store the token 
   * in the browser
   */
  export function setToken(token: any) {
    let userInfo: object = {
      token: token,
    }
    let credentials = JSON.stringify(userInfo)
    localStorage.setItem('credentials', credentials)
  }
