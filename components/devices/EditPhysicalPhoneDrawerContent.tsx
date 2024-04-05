// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentPropsWithRef, forwardRef, useEffect, useRef, useState } from 'react'
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
import { getDevicesPinStatusForDevice } from '../../lib/devices'
import { openToast } from '../../lib/utils'

export interface EditPhysicalPhoneDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const EditPhysicalPhoneDrawerContent = forwardRef<
  HTMLButtonElement,
  EditPhysicalPhoneDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const [pinVisible, setPinVisible] = useState(false)
  const pinRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const [firstRender, setFirstRender] = useState(true)
  const [getPinError, setGetPinError] = useState('')
  const [pinObjectInformation, setPinObjectInformation] = useState<any>({})

  const [pinValue, setPinValue] = useState('')

  const handlePinChange = (event: any) => {
    setPinValue(event.target.value)
  }

  const [initialPinSet, setInitialPinSet] = useState(false)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    const retrievePinStatus = async () => {
      try {
        setGetPinError('')
        const pin = await getDevicesPinStatusForDevice()
        setPinObjectInformation(pin)
        setInitialPinSet(false)
      } catch (error) {
        setGetPinError('Cannot retrieve pin information')
      }
    }
    retrievePinStatus()
  }, [firstRender])

  useEffect(() => {
    if (
      !initialPinSet &&
      pinObjectInformation[config?.id]?.pin !== '' &&
      pinObjectInformation[config?.id]?.enabled
    ) {
      setPinValue(pinObjectInformation[config?.id]?.pin)
      setInitialPinSet(true)
    } else {
      setPinValue('')
    }
  }, [pinObjectInformation, config?.id])

  const handleButtonClick = () => {
    // Generate a random PIN of 4 digits
    const generateRandomPIN = () => {
      return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')
    }
    const randomPIN = generateRandomPIN()
    // Set the random PIN to the input field
    if (pinRef.current) {
      pinRef.current.value = randomPIN
      setPinValue(randomPIN)
    }
  }

  const [selectAllOperatorsModalStatus, setSelectAllOperatorsModalStatus] = useState(false)
  const [viewAllOperatorsModal, setViewAllOperatorsModal] = useState(false)

  const configureKeysDropdownMenu = () => (
    <Dropdown.Item onClick={() => manageAllOperatorsKeyModalStatus()}>
      {t('Devices.Assign key to all operators')}
    </Dropdown.Item>
  )

  const manageAllOperatorsKeyModalStatus = () => {
    setViewAllOperatorsModal(true)
    updateAllOperatorsModalStatus(true)
  }

  const updateAllOperatorsModalStatus = (statusModal: boolean) => {
    setSelectAllOperatorsModalStatus(statusModal)
    setViewAllOperatorsModal(statusModal)
  }

  const [isEditComplete, setIsEditComplete] = useState(false)

  const updateDrawerVisibility = (editCompleteValue: boolean) => {
    setIsEditComplete(editCompleteValue)
    if (editCompleteValue) {
      openToast(
        'success',
        `${t('Devices.New phone configuration saved')}`,
        `${t('Devices.Edit completed')}`,
      )
    }
  }

  return (
    <>
      {/* Drawer header */}
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
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
      <div className='px-5'>
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        {/* Pin section */}
        {/* Check if user has pin enabled */}
        {config?.pinStatus && (
          <>
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
                <span className='text-sm text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Devices.Optional')}
                </span>
              </div>
            </div>{' '}
            {/* Pin input section */}
            <form action='#' className='space-y-6' autoComplete='off'>
              <div className='mt-1 pb-4'>
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
                  onChange={handlePinChange}
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
          </>
        )}

        {/* Keys configuration section */}
        <div className='flex items-center justify-between pt-8'>
          <div className='flex items-center'>
            <span>{t('Devices.Configure keys')}</span>
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-4 w-4 pl-2 text-primary dark:text-primaryDark flex items-center tooltip-configure-keys-information'
              aria-hidden='true'
            />
            {/* keys configuration information tooltip */}
            <Tooltip anchorSelect='.tooltip-configure-keys-information' place='right'>
              {t('Devices.Keys configuration information tooltip') || ''}
            </Tooltip>
          </div>
          <Dropdown items={configureKeysDropdownMenu()} position='left'>
            <FontAwesomeIcon
              icon={faEllipsisVertical}
              className='h-4 w-4 text-primary dark:text-primaryDark'
            />
          </Dropdown>
        </div>
        <ConfigureKeysSection
          deviceId={config?.id}
          modalAllOperatorsKeyStatus={updateAllOperatorsModalStatus}
          viewModalAllKeys={viewAllOperatorsModal}
          pinValue={pinValue}
          updateDrawerVisibility={updateDrawerVisibility}
        ></ConfigureKeysSection>
      </div>
    </>
  )
})

EditPhysicalPhoneDrawerContent.displayName = 'EditPhysicalPhoneDrawerContent'
