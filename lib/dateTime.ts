// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { intervalToDuration } from 'date-fns'
import { padStart } from 'lodash'

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
