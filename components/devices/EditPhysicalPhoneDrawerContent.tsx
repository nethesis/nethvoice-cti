// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import { SideDrawerCloseIcon } from '../common'
import { t } from 'i18next'

export interface EditPhysicalPhoneDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const EditPhysicalPhoneDrawerContent = forwardRef<
  HTMLButtonElement,
  EditPhysicalPhoneDrawerContentProps
>(({ config, className, ...props }, ref) => {
  return (<>
  <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Devices.Edit')}:
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div></>)
})

EditPhysicalPhoneDrawerContent.displayName = 'EditPhysicalPhoneDrawerContent'
