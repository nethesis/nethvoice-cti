// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { formatDistanceToNow, intervalToDuration } from 'date-fns'
import { padStart } from 'lodash'
import { enGB, it } from 'date-fns/locale'
import { format, utcToZonedTime } from 'date-fns-tz'

export function formatDateLoc(date: any, fmt: string) {
  return format(date, fmt, { locale: getLocale() })
}

export const formatInTimeZoneLoc = (date: any, fmt: string, tz: any) => {
  return format(utcToZonedTime(date, tz), fmt, { timeZone: tz, locale: getLocale() })
}

/**
 * Format a duration expressed in seconds to HH:MM:SS. E.g. 189 -> 03:09
 *
 * @param seconds - duration to format
 *
 */
export const formatDuration = (durationSeconds: number) => {
  const duration: any = intervalToDuration({ start: 0, end: durationSeconds * 1000 })
  const hours = duration.hours ? `${padStart(duration.hours, 2, '0')}:` : ''
  const minutes = padStart(duration.minutes, 2, '0')
  const seconds = padStart(duration.seconds, 2, '0')
  const formatted = `${hours}${minutes}:${seconds}`
  return formatted
}

/**
 * Get browser locale (english fallback)
 */
export const getLocale = () => {
  let loc = enGB

  if (navigator) {
    const lang = navigator.language.substring(0, 2)
    switch (lang) {
      case 'it':
        loc = it
        break
      //// TODO add other languages
    }
  }
  return loc
}

/**
 * Invoke formatDistanceToNow function using browser locale
 */
export const formatDistanceToNowLoc = (date: any, options: any) => {
  return formatDistanceToNow(date, { ...options, locale: getLocale() })
}
