// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  faClockRotateLeft as faClockRotateLeftSolid,
  faHeadset as faHeadsetSolid,
  faAddressBook as faAddressBookSolid,
  faGear as faGearSolid,
  faGrid2 as faGridSolid,
  faUsers as faUsersSolid,
  faChartLine as faChartLineSolid,
} from '@nethesis/nethesis-solid-svg-icons'

import {
  faClockRotateLeft as faClockRotateLeftLight,
  faHeadset as faHeadsetLight,
  faAddressBook as faAddressBookLight,
  faGear as faGearLight,
  faGrid2 as faGridLight,
  faUsers as faUsersLight,
  faChartLine as faChartLineLight,
} from '@nethesis/nethesis-light-svg-icons'

import { IconDefinition } from '@fortawesome/fontawesome-common-types'

export type NavItemsProps = {
  name: string
  href: string
  icon: IconDefinition
  iconActive: IconDefinition
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
  { name: 'Queues', href: '/queues', icon: faUsersLight, iconActive: faUsersSolid, current: false },
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
    name: 'QueueManager',
    href: '/queueManager',
    icon: faChartLineLight,
    iconActive: faChartLineSolid,
    current: false,
  },
  {
    name: 'Applications',
    href: '/applications',
    icon: faGridLight,
    iconActive: faGridSolid,
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
