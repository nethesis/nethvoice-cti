// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleLeft,
  faCircleInfo,
  faCirclePlus,
  faEye,
  faEyeSlash,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import classNames from 'classnames'
import { Button, InlineNotification, TextInput } from '../common'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { LineKeysSection } from './LineKeysSection'
import { getDevicesPinStatusForDevice, reloadPhysicalPhone, setPin } from '../../lib/devices'
import { openToast } from '../../lib/utils'

export interface PhysicalPhoneSettingsProps {
  // physical phone endpoint, as returned by the user profile
  phone: any
  // true when the user profile enables the pin feature
  pinStatus: boolean
  onBack: () => void
}

type PhoneSettingsTab = 'lineKeys' | 'generalSettings'

const generateRandomPin = () =>
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')

export const PhysicalPhoneSettings: FC<PhysicalPhoneSettingsProps> = ({
  phone,
  pinStatus,
  onBack,
}) => {
  const [currentTab, setCurrentTab] = useState<PhoneSettingsTab>('lineKeys')
  const phoneName = phone?.description || t('Devices.IP phone')

  // the pin is read here because the line keys are saved with the same phone configuration
  const [pinValue, setPinValue] = useState('')
  const [savedPinValue, setSavedPinValue] = useState('')
  const [pinVisible, setPinVisible] = useState(false)
  const [isSavingPin, setIsSavingPin] = useState(false)
  const [savePinError, setSavePinError] = useState('')
  const pinRef = useRef() as React.MutableRefObject<HTMLInputElement>

  useEffect(() => {
    if (!pinStatus) {
      return
    }
    const retrievePinStatus = async () => {
      try {
        const pinInformation = await getDevicesPinStatusForDevice()
        const currentPin =
          pinInformation?.[phone?.id]?.enabled && pinInformation?.[phone?.id]?.pin !== ''
            ? pinInformation[phone?.id].pin
            : ''
        setPinValue(currentPin)
        setSavedPinValue(currentPin)
      } catch (error) {
        console.error('Cannot retrieve pin information', error)
      }
    }
    retrievePinStatus()
  }, [phone?.id, pinStatus])

  const setRandomPin = () => {
    const randomPin = generateRandomPin()
    if (pinRef.current) {
      pinRef.current.value = randomPin
    }
    setPinValue(randomPin)
  }

  const savePin = async () => {
    try {
      setIsSavingPin(true)
      setSavePinError('')
      await setPin({
        extension: phone?.id,
        enabled: pinValue !== '',
        pin: pinValue !== '' ? pinValue : generateRandomPin(),
      })
      if (phone?.id) {
        await reloadPhysicalPhone(phone?.id)
      }
      setSavedPinValue(pinValue)
      openToast(
        'success',
        `${t('Devices.Phone configuration saved description', { name: phoneName })}`,
        `${t('Devices.Configuration saved')}`,
      )
    } catch (error) {
      setSavePinError('Cannot save the pin')
    } finally {
      setIsSavingPin(false)
    }
  }

  const tabs: { id: PhoneSettingsTab; label: string }[] = [
    { id: 'lineKeys', label: t('Devices.Line keys') },
    { id: 'generalSettings', label: t('Devices.General settings') },
  ]

  return (
    <div className='flex flex-col gap-8 flex-1 min-h-0'>
      {/* back link, title and expansion modules */}
      <div className='flex flex-col gap-4'>
        <div>
          <Button variant='ghost' onClick={onBack}>
            <FontAwesomeIcon icon={faAngleLeft} className='mr-3 h-4 w-4' />
            <span>{t('Devices.Back to Devices')}</span>
          </Button>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <h2 className='text-lg font-medium leading-7 text-secondaryNeutral dark:text-secondaryNeutralDark'>
            {t('Devices.Phone settings', { name: phoneName })}
          </h2>
          <Button variant='ghost' disabled>
            <FontAwesomeIcon icon={faCirclePlus} className='mr-3 h-4 w-4' />
            <span>{t('Devices.Add expansion module')}</span>
          </Button>
        </div>
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
        <LineKeysSection
          deviceId={phone?.id}
          phoneName={phoneName}
          pinValue={pinValue}
          pinEnabled={pinStatus}
        />
      ) : (
        <div className='flex flex-col gap-6 items-start'>
          {pinStatus ? (
            <>
              <div className='flex items-end gap-6'>
                <div className='w-80'>
                  <div className='flex items-end justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
                        {t('Devices.PIN')}
                      </span>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className='h-4 w-4 text-primaryIndigo dark:text-primaryIndigoDark'
                        aria-hidden='true'
                        data-tooltip-id='tooltip-phone-pin-information'
                        data-tooltip-content={t('Devices.Pin information tooltip') || ''}
                      />
                      <CustomThemedTooltip
                        id='tooltip-phone-pin-information'
                        place='right'
                        className='whitespace-normal text-left'
                      />
                    </div>
                    <span className='text-sm leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
                      {t('Devices.Optional')}
                    </span>
                  </div>
                  <TextInput
                    className='mt-2'
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
                    onChange={(event) => setPinValue(event.target.value.replace(/[^0-9]/g, ''))}
                    autoComplete='off'
                  />
                </div>
                <Button variant='white' onClick={setRandomPin}>
                  <span>{t('Devices.Generate random PIN')}</span>
                </Button>
              </div>

              {savePinError && (
                <InlineNotification type='error' title={t('Common.Error')}>
                  <p>{t('Devices.Cannot save the pin')}</p>
                </InlineNotification>
              )}

              <Button
                variant='primary'
                onClick={savePin}
                disabled={isSavingPin || pinValue === savedPinValue}
              >
                <FontAwesomeIcon icon={faFloppyDisk} className='mr-3 h-4 w-4' />
                <span>{t('Common.Save')}</span>
              </Button>
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
