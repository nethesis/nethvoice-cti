// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * It can be used to render a status dot.
 *
 * @param size - The status dot size.
 * @param status - The status of status dot.
 *
 */

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import type { StatusTypes } from '../../theme/Types'
import { useTheme } from '../../theme/Context'

export interface statusDotProps extends Omit<ComponentPropsWithRef<'button'>, 'color' | 'style'> {
  size?: 'extra_small' | 'small' | 'base' | 'large' | 'extra_large'
  status: StatusTypes
}

export const StatusDot = forwardRef<HTMLButtonElement, statusDotProps>(
  ({ size = 'small', status, className }, ref): JSX.Element => {
    const { statusDot: theme } = useTheme().theme
    const themeStatus: any = useTheme().theme.status
    return (
      <div
        className={classNames(
          theme.base,
          size && theme.sizes[size],
          themeStatus[status]?.avatar.dot,
          className,
        )}
      ></div>
    )
  },
)

StatusDot.displayName = 'StatusDot'
