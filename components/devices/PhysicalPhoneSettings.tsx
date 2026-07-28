// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import classNames from 'classnames'
import { Button, TextInput } from '../common'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { LineKeysSection } from './LineKeysSection'
import { getDevicesPinStatusForDevice } from '../../lib/devices'

export interface PhysicalPhoneSettingsProps {
  // physical phone endpoint, as returned by the user profile
  phone: any
  // true when the user profile enables the pin feature
  pinStatus: boolean
  onBack: () => void
}

type PhoneSettingsTab = 'lineKeys' | 'generalSettings'

export const PhysicalPhoneSettings: FC<PhysicalPhoneSettingsProps> = ({
  phone,
  pinStatus,
  onBack,
}) => {
  const [currentTab, setCurrentTab] = useState<PhoneSettingsTab>('lineKeys')
  const phoneName = phone?.description || t('Devices.IP phone')

  // pin is read here because the keys and the pin are saved with the same request
  const [pinValue, setPinValue] = useState('')
  const [pinVisible, setPinVisible] = useState(false)
  const pinRef = useRef() as React.MutableRefObject<HTMLInputElement>

  useEffect(() => {
    if (!pinStatus) {
      return
    }
    const retrievePinStatus = async () => {
      try {
        const pinInformation = await getDevicesPinStatusForDevice()
        if (pinInformation?.[phone?.id]?.enabled && pinInformation?.[phone?.id]?.pin !== '') {
          setPinValue(pinInformation[phone?.id].pin)
        } else {
          setPinValue('')
        }
      } catch (error) {
        console.error('Cannot retrieve pin information', error)
      }
    }
    retrievePinStatus()
  }, [phone?.id, pinStatus])

  const generateRandomPin = () => {
    const randomPin = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')
    if (pinRef.current) {
      pinRef.current.value = randomPin
    }
    setPinValue(randomPin)
  }

  const tabs: { id: PhoneSettingsTab; label: string }[] = [
    { id: 'lineKeys', label: t('Devices.Line keys') },
    { id: 'generalSettings', label: t('Devices.General settings') },
  ]

  return (
    <div className='flex flex-col gap-8 flex-1 min-h-0'>
      {/* breadcrumbs and title */}
      <div className='flex flex-col gap-2'>
        <div className='text-xs font-medium leading-4 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
          <button
            onClick={onBack}
            className='text-textLink dark:text-textLinkDark hover:underline cursor-pointer'
          >
            {t('Devices.Devices')}
          </button>
          <span className='mx-1'>{'>'}</span>
          <span>{t('Devices.Phone settings', { name: phoneName })}</span>
        </div>
        <h2 className='text-xl font-medium leading-7 text-primaryNeutral dark:text-primaryNeutralDark'>
          {t('Devices.Phone settings', { name: phoneName })}
        </h2>
      </div>

      {/* tabs */}
      <div className='flex gap-8 border-b border-layoutDivider dark:border-layoutDividerDark'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={classNames(
              'flex flex-col items-center justify-center px-1 pb-4 text-sm font-medium leading-5 cursor-pointer',
              currentTab === tab.id
                ? 'border-b-2 border-primary dark:border-primaryDark text-primary dark:text-primaryDark'
                : 'text-tertiaryNeutral dark:text-tertiaryNeutralDark',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {currentTab === 'lineKeys' ? (
        <LineKeysSection deviceId={phone?.id} pinValue={pinValue} pinEnabled={pinStatus} />
      ) : (
        <div className='flex flex-col gap-4'>
          {/* pin section, kept from the previous drawer until the general settings design is done */}
          {pinStatus ? (
            <>
              <div className='flex items-center'>
                <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
                  {t('Devices.PIN')}
                </span>
                <FontAwesomeIcon
                  icon={faCircleInfo}
                  className='h-4 w-4 pl-2 text-primaryIndigo dark:text-primaryIndigoDark'
                  aria-hidden='true'
                  data-tooltip-id='tooltip-phone-pin-information'
                  data-tooltip-content={t('Devices.Pin information tooltip') || ''}
                />
                <CustomThemedTooltip
                  id='tooltip-phone-pin-information'
                  place='right'
                  className='whitespace-normal text-left'
                />
                <span className='ml-2 text-sm leading-5 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                  {t('Devices.Optional')}
                </span>
              </div>
              <div className='w-80'>
                <TextInput
                  placeholder={t('Devices.Create a pin') || ''}
                  name='pin'
                  type={pinVisible ? 'text' : 'password'}
                  icon={pinVisible ? faEye : faEyeSlash}
                  onIconClick={() => setPinVisible(!pinVisible)}
                  trailingIcon={true}
                  ref={pinRef}
                  pattern='[0-9]*'
                  maxLength={10}
                  value={pinValue}
                  onChange={(event) => setPinValue(event.target.value)}
                  autoComplete='off'
                />
              </div>
              <div>
                <Button variant='white' onClick={generateRandomPin}>
                  {t('Devices.Generate random PIN')}
                </Button>
              </div>
              <p className='text-sm leading-5 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                {t('Devices.Pin saved with keys')}
              </p>
            </>
          ) : (
            <p className='text-sm leading-5 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
              {t('Devices.No general settings available')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

PhysicalPhoneSettings.displayName = 'PhysicalPhoneSettings'
