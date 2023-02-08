// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useState, useEffect, ComponentProps, ReactNode } from 'react'
import classNames from 'classnames'
import { useTheme } from '../../theme/Context'
import { Switch as HeadlessSwitch } from '@headlessui/react'

export interface IconSwitchProps extends ComponentProps<'div'> {
  on?: boolean
  icon: ReactNode
  size?: 'small' | 'base' | 'large' | 'extra_large'
  changed?: (enabled: boolean) => void
  disabled?: boolean
  lighterOnDark?: boolean
}

export const IconSwitch: FC<IconSwitchProps> = ({
  changed,
  on = false,
  icon,
  size = 'base',
  disabled,
  lighterOnDark = false,
  className,
  ...props
}): JSX.Element => {
  const [enabled, setEnabled] = useState(on || false)
  const { iconSwitch: theme } = useTheme().theme

  useEffect(() => {
    setEnabled(on)
  }, [on])

  const callback = () => {
    setEnabled(!enabled)
    changed && changed(!enabled)
  }

  return (
    <HeadlessSwitch.Group {...props}>
      <HeadlessSwitch
        checked={enabled}
        onChange={() => callback()}
        disabled={disabled}
        className={classNames(theme.base, size && theme.sizes[size], className)}
      >
        <span
          className={classNames(
            enabled
              ? lighterOnDark
                ? theme.iconEnabledLighterOnDark
                : theme.iconEnabled
              : theme.iconDisabled,
          )}
        >
          {icon}
        </span>
      </HeadlessSwitch>
    </HeadlessSwitch.Group>
  )
}
