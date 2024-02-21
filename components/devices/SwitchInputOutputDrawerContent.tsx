// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState, Fragment } from 'react'
import { Button, SideDrawerCloseIcon } from '../common'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronDown, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

import { Tooltip } from 'react-tooltip'
import { closeSideDrawer } from '../../lib/utils'
import { Listbox, Transition } from '@headlessui/react'
import { savePreference } from '../../lib/storage'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'

export interface SwitchInputOutputDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const SwitchInputOutputDrawerContent = forwardRef<
  HTMLButtonElement,
  SwitchInputOutputDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const [selectedAudioInput, setSelectedAudioInput] = useState<any>('')

  const [audioInputs, setAudioInputs] = useState<any[]>([])
  const [audioOutputs, setAudioOutputs] = useState<any[]>([])

  useEffect(() => {
    const checkInputOutputDevices = () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((deviceInfos) => {
          const inputs = deviceInfos.filter((device) => device.kind === 'audioinput')
          const outputs = deviceInfos.filter((device) => device.kind === 'audiooutput')
          setAudioInputs(inputs)
          setAudioOutputs(outputs)
        })
        .catch((error) => {
          console.error('error', error)
        })
    }

    checkInputOutputDevices()

    navigator.mediaDevices.addEventListener('devicechange', checkInputOutputDevices)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkInputOutputDevices)
    }
  }, [])

  const authStore = useSelector((state: RootState) => state.authentication)

  const handleSelectedAudioInput = (newAudioInputSelected: any) => {
    setSelectedAudioInput(newAudioInputSelected)
    let currentSelectedAudioInput = newAudioInputSelected
    savePreference('audioInputDeviceSelected', currentSelectedAudioInput, authStore.username)
  }

  return (
    <>
      {/* Drawer header */}
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          {/* Title */}
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Devices.Audio settings')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className='m-1 py-5 pl-5 pr-9'>
        <>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <span>{t('Devices.Audio input')}</span>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className='h-4 w-4 pl-2 py-2 text-primary dark:text-primaryDark flex items-center tooltip-pin-information'
                aria-hidden='true'
              />
              {/* Audio input information tooltip */}
              <Tooltip anchorSelect='.tooltip-pin-information' place='right'>
                {t('Devices.Audio input information tooltip') || ''}
              </Tooltip>
            </div>
          </div>

          {/* Audio input select */}
          <Listbox value={selectedAudioInput} onChange={handleSelectedAudioInput}>
            {({ open }) => (
              <>
                <div className='flex items-center'>
                  <div className='relative'>
                    <Listbox.Button className='relative cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pr-10 text-left text-gray-900 dark:text-gray-100 focus:outline-none sm:text-sm sm:leading-6 w-80 border dark:border-gray-600'>
                      <span className={`block truncate mr-1 ml-4 font-semibold`}>
                        {selectedAudioInput?.label
                          ? selectedAudioInput?.label
                          : t('Devices.Select audio input')}
                      </span>
                      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <Listbox.Options className='absolute z-10 mt-1 w-full overflow-auto  scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 rounded-md bg-white py-1 text-base shadow-lg ring-1 dark:bg-gray-900 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none sm:text-sm h-auto'>
                        {Object.entries<any>(audioInputs)?.map(([audioInputId, audioInputInfo]) => (
                          <Listbox.Option
                            key={audioInputId}
                            className={({ active }) =>
                              classNames(
                                active
                                  ? 'bg-primary text-white'
                                  : 'text-gray-900 dark:text-gray-100',
                                'relative cursor-default select-none py-2 pl-8 pr-4',
                                ``,
                              )
                            }
                            value={audioInputInfo}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={classNames(
                                    selected ? 'font-semibold' : 'font-normal',
                                    'block truncate',
                                  )}
                                >
                                  {audioInputInfo?.label}
                                </span>

                                {selected || selectedAudioInput?.queue === audioInputId ? (
                                  <span
                                    className={classNames(
                                      active ? 'text-white' : 'text-primary',
                                      'absolute inset-y-0 left-0 flex items-center pl-1.5',
                                    )}
                                  >
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                                      aria-hidden='true'
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </div>
              </>
            )}
          </Listbox>
        </>

        {/* Footer section */}
        <div className='flex justify-end pt-6'>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='mb-4'>
            <span className='text-primary dark:text-primaryDark leading-5 text-sm font-medium'>
              {t('Common.Cancel')}
            </span>
          </Button>
          <Button
            variant='primary'
            type='submit'
            className='mb-4 ml-4'
            //   onClick={() => handleUpdateAudioDevices()}
          >
            <span className='leading-5 text-sm font-medium'>{t('Devices.Confirm edits')}</span>
          </Button>
        </div>
      </div>
    </>
  )
})

SwitchInputOutputDrawerContent.displayName = 'SwitchInputOutputDrawerContent'
