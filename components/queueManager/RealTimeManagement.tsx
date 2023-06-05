// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, Button, Dropdown, EmptyState, IconSwitch, TextInput } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { Tooltip } from 'react-tooltip'
import { debounce } from 'lodash'
import {
  faChevronDown,
  faChevronUp,
  faUserCheck,
  faUserClock,
  faUserXmark,
  faHeadset,
  faStar as faStarSolid,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarLight } from '@nethesis/nethesis-light-svg-icons'
import {
  searchStringInQueue,
  addQueueToFavorites,
  removeQueueFromFavorites,
  addQueueToExpanded,
  removeQueueFromExpanded,
} from '../../lib/queuesLib'

import { RealTimeOperatorsFilter } from './RealTimeOperatorsFilter'
import { RealTimeQueuesFilter } from './RealTimeQueuesFilter'

export interface RealTimeManagementProps extends ComponentProps<'div'> {}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const RealTimeManagement: FC<RealTimeManagementProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [queuesStatisticsExpanded, setQueuesStatisticsExpanded] = useState(false)
  const [operatorsStatisticsExpanded, setOperatorsStatisticsExpanded] = useState(false)
  const [queueExpanded, setQueueExpanded] = useState(false)
  const [pageNum, setPageNum]: any = useState(1)

  const authStore = useSelector((state: RootState) => state.authentication)

  const toggleFavoriteQueue = (queue: any) => {
    const queueId = queue.queue
    const isFavorite = !queue.favorite
    store.dispatch.queues.setQueueFavorite(queueId, isFavorite)

    if (isFavorite) {
      addQueueToFavorites(queueId, authStore.username)
    } else {
      removeQueueFromFavorites(queueId, authStore.username)
    }
  }

  const toggleExpandQueuesStatistics = () => {
    setQueuesStatisticsExpanded(!queuesStatisticsExpanded)
  }

  const toggleExpandOperatorsStatistics = () => {
    setOperatorsStatisticsExpanded(!operatorsStatisticsExpanded)
  }

  const [textFilter, setTextFilter]: any = useState('')

  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
    setPageNum(1)
  }

  const debouncedUpdateTextFilterQueuesStatistics = useMemo(
    () => debounce(updateTextFilter, 400),
    [],
  )

  const debouncedUpdateTextFilterOperatorsStatistics = useMemo(
    () => debounce(updateTextFilter, 400),
    [],
  )

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilterQueuesStatistics.cancel()
    }
  }, [debouncedUpdateTextFilterQueuesStatistics])

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilterOperatorsStatistics.cancel()
    }
  }, [debouncedUpdateTextFilterOperatorsStatistics])

  const [outcomeFilterQueues, setOutcomeFilterQueues]: any = useState('')
  const updateOutcomeFilterQueues = (newOutcomeFilter: string) => {
    setOutcomeFilterQueues(newOutcomeFilter)
    setPageNum(1)
  }

  const [queuesFilterQueues, setQueuesFilterQueues]: any = useState([])
  const updateQueuesFilterQueues = (newQueuesFilter: string[]) => {
    setQueuesFilterQueues(newQueuesFilter)
    setPageNum(1)
  }

  const [outcomeFilterOperators, setOutcomeFilterOperators]: any = useState('')
  const updateOutcomeFilterOperators = (newOutcomeFilter: string) => {
    setOutcomeFilterQueues(newOutcomeFilter)
    setPageNum(1)
  }

  const [queuesFilterOperators, setQueuesFilterOperators]: any = useState([])
  const updateQueuesFilterOperators = (newQueuesFilter: string[]) => {
    setQueuesFilterQueues(newQueuesFilter)
    setPageNum(1)
  }

  const [filteredQueues, setFilteredQueues]: any = useState({})

  const { name, mainPresence, mainextension, avatar, profile } = useSelector(
    (state: RootState) => state.user,
  )

  const [isApplyingFilters, setApplyingFilters]: any = useState(false)

  const queuesStore = useSelector((state: RootState) => state.queues)

  const getQueuesUserLoggedIn = () => {
    return Object.values(queuesStore.queues)
      .filter((queue: any) => {
        return (
          queue.members[mainextension].loggedIn && queue.members[mainextension].type !== 'static'
        )
      })
      .map((queue: any) => queue.queue)
  }

  const applyFilters = () => {
    setApplyingFilters(true)

    // text filter
    let filteredQueues = Object.values(queuesStore.queues).filter((queue) =>
      searchStringInQueue(queue, textFilter),
    )

    // sort queues
    // filteredQueues.sort(sortByProperty('name'))
    // filteredQueues.sort(sortByProperty('queue'))
    // filteredQueues.sort(sortByFavorite)

    setFilteredQueues(filteredQueues)
    setApplyingFilters(false)
  }

  // filtered queues
  useEffect(() => {
    applyFilters()
  }, [queuesStore.queues])

  const toggleExpandQueue = (queue: any) => {
    const queueId = queue.queue
    const isExpanded = !queue.expanded
    store.dispatch.queues.setQueueExpanded(queueId, isExpanded)

    if (isExpanded) {
      addQueueToExpanded(queueId, authStore.username)
    } else {
      removeQueueFromExpanded(queueId, authStore.username)
    }
    applyFilters()
  }

  
  return (
    <>
      {/* Dashboard queue active section */}
      <div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Connected calls */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Connected calls')}
                </span>
              </div>
            </div>
          </div>

          {/* Online operators */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faUserClock}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Online operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Free operators */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Free operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Waiting calls */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Waiting calls')}
                </span>
              </div>
            </div>
          </div>

          {/* On break operators */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faUserXmark}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.On break operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Busy operators ( in queue ) */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Busy operators (in queue)')}
                </span>
              </div>
            </div>
          </div>

          {/* Busy operators ( total calls ) */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Total calls')}
                </span>
              </div>
            </div>
          </div>

          {/* Offline operators */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Offline operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Busy operators ( out queue ) */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Busy operators (out queue)')}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* ... */}
      </div>

      {/* Queues statistics*/}
      <div className='pt-8 relative mt-4'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {t('QueueManager.Queues statistics')}
            </h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={queuesStatisticsExpanded ? faChevronDown : faChevronUp}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandQueuesStatistics}
            />
          </div>
        </div>
        {/* divider */}
        <div className='flex-grow border-b border-gray-300 mt-1'></div>

        {queuesStatisticsExpanded && (
          <>
            <RealTimeQueuesFilter
              updateTextFilter={debouncedUpdateTextFilterQueuesStatistics}
              updateOutcomeFilter={updateOutcomeFilterQueues}
              updateQueuesFilter={updateQueuesFilterQueues}
              className='pt-6'
            ></RealTimeQueuesFilter>
            <ul role='list' className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3'>
              {/* skeleton */}
              {/* {(!queuesStore.isLoaded || isApplyingFilters) &&
                Array.from(Array(3)).map((e, i) => (
                  <li
                    key={i}
                    className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'
                  >
                    <div className='px-5 py-4'>
                      {Array.from(Array(3)).map((e, j) => (
                        <div key={j} className='space-y-4 mb-4'>
                          <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                          <div className='animate-pulse h-5 rounded max-w-[75%] bg-gray-300 dark:bg-gray-600'></div>
                        </div>
                      ))}
                    </div>
                  </li>
                ))} */}
              {/* queues */}
              {queuesStore.isLoaded &&
                Object.keys(filteredQueues).map((key) => {
                  const queue = filteredQueues[key]
                  return (
                    <div key={queue.queue}>
                      <li className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                        {/* card header */}
                        <div className='flex flex-col pt-3 pb-5 px-5'>
                          <div className='flex w-full items-center justify-between space-x-6'>
                            <div className='flex-1 truncate'>
                              <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                                <h3 className='truncate text-lg leading-6 font-medium'>
                                  {queue.name}
                                </h3>
                                <span>{queue.queue}</span>
                                <IconSwitch
                                  on={queue.favorite}
                                  size='large'
                                  onIcon={<FontAwesomeIcon icon={faStarSolid} />}
                                  offIcon={<FontAwesomeIcon icon={faStarLight} />}
                                  changed={() => toggleFavoriteQueue(queue)}
                                  key={queue.queue}
                                  className={`tooltip-favorite-${queue.queue}`}
                                >
                                  <span className='sr-only'>
                                    {t('Queues.Toggle favorite queue')}
                                  </span>
                                </IconSwitch>
                                <Tooltip
                                  anchorSelect={`.tooltip-favorite-${queue.queue}`}
                                  place='top'
                                >
                                  {queue.favorite
                                    ? t('Common.Remove from favorites') || ''
                                    : t('Common.Add to favorites') || ''}
                                </Tooltip>
                              </div>
                            </div>
                            <FontAwesomeIcon
                              icon={queue.expanded ? faChevronUp : faChevronDown}
                              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                              aria-hidden='true'
                              onClick={() => toggleExpandQueue(queue)}
                            />
                          </div>
                        </div>
                        {/* card body */}
                        {queue.expanded && <></>}
                      </li>
                    </div>
                  )
                })}
            </ul>
          </>
        )}
      </div>

      {/* Operators statistics*/}
      <div className='py-8 relative'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {t('QueueManager.Operators statistics')}
            </h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={operatorsStatisticsExpanded ? faChevronDown : faChevronUp}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandOperatorsStatistics}
            />
          </div>
        </div>
        {/* divider */}
        <div className='flex-grow border-b border-gray-300 mt-1'></div>

        {operatorsStatisticsExpanded && (
          <>
            <RealTimeOperatorsFilter
              updateTextFilter={debouncedUpdateTextFilterOperatorsStatistics}
              updateOutcomeFilter={updateOutcomeFilterOperators}
              updateQueuesFilter={updateQueuesFilterOperators}
              className='pt-6'
            ></RealTimeOperatorsFilter>
          </>
        )}
      </div>
    </>
  )
}

RealTimeManagement.displayName = 'RealTimeManagement'
