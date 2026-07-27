// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import { Button } from '../common'
import { DrawerHeader } from '../common/DrawerHeader'
import { Divider } from '../common/Divider'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'

import { closeSideDrawer } from '../../lib/utils'
import { faApple, faWindows } from '@fortawesome/free-brands-svg-icons'
import { isEmpty } from 'lodash'

export interface DownloadDesktopLinkContentProps extends ComponentPropsWithRef<'div'> {
  config: {
    urlStatus: any[]
    selectedOS: string
    macArchitecture?: string
  }
}

const osCards = [
  { id: 'apple', label: 'MacOS', icon: faApple },
  { id: 'windows', label: 'Windows', icon: faWindows },
]

export const DownloadDesktopLinkContent = forwardRef<
  HTMLButtonElement,
  DownloadDesktopLinkContentProps
>(({ config, className, ...props }, ref) => {
  const [selectedOS, setSelectedOS] = useState(config?.selectedOS || '')
  const macArchitecture = config?.macArchitecture || 'x64'

  const handleSelectedOS = (os: string) => {
    setSelectedOS(os)
  }

  const handleDownloadStart = () => {
    if (!isEmpty(config) && selectedOS !== '') {
      let url
      switch (selectedOS) {
        case 'apple':
          const macArmUrl = config?.urlStatus?.find((item: any) => item.macArmUrl)?.macArmUrl
          const macX64Url = config?.urlStatus?.find((item: any) => item.macX64Url)?.macX64Url
          const macDefaultUrl = config?.urlStatus?.find((item: any) => item.macUrl)?.macUrl

          if (macArchitecture === 'arm64' && macArmUrl) {
            url = macArmUrl
          } else if (macX64Url) {
            url = macX64Url
          } else {
            url = macDefaultUrl
          }
          break
        case 'windows':
          url = config?.urlStatus?.find((item: any) => item.windowsUrl)?.windowsUrl
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
      <DrawerHeader title={t('Devices.Download Desktop app')} onClose={closeSideDrawer} />
      {/* Divider */}
      <div className='px-6 pb-6'>
        <Divider paddingY='pb-12' />
        {/* Desktop app OS selection */}
        {/* title  */}
        <div>
          <span className='dark:text-gray-200 leading-5 text-sm font-medium'>
            {t('Devices.Operating system')}
          </span>
        </div>
        <div className='mt-2 grid grid-cols-2 gap-4'>
          {osCards.map((osCard) => (
            <div
              key={osCard.id}
              className={`${
                selectedOS === osCard.id
                  ? 'border-primary dark:border-primaryDark'
                  : 'border-gray-200 dark:border-gray-500'
              } rounded-md border bg-cardBackgroud dark:bg-cardBackgroudDark px-3 py-2 min-h-[55px] relative flex items-center justify-between gap-2 cursor-pointer`}
              onClick={() => handleSelectedOS(osCard.id)}
            >
              <div className='flex items-center gap-2'>
                <FontAwesomeIcon icon={osCard.icon} className='h-6 w-6' aria-hidden='true' />
                <span className='text-sm font-medium leading-5 text-gray-700 dark:text-gray-100'>
                  {osCard.label}
                </span>
              </div>
              {selectedOS === osCard.id && (
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className='h-3 w-3 self-start text-primary dark:text-primaryDark'
                />
              )}
            </div>
          ))}
        </div>
        {/* Divider */}
        <Divider paddingY='pt-8 pb-6' />
        {/* Footer section */}
        <div className='flex justify-end gap-6'>
          <Button variant='ghost' type='submit' onClick={closeSideDrawer}>
            {t('Common.Cancel')}
          </Button>
          <Button variant='primary' type='submit' onClick={() => handleDownloadStart()}>
            {t('Common.Download')}
          </Button>
        </div>
      </div>
    </>
  )
})

DownloadDesktopLinkContent.displayName = 'DownloadDesktopLinkContent'
