// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  faClockRotateLeft,
  faHeadset,
  faAddressBook,
  faGear,
} from '@fortawesome/free-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'

export type NavItemsProps = {
  name: string
  href: string
  icon: IconDefinition
  current: boolean
}

export const navItems: NavItemsProps[] = [
  { name: 'Operators', href: '/operators', icon: faHeadset, current: false },
  { name: 'History', href: '/history', icon: faClockRotateLeft, current: false },
  { name: 'Phonebook', href: '/phonebook', icon: faAddressBook, current: false },
  { name: 'Settings', href: '/settings', icon: faGear, current: false },
]
