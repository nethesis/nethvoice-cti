import { FC, ComponentProps, Fragment, ReactNode } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { DropdownItem } from './DropdownItem'
import { DropdownHeader } from './DropdownHeader'
import { useTheme } from '../../../theme/Context'
import classNames from 'classnames'

export interface DropdownProps extends Omit<ComponentProps<'div'>, 'className'> {
  items: ReactNode
  divider?: boolean
  position?: 'left' | 'right'
  size?: 'full'
}

const DropdownComponent: FC<DropdownProps> = ({ children, items, divider, position, size }) => {
  const { dropdown: theme } = useTheme().theme

  return (
    <Menu as='div' className={theme.base}>
      <Menu.Button as='div' className={classNames(size && theme.size[size])}>
        {children}
      </Menu.Button>
      <Transition as={Fragment} {...theme.items.transition}>
        <Menu.Items
          className={classNames(
            theme.items.base,
            divider && theme.items.divider,
            position ? theme.items.position[position] : theme.items.position.right,
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
