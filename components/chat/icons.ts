// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faUserGroup, faUsers } from '@fortawesome/free-solid-svg-icons'

export const faNewChat = {
  prefix: 'fas',
  iconName: 'new-chat',
  icon: [512, 512, [], '', 'M0 352L0 128C0 75 43 32 96 32l320 0c53 0 96 43 96 96l0 224c0 53-43 96-96 96l-120 0c-5.2 0-10.2 1.7-14.4 4.8L166.4 539.2c-4.2 3.1-9.2 4.8-14.4 4.8-13.3 0-24-10.7-24-24l0-72-32 0c-53 0-96-43-96-96zM232 152v64h-64v48h64v64h48v-64h64v-48h-64v-64z'],
} as unknown as IconDefinition

/** A group's look, as in the island: CTI operator groups (cti-…) in the group badge blue, a queue's chat ("Queue - …") with the Queues icon, other groups purple. */
export const groupLook = (peer: string, name: string) => ({
  icon: name.startsWith('Queue - ') ? faUsers : faUserGroup,
  className: peer.startsWith('cti-')
    ? 'bg-surfaceBadgeBlue text-textBadgeBlue dark:bg-surfaceBadgeBlueDark dark:text-textBadgeBlueDark'
    : 'bg-indigo-700 text-white',
})
