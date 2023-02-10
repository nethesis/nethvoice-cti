// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  faClockRotateLeft as faClockRotateLeftSolid,
  faHeadset as faHeadsetSolid,
  faAddressBook as faAddressBookSolid,
  faGear as faGearSolid,
} from '@nethesis/nethesis-solid-svg-icons'

import {
  faClockRotateLeft as faClockRotateLeftLight,
  faHeadset as faHeadsetLight,
  faAddressBook as faAddressBookLight,
  faGear as faGearLight,
} from '@nethesis/nethesis-light-svg-icons'

import { IconDefinition } from '@fortawesome/fontawesome-common-types'

export type NavItemsProps = {
  name: string
  href: string
  icon: IconDefinition
  current: boolean
}

export const navItems: NavItemsProps[] = [
  {
    name: 'Operators',
    href: '/operators',
    icon: faHeadsetLight,
    iconActive: faHeadsetSolid,
    current: false,
  },
  {
    name: 'Phonebook',
    href: '/phonebook',
    icon: faAddressBookLight,
    iconActive: faAddressBookSolid,
    current: false,
  },
  {
    name: 'History',
    href: '/history',
    icon: faClockRotateLeftLight,
    iconActive: faClockRotateLeftSolid,
    current: false,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: faGearLight,
    iconActive: faGearSolid,
    current: false,
  },
]
