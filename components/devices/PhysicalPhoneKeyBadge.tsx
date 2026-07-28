// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC } from 'react'
import { t } from 'i18next'

interface PhysicalPhoneKeyBadgeProps {
  type: string
}

const BADGE_STYLES: { [key: string]: string } = {
  line: 'bg-surfaceBadgeGreen dark:bg-surfaceBadgeGreenDark text-textBadgeGreen dark:text-textBadgeGreenDark',
  blf: 'bg-surfaceBadgeBlueNethLink dark:bg-surfaceBadgeBlueNethLinkDark text-textBadgeBlueNethLink dark:text-textBadgeBlueNethLinkDark',
  toggleQueue:
    'bg-surfaceBadgeAmber dark:bg-surfaceBadgeAmberDark text-textBadgeAmber dark:text-textBadgeAmberDark',
  dnd: 'bg-surfaceBadgeRose dark:bg-surfaceBadgeRoseDark text-textBadgeRose dark:text-textBadgeRoseDark',
  speed_dial:
    'bg-surfaceBadgeCyan dark:bg-surfaceBadgeCyanDark text-textBadgeCyan dark:text-textBadgeCyanDark',
}

const BADGE_LABELS: { [key: string]: string } = {
  line: 'Devices.LINE',
  blf: 'Devices.BLF',
  toggleQueue: 'Devices.QUEUE',
  dnd: 'Devices.DND',
  speed_dial: 'Devices.SPEED DIAL',
}

const TYPE_LABELS: { [key: string]: string } = {
  line: 'Devices.Line',
  blf: 'Devices.Busy lamp field (BLF)',
  toggleQueue: 'Devices.Toggle login/logout queue',
  dnd: 'Devices.Do not disturb (DND)',
  speed_dial: 'Devices.Speed call',
}

export const getKeyTypeSearchText = (type: string) => {
  if (!type) {
    return ''
  }
  return [BADGE_LABELS[type], TYPE_LABELS[type]]
    .filter(Boolean)
    .map((key) => t(key as string))
    .join(' ')
}

export const PhysicalPhoneKeyBadge: FC<PhysicalPhoneKeyBadgeProps> = ({ type }) => {
  if (!type || !BADGE_STYLES[type]) {
    return null
  }

  return (
    <span
      className={`${BADGE_STYLES[type]} inline-flex items-center justify-center rounded-full px-3 py-0.5 text-sm font-medium leading-5 text-center whitespace-nowrap`}
    >
      {t(BADGE_LABELS[type])}
    </span>
  )
}

PhysicalPhoneKeyBadge.displayName = 'PhysicalPhoneKeyBadge'
