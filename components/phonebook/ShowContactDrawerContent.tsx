// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { ContactSummary } from './ContactSummary'
import { SideDrawerCloseIcon } from '../common'
import { useTranslation } from 'react-i18next'

export interface ShowContactDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowContactDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowContactDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()

  const auth = useSelector((state: RootState) => state.authentication)

  return (
    <>
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Phonebook.Contact details')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className)} {...props}>
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        <ContactSummary contact={config} isShownContactMenu={true} isShownSideDrawerLink={false} />
      </div>
    </>
  )
})

ShowContactDrawerContent.displayName = 'ShowContactDrawerContent'
