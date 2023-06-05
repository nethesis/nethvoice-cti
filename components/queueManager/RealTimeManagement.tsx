// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { debounce } from 'lodash'
import {
  faChevronDown,
  faChevronUp,
  faUserCheck,
  faUserClock,
  faUserXmark,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons'
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
  const [pageNum, setPageNum]: any = useState(1)

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
