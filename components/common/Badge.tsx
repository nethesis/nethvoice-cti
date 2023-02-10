// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The badge can be used to highlight values or statuses.
 *
 * @param label - The label to show.
 * @param rounded - It's useful to put the the label rounded or less
 * @param size - It's the size of the badge
 * @param variant - It's the type of the badge
 * @param dot - It's the dot for the presence
 *
 */

import classNames from 'classnames'
import { FC, ComponentProps } from 'react'
import { useTheme } from '../../theme/Context'
import type { StatusTypes } from '../../theme/Types'

export interface BadgeProps extends ComponentProps<'span'> {
  variant: StatusTypes
  rounded?: 'base' | 'full'
  size?: 'base' | 'small' | 'large'
}

export const Badge: FC<BadgeProps> = ({
  rounded,
  variant,
  children,
  size,
  className,
  ...props
}): JSX.Element => {
  const { badge: theme, status: statuses } = useTheme().theme

  return (
    <>
      <span
        className={classNames(
          theme.base,
          rounded ? theme.rounded[rounded] : theme.rounded.base,
          variant && statuses[variant]?.badge.base,
          size ? theme.sizes[size] : theme.sizes.base,
          className,
        )}
        {...props}
      >
        {children}
      </span>
    </>
  )
}
