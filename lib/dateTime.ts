// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { formatDistanceToNowStrict, formatDuration, intervalToDuration } from 'date-fns'
import { padStart } from 'lodash'
import { enGB, it } from 'date-fns/locale'
import { format, utcToZonedTime } from 'date-fns-tz'

/**
 * Format a date expressed in milliseconds to current locale
 *
 */
export function formatDateLoc(date: any, fmt: string) {
  return format(date, fmt, { locale: getLocale() })
}

export const getCallTimeToDisplay = (date: any, timeZone: string) => {
  return format(new Date(date), 'HH:mm', { timeZone })
}

export const formatInTimeZoneLoc = (date: any, fmt: string, tz: any) => {
  return format(utcToZonedTime(date, tz), fmt, { timeZone: tz, locale: getLocale() })
}

export function formatDateLocIsDifferentTimezone(date: any, fmt: string) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return format(utcToZonedTime(date, timeZone), fmt, { locale: getLocale() })
}

export const getCallTimeToDisplayIsDifferentTimezone = (date: any) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return format(utcToZonedTime(date, timeZone), 'HH:mm', { timeZone, locale: getLocale() })
}

export function formatDateLocIsAnnouncement(date: any) {
  const dateParts = date?.date_creation.split('/')
  const year = parseInt(dateParts[2], 10)
  const month = parseInt(dateParts[1], 10) - 1
  const day = parseInt(dateParts[0], 10)

  const formattedDate = new Date(year, month, day)

  return format(formattedDate, 'PP', { locale: getLocale() })
}

export const getCallTimeToDisplayIsAnnouncement = (date: any) => {
  const timeParts = date?.time_creation.split(':')
  const hour = parseInt(timeParts[0], 10)
  const minute = parseInt(timeParts[1], 10)
  const second = parseInt(timeParts[2], 10)

  const formattedTime = new Date(0, 0, 0, hour, minute, second)

  return formatInTimeZoneLoc(formattedTime, 'HH:mm', 'UTC')
}

export const formatInTimeZoneLocIsAnnouncement = (date: any, fmt: string, tz: any) => {
  const dateParts = date?.date_creation.split('/')
  const timeParts = date?.time_creation.split('/')

  const year = parseInt(dateParts[2], 10)
  const month = parseInt(dateParts[1], 10) - 1
  const day = parseInt(dateParts[0], 10)
  const hour = parseInt(timeParts[0], 10)
  const minute = parseInt(timeParts[1], 10)
  const second = parseInt(timeParts[2], 10)

  const formattedDateAndTime = new Date(year, month, day, hour, minute, second)

  return format(utcToZonedTime(formattedDateAndTime, tz), fmt, {
    timeZone: tz,
    locale: getLocale(),
  })
}

/**
 * Format a call duration expressed in seconds to HH:MM:SS. E.g. 189 -> 03:09
 *
 * @param seconds - duration to format
 *
 */
export const formatCallDuration = (durationSeconds: number) => {
  const duration: any = intervalToDuration({ start: 0, end: durationSeconds * 1000 })
  const hours = duration.hours ? `${padStart(duration.hours, 2, '0')}:` : ''
  const minutes = padStart(duration.minutes, 2, '0')
  const seconds = padStart(duration.seconds, 2, '0')
  const formatted = `${hours}${minutes}:${seconds}`
  return formatted
}

/**
 * Format a duration expressed in seconds to HH:MM:SS. E.g. 189 -> 3 minutes 9 seconds
 *
 * @param seconds - duration to format
 *
 */
export const formatDurationLoc = (durationSeconds: number, options: any = {}) => {
  if (!durationSeconds) {
    return null
  }

  return formatDuration(
    intervalToDuration({
      start: 0,
      end: durationSeconds * 1000,
    }),
    { ...options, locale: getLocale() },
  )
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
 * Return the approximate distance from a date to now. Example output: 6 months
 */
export const humanDistanceToNowLoc = (date: any, options: any = {}) => {
  if (!date) {
    return null
  }

  return formatDistanceToNowStrict(date, { ...options, locale: getLocale() })
}

/**
 * Return the exact distance from a date to now. Example output: 13 minutes 5 seconds
 */
export const exactDistanceToNowLoc = (date: any, options: any = {}) => {
  if (!date) {
    return null
  }

  const duration = intervalToDuration({
    start: date,
    end: new Date(),
  })

  // custom option hideSeconds (not supported by date-fns)
  if (options.hideSeconds) {
    delete duration.seconds
  }

  return formatDuration(duration, { ...options, locale: getLocale() })
}
