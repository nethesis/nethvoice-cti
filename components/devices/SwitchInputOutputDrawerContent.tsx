// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState, Fragment } from 'react'
import { Button, SideDrawerCloseIcon } from '../common'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronDown, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

import { Tooltip } from 'react-tooltip'
import { closeSideDrawer } from '../../lib/utils'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { getInputOutputLocalStorageValue } from '../../lib/devices'
import { eventDispatch } from '../../lib/hooks/eventDispatch'
import { isEmpty } from 'lodash'

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
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<any>('')

  const [audioInputs, setAudioInputs] = useState<any[]>([])
  const [audioOutputs, setAudioOutputs] = useState<any[]>([])
  const auth = useSelector((state: RootState) => state.authentication)

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

  const handleSelectedAudioInput = (newAudioInputSelected: any) => {
    setSelectedAudioInput(newAudioInputSelected)
  }

  const handleSelectedAudioOutput = (newAudioOutputSelected: any) => {
    setSelectedAudioOutput(newAudioOutputSelected)
  }

  const [inputValueStore, setInputValueStore] = useState<any>('')
  const [outputValueStore, setOutputValueStore] = useState<any>('')

  const handleUpdateAudioDevices = () => {
    eventDispatch('phone-island-audio-input-change', { deviceId: selectedAudioInput?.deviceId })
    eventDispatch('phone-island-audio-output-change', { deviceId: selectedAudioOutput?.deviceId })
    closeSideDrawer()
  }

  //Get input/output value from local storage
  useEffect(() => {
    const inputOutputValues = getInputOutputLocalStorageValue(auth?.username)
    setInputValueStore(inputOutputValues?.audioInputType)
    setOutputValueStore(inputOutputValues?.audioOutputType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isEmpty(inputValueStore) && !isEmpty(audioInputs)) {
      const selectedInput = audioInputs.find(
        (input: any) => input.deviceId === inputValueStore?.deviceId,
      )
      setSelectedAudioInput(selectedInput)
    }
  }, [inputValueStore, audioInputs])

  useEffect(() => {
    if (!isEmpty(outputValueStore) && !isEmpty(audioOutputs)) {
      const selectedOutput = audioOutputs.find(
        (output: any) => output.deviceId === outputValueStore?.deviceId,
      )
      setSelectedAudioOutput(selectedOutput)
    }
  }, [outputValueStore, audioOutputs])

  return (
    <>
      {/* Drawer header */}
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
        <div className='flex items-center justify-between'>
          {/* Title */}
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Devices.Audio settings')}: {t('Devices.Web phone')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>

      <div className='px-5'>
        {/* Divider */}
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        <>
          {/* Audio input section */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <span className='dark:text-gray-200 leading-5 text-sm font-medium'>
                {t('Devices.Speaker')}
              </span>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className='h-4 w-4 pl-2 py-2 text-primaryIndigo dark:text-primaryIndigoDark flex items-center'
                aria-hidden='true'
                data-tooltip-id='tooltip-input-information'
                data-tooltip-content={t('Devices.Audio input information tooltip') || ''}
              />
              {/* Audio input information tooltip */}
              <Tooltip id='tooltip-input-information' place='right' />
            </div>
          </div>

          {/* Audio input select */}
          <Listbox value={selectedAudioInput} onChange={handleSelectedAudioInput}>
            {({ open }) => (
              <>
                <div className='flex items-center mt-2'>
                  <div className='relative w-full'>
                    <ListboxButton className='relative w-full cursor-default rounded-md bg-white dark:bg-gray-950 py-1.5 pr-10 text-left focus:outline-none sm:text-sm sm:leading-6 border dark:border-gray-700'>
                      <span
                        className={`${
                          selectedAudioInput?.label
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-500 dark:text-gray-300'
                        } block truncate mr-1 ml-4 font-medium`}
                      >
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
                    </ListboxButton>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <ListboxOptions className='absolute z-10 mt-1 w-full overflow-auto  scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 rounded-md bg-white py-1 text-base shadow-lg ring-1 dark:bg-gray-950 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none sm:text-sm h-auto'>
                        {Object.entries<any>(audioInputs)?.map(([audioInputId, audioInputInfo]) => (
                          <ListboxOption
                            key={audioInputId}
                            className='data-[focus]:bg-gray-100 data-[focus]:dark:bg-gray-800 data-[focus]:text-gray-950 data-[focus]:dark:text-gray-100 text-gray-900 dark:text-gray-200 relative cursor-default select-none py-2 pl-8 pr-4'
                            value={audioInputInfo}
                          >
                            {({ selected, active }) => (
                              <>
                                <span
                                  className={classNames(
                                    selected ? 'font-medium' : 'font-normal',
                                    'block truncate',
                                  )}
                                >
                                  {audioInputInfo?.label}
                                </span>

                                {selected || selectedAudioInput?.label === audioInputInfo?.label ? (
                                  <span className='text-primary dark:text-primaryDark absolute inset-y-0 left-0 flex items-center pl-1.5'>
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                                      aria-hidden='true'
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </ListboxOption>
                        ))}
                      </ListboxOptions>
                    </Transition>
                  </div>
                </div>
              </>
            )}
          </Listbox>

          {/* Audio output section */}
          <div className='flex items-center justify-between pt-6'>
            <div className='flex items-center'>
              <span className='dark:text-gray-200 leading-5 text-sm font-medium'>
                {t('Devices.Microphone')}
              </span>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className='h-4 w-4 pl-2 py-2 text-primaryIndigo dark:text-primaryIndigoDark flex items-center tooltip-output-information'
                aria-hidden='true'
                data-tooltip-id='tooltip-output-information'
                data-tooltip-content={t('Devices.Audio output information tooltip') || ''}
              />
              {/* Audio output information tooltip */}
              <Tooltip id='tooltip-output-information' place='right' />
            </div>
          </div>

          {/* Audio output select */}
          <Listbox value={selectedAudioOutput} onChange={handleSelectedAudioOutput}>
            {({ open }) => (
              <>
                <div className='flex items-center mt-2'>
                  <div className='relative w-full'>
                    <ListboxButton className='relative w-full cursor-default rounded-md bg-white dark:bg-gray-950 py-1.5 pr-10 text-left text-gray-700 dark:text-gray-300 focus:outline-none sm:text-sm sm:leading-6 border dark:border-gray-700'>
                      <span
                        className={`${
                          selectedAudioOutput?.label
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-500 dark:text-gray-300'
                        } block truncate mr-1 ml-4 font-medium`}
                      >
                        {selectedAudioOutput?.label
                          ? selectedAudioOutput?.label
                          : t('Devices.Select audio output')}
                      </span>

                      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </span>
                    </ListboxButton>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <ListboxOptions className='absolute z-10 mt-1 w-full overflow-auto  scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 rounded-md bg-white py-1 text-base shadow-lg ring-1 dark:bg-gray-950 ring-black dark:ring-gray-600 ring-opacity-5 focus:outline-none sm:text-sm h-auto'>
                        {Object.entries<any>(audioOutputs)?.map(
                          ([audioOutputId, audioOutputInfo]) => (
                            <ListboxOption
                              key={audioOutputId}
                              className='data-[focus]:bg-gray-100 data-[focus]:dark:bg-gray-800 data-[focus]:text-gray-950 data-[focus]:dark:text-gray-100 text-gray-900 dark:text-gray-100 relative cursor-default select-none py-2 pl-8 pr-4'
                              value={audioOutputInfo}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={classNames(
                                      selected ? 'font-semibold' : 'font-normal',
                                      'block truncate',
                                    )}
                                  >
                                    {audioOutputInfo?.label}
                                  </span>

                                  {selected ||
                                  selectedAudioOutput?.label === audioOutputInfo?.label ? (
                                    <span className='data-[focus]:text-white text-primary dark:text-primaryDark absolute inset-y-0 left-0 flex items-center pl-1.5'>
                                      <FontAwesomeIcon
                                        icon={faCheck}
                                        className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </ListboxOption>
                          ),
                        )}
                      </ListboxOptions>
                    </Transition>
                  </div>
                </div>
              </>
            )}
          </Listbox>
        </>
        {/* Divider */}
        <div className='relative pb-10 pt-6'>
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
            onClick={() => handleUpdateAudioDevices()}
          >
            <span className='leading-5 text-sm font-medium'>{t('Common.Save')}</span>
          </Button>
        </div>
      </div>
    </>
  )
})

SwitchInputOutputDrawerContent.displayName = 'SwitchInputOutputDrawerContent'
