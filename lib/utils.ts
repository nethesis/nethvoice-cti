// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { PropsWithChildren } from 'react'
import axios from 'axios'
import { store } from '../store'
import { getJSONItem, setJSONItem } from './storage'

import { format, utcToZonedTime } from 'date-fns-tz'
import { enGB, it } from 'date-fns/locale'

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
 * The helper function to dispatch events
 *
 * @param name The name of the event
 * @param data The data object
 * @param element The target element
 */

export const eventDispatch = (name: string, data: any, element: HTMLElement | Window = window) => {
  typeof element !== 'undefined'
    ? element.dispatchEvent(new CustomEvent(name, { detail: data }))
    : console.error(new Error('EventDispatch error: element is not defined'))
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

export function formatDate(date: any, fmt: string) {
  let loc = enGB
  if (navigator) {
    const lang = navigator.language.substring(0, 2)
    switch (lang) {
      case 'it':
        loc = it
        break
      //TO DO add other languages
    }
    return format(date, fmt, { locale: loc })
  }
}

export const formatInTimeZone = (date: any, fmt: string, tz: any) => {
  return format(utcToZonedTime(date, tz), fmt, { timeZone: tz })
}
