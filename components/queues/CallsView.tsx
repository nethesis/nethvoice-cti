// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineNotification } from '../common'
import { isEmpty, debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  DEFAULT_CALLS_LOAD_PERIOD,
  DEFAULT_CALLS_REFRESH_INTERVAL,
  getCallIcon,
  openShowQueueCallDrawer,
  PAGE_SIZE,
  retrieveAndFilterQueueCalls,
} from '../../lib/queuesLib'
import { faChevronRight, faChevronLeft, faPhone } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { formatDateLoc } from '../../lib/dateTime'
import { CallsViewFilter } from './CallsViewFilter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { loadPreference } from '../../lib/storage'
import Link from 'next/link'
import { CallsDate } from '../history/CallsDate'

export interface CallsViewProps extends ComponentProps<'div'> {}

export const CallsView: FC<CallsViewProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [calls, setCalls]: any = useState({})
  const [isCallsLoaded, setCallsLoaded]: any = useState(false)
  const [callsError, setCallsError] = useState('')
  const [pageNum, setPageNum]: any = useState(1)
  const [firstRender, setFirstRender]: any = useState(true)
  const [lastUpdated, setLastUpdated]: any = useState(null)
  const [intervalId, setIntervalId]: any = useState(0)
  const [callsRefreshInterval, setCallsRefreshInterval]: any = useState(
    DEFAULT_CALLS_REFRESH_INTERVAL,
  )
  const queuesStore = useSelector((state: RootState) => state.queues)
  const authStore = useSelector((state: RootState) => state.authentication)

  const [textFilter, setTextFilter]: any = useState('')
  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
    setPageNum(1)
  }

  const debouncedUpdateTextFilter = useMemo(() => debounce(updateTextFilter, 400), [])

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilter.cancel()
    }
  }, [debouncedUpdateTextFilter])

  const [outcomeFilter, setOutcomeFilter]: any = useState('')
  const updateOutcomeFilter = (newOutcomeFilter: string) => {
    setOutcomeFilter(newOutcomeFilter)
    setPageNum(1)
  }

  const [queuesFilter, setQueuesFilter]: any = useState([])
  const [emptyQueueFilter, setEmptyQueueFilter]: any = useState(false)

  const updateQueuesFilter = (newQueuesFilter: string[]) => {
    setQueuesFilter(newQueuesFilter)
    setPageNum(1)
    setCallsLoaded(false)
  }

  const fetchCalls = async (numHours: number) => {
    let selectedQueues = queuesFilter

    //avoid fetching calls if no queues are selected
    if (!isEmpty(selectedQueues)) {
      setEmptyQueueFilter(false)
      try {
        setCallsError('')
        setCallsLoaded(false)

        const res = await retrieveAndFilterQueueCalls(
          pageNum,
          textFilter.trim(),
          outcomeFilter,
          selectedQueues,
          numHours,
        )

        res.rows = res.rows.map((call: any) => {
          call.queueId = call.queuename
          call.queueName = queuesStore.queues[call.queuename]?.name

          // queuename attribute name is misleading
          delete call.queuename

          return call
        })
        setCalls(res)
        setLastUpdated(new Date())
      } catch (e) {
        console.error(e)
        setCallsError(t('Queues.Cannot retrieve calls') || '')
      }
      setCallsLoaded(true)
    } else {
      setCallsLoaded(true)
      setEmptyQueueFilter(true)
    }
  }

  // retrieve calls
  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }

    let newIntervalId: any = 0

    async function fetchCallsInterval() {
      const numHours =
        loadPreference('queuesCallsLoadPeriod', authStore?.username) || DEFAULT_CALLS_LOAD_PERIOD

      // fetch stats immediately and set interval
      fetchCalls(numHours)

      // clear previous interval (if exists)
      if (intervalId) {
        clearInterval(intervalId)
      }

      const refreshInterval =
        loadPreference('queuesCallsRefreshInterval', authStore?.username) ||
        DEFAULT_CALLS_REFRESH_INTERVAL

      setCallsRefreshInterval(refreshInterval)

      newIntervalId = setInterval(() => {
        fetchCalls(numHours)
      }, refreshInterval * 1000)

      setIntervalId(newIntervalId)
    }

    fetchCallsInterval()

    return () => {
      if (newIntervalId) {
        clearInterval(newIntervalId)
      }
    }
  }, [firstRender, pageNum, textFilter, outcomeFilter, queuesFilter])

  function goToPreviousPage() {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
    }
  }

  function goToNextPage() {
    if (pageNum < calls.totalPages) {
      setPageNum(pageNum + 1)
    }
  }

  function isPreviousPageButtonDisabled() {
    return !isCallsLoaded || pageNum <= 1
  }

  function isNextPageButtonDisabled() {
    return !isCallsLoaded || pageNum >= calls?.totalPages
  }

  return (
    <div className={classNames(className)}>
      <div className='flex flex-col flex-wrap xl:flex-row justify-between gap-x-4 xl:items-end'>
        <CallsViewFilter
          updateTextFilter={debouncedUpdateTextFilter}
          updateOutcomeFilter={updateOutcomeFilter}
          updateQueuesFilter={updateQueuesFilter}
        />
        <div className='flex text-sm gap-4 text-right pb-4 xl:pb-7'>
          <div className='text-gray-500 dark:text-gray-500'>
            {t('Queues.Last update')}: {lastUpdated ? formatDateLoc(new Date(), 'HH:mm:ss') : '-'} (
            {t('Queues.every_time_interval_seconds', { timeInterval: callsRefreshInterval })})
          </div>
          <Link href={{ pathname: '/settings', query: { section: 'Queues' } }}>
            <span className='hover:underline text-gray-900 dark:text-gray-100'>
              {t('Queues.Settings')}
            </span>
          </Link>
        </div>
      </div>
      {callsError && <InlineNotification type='error' title={callsError}></InlineNotification>}
      {!callsError && (
        <div className='mx-auto'>
          <div className='flex flex-col'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 md:rounded-lg ring-opacity-5 dark:ring-opacity-5 ring-gray-900 dark:ring-gray-100 border-[1px] border-solid rounded-xl dark:border-gray-600'>
                  {/* empty state */}
                  {isCallsLoaded && isEmpty(calls?.rows) && (
                    <EmptyState
                      title={t('Queues.No queue calls')}
                      description={t('Queues.There are no recent calls with current filters') || ''}
                      icon={
                        <FontAwesomeIcon
                          icon={faPhone}
                          className='mx-auto h-12 w-12'
                          aria-hidden='true'
                        />
                      }
                      className='bg-white dark:bg-gray-950'
                    ></EmptyState>
                  )}
                  {(!isCallsLoaded || !isEmpty(calls?.rows)) && (
                    <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                      <div className='max-h-[32rem]'>
                        <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                          <thead className='sticky top-0 bg-gray-100 dark:bg-gray-800 z-[1]'>
                            <tr>
                              <th
                                scope='col'
                                className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 text-gray-700 dark:text-gray-200'
                              >
                                {t('Queues.Time')}
                              </th>
                              <th
                                scope='col'
                                className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                              >
                                {t('Queues.Queue')}
                              </th>
                              <th
                                scope='col'
                                className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                              >
                                {t('Queues.Name')}
                              </th>
                              <th
                                scope='col'
                                className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                              >
                                {t('Queues.Company')}
                              </th>
                              <th
                                scope='col'
                                className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                              >
                                {t('Queues.Outcome')}
                              </th>
                              <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                                <span className='sr-only'>{t('Queues.Details')}</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className='text-sm bg-white dark:bg-gray-950 text-gray-700  dark:text-gray-200'>
                            {/* skeleton */}
                            {!isCallsLoaded &&
                              Array.from(Array(5)).map((e, i) => (
                                <tr key={i}>
                                  {Array.from(Array(6)).map((e, j) => (
                                    <td key={j}>
                                      <div className='px-4 py-6'>
                                        <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            {/* calls */}
                            {isCallsLoaded &&
                              calls?.rows?.map((call: any, index: number) => (
                                <tr key={index}>
                                  {/* time */}
                                  <td className='whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6 relative'>
                                    <CallsDate call={call} isInQueue={true} />
                                    {/* row divider  */}
                                    {index !== 0 ? (
                                      <div className='absolute -top-[0.03rem] left-6 right-0 h-px bg-gray-300 dark:bg-gray-600' />
                                    ) : null}
                                  </td>
                                  {/* queue */}
                                  <td
                                    className={`${
                                      index === 0
                                        ? ''
                                        : 'border-t border-gray-300 dark:border-gray-600'
                                    } py-4 px-3 relative`}
                                  >
                                    <div>{call?.queueName}</div>
                                    <div className='text-gray-500 dark:text-gray-500'>
                                      {call?.queueId}
                                    </div>
                                  </td>
                                  {/* name / number */}
                                  <td
                                    className={`${
                                      index === 0
                                        ? ''
                                        : 'border-t border-gray-300 dark:border-gray-600'
                                    } py-4 px-3 relative`}
                                  >
                                    {call?.name && (
                                      <div
                                        onClick={() =>
                                          openShowQueueCallDrawer(call, queuesStore?.queues)
                                        }
                                      >
                                        <span
                                          className={classNames(
                                            call.cid && 'cursor-pointer hover:underline',
                                          )}
                                        >
                                          {call?.name}
                                        </span>
                                      </div>
                                    )}
                                    <div
                                      onClick={() =>
                                        openShowQueueCallDrawer(call, queuesStore?.queues)
                                      }
                                      className={classNames(
                                        call?.name && 'text-gray-500 dark:text-gray-500',
                                      )}
                                    >
                                      <span className='cursor-pointer hover:underline'>
                                        {call?.cid}
                                      </span>
                                    </div>
                                  </td>
                                  {/* company */}
                                  <td
                                    className={`${
                                      index === 0
                                        ? ''
                                        : 'border-t border-gray-300 dark:border-gray-600'
                                    } py-4 px-3 relative`}
                                  >
                                    {call?.company || '-'}
                                  </td>
                                  {/* outcome */}
                                  <td
                                    className={`${
                                      index === 0
                                        ? ''
                                        : 'border-t border-gray-300 dark:border-gray-600'
                                    } whitespace-nowrap py-4 px-3 relative`}
                                  >
                                    <div className='flex items-center'>
                                      <span>{getCallIcon(call)}</span>
                                      <span>{t(`Queues.outcome_${call?.event}`)}</span>
                                    </div>
                                  </td>
                                  {/* show details */}
                                  <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                                    <FontAwesomeIcon
                                      icon={faChevronRight}
                                      className='h-3 w-3 p-2 cursor-pointer text-gray-500 dark:text-gray-500'
                                      aria-hidden='true'
                                      onClick={() =>
                                        openShowQueueCallDrawer(call, queuesStore?.queues)
                                      }
                                    />
                                    {index !== 0 ? (
                                      <div className='absolute -top-[0.03rem] left-0 right-6 h-px bg-gray-300 dark:bg-gray-600' />
                                    ) : null}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* pagination */}
          {!callsError && !!calls?.rows?.length && (
            <nav
              className='flex items-center justify-between border-t px-0 py-4 mb-8 border-gray-100 dark:border-gray-800'
              aria-label='Pagination'
            >
              <div className='hidden sm:block'>
                <p className='text-sm text-gray-700 dark:text-gray-200'>
                  {t('Common.Showing')}{' '}
                  <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> -&nbsp;
                  <span className='font-medium'>
                    {PAGE_SIZE * (pageNum - 1) + PAGE_SIZE < calls?.count
                      ? PAGE_SIZE * (pageNum - 1) + PAGE_SIZE
                      : calls?.count}
                  </span>{' '}
                  {t('Common.of')} <span className='font-medium'>{calls?.count}</span>{' '}
                  {t('Queues.calls')}
                </p>
              </div>
              <div className='flex flex-1 justify-between sm:justify-end'>
                <Button
                  type='button'
                  variant='white'
                  disabled={isPreviousPageButtonDisabled()}
                  onClick={() => goToPreviousPage()}
                  className='flex items-center'
                >
                  <FontAwesomeIcon icon={faChevronLeft} className='mr-2 h-4 w-4' />
                  <span> {t('Common.Previous page')}</span>
                </Button>
                <Button
                  type='button'
                  variant='white'
                  className='ml-3 flex items-center'
                  disabled={isNextPageButtonDisabled()}
                  onClick={() => goToNextPage()}
                >
                  <span>{t('Common.Next page')}</span>
                  <FontAwesomeIcon icon={faChevronRight} className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}

CallsView.displayName = 'CallsView'
