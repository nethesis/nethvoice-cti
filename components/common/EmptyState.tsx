// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import classNames from 'classnames'
import { FC, ComponentProps } from 'react'

export interface EmptyStateProps extends ComponentProps<'div'> {
  title: string
  description?: string
  icon?: any
}

export const EmptyState: FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  children,
  className,
}): JSX.Element => {
  return (
    <>
      <div className={classNames('text-center', 'p-8', className)}>
        <div className='text-gray-400 dark:text-gray-400'>{icon}</div>
        <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-gray-100'>{title}</h3>
        {description && (
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{description}</p>
        )}
        {children && <div className='mt-6 flex flex-col items-center'>{children}</div>}
      </div>
    </>
  )
}
