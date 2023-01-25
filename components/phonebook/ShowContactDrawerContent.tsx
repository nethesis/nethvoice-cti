// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { ContactSummary } from './ContactSummary'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { closeSideDrawer } from '../../lib/utils'

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
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            Contact details
          </div>
          <div className='flex items-center h-7'>
            <FontAwesomeIcon
              icon={faXmark}
              className='h-5 w-5 cursor-pointer p-0.5 mr-1 dark:text-gray-200 text-gray-700'
              aria-hidden='true'
              onClick={() => closeSideDrawer()}
            />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'p-5')} {...props}>
        <ContactSummary contact={config} isShownContactMenu={true} />
      </div>
    </>
  )
})

ShowContactDrawerContent.displayName = 'ShowContactDrawerContent'
