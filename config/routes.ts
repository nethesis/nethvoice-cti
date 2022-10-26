// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps } from 'react'
import { MdHistory, MdOutlineContacts, MdOutlineSettings, MdPersonOutline } from 'react-icons/md'

export type NavItemsProps = {
  name: string
  href: string
  icon: FC<ComponentProps<'svg'>>
  current: boolean
}

export const navItems: NavItemsProps[] = [
  { name: 'Operators', href: '/operators', icon: MdPersonOutline, current: false },
  { name: 'History', href: '/history', icon: MdHistory, current: false },
  { name: 'Phonebook', href: '/phonebook', icon: MdOutlineContacts, current: false },
  { name: 'Settings', href: '/settings', icon: MdOutlineSettings, current: false },
]
