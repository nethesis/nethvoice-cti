// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { format, formatDistance } from 'date-fns'
import { enGB, it } from 'date-fns/locale'
import i18next from 'i18next'

/** Like the call history: "about 15 hours ago" over "(30 Sep 2026 18:08)". */
export function ChatTime({ ts }: { ts: number }) {
  const locale = i18next?.languages?.[0] === 'it' ? it : enGB
  const line = 'font-poppins text-sm leading-4 font-normal text-gray-600 dark:text-gray-300 truncate'
  return (
    <div className='flex flex-col justify-center flex-shrink-0'>
      <div className={line}>{formatDistance(ts, Date.now(), { addSuffix: true, includeSeconds: true, locale })}</div>
      <div className={line}>({format(ts, 'd MMM yyyy HH:mm', { locale })})</div>
    </div>
  )
}
