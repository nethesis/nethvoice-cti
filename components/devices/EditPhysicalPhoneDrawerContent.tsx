// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useRef, useState } from 'react'
import { Button, SideDrawerCloseIcon, TextInput } from '../common'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tooltip'

export interface EditPhysicalPhoneDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const EditPhysicalPhoneDrawerContent = forwardRef<
  HTMLButtonElement,
  EditPhysicalPhoneDrawerContentProps
>(({ config, className, ...props }, ref) => {
  console.log('this is config', config)

  const [pinVisible, setPinVisible] = useState(false)
  const pinRef = useRef() as React.MutableRefObject<HTMLInputElement>

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Devices.Edit')}: {config?.description}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>

      <div className='m-1 py-5 pl-5 pr-9'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <span>{t('Devices.PIN')}</span>
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-4 w-4 pl-2 py-2 text-emerald-700 flex items-center tooltip-pin-information'
              aria-hidden='true'
            />
            <Tooltip anchorSelect='.tooltip-pin-information' place='right'>
              {t('Devices.Pin information tooltip') || ''}
            </Tooltip>
          </div>
          <div className='flex'>
            <span>{t('Devices.Optional')}</span>
          </div>
        </div>
        <form action='#' className='space-y-6' autoComplete='off'>
          <div className='mt-1 pb-4'>
            <TextInput
              placeholder=''
              name='pin'
              type={pinVisible ? 'text' : 'password'}
              icon={pinVisible ? faEye : faEyeSlash}
              onIconClick={() => setPinVisible(!pinVisible)}
              trailingIcon={true}
              ref={pinRef}
            />
          </div>
        </form>
        <Button variant='ghost' className='text-primary dark:text-primaryDark text-sm font-medium leading-5'>
          {t('Devices.Generate random PIN')}
        </Button>
      </div>
    </>
  )
})

EditPhysicalPhoneDrawerContent.displayName = 'EditPhysicalPhoneDrawerContent'
