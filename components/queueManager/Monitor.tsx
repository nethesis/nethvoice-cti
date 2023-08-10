// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState } from '../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faChevronDown,
  faCheck,
  faMinus,
  faExpand,
  faPlus,
  faUsers,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

import { exactDistanceToNowLoc } from '../../lib/dateTime'

import { getMonitorValue } from '../../lib/queueManager'

import { Listbox, Transition } from '@headlessui/react'

import { savePreference } from '../../lib/storage'

export interface MonitorProps extends ComponentProps<'div'> {}

const numbers = Array.from({ length: 20 }, (_, index) => index + 1)

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const Monitor: FC<MonitorProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number>(0)

  const authStore = useSelector((state: RootState) => state.authentication)
  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

  //TODO SAVE SELECTED QUEUE INSIDE LOCAL STORAGE
  const [selectedQueueFirstTable, setSelectedQueueFirstTable] = useState<any>(
    Object.keys(queueManagerStore.queues)[0] || '',
  )

  const [selectedQueueSecondTable, setSelectedQueueSecondTable] = useState<any>(
    Object.keys(queueManagerStore.queues)[1] || '',
  )

  const [addQueueCard, setAddQueueCard] = useState(true)
  const [showSecondCard, setShowSecondCard] = useState(false)

  // Add or remove secondo queue card
  function toggleAddQueueCard() {
    setAddQueueCard(!addQueueCard)
    if (addQueueCard && !showSecondCard) {
      setShowSecondCard(!showSecondCard)
      savePreference('monitorSecondCardIsVisible', !showSecondCard, authStore.username)
    } else {
      setShowSecondCard(!showSecondCard)
      savePreference('monitorSecondCardIsVisible', !showSecondCard, authStore.username)
    }
  }

  // get total number of call in queues
  function getWaitingCallsCount(queueId: any) {
    const selectedQueue = queueManagerStore.queues[queueId]
    if (selectedQueue && selectedQueue.waitingCallers) {
      const waitingCallers = selectedQueue.waitingCallers
      return Object.keys(waitingCallers).length
    }
    return 0
  }

  const [isFullscreen, setIsFullscreen] = useState(false)

  // Activate or deactivate fullscreen mode
  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen)
  }

  // on change of selected row numbers
  const handleSelectedRowNumbers = (newRowNumbers: any) => {
    setSelected(newRowNumbers)
    let currentSelectedRowNumbers = newRowNumbers
    savePreference('monitorRowNumbers', currentSelectedRowNumbers, authStore.username)
  }

  // on change of selected row numbers
  const handleSelectedFirstQueues = (newFirstQueueSelected: any) => {
    setSelectedQueueFirstTable(newFirstQueueSelected)
    let currentSelectedFirstQueue = newFirstQueueSelected
    savePreference('monitorFirstQueueSelected', currentSelectedFirstQueue, authStore.username)
  }

  // on change of selected row numbers
  const handleSelectedSecondQueues = (newSecondQueueSelected: any) => {
    setSelectedQueueSecondTable(newSecondQueueSelected)
    let currentSelectedSecondQueue = newSecondQueueSelected
    savePreference('monitorSecondQueueSelected', currentSelectedSecondQueue, authStore.username)
  }

  //Load expanded chevron values from local storage
  useEffect(() => {
    const monitorLocalStorageValue = getMonitorValue(authStore.username)
    setSelected(monitorLocalStorageValue.rowNumbers)
    setSelectedQueueFirstTable(monitorLocalStorageValue.selectedFirstQueue)
    setSelectedQueueSecondTable(monitorLocalStorageValue.selectedSecondQueue)
    setShowSecondCard(monitorLocalStorageValue.isSecondCardVisible)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //Use escape button to close fullscreen
  useEffect(() => {
    const handleEscKey = (event: any) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleEscKey)

    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className='flex space-x-8'>
        <Listbox value={selected} onChange={handleSelectedRowNumbers}>
          {({ open }) => (
            <>
              <div className='flex items-center'>
                <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                  {t('QueueManager.Calls to show')}
                </Listbox.Label>
                <div className='relative'>
                  <Listbox.Button className='relative w-full cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6'>
                    <span className='block truncate mr-1'>{selected}</span>
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
                    <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                      {numbers.map((number: any) => (
                        <Listbox.Option
                          key={number}
                          className={({ active }) =>
                            classNames(
                              active
                                ? 'bg-primary text-white dark:text-gray-900'
                                : 'text-gray-900 dark:text-gray-100',
                              'relative cursor-default select-none py-2 pl-6',
                            )
                          }
                          value={number}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? 'font-semibold' : 'font-normal',
                                  'block truncate',
                                )}
                              >
                                {number}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : 'text-primary',
                                    'absolute inset-y-0 left-0 flex items-center ',
                                  )}
                                >
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className='h-3.5 w-3.5 pl-1 py-2 cursor-pointer flex items-center'
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
        <Button variant='primary' onClick={toggleFullscreen}>
          <FontAwesomeIcon
            icon={faExpand}
            className='h-5 w-5 mr-2 cursor-pointer flex items-center'
            aria-hidden='true'
          />
          <span>{t('QueueManager.Fullscreen')}</span>
        </Button>
      </div>

      {/* Queue Dashboard*/}
      <div
        className={`transition-all duration-300 ${
          isFullscreen ? 'fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50' : ''
        }`}
      >
        <div>
          {/* Card section */}
          <div>
            {isFullscreen && (
              <Button variant='danger' onClick={() => setIsFullscreen(false)}>
                <FontAwesomeIcon icon={faTimes} className='h-4 w-4 mr-2' aria-hidden='true' />
                <span>{t('QueueManager.Exit fullscreen description')}</span>
              </Button>
            )}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2'>
              <div
                className={`${!isFullscreen ? 'pt-8' : 'pt-1'} ${
                  !showSecondCard ? 'col-span-2' : 'col-span-1'
                }`}
              >
                {/* First Queue card  */}
                <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-4 sm:mt-1 relative'>
                  {/* Header section */}
                  <div className='flex items-center space-x-2'>
                    {/* left side */}
                    <div className='flex-grow'>
                      <div className='flex items-center space-x-2'>
                        {/* Queue list */}
                        <Listbox
                          value={selectedQueueFirstTable}
                          onChange={handleSelectedFirstQueues}
                        >
                          {({ open }) => (
                            <>
                              <div className='flex items-center'>
                                <div className='relative'>
                                  <Listbox.Button className='relative w-48 cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pr-10 text-left text-gray-900 dark:text-gray-100 focus:outline-none sm:text-sm sm:leading-6'>
                                    <span className='block truncate mr-1 font-semibold'>
                                      {selectedQueueFirstTable.name
                                        ? selectedQueueFirstTable.name +
                                          ' ' +
                                          selectedQueueFirstTable.queue
                                        : 'Select queue'}
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
                                    <Listbox.Options className='absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 dark:bg-gray-900 ring-black ring-opacity-5 focus:outline-none sm:text-sm h-auto'>
                                      {Object.entries<any>(queueManagerStore.queues).map(
                                        ([queueId, queueInfo]) => (
                                          <Listbox.Option
                                            key={queueId}
                                            className={({ active }) =>
                                              classNames(
                                                active
                                                  ? 'bg-primary text-white'
                                                  : 'text-gray-900 dark:text-gray-100',
                                                'relative cursor-default select-none py-2 pl-8 pr-4',
                                              )
                                            }
                                            value={queueInfo}
                                          >
                                            {({ selected, active }) => (
                                              <>
                                                <span
                                                  className={classNames(
                                                    selected ? 'font-semibold' : 'font-normal',
                                                    'block truncate',
                                                  )}
                                                >
                                                  {queueInfo.name} ({queueInfo.queue})
                                                </span>

                                                {selected ||
                                                selectedQueueFirstTable.queue === queueId ? (
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
                                        ),
                                      )}
                                    </Listbox.Options>
                                  </Transition>
                                </div>
                              </div>
                            </>
                          )}
                        </Listbox>
                      </div>
                    </div>

                    {/* right side */}
                    <div className='flex items-center ml-auto space-x-5'>
                      {/* Number of waiting calls */}
                      <div className='text-sm text-gray-500'>
                        <span className='mr-2 font-semibold text-orange-700'>
                          {getWaitingCallsCount(selectedQueueFirstTable.queue)}
                        </span>
                        <span className='text-md text-orange-700'>
                          {t('QueueManager.Waiting calls')}
                        </span>
                      </div>

                      {/* Remove or add queue card */}
                      {!showSecondCard && (
                        <Button variant='white' className='ml-2' onClick={toggleAddQueueCard}>
                          <FontAwesomeIcon icon={faPlus} className='text-gray-500' />
                          <span className='ml-2'>{t('QueueManager.Add queue')} </span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Body section */}
                  {selectedQueueFirstTable === '' && (
                    <>
                      {/* empty state */}

                      <EmptyState
                        title='No queue selected'
                        description='Please select a queue'
                        icon={
                          <FontAwesomeIcon
                            icon={faUsers}
                            className='mx-auto h-12 w-12'
                            aria-hidden='true'
                          />
                        }
                      ></EmptyState>
                    </>
                  )}

                  {selectedQueueFirstTable !== '' && (
                    <div className=''>
                      <div className='mt- flow-root'>
                        <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                          <div className='inline-block min-w-full py-4 align-middle sm:px-6 lg:px-8'>
                            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-600'>
                              <thead>
                                <tr>
                                  <th
                                    scope='col'
                                    className={`py-3.5 pl-4 pr-3 text-left font-semibold text-gray-700 dark:text-gray-200 sm:pl-0 ${
                                      !isFullscreen ? 'text-sm ' : 'text-xl'
                                    }`}
                                  >
                                    {t('QueueManager.Position')}
                                  </th>
                                  <th
                                    scope='col'
                                    className={`py-3.5 pl-4 pr-3 text-left font-semibold text-gray-700 dark:text-gray-200 sm:pl-0 ${
                                      !isFullscreen ? 'text-sm ' : 'text-xl'
                                    }`}
                                  >
                                    {t('QueueManager.Calls')}
                                  </th>
                                  <th
                                    scope='col'
                                    className={`py-3.5 pl-4 pr-3 text-left font-semibold text-gray-700 dark:text-gray-200 sm:pl-0 ${
                                      !isFullscreen ? 'text-sm ' : 'text-xl'
                                    }`}
                                  >
                                    {t('QueueManager.Waiting')}
                                  </th>
                                </tr>
                              </thead>

                              <tbody className='divide-y divide-gray-200 dark:divide-gray-600'>
                                {Array.from({ length: selected }, (_, index) => {
                                  const waitingCallers =
                                    queueManagerStore?.queues[selectedQueueFirstTable?.queue]
                                      ?.waitingCallers
                                  const callerArray = waitingCallers
                                    ? Object.values(waitingCallers)
                                    : []
                                  const caller: any = callerArray[index]
                                  const isDataPresent = !!caller && !!caller.name

                                  return (
                                    <tr key={index}>
                                      <td
                                        className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-${
                                          isDataPresent ? 'gray-900' : 'primary'
                                        } sm:pl-0`}
                                      >
                                        <div className='flex items-center ml-2'>
                                          <div
                                            className={`${
                                              isFullscreen ? 'w-10 h-10' : 'w-6 h-6'
                                            }  rounded-full bg-${
                                              isDataPresent ? 'orange-50' : 'emerald-50'
                                            } flex items-center justify-center`}
                                          >
                                            <span
                                              className={`text-${
                                                isDataPresent ? 'orange-600' : 'primary'
                                              } ${isFullscreen ? 'text-lg' : 'text-sm'}`}
                                            >
                                              {index + 1}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td
                                        className={`whitespace-nowrap  py-4 text-gray-500 ${
                                          isFullscreen ? 'text-xl' : 'text-sm px-3'
                                        }`}
                                      >
                                        {isDataPresent ? caller.name : '-'}
                                      </td>
                                      <td
                                        className={`whitespace-nowrap  py-4 text-gray-500 ${
                                          isFullscreen ? 'text-xl' : 'text-sm px-3'
                                        }`}
                                      >
                                        {isDataPresent ? caller.waitingTime : '00:00:00'}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Second Queue card  */}
              {showSecondCard && (
                <div className={`${!isFullscreen ? 'pt-8' : 'pt-1'}`}>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-4 sm:mt-1 relative'>
                    {/* Header section */}
                    <div className='flex items-center space-x-2'>
                      {/* left side */}
                      <div className='flex-grow'>
                        <div className='flex items-center space-x-2'>
                          <Listbox
                            value={selectedQueueSecondTable}
                            onChange={handleSelectedSecondQueues}
                          >
                            {({ open }) => (
                              <>
                                <div className='flex items-center'>
                                  {/* <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                                {t('QueueManager.Calls to show')}
                              </Listbox.Label> */}
                                  <div className='relative'>
                                    <Listbox.Button className='relative w-48 cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pr-10 text-left text-gray-900 dark:text-gray-100 focus:outline-none sm:text-sm sm:leading-6'>
                                      <span className='block truncate mr-1 font-semibold'>
                                        {selectedQueueSecondTable.name
                                          ? selectedQueueSecondTable.name +
                                            ' ' +
                                            selectedQueueSecondTable.queue
                                          : 'Select queue'}
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
                                      <Listbox.Options className='absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 dark:bg-gray-900 ring-black ring-opacity-5 focus:outline-none sm:text-sm h-auto'>
                                        {Object.entries<any>(queueManagerStore.queues).map(
                                          ([queueId, queueInfo]) => (
                                            <Listbox.Option
                                              key={queueId}
                                              className={({ active }) =>
                                                classNames(
                                                  active
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-900 dark:text-gray-100',
                                                  'relative cursor-default select-none py-2 pl-8 pr-4',
                                                )
                                              }
                                              value={queueInfo}
                                            >
                                              {({ selected, active }) => (
                                                <>
                                                  <span
                                                    className={classNames(
                                                      selected ? 'font-semibold' : 'font-normal',
                                                      'block truncate',
                                                    )}
                                                  >
                                                    {queueInfo.name} ({queueInfo.queue})
                                                  </span>

                                                  {selected ||
                                                  selectedQueueSecondTable.queue === queueId ? (
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
                                          ),
                                        )}
                                      </Listbox.Options>
                                    </Transition>
                                  </div>
                                </div>
                              </>
                            )}
                          </Listbox>
                        </div>
                      </div>
                      {/* right side */}
                      <div className='flex items-center ml-auto space-x-5'>
                        {/* Number of waiting calls */}
                        <div className='text-sm text-gray-500'>
                          <span className='mr-2 font-semibold text-orange-700'>
                            {getWaitingCallsCount(selectedQueueSecondTable.queue)}
                          </span>
                          <span className='text-md text-orange-700'>
                            {t('QueueManager.Waiting calls')}
                          </span>
                        </div>
                        <Button variant='white' className='ml-2' onClick={toggleAddQueueCard}>
                          <FontAwesomeIcon icon={faMinus} className='text-gray-500' />
                          <span className='ml-2'>{t('QueueManager.Remove')}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Body section */}
                    {selectedQueueSecondTable === '' && (
                      <>
                        {/* empty state */}
                        <EmptyState
                          title='No queue selected'
                          description='Please select a queue'
                          icon={
                            <FontAwesomeIcon
                              icon={faUsers}
                              className='mx-auto h-12 w-12'
                              aria-hidden='true'
                            />
                          }
                        ></EmptyState>
                      </>
                    )}
                    {selectedQueueSecondTable !== '' && (
                      <div className=''>
                        <div className='mt- flow-root'>
                          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                            <div className='inline-block min-w-full py-4 align-middle sm:px-6 lg:px-8'>
                              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-600'>
                                <thead>
                                  <tr>
                                    <th
                                      scope='col'
                                      className={`py-3.5 pl-4 pr-3 text-left font-semibold text-gray-700 dark:text-gray-200 sm:pl-0 ${
                                        !isFullscreen ? 'text-sm ' : 'text-xl'
                                      }`}
                                    >
                                      {t('QueueManager.Position')}
                                    </th>
                                    <th
                                      scope='col'
                                      className={`py-3.5 pl-4 pr-3 text-left font-semibold text-gray-700 dark:text-gray-200 sm:pl-0 ${
                                        !isFullscreen ? 'text-sm ' : 'text-xl'
                                      }`}
                                    >
                                      {t('QueueManager.Calls')}
                                    </th>
                                    <th
                                      scope='col'
                                      className={`py-3.5 pr-3 pl-4 text-left font-semibold text-gray-700 dark:text-gray-200 sm:pl-0 ${
                                        !isFullscreen ? 'text-sm ' : 'text-xl'
                                      }`}
                                    >
                                      {t('QueueManager.Waiting')}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200 dark:divide-gray-600'>
                                  {Array.from({ length: selected }, (_, index) => {
                                    const waitingCallers =
                                      queueManagerStore?.queues[selectedQueueSecondTable?.queue]
                                        ?.waitingCallers
                                    const callerArray = waitingCallers
                                      ? Object.values(waitingCallers)
                                      : []
                                    const caller: any = callerArray[index]
                                    const isDataPresent = !!caller && !!caller.name

                                    return (
                                      <tr key={index}>
                                        <td
                                          className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-${
                                            isDataPresent ? 'gray-900' : 'primary'
                                          } sm:pl-0`}
                                        >
                                          <div className='flex items-center ml-2'>
                                            <div
                                              className={`${
                                                isFullscreen ? 'w-10 h-10' : 'w-6 h-6'
                                              }  rounded-full bg-${
                                                isDataPresent ? 'orange-50' : 'emerald-50'
                                              } flex items-center justify-center`}
                                            >
                                              <span
                                                className={`text-${
                                                  isDataPresent ? 'orange-600' : 'primary'
                                                } ${isFullscreen ? 'text-lg' : 'text-sm'}`}
                                              >
                                                {index + 1}
                                              </span>
                                            </div>
                                          </div>
                                        </td>
                                        <td
                                          className={`whitespace-nowrap  py-4 text-gray-500 ${
                                            isFullscreen ? 'text-xl' : 'text-sm px-3'
                                          }`}
                                        >
                                          {isDataPresent ? caller.name : '-'}
                                        </td>
                                        <td
                                          className={`whitespace-nowrap  py-4 text-gray-500 ${
                                            isFullscreen ? 'text-xl' : 'text-sm px-3'
                                          }`}
                                        >
                                          {isDataPresent ? caller.waitingTime : '00:00:00'}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* ... */}
          </div>
        </div>
      </div>
    </>
  )
}

Monitor.displayName = 'Monitor'
