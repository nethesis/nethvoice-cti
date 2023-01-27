// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { Filter } from '../components/history/Filter'
import { Button, EmptyState, InlineNotification } from '../components/common'
import { useState, useEffect, useMemo } from 'react'
import { search, PAGE_SIZE, openDrawerHistory, getCallTimeToDisplay } from '../lib/history'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuilding,
  faPlay,
  faArrowRight,
  faChevronRight,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import { HiArrowDownLeft, HiArrowUpRight } from 'react-icons/hi2'
import { MdCallMissed } from 'react-icons/md'
import { formatDateLoc } from '../lib/dateTime'
import { subDays, startOfDay } from 'date-fns'

const History: NextPage = () => {
  const [isHistoryLoaded, setHistoryLoaded] = useState(false)
  const [history, setHistory]: any = useState({})
  const [pageNum, setPageNum]: any = useState(1)

  const [filterText, setFilterText]: any = useState('')

  const updateFilterText = (newFilterText: string) => {
    setPageNum(1)
    setFilterText(newFilterText)
    setHistoryLoaded(false)
  }

  const debouncedUpdateFilterText = useMemo(() => debounce(updateFilterText, 400), [])

  // Stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateFilterText.cancel()
    }
  }, [debouncedUpdateFilterText])

  const [callType, setContactType]: any = useState('user')

  const updateContactTypeFilter = (newContactType: string) => {
    setPageNum(1)
    setContactType(newContactType)
    setHistoryLoaded(false)
  }

  const [callDirection, setContactDirection]: any = useState('all')

  const updateContactDirectionFilter = (newContactDirection: string) => {
    setPageNum(1)
    setContactDirection(newContactDirection)
    setHistoryLoaded(false)
  }

  const [dateBegin, setDateBegin]: any = useState('')

  const updateDateBeginFilter = (newDateBegin: string) => {
    setDateBegin(newDateBegin)
    setHistoryLoaded(false)
  }

  const [dateEnd, setDateEnd]: any = useState('')

  const updateDateEndFilter = (newDateEnd: string) => {
    setDateEnd(newDateEnd)
    setHistoryLoaded(false)
  }

  const [sortBy, setSortBy]: any = useState('time%20desc')

  const updateSortFilter = (newSortBy: string) => {
    setSortBy(newSortBy)
    setHistoryLoaded(false)
  }

  const [historyError, setHistoryError] = useState('')

  //Find the credentials of the user saved in the store
  const authenticationStore = useSelector((state: RootState) => state.authentication)
  const { username } = authenticationStore

  //Get the operators information
  const { operators } = useSelector((state: RootState) => state.operators)

  //This date will be sent to the API to get the history of the user
  //Get actual date without hours and minutes
  const dateTo: any = formatDateLoc(new Date(), 'yyyy-MM-dd')

  //Get one week before date
  const DateFromNotConverted = startOfDay(subDays(new Date(), 7))

  //Format the date to the format for the visualizations
  const dateFrom: any = formatDateLoc(DateFromNotConverted, 'yyyy-MM-dd')

  useEffect(() => {
    if (!dateBegin) {
      return setDateBegin(dateFrom.replace(/-/g, ''))
    } else {
      setDateBegin(dateBegin.replace(/-/g, ''))
    }
  }, [dateBegin, dateFrom])

  useEffect(() => {
    if (!dateEnd) {
      return setDateEnd(dateTo.replace(/-/g, ''))
    } else {
      setDateEnd(dateEnd.replace(/-/g, ''))
    }
  }, [dateTo, dateEnd])

  //Check if the date is in the correct format
  //to avoid errors in the API
  const checkDateType = new RegExp(/-/, 'g')

  //Get the history of the user
  useEffect(() => {
    async function fetchHistory() {
      if (
        !isHistoryLoaded &&
        dateBegin &&
        !checkDateType.test(dateBegin) &&
        dateEnd &&
        !checkDateType.test(dateEnd) &&
        !(callType === 'user' && callDirection === 'internal')
      ) {
        try {
          setHistoryError('')
          const res = await search(
            callType,
            username,
            dateBegin,
            dateEnd,
            filterText,
            sortBy,
            callDirection,
            pageNum,
          )
          setHistory(res)
        } catch (e) {
          setHistoryError('Cannot retrieve history')
        }
        setHistoryLoaded(true)
      }
    }
    fetchHistory()
  }, [
    isHistoryLoaded,
    history,
    callType,
    username,
    dateBegin,
    dateEnd,
    filterText,
    pageNum,
    sortBy,
    callDirection,
  ])

  const [totalPages, setTotalPages] = useState(0)

  //Calculate the total pages of the history
  useEffect(() => {
    setTotalPages(Math.ceil(history.count / PAGE_SIZE))
  }, [history])

  function goToPreviousPage() {
    if (pageNum > 1) {
      setHistoryLoaded(false)
      setPageNum(pageNum - 1)
    }
  }

  function goToNextPage() {
    if (pageNum < totalPages) {
      setHistoryLoaded(false)
      setPageNum(pageNum + 1)
    }
  }

  function isPreviousPageButtonDisabled() {
    return !isHistoryLoaded || pageNum <= 1
  }

  function isNextPageButtonDisabled() {
    return !isHistoryLoaded || pageNum >= totalPages
  }

  //Get the duration of the call in Human time
  function toDaysMinutesSeconds(totalSeconds: any) {
    const seconds = Math.floor(totalSeconds % 60)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const days = Math.floor(totalSeconds / (3600 * 24))

    const secondsStr = makeHumanReadable(seconds, 'second')
    const minutesStr = makeHumanReadable(minutes, 'minute')
    const hoursStr = makeHumanReadable(hours, 'hour')
    const daysStr = makeHumanReadable(days, 'day')

    return `${daysStr}${hoursStr}${minutesStr}${secondsStr}`.replace(/,\s*$/, '')
  }

  //Make the duration of the call in Human time
  function makeHumanReadable(num: any, singular: any) {
    return num > 0 ? num + (num === 1 ? ` ${singular}, ` : ` ${singular}s, `) : ''
  }

  //Get the main extension and the name of the user
  const { name, mainextension } = useSelector((state: RootState) => state.user)

  //check if the call type is user or switchboard for the Source column
  function checkTypeSource(call: any) {
    //User call type
    if (callType === 'user') {
      return (
        <>
          <div
            className={
              'truncate max-w-[6rem] md:max-w-[12rem] lg:max-w-[10rem] xl:max-w-[10rem] 2xl:max-w-[12rem] text-gray-900 dark:text-gray-100 text-sm ' +
              (call.cnum !== '' ? ' text-sm cursor-pointer hover:underline' : '')
            }
          >
            {/* Check the date to show */}
            {call.cnam !== '' && call.cnum !== mainextension && call.cnam !== name
              ? call.cnam
              : call.ccompany !== ''
              ? call.ccompany
              : call.cnum !== mainextension
              ? call.cnum
              : 'You'}
          </div>
          {call.cnum !== '' &&
            call.cnum !== mainextension &&
            (call.cnam !== '' || call.ccompany !== '') && (
              <div className='truncate text-sm cursor-pointer hover:underline text-gray-500 dark:text-gray-500'>
                {call.src}
              </div>
            )}
        </>
      )
    } else {
      //Check if a user does not have a name and add the name of the operator
      if (call.cnam === '') {
        let foundOperator: any = Object.values(operators).find((operator: any) =>
          operator.endpoints.extension.find(
            (device: any) => device.id === call.cnum || device.id === call.src,
          ),
        )

        if (foundOperator) {
          call.cnam = foundOperator.name
        }
      }

      //Switchboard call type
      return (
        <>
          <div className='truncate max-w-[6rem] md:max-w-[12rem] lg:max-w-[10rem] xl:max-w-[10rem] 2xl:max-w-[12rem] text-sm cursor-pointer hover:underline text-gray-900 dark:text-gray-100'>
            {call.cnam !== '' ? call.cnam : call.ccompany !== '' ? call.ccompany : call.cnum || '-'}
          </div>
          {call.cnum !== '' && (
            <div className='truncate text-sm cursor-pointer hover:underline text-gray-500 dark:text-gray-500'>
              {call.src}
            </div>
          )}
        </>
      )
    }
  }

  //Check if the call type is user or switchboard for the Destination column
  function checkTypeDestination(call: any) {
    //User call type
    if (callType === 'user') {
      return (
        <>
          <div
            className={
              'truncate max-w-[6rem] md:max-w-[12rem] lg:max-w-[10rem] xl:max-w-[10rem] 2xl:max-w-[12rem] text-gray-900 dark:text-gray-100 text-sm ' +
              (call.dst !== '' ? 'hover:underline cursor-pointer' : '')
            }
          >
            {call.dst_cnam !== '' && call.dst !== mainextension && call.dst_cnam !== name
              ? call.dst_cnam
              : call.dst_ccompany !== ''
              ? call.dst_ccompany
              : call.dst !== mainextension
              ? call.dst
              : 'You'}
          </div>
          {call.dst !== '' &&
            call.dst !== mainextension &&
            (call.dst_cnam !== '' || call.dst_ccompany !== '') && (
              <div className='truncate text-sm cursor-pointer hover:underline text-gray-500 dark:text-gray-500'>
                {call.dst}
              </div>
            )}
        </>
      )
    } else {
      //Check if a user does not have a name and add the name of the operator
      if (call.dst_cnam === '') {
        let foundOperator: any = Object.values(operators).find((operator: any) =>
          operator.endpoints.extension.find((device: any) => device.id === call.dst),
        )

        if (foundOperator) {
          call.dst_cnam = foundOperator.name
        }
      }

      //Switchboard call type
      return (
        <>
          <div className='truncate max-w-[6rem] md:max-w-[12rem] lg:max-w-[10rem] xl:max-w-[10rem] 2xl:max-w-[12rem] text-sm cursor-pointer hover:underline text-gray-900 dark:text-gray-100'>
            {call.dst_cnam !== ''
              ? call.dst_cnam
              : call.dst_ccompany !== ''
              ? call.dst_ccompany
              : call.dst || '-'}{' '}
          </div>
          {(call.dst_cnam !== '' || call.dst_ccompany !== '') && (
            <div className='truncate text-sm cursor-pointer hover:underline text-gray-500 dark:text-gray-500'>
              {call.dst}
            </div>
          )}
        </>
      )
    }
  }

  //Check the icon for the status column
  function checkIconUser(call: any) {
    //Check if the call type is user
    if (callType === 'user') {
      return (
        <div className='mt-1 text-sm'>
          <div>
            {/* Check if the call is incoming or outgoing */}
            {call.direction === 'in' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <div className='flex flex-nowrap items-center'>
                    <HiArrowDownLeft
                      className='mr-2 h-5 w-5 text-green-600 dark:text-green-500'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>Incoming answered</span>
                  </div>
                ) : (
                  <div className='flex flex-nowrap items-center'>
                    <MdCallMissed className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                    <span className='text-gray-900 dark:text-gray-100'>Incoming missed</span>
                  </div>
                )}
              </div>
            )}
            {call.direction === 'out' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <div className='flex flex-nowrap items-center'>
                    <HiArrowUpRight
                      className='mr-2 h-5 w-5 text-green-600 dark:text-green-500'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>Outgoing answered</span>
                  </div>
                ) : (
                  <div className='flex flex-nowrap items-center'>
                    <HiArrowUpRight className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                    <span className='text-gray-900 dark:text-gray-100'>Outgoing missed</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    } else {
      //Call type is switchboard
      return (
        <div className='mt-1 text-sm'>
          <div>
            {/* Check if the call is internal or external */}
            {call.type === 'internal' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <div className='flex flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>Internal answered</span>
                  </div>
                ) : (
                  <div className='flex flex-nowrap'>
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-red-400'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>Internal missed</span>
                  </div>
                )}
              </div>
            )}
            {call.type !== 'internal' && (
              <div>
                {call.type === 'in' && (
                  <div>
                    {call.disposition === 'ANSWERED' ? (
                      <div className='flex flex-nowrap items-center'>
                        <HiArrowDownLeft
                          className='mr-2 h-5 w-5 text-green-600 dark:text-green-500'
                          aria-hidden='true'
                        />
                        <span className='text-gray-900 dark:text-gray-100'>Incoming answered</span>
                      </div>
                    ) : (
                      <div className='flex flex-nowrap'>
                        <MdCallMissed className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                        <span className='text-gray-900 dark:text-gray-100'>Incoming missed</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Check if the call is incoming or outgoing */}
                {call.type === 'out' && (
                  <div>
                    {call.disposition === 'ANSWERED' ? (
                      <div className='flex flex-nowrap items-center'>
                        <HiArrowUpRight
                          className='mr-2 h-5 w-5 text-green-600 dark:text-green-500'
                          aria-hidden='true'
                        />
                        <span className='text-gray-900 dark:text-gray-100'>Outgoing answered</span>
                      </div>
                    ) : (
                      <div className='flex flex-nowrap'>
                        <HiArrowUpRight className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                        <span className='text-gray-900 dark:text-gray-100'>Outgoing missed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <>
      <div>
        <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>History</h1>
        <Filter
          updateFilterText={debouncedUpdateFilterText}
          updateContactTypeFilter={updateContactTypeFilter}
          updateSortFilter={updateSortFilter}
          updateContactDirectionFilter={updateContactDirectionFilter}
          updateDateBeginFilter={updateDateBeginFilter}
          updateDateEndFilter={updateDateEndFilter}
        />

        <div className='overflow-hidden shadow sm:rounded-md bg-white dark:bg-gray-900'>
          <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
            {/* History error */}
            {historyError && (
              <InlineNotification type='error' title={historyError}></InlineNotification>
            )}

            {/* history skeleton */}
            {!isHistoryLoaded &&
              Array.from(Array(9)).map((e, index) => (
                <li key={index}>
                  {/* Skeleton for larger than 750px screen */}
                  <div className='hidden md:flex items-center px-4 py-4 sm:px-6'>
                    {/* History skeleton */}
                    <div className='min-w-0 flex-1 px-4 h-12 md:grid md:grid-cols-4 gap-4 lg:grid-cols-4 xl:grid-cols-7'>
                      <div className='flex flex-col justify-center'>
                        {/* Date skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Source skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Icon skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Destination skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Duration skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Icon skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0mb-6 md:mb-0  bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Recording skeleton */}
                        <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                    </div>
                  </div>

                  {/* Skeleton for mobile device  */}
                  <div className='md:hidden flex items-center px-4 py-4 sm:px-6 shadow'>
                    {/* History skeleton */}
                    <div className='min-w-0 flex-1 px-4 sm:grid sm:grid-cols-2 gap-4'>
                      <div className='flex flex-col justify-center'>
                        {/* Date skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 sm:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Source skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 sm:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Duration skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 sm:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Icon skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 sm:mb-0  bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div className='flex flex-col justify-center'>
                        {/* Recording skeleton */}
                        <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}

            {/* Empty state */}
            {isHistoryLoaded && history?.count === 0 && (
              <EmptyState
                title='No calls'
                description='There are no calls in your history'
              ></EmptyState>
            )}

            {/* Not empty state  */}
            {isHistoryLoaded &&
              history?.rows &&
              history.rows.map((call: any, index: number) => (
                <li key={index}>
                  <div className='flex items-center px-4 py-4 sm:px-6'>
                    <div className='flex min-w-0 flex-1 items-center'>
                      <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-3 gap-4 xl:grid-cols-4 2xl:grid-cols-5'>
                        {/* Date column */}
                        <div className='flex flex-col justify-center'>
                          <div className=''>
                            <div className='text-sm text-gray-900 dark:text-gray-100'>
                              {formatDateLoc(call.time * 1000, 'PP')}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {getCallTimeToDisplay(call.time)}
                            </div>
                          </div>
                        </div>

                        <div className='flex col-span-2'>
                          {/* Source column  */}
                          <div
                            className='flex flex-col justify-center mt-4 md:mt-0'
                            onClick={() => {
                              openDrawerHistory(
                                call.cnam,
                                call.ccompany,
                                call.cnum || call.src,
                                callType,
                                operators,
                              )
                            }}
                          >
                            {checkTypeSource(call)}
                          </div>

                          {/* Icon column */}
                          <div className='flex mx-4 mt-4 md:mt-0 items-center'>
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className='ml-0 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-600'
                              aria-hidden='true'
                            />
                          </div>

                          {/* Destination column */}
                          <div
                            className='flex flex-col justify-center mt-4 md:mt-0'
                            onClick={() =>
                              openDrawerHistory(
                                call.dst_cnam,
                                call.dst_ccompany,
                                call.dst,
                                callType,
                                operators,
                              )
                            }
                          >
                            {checkTypeDestination(call)}
                          </div>
                        </div>

                        {/* duration column */}
                        <div className='mt-4 md:mt-0 flex items-center'>
                          <div className='text-sm text-gray-900 dark:text-gray-100'>
                            {!call.duration ? '0 second' : toDaysMinutesSeconds(call.duration)}
                          </div>
                        </div>

                        {/* icon column */}
                        <div className='mt-4 md:mt-0 flex items-center'>{checkIconUser(call)}</div>

                        {/* recording column */}
                        <div className='mt-4 md:mt-0 grid items-center justify-items-end'>
                          {call.recordingfile && (
                            <div>
                              <Button variant='white'>
                                <FontAwesomeIcon
                                  icon={faPlay}
                                  className='h-4 w-4 flex-shrink-0 text-gray-900 dark:text-gray-100'
                                  aria-hidden='true'
                                />{' '}
                                Play recording
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <nav
            className='flex items-center justify-between border-t px-0 py-4 border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800'
            aria-label='Pagination'
          >
            <div className='hidden sm:block'>
              <p className='text-sm text-gray-700 dark:text-gray-200'>
                Showing <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> to{' '}
                <span className='font-medium'>
                  {PAGE_SIZE * (pageNum - 1) + PAGE_SIZE < history?.count
                    ? PAGE_SIZE * (pageNum - 1) + PAGE_SIZE
                    : history?.count}
                </span>{' '}
                of <span className='font-medium'>{history?.count}</span> calls
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
                <span>Previous page</span>
              </Button>
              <Button
                type='button'
                variant='white'
                className='ml-3 flex items-center'
                disabled={isNextPageButtonDisabled()}
                onClick={() => goToNextPage()}
              >
                <span>Next page</span>
                <FontAwesomeIcon icon={faChevronRight} className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </nav>
        )}
      </div>
    </>
  )
}

export default History
