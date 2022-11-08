// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * It can be used to render an Alert
 *
 * @param children - The children/s to render.
 * @param type - The alert type.
 *
 */

import classNames from 'classnames'
import { FC, ComponentProps } from 'react'
import { useTheme } from '../../theme/Context'
import {
  MdOutlineCancel,
  MdWarningAmber,
  MdInfoOutline,
  MdCheckCircleOutline,
} from 'react-icons/md'

export interface InlineNotifcationProps extends ComponentProps<'div'> {
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
}
export const InlineNotification: FC<InlineNotifcationProps> = ({
  type,
  title,
  children,
  className,
}): JSX.Element => {
  const { inlineNotification: theme } = useTheme().theme
  let checkIcon =
    type === 'info' ? (
      <MdInfoOutline className={theme.iconStyle[type]} aria-hidden='true' />
    ) : type === 'warning' ? (
      <MdWarningAmber className={theme.iconStyle[type]} aria-hidden='true' />
    ) : type === 'success' ? (
      <MdCheckCircleOutline className={theme.iconStyle[type]} aria-hidden='true' />
    ) : (
      <MdOutlineCancel className={theme.iconStyle[type]} aria-hidden='true' />
    )

  return (
    <>
      <div
        className={classNames(theme.base, type ? theme.type[type] : theme.type.success, className)}
      >
        <div className='flex-shrink-0'>{checkIcon}</div>
        <div className='ml-3'>
          <h3 className={theme.titleStyle[type]}>{title}</h3>
          <div className={theme.childrenText[type]}>{children}</div>
        </div>
      </div>
    </>
  )
}
