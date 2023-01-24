// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { ContactSummary } from './ContactSummary'

export interface ShowContactDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowContactDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowContactDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const auth = useSelector((state: RootState) => state.authentication)

  return (
    <>
      <div className={classNames(className, 'p-5')} {...props}>
        <ContactSummary contact={config} isShownContactMenu={true} />
      </div>
    </>
  )
})

ShowContactDrawerContent.displayName = 'ShowContactDrawerContent'
