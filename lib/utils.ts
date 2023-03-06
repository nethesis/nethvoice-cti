// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { PropsWithChildren, useState } from 'react'
import axios from 'axios'
import { store } from '../store'
import { eventDispatch } from './hooks/eventDispatch'
import { doLogout } from '../services/login'

export interface ClearProps {
  key: string
  source: Record<string, unknown>
}

const clean = ({ key, source }: ClearProps): object => {
  delete source[key]
  return source
}

export const cleanClassName = (props: PropsWithChildren<object>): object => {
  return clean({
    key: 'className',
    source: props,
  })
}

export function handleNetworkError(error: any) {
  if (axios.isAxiosError(error)) {
    console.error('error: ', error.message)

    if (!error.status) {
      // the request probably failed because auth token is expired (and CORS policy misconfigured)
      doLogout()
    }
    return null
  } else {
    console.error('unexpected error: ', error)
    return null
  }
}

export const closeSideDrawer = () => {
  store.dispatch.sideDrawer.setShown(false)
}

/**
 * Sort function to order array elements by a specific property (for array of objects) or by a specific index (for arrays of arrays)
 *
 */
export const sortByProperty = (property: string | number) => {
  return function (a: any, b: any) {
    if (a[property] < b[property]) {
      return -1
    }
    if (a[property] > b[property]) {
      return 1
    }
    return 0
  }
}

/**
 * Sort function to order array elements by "favorite" boolean attribute
 */
export const sortByFavorite = (a: any, b: any) => {
  if (a.favorite && !b.favorite) {
    return -1
  }
  if (!a.favorite && b.favorite) {
    return 1
  }
  return 0
}

export function callPhoneNumber(phoneNumber: string) {
  eventDispatch('phone-island-call-start', { number: phoneNumber })

  console.log('callPhoneNumber', phoneNumber) ////
}

export function getProductName() {
  if (typeof window === 'undefined') {
    return ''
  }
  // @ts-ignore
  return `${window.CONFIG.PRODUCT_NAME}`
}

export function getApiEndpoint() {
  if (typeof window === 'undefined') {
    return ''
  }
  // @ts-ignore
  return `${window.CONFIG.API_ENDPOINT}`
}

export function getApiScheme() {
  if (typeof window === 'undefined') {
    return ''
  }
  // @ts-ignore
  return `${window.CONFIG.API_SCHEME}`
}

/**
 * Returns true if the device used by the user is using a mobile device. Useful to check if the user is using a touch screen, for example to disable hover features
 */
export function isMobileDevice() {
  if (!navigator) {
    return true
  }
  return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
}

let idInterval: any

// It' s used to handle events and make the favicon dynamic
export function manageFaviconEvents(isError: boolean, isCalling: boolean) {
  let warningMessageError = 'Warning' + ' -'
  let base = true
  if (typeof window !== 'undefined') {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    idInterval = setInterval(() => {
      if (base) {
        if (isError || isCalling) {
          if (isError) {
            link.href = 'favicon-warn.ico'
            window.document.title = window.document.title.replace(
              /^[^-]+-/,
              `${warningMessageError}`,
            )
          } else {
            link.href = 'favicon-calling.ico'
            window.document.title = window.document.title.replace(
              /^[^-]+-/,
              `${warningMessageError}`,
            )
          }
        }
      } else {
        link.href = 'favicon.ico'
        window.document.title = 'Changed'
      }
      base = !base
    }, 1500)
  }
}

export function hideFaviconWarn() {
  clearInterval(idInterval)
  if (typeof window !== 'undefined') {
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    link.href = 'favicon.ico'
    window.document.title = 'Changed'
    console.log("job done")
  }
}
