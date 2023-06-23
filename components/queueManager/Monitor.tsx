// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faChevronDown,
  faChevronUp,
  faCheck,
  faMinus,
  faExpand,
  faPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'

import { getQueues } from '../../lib/queueManager'

import { Listbox, Transition } from '@headlessui/react'

export interface MonitorProps extends ComponentProps<'div'> {}

const numbers = Array.from({ length: 20 }, (_, index) => index + 1)

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const Monitor: FC<MonitorProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number>(5)

  const [firstRenderQueuesList, setFirstRenderQueuesList]: any = useState(true)
  const [isLoadedQueues, setLoadedQueues] = useState(false)
  const [queuesList, setQueuesList] = useState<any>({})

  //get queues list
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderQueuesList) {
      setFirstRenderQueuesList(false)
      return
    }
    async function getQueuesInformation() {
      setLoadedQueues(false)
      try {
        const res = await getQueues()
        setQueuesList(res)
      } catch (err) {
        console.error(err)
      }
      setLoadedQueues(true)
    }
    if (!isLoadedQueues) {
      getQueuesInformation()
    }
  }, [firstRenderQueuesList, isLoadedQueues])

  //TODO SAVE SELECTED QUEUE INSIDE LOCAL STORAGE
  const [selectedQueueFirstTable, setSelectedQueueFirstTable] = useState<any>(
    Object.keys(queuesList)[0] || '',
  )

  const [selectedQueueSecondTable, setSelectedQueueSecondTable] = useState<any>(
    Object.keys(queuesList)[1] || '',
  )

  const [addQueueCard, setAddQueueCard] = useState(true)
  const [showSecondCard, setShowSecondCard] = useState(false)

  // Add or remove secondo queue card
  function toggleAddQueueCard() {
    setAddQueueCard(!addQueueCard)
    if (addQueueCard && !showSecondCard) {
      setShowSecondCard(!showSecondCard)
    } else {
      setShowSecondCard(!showSecondCard)
    }
  }

  function getWaitingCallsCount(queueId: any) {
    const selectedQueue = queuesList[queueId]
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

  return (
    <>
      <div className='flex space-x-8'>
        <Listbox value={selected} onChange={setSelected}>
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
      {/* <div
        className={`transition-all duration-300 ${
          isFullscreen ? 'fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50' : ''
        }`}
      > */}
      <div>
        {/* Card section */}
        <div>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-2'>
            <div className={`pt-8 ${!showSecondCard ? 'col-span-2' : 'col-span-1'}`}>
              {/* First Queue card  */}
              <div className='border-b rounded-lg shadow-md bg-white dark:bg-gray-900 px-5 py-4 sm:mt-1 relative'>
                {/* Header section */}
                <div className='flex items-center space-x-2'>
                  {/* left side */}
                  <div className='flex-grow'>
                    <div className='flex items-center space-x-2'>
                      {/* Queue list */}
                      <Listbox
                        value={selectedQueueFirstTable}
                        onChange={setSelectedQueueFirstTable}
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
                                    {Object.entries<any>(queuesList).map(([queueId, queueInfo]) => (
                                      <Listbox.Option
                                        key={queueId}
                                        className={({ active }) =>
                                          classNames(
                                            active ? 'bg-primary text-white' : 'text-gray-900',
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

                                            {selected ? (
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
                        <FontAwesomeIcon
                          icon={addQueueCard ? faPlus : faMinus}
                          className='text-gray-500'
                        />
                        <span className='ml-2'>
                          {addQueueCard ? t('QueueManager.Add queue') : t('QueueManager.Remove')}
                        </span>
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
                          <table className='min-w-full divide-y divide-gray-300'>
                            <thead>
                              <tr>
                                <th
                                  scope='col'
                                  className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0'
                                >
                                  {t('QueueManager.Position')}
                                </th>
                                <th
                                  scope='col'
                                  className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                                >
                                  {t('QueueManager.Calls')}
                                </th>
                                <th
                                  scope='col'
                                  className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                                >
                                  {t('QueueManager.Waiting')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                              {Array.from({ length: selected }, (_, index) => {
                                const waitingCallers = selectedQueueFirstTable.waitingCallers
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
                                          className={`w-6 h-6 rounded-full bg-${
                                            isDataPresent ? 'orange-50' : 'emerald-50'
                                          } flex items-center justify-center`}
                                        >
                                          <span
                                            className={`text-${
                                              isDataPresent ? 'orange-600' : 'primary'
                                            }`}
                                          >
                                            {index + 1}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                      {isDataPresent ? caller.name : '-'}
                                    </td>
                                    <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
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
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md bg-white dark:bg-gray-900 px-5 py-4 sm:mt-1 relative'>
                  {/* Header section */}
                  <div className='flex items-center space-x-2'>
                    {/* left side */}
                    <div className='flex-grow'>
                      <div className='flex items-center space-x-2'>
                        <Listbox
                          value={selectedQueueSecondTable}
                          onChange={setSelectedQueueSecondTable}
                        >
                          {({ open }) => (
                            <>
                              <div className='flex items-center'>
                                {/* <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                                {t('QueueManager.Calls to show')}
                              </Listbox.Label> */}
                                <div className='relative'>
                                  <Listbox.Button className='relative w-48 cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 focus:outline-none sm:text-sm sm:leading-6'>
                                    <span className='block truncate mr-1'>
                                      {selectedQueueSecondTable.name
                                        ? selectedQueueSecondTable.name
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
                                      {Object.entries<any>(queuesList).map(
                                        ([queueId, queueInfo]) => (
                                          <Listbox.Option
                                            key={queueId}
                                            className={({ active }) =>
                                              classNames(
                                                active ? 'bg-primary text-white' : 'text-gray-900',
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

                                                {selected ? (
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
                        <FontAwesomeIcon
                          icon={addQueueCard ? faPlus : faMinus}
                          className='text-gray-500'
                        />
                        <span className='ml-2'>
                          {addQueueCard ? t('QueueManager.Add queue') : t('QueueManager.Remove')}
                        </span>
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
                            <table className='min-w-full divide-y divide-gray-300'>
                              <thead>
                                <tr>
                                  <th
                                    scope='col'
                                    className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0'
                                  >
                                    {t('QueueManager.Position')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                                  >
                                    {t('QueueManager.Calls')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                                  >
                                    {t('QueueManager.Waiting')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='divide-y divide-gray-200'>
                                {Array.from({ length: selected }, (_, index) => {
                                  const waitingCallers = selectedQueueSecondTable.waitingCallers
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
                                            className={`w-6 h-6 rounded-full bg-${
                                              isDataPresent ? 'orange-50' : 'emerald-50'
                                            } flex items-center justify-center`}
                                          >
                                            <span
                                              className={`text-${
                                                isDataPresent ? 'orange-600' : 'primary'
                                              }`}
                                            >
                                              {index + 1}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                        {isDataPresent ? caller.name : '-'}
                                      </td>
                                      <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
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
    </>
  )
}

Monitor.displayName = 'Monitor'
