// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC } from 'react'
import { t } from 'i18next'

interface PhysicalPhoneKeyBadgeProps {
  type: string
}

// colors as in the mockup: line/emerald, blf/blue, queue/orange, dnd/rose, speed dial/cyan
const BADGE_STYLES: { [key: string]: string } = {
  line: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-700 dark:text-emerald-50',
  blf: 'bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-50',
  toggleQueue: 'bg-amber-200 text-amber-900 dark:bg-amber-600 dark:text-amber-50',
  dnd: 'bg-rose-200 text-rose-900 dark:bg-rose-700 dark:text-rose-50',
  speed_dial: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-700 dark:text-cyan-50',
}

const BADGE_LABELS: { [key: string]: string } = {
  line: 'Devices.LINE',
  blf: 'Devices.BLF',
  toggleQueue: 'Devices.QUEUE',
  dnd: 'Devices.DND',
  speed_dial: 'Devices.SPEED DIAL',
}

export const PhysicalPhoneKeyBadge: FC<PhysicalPhoneKeyBadgeProps> = ({ type }) => {
  if (!type || !BADGE_STYLES[type]) {
    return null
  }

  return (
    <span
      className={`${BADGE_STYLES[type]} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4 whitespace-nowrap`}
    >
      {t(BADGE_LABELS[type])}
    </span>
  )
}

PhysicalPhoneKeyBadge.displayName = 'PhysicalPhoneKeyBadge'
