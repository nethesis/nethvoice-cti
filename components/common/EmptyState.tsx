// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import classNames from 'classnames'
import { FC, ComponentProps } from 'react'

export interface EmptyStateProps extends ComponentProps<'div'> {
  title: string
  description?: string
  icon?: any
  // 'inline' drops the card surface, for empty states nested inside a card or a dropdown
  variant?: 'card' | 'inline'
}

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  children,
  className,
  variant = 'card',
}): JSX.Element => {
  return (
    <>
      <div
        className={classNames(
          'w-full overflow-hidden text-center',
          variant === 'card'
            ? 'rounded-lg bg-white shadow dark:bg-gray-800 px-8 py-7 space-y-5'
            : 'px-4 py-6 space-y-3',
          className,
        )}
      >
        <div className='text-gray-400 dark:text-gray-400'>{icon}</div>
        <div>
          <h3 className='mt-2 text-sm font-medium text-primaryNeutral dark:text-primaryNeutralDark'>
            {title}
          </h3>
          {description && (
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{description}</p>
          )}
          {children && <div className='mt-6 flex flex-col items-center leading-5'>{children}</div>}
        </div>
      </div>
    </>
  )
}
