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

let pathName: string = ''

// Get current page name and convert in the correct format
export function convertRouterPathName(router: any) {
  const productName = getProductName()
  if (router.pathname) {
    // Delete slash at the beginning of the path
    const cleanRouterPath: string = router.pathname.replace(/^\/|\/$/g, '')
    // Return path with the uppercase first character
    if (cleanRouterPath) {
      pathName = cleanRouterPath[0].toUpperCase() + cleanRouterPath.slice(1) + ' - ' + productName
    }
  }
}

// Get icon html icon path
export function getLinkIcon() {
  if (typeof window === 'undefined') {
    return ''
  }
  let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement
  return link
}

const linkIcon = getLinkIcon()

let idInterval: any
export function manageFaviconEvents(isError: boolean, isCalling: boolean) {
  let warningMessage = 'Warning'
  let callingMessage = 'Calling'
  const warningMessageError = pathName.replace(/^.*? -/, `${warningMessage} - `)
  const callingMessageNotification = pathName.replace(/^.*? -/, `${callingMessage} - `)
  let base = true
  if (isError || isCalling) {
    idInterval = setInterval(() => {
      if (base) {
        if (isError) {
          if (linkIcon) {
            linkIcon.href = 'favicon-warn.ico'
          }
          window.document.title = warningMessageError
        } else if (isCalling) {
          if (linkIcon) {
            linkIcon.href = 'favicon-call.ico'
          }
          window.document.title = callingMessageNotification
        }
      } else {
        if (linkIcon) {
          linkIcon.href = 'favicon.ico'
        }
        window.document.title = pathName
      }
      base = !base
    }, 1000)
  }
}

// Call the function to interrupt the dynamic icon interval
export function hideFaviconWarn() {
  clearInterval(idInterval)
  if (linkIcon) {
    linkIcon.href = 'favicon.ico'
  }
  window.document.title = pathName
}
