// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentPropsWithRef, forwardRef, useRef, useState } from 'react'
import { Button, Dropdown, SideDrawerCloseIcon, TextInput } from '../common'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleInfo,
  faEllipsisVertical,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'

import { Tooltip } from 'react-tooltip'
import { ConfigureKeysSection } from './ConfigureKeysSection'

export interface EditPhysicalPhoneDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const EditPhysicalPhoneDrawerContent = forwardRef<
  HTMLButtonElement,
  EditPhysicalPhoneDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const [pinVisible, setPinVisible] = useState(false)
  const pinRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const handleButtonClick = () => {
    // Generate a random PIN of 4 digits
    const generateRandomPIN = () => {
      return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')
    }
    const randomPIN = generateRandomPIN()
    // Set the random PIN to the input field
    if (pinRef.current) {
      pinRef.current.value = randomPIN
    }
  }

  const configureKeysDropdownMenu = (deviceId: any) => (
    <Dropdown.Item onClick={() => setSelectedAsMainDevice(deviceId)}>
      {t('Devices.Assign key to all operators')}
    </Dropdown.Item>
  )

  const setSelectedAsMainDevice = async (deviceId: string) => {
    // let deviceIdInfo: any = {}
    // if (deviceId) {
    //   deviceIdInfo.id = deviceId
    //   try {
    //     await setMainDevice(deviceIdInfo)
    //     dispatch.user.updateDefaultDevice(deviceIdInfo)
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }
  }

  return (
    <>
      {/* Drawer header */}
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          {/* Title */}
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Devices.Edit')}: {config?.description}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className='m-1 py-5 pl-5 pr-9'>
        {/* Pin section */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <span>{t('Devices.PIN')}</span>
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-4 w-4 pl-2 py-2 text-primary dark:text-primaryDark flex items-center tooltip-pin-information'
              aria-hidden='true'
            />
            {/* Pin information tooltip */}
            <Tooltip anchorSelect='.tooltip-pin-information' place='right'>
              {t('Devices.Pin information tooltip') || ''}
            </Tooltip>
          </div>
          <div className='flex'>
            <span className='text-sm text-gray-700 leading-5'>{t('Devices.Optional')}</span>
          </div>
        </div>
        {/* Pin input section */}
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
              pattern='[0-9]*'
              maxLength={10}
            />
          </div>
        </form>
        {/* Generate random PIN button */}
        <Button
          variant='dashboard'
          className='text-primary dark:text-primaryDark text-sm font-medium leading-5'
          onClick={handleButtonClick}
        >
          {t('Devices.Generate random PIN')}
        </Button>
        {/* Keys configuration section */}
        <div className='flex items-center justify-between pt-8'>
          <div className='flex items-center'>
            <span>{t('Devices.Configure keys')}</span>
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-4 w-4 pl-2 text-primary dark:text-primaryDark flex items-center tooltip-configure-keys-information'
              aria-hidden='true'
            />
            {/* Pin information tooltip */}
            <Tooltip anchorSelect='.tooltip-configure-keys-information' place='right'>
              {t('Devices.Pin information tooltip') || ''}
            </Tooltip>
          </div>
          <Dropdown items={configureKeysDropdownMenu('')} position='left'>
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              className='h-4 w-4 text-primary dark:text-primaryDark'
            />
          </Dropdown>
        </div>
        <ConfigureKeysSection deviceId={config?.id}></ConfigureKeysSection>
      </div>
    </>
  )
})

EditPhysicalPhoneDrawerContent.displayName = 'EditPhysicalPhoneDrawerContent'
