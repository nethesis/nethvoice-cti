// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineNotification, ProgressionRing } from '../../common'
import { isEmpty, debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  DEFAULT_CALLS_LOAD_PERIOD,
  DEFAULT_CALLS_REFRESH_INTERVAL,
  getCallIcon,
  openShowQueueCallDrawer,
  PAGE_SIZE,
  retrieveAndFilterQueueCalls,
} from '../../../lib/queueManager'
import {
  faChevronRight,
  faChevronLeft,
  faPhone,
  faDownload,
} from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { exactDistanceToNowLoc, formatDateLoc, getCallTimeToDisplay } from '../../../lib/dateTime'
import { NotManagedCallsFilter } from './NotManagedCallsFilter'
import { utcToZonedTime } from 'date-fns-tz'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { loadPreference } from '../../../lib/storage'
import Link from 'next/link'

export interface NotManagedCallsProps extends ComponentProps<'div'> {}

export const NotManagedCalls: FC<NotManagedCallsProps> = ({ className }): JSX.Element => {
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
  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

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
  const updateQueuesFilter = (newQueuesFilter: string[]) => {
    setQueuesFilter(newQueuesFilter)
    setPageNum(1)
    setCallsLoaded(false)
  }

  const fetchCalls = async (numHours: number) => {
    let selectedQueues = queuesFilter

    if (isEmpty(selectedQueues)) {
      selectedQueues = Object.keys(queueManagerStore.queues)
    }

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
        call.queueName = queueManagerStore.queues[call.queuename]?.name

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
        loadPreference('queuesCallsLoadPeriod', authStore.username) || DEFAULT_CALLS_LOAD_PERIOD

      // fetch stats immediately and set interval
      fetchCalls(numHours)

      // clear previous interval (if exists)
      if (intervalId) {
        clearInterval(intervalId)
      }

      const refreshInterval =
        loadPreference('queuesCallsRefreshInterval', authStore.username) ||
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

  const getCallDistanceToNowTemplate = (callTime: any) => {
    const timeDistance = exactDistanceToNowLoc(utcToZonedTime(new Date(callTime), 'UTC'), {
      addSuffix: true,
      hideSeconds: true,
    })

    return t('Common.time_distance_ago', { timeDistance })
  }

  // export to csv section
  const [exportData, setExportData] = useState([])

  const formatDataAsCSV = (data: any) => {
    const headers = ['Time', 'Queue', 'Name', 'Company', 'Outcome']

    const csvContent = [
      headers.join(','),
      ...data.map((row: any) =>
        [
          formatDateLoc(row.time * 1000, 'PP'),
          row.queueName,
          row.name || row.cid,
          row.company || '-',
          t(`Queues.outcome_${row.event}`),
        ]
          .map((value) => `"${value}"`)
          .join(','),
      ),
    ].join('\n')

    return csvContent
  }

  const handleExportCSV = () => {
    const dataToExport = calls?.rows || []
    setExportData(dataToExport)

    const csvContent = formatDataAsCSV(dataToExport)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'table_data.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={classNames(className)}>
      <div className='flex flex-col flex-wrap xl:flex-row justify-between gap-x-4 xl:items-end'>
        <NotManagedCallsFilter
          updateTextFilter={debouncedUpdateTextFilter}
          updateOutcomeFilter={updateOutcomeFilter}
          updateQueuesFilter={updateQueuesFilter}
        />
        <div className='flex items-center justify-end text-sm pb-4 xl:pb-7'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center mr-2'>
              <Button variant='primary' onClick={handleExportCSV}>
                <FontAwesomeIcon
                  icon={faDownload}
                  className='mr-2 h-4 w-4 text-gray-100 dark:text-gray-100'
                />{' '}
                <span>{t('QueueManager.Download')}</span>
              </Button>
            </div>
            <span className='mr-2'>
              <span className='text-gray-900'>{t('Queues.Last update')}:</span>{' '}
              <span className='text-gray-500 dark:text-gray-500'>
                {lastUpdated ? formatDateLoc(new Date(), 'HH:mm:ss') : '-'}
              </span>
            </span>
          </div>
          <Link href={{ pathname: '/settings', query: { section: 'Queues' } }}>
            <a className='hover:underline text-gray-900 font-semibold dark:text-gray-100'>
              {t('Queues.Settings')}
            </a>
          </Link>
        </div>
      </div>
      {callsError && <InlineNotification type='error' title={callsError}></InlineNotification>}
      {!callsError && (
        <div className='mx-auto'>
          <div className='flex flex-col overflow-hidden'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 md:rounded-lg ring-opacity-5 dark:ring-opacity-5 ring-gray-900 dark:ring-gray-100'>
                  {/* empty state */}
                  {isCallsLoaded && isEmpty(calls.rows) && (
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
                      className='bg-white dark:bg-gray-900'
                    ></EmptyState>
                  )}
                  {(!isCallsLoaded || !isEmpty(calls.rows)) && (
                    <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                      <thead className='bg-white dark:bg-gray-900'>
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
                      <tbody className=' text-sm divide-y divide-gray-200 bg-white text-gray-700 dark:divide-gray-700 dark:bg-gray-900 dark:text-gray-200'>
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
                              <td className='py-4 pl-4 pr-3 sm:pl-6'>
                                <div className='flex flex-col'>
                                  <div>{formatDateLoc(call.time * 1000, 'PP')}</div>
                                  <div className='text-gray-500 dark:text-gray-500'>
                                    {getCallTimeToDisplay(call.time * 1000) +
                                      ' (' +
                                      getCallDistanceToNowTemplate(call.time * 1000) +
                                      ')'}
                                  </div>
                                </div>
                              </td>
                              {/* queue */}
                              <td className='px-3 py-4'>
                                <div>{call.queueName}</div>
                                <div className='text-gray-500 dark:text-gray-500'>
                                  {call.queueId}
                                </div>
                              </td>
                              {/* name / number */}
                              <td className='px-3 py-4'>
                                {call.name && (
                                  <div
                                    onClick={() =>
                                      openShowQueueCallDrawer(call, queueManagerStore.queues)
                                    }
                                  >
                                    <span
                                      className={classNames(
                                        call.cid && 'cursor-pointer hover:underline',
                                      )}
                                    >
                                      {call.name}
                                    </span>
                                  </div>
                                )}
                                <div
                                  onClick={() =>
                                    openShowQueueCallDrawer(call, queueManagerStore.queues)
                                  }
                                  className={classNames(
                                    call.name && 'text-gray-500 dark:text-gray-500',
                                  )}
                                >
                                  <span className='cursor-pointer hover:underline'>{call.cid}</span>
                                </div>
                              </td>
                              {/* company */}
                              <td className='px-3 py-4'>{call.company || '-'}</td>
                              {/* outcome */}
                              <td className='whitespace-nowrap px-3 py-4'>
                                <div className='flex items-center'>
                                  <span>{getCallIcon(call)}</span>
                                  <span>{t(`Queues.outcome_${call.event}`)}</span>
                                </div>
                              </td>
                              {/* show details */}
                              <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  className='h-3 w-3 p-2 cursor-pointer text-gray-500 dark:text-gray-500'
                                  aria-hidden='true'
                                  onClick={() =>
                                    openShowQueueCallDrawer(call, queueManagerStore.queues)
                                  }
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
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

NotManagedCalls.displayName = 'NotManagedCalls'
