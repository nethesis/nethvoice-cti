// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import { Button, SideDrawerCloseIcon } from '../common'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'

import { closeSideDrawer } from '../../lib/utils'
import { faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons'
import { isEmpty } from 'lodash'

export interface DownloadDesktopLinkContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const DownloadDesktopLinkContent = forwardRef<
  HTMLButtonElement,
  DownloadDesktopLinkContentProps
>(({ config, className, ...props }, ref) => {
  const [selectedOS, setSelectedOS] = useState('')

  const handleSelectedOS = (os: string) => {
    setSelectedOS(os)
  }

  const handleDownloadStart = () => {
    if (!isEmpty(config) && selectedOS !== '') {
      let url
      switch (selectedOS) {
        case 'linux':
          url = config.find((item: any) => item.linuxUrl)?.linuxUrl
          break
        case 'apple':
          url = config.find((item: any) => item.macUrl)?.macUrl
          break
        case 'windows':
          url = config.find((item: any) => item.windowsUrl)?.windowsUrl
          break
        default:
          break
      }
      if (url) {
        window.open(url, '_blank')
      }
    }
    closeSideDrawer()
  }

  return (
    <>
      {/* Drawer header */}
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
        <div className='flex items-center justify-between'>
          {/* Title */}
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Devices.Download Desktop app')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      {/* Divider */}
      <div className='px-6'>
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        {/* Desktop app OS selection */}
        {/* title  */}
        <div>
          <span className='dark:text-gray-200 leading-5 text-sm font-medium'>
            {t('Devices.Operating system')}
          </span>
        </div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
          {/* Linux */}
          <div
            className={`${
              selectedOS === 'linux'
                ? 'border-primary dark:border-primaryDark border-2'
                : 'border-gray-200 dark:border-gray-500 border-[1px]'
            } rounded-md bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-3 sm: mt-1 relative flex items-center `}
            onClick={() => handleSelectedOS('linux')}
          >
            <div className='flex items-center space-x-4'>
              <FontAwesomeIcon icon={faLinux} className='h-6 w-6' aria-hidden='true' />
              <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                Linux
              </span>
              {selectedOS === 'linux' && (
                <div className='absolute bottom-0 right-[0.75rem] mb-3 mr-3'>
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className='h-3 w-3 text-primary dark:text-primaryDark'
                  />
                </div>
              )}
            </div>
          </div>
          {/* Apple */}
          <div
            className={`${
              selectedOS === 'apple'
                ? 'border-primary dark:border-primaryDark border-2'
                : 'border-gray-200 dark:border-gray-500 border-[1px]'
            } rounded-md bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-3 sm: mt-1 relative flex items-center `}
            onClick={() => handleSelectedOS('apple')}
          >
            <div className='flex items-center space-x-4'>
              <FontAwesomeIcon icon={faApple} className='h-6 w-6' aria-hidden='true' />
              <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                MacOS
              </span>
            </div>
            {selectedOS === 'apple' && (
              <div className='absolute bottom-0 right-0 mb-3 mr-3'>
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className='h-3 w-3 text-primary dark:text-primaryDark'
                />
              </div>
            )}
          </div>
          {/* Windows */}
          <div
            className={`${
              selectedOS === 'windows'
                ? 'border-primary dark:border-primaryDark border-2'
                : 'border-gray-200 dark:border-gray-500 border-[1px]'
            } rounded-md bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-3 sm: mt-1 relative flex items-center `}
            onClick={() => handleSelectedOS('windows')}
          >
            <div className='flex items-center space-x-4'>
              <FontAwesomeIcon icon={faWindows} className='h-6 w-6' aria-hidden='true' />
              <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                Windows
              </span>
              {selectedOS === 'windows' && (
                <div className='absolute bottom-0 right-[0.75rem] mb-3 mr-3'>
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className='h-3 w-3 text-primary dark:text-primaryDark'
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Divider */}
        <div className='relative pb-8 pt-6'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        {/* Footer section */}
        <div className='flex justify-end'>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='mb-4'>
            <span className='text-primary dark:text-primaryDark leading-5 text-sm font-medium'>
              {t('Common.Cancel')}
            </span>
          </Button>
          <Button
            variant='primary'
            type='submit'
            className='mb-4 ml-4'
            onClick={() => handleDownloadStart()}
          >
            <span className='leading-5 text-sm font-medium'>{t('Common.Download')}</span>
          </Button>
        </div>
      </div>
    </>
  )
})

DownloadDesktopLinkContent.displayName = 'DownloadDesktopLinkContent'
