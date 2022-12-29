// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PropsWithChildren } from 'react'
import axios from 'axios'
import { store } from '../store'

import { format, utcToZonedTime } from 'date-fns-tz'
import { eventDispatch } from './hooks/eventDispatch'
import { getLocale } from './dateTime'

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

export function callPhoneNumber(phoneNumber: string) {
  eventDispatch('phone-island-call-start', { number: phoneNumber })

  console.log('callPhoneNumber', phoneNumber) ////
}

export function getProductName() {
  if (window == undefined) {
    return ''
  }
  // @ts-ignore
  return `${window.CONFIG.PRODUCT_NAME}`
}
