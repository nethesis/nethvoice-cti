// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps } from 'react'
import { Menu } from '@headlessui/react'
import classNames from 'classnames'
import { useTheme } from '../../../theme/Context'
import { cleanClassName } from '../../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'

export interface DropdownItemProps extends Omit<ComponentProps<'div'>, 'className'> {
  onClick?: () => void
  icon?: IconDefinition
  centered?: boolean
}

export const DropdownItem: FC<DropdownItemProps> = ({
  children,
  onClick,
  icon: Icon,
  centered,
  ...props
}) => {
  const { dropdown: theme } = useTheme().theme
  const theirProps = cleanClassName(props)

  return (
    <Menu.Item>
      {({ active }) => (
        <div
          className={classNames(
            theme.item.base,
            active ? theme.item.active : theme.item.light,
            centered && theme.item.centered,
          )}
          onClick={onClick}
          {...theirProps}
        >
          {Icon && <FontAwesomeIcon icon={Icon} className={theme.item.icon} />}
          {children}
        </div>
      )}
    </Menu.Item>
  )
}
