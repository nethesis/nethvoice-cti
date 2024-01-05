// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, Fragment, ReactNode } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { DropdownItem } from './DropdownItem'
import { DropdownHeader } from './DropdownHeader'
import { useTheme } from '../../../theme/Context'
import classNames from 'classnames'

export interface DropdownProps extends ComponentProps<'div'> {
  items: ReactNode
  divider?: boolean
  position?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'full'
}

const DropdownComponent: FC<DropdownProps> = ({
  children,
  items,
  divider,
  position,
  size,
  className,
}) => {
  const { dropdown: theme } = useTheme().theme

  return (
    <Menu as='div' className={classNames(theme.base, className)}>
      <Menu.Button as='div' className={classNames(size && theme.size[size])}>
        {children}
      </Menu.Button>
      <Transition as={Fragment} {...theme.items.transition}>
        <Menu.Items
          className={classNames(
            theme.items.base,
            divider && theme.items.divider,
            position ? theme.items.position[position] : theme.items.position.right,
            position === 'top' ? 'py-1': ''
          )}
        >
          {items}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

DropdownItem.displayName = 'Dropdown.Item'
DropdownHeader.displayName = 'Dropdown.Header'

export const Dropdown = Object.assign(DropdownComponent, {
  Item: DropdownItem,
  Header: DropdownHeader,
})
