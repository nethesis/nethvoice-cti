// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { Filter } from '../components/history/Filter'
import { Avatar, Button, EmptyState } from '../components/common'
import { useState, useEffect, useMemo } from 'react'
import { search, PAGE_SIZE, openDrawerHistory } from '../lib/history'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faEllipsisVertical, faPlay, faAnglesRight } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { HiArrowDownLeft, HiArrowUpRight } from 'react-icons/hi2'
import { MdCallMissed, MdPhoneCallback } from 'react-icons/md'
import { BsFillRecordFill } from 'react-icons/bs'

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

  const [contactType, setContactType]: any = useState('user')

  const updateContactTypeFilter = (newContactType: string) => {
    setPageNum(1)
    setContactType(newContactType)
    setHistoryLoaded(false)
  }

  const [contactDirection, setContactDirection]: any = useState('all')

  const updateContactDirectionFilter = (newContactDirection: string) => {
    setPageNum(1)
    setContactDirection(newContactDirection)
    setHistoryLoaded(false)
  }

  const [dataBegin, setDataBegin]: any = useState('')

  const updateDataBeginFilter = (newDataBegin: string) => {
    setDataBegin(newDataBegin)
    setHistoryLoaded(false)
  }

  const [dataEnd, setDataEnd]: any = useState('')

  const updateDataEndFilter = (newDataEnd: string) => {
    setDataEnd(newDataEnd)
    setHistoryLoaded(false)
  }

  const [sortBy, setSortBy]: any = useState('time%20desc')

  const updateSortFilter = (newSortBy: string) => {
    setSortBy(newSortBy)
    setHistoryLoaded(false)
  }

  const [historyError, setHistoryError] = useState('')

  //Find the credentials of the user saved in the store
  const historyStore = useSelector((state: RootState) => state.history)
  const authenticationStore = useSelector((state: RootState) => state.authentication)
  const { username } = authenticationStore

  const dateTo = moment().format('YYYY-MM-DD')
  const dateFrom = moment().subtract(7, 'd').format('YYYY-MM-DD')

  useEffect(() => {
    if (!dataBegin) {
      return setDataBegin(dateFrom.replace(/-/g, ''))
    } else {
      setDataBegin(dataBegin.replace(/-/g, ''))
    }
  }, [dataBegin, dateFrom])

  useEffect(() => {
    if (!dataEnd) {
      return setDataEnd(dateTo.replace(/-/g, ''))
    } else {
      setDataEnd(dataEnd.replace(/-/g, ''))
    }
  }, [dateTo, dataEnd])

  //Get the history of the user
  useEffect(() => {
    async function fetchHistory() {
      if (!isHistoryLoaded) {
        try {
          const res = await search(
            contactType,
            username,
            dataBegin,
            dataEnd,
            filterText,
            pageNum,
            sortBy,
            contactDirection,
          )
          setHistory(res)
        } catch (e) {
          setHistoryError('Cannot retrieve history')
        }
        setHistoryLoaded(true)
      }
    }
    fetchHistory()
    checkSize()
  }, [
    isHistoryLoaded,
    history,
    contactType,
    username,
    dataBegin,
    dataEnd,
    filterText,
    pageNum,
    sortBy,
    contactDirection,
  ])

  useEffect(() => {
    // reload phonebook
    setHistoryLoaded(false)
  }, [historyStore])

  const [totalPages, setTotalPages] = useState(0)

  function checkSize() {
    setTotalPages(Math.ceil(history.count / PAGE_SIZE))
  }

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

  //check if the call type is user or switchboard for the Source column
  function checkTypeSource(contact: any) {
    //User call type
    if (contactType === 'user') {
      return <span className=' text-gray-900 dark:text-gray-100'>You</span>
    } else {
      //Switchboard call type
      return (
        <>
          <div className='truncate cursor-pointer no-underline hover:underline text-gray-900 dark:text-gray-100'>
            {contact.cnam !== ''
              ? contact.cnam
              : contact.ccompany !== ''
              ? contact.ccompany
              : contact.cnum || '-'}
          </div>
          {contact.cnum !== '' && (
            <div className='truncate cursor-pointer no-underline hover:underline text-gray-500'>
              {contact.src}
            </div>
          )}
        </>
      )
    }
  }

  //check if the call type is user or switchboard for the Destination column
  function checkTypeDestination(contact: any) {
    //User call type
    if (contactType === 'user') {
      return (
        <>
          <div className='truncate cursor-pointer no-underline hover:underline text-gray-900 dark:text-gray-100'>
            {contact.direction === 'out'
              ? contact.dst_cnam !== ''
                ? contact.dst_cnam
                : contact.dst_ccompany !== ''
                ? contact.dst_ccompany
                : contact.dst || '-'
              : contact.cnam !== ''
              ? contact.cnam
              : contact.ccompany !== ''
              ? contact.ccompany
              : contact.cnum || '-'}
          </div>
        </>
      )
    } else {
      //Switchboard call type
      return (
        <>
          <div className='truncate cursor-pointer no-underline hover:underline text-gray-900 dark:text-gray-100'>
            {contact.dst_cnam !== ''
              ? contact.dst_cnam
              : contact.dst_ccompany !== ''
              ? contact.dst_ccompany
              : contact.dst || '-'}
          </div>
          {(contact.dst_cnam !== '' || contact.dst_ccompany !== '') && (
            <div className='truncate cursor-pointer no-underline hover:underline text-gray-500'>
              {contact.dst}
            </div>
          )}
        </>
      )
    }
  }

  //Check the icon for the status column
  function checkIconUser(contact: any) {
    if (contactType === 'user') {
      return (
        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
          <div className='mt-1 flex items-center text-sm'>
            <div>
              {contact.direction === 'in' && (
                <div>
                  {contact.disposition === 'ANSWERED' ? (
                    <div className='flex flex-nowrap'>
                      <HiArrowDownLeft className='mr-2 h-5 w-5 text-green-400' aria-hidden='true' />
                      <span className=''>Incoming answered</span>
                    </div>
                  ) : (
                    <div className='flex flex-nowrap'>
                      <MdCallMissed className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                      <span className=''>Incoming missed</span>
                    </div>
                  )}
                </div>
              )}
              {contact.direction === 'out' && (
                <div>
                  {contact.disposition === 'ANSWERED' ? (
                    <div className='flex flex-nowrap'>
                      <HiArrowUpRight className='mr-2 h-5 w-5 text-green-400' aria-hidden='true' />
                      <span className=''>Outgoing answered</span>
                    </div>
                  ) : (
                    <div className='flex flex-nowrap'>
                      <HiArrowUpRight className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                      <span className=''>Outgoing missed</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </td>
      )
    } else {
      return (
        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
          <div className='mt-1 flex items-center text-sm'>
            <div>
              {contact.type === 'internal' && (
                <div>
                  {contact.disposition === 'ANSWERED' ? (
                    <div className='flex flex-nowrap'>
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className='mr-2 h-4 w-4 flex-shrink-0 text-green-400'
                        aria-hidden='true'
                      />
                      <span>Internal answered</span>
                    </div>
                  ) : (
                    <div className='flex flex-nowrap'>
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className='mr-2 h-4 w-4 flex-shrink-0 text-red-400'
                        aria-hidden='true'
                      />
                      <span>Internal missed</span>
                    </div>
                  )}
                </div>
              )}
              {contact.type !== 'internal' && (
                <div>
                  {contact.type === 'in' && (
                    <div>
                      {contact.disposition === 'ANSWERED' ? (
                        <div className='flex flex-nowrap'>
                          <HiArrowDownLeft
                            className='mr-2 h-5 w-5 text-green-400'
                            aria-hidden='true'
                          />
                          <span className=''>Incoming answered</span>
                        </div>
                      ) : (
                        <div className='flex flex-nowrap'>
                          <MdCallMissed className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                          <span className=''>Incoming missed</span>
                        </div>
                      )}
                    </div>
                  )}
                  {contact.type === 'out' && (
                    <div>
                      {contact.disposition === 'ANSWERED' ? (
                        <div className='flex flex-nowrap'>
                          <HiArrowUpRight
                            className='mr-2 h-5 w-5 text-green-400'
                            aria-hidden='true'
                          />
                          <span className=''>Outgoing answered</span>
                        </div>
                      ) : (
                        <div className='flex flex-nowrap'>
                          <HiArrowUpRight
                            className='mr-2 h-5 w-5 text-red-400'
                            aria-hidden='true'
                          />
                          <span className=''>Outgoing missed</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </td>
      )
    }
  }

  return (
    <>
      <div>
        <Filter
          updateFilterText={debouncedUpdateFilterText}
          updateContactTypeFilter={updateContactTypeFilter}
          updateSortFilter={updateSortFilter}
          updateContactDirectionFilter={updateContactDirectionFilter}
          updateDataBeginFilter={updateDataBeginFilter}
          updateDataEndFilter={updateDataEndFilter}
        />
        {/* <div className='mt-8 flex flex-col'> */}
        <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-300'>
                {/* <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'
                      >
                        Date
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                      >
                        Source
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                      >
                        Destination
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                      >
                        Duration
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                      >
                        Status
                      </th>
                      <th className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'>
                        Recording
                      </th>
                    </tr>
                  </thead> */}
                <tbody className='divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700'>
                  {/* empty state */}
                  {isHistoryLoaded && history?.count === 0 && (
                    <>
                      <tr>
                        <td></td>
                        <td></td>
                        <td>
                          {' '}
                          <EmptyState
                            title='No contact'
                            description='There is no call in your history'
                          ></EmptyState>
                        </td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    </>
                  )}
                  {/* history skeleton */}
                  {!isHistoryLoaded &&
                    Array.from(Array(9)).map((e, index) => (
                      <tr key={index}>
                        {/* Date skeleton */}
                        <td className='items-center px-4 py-4 sm:px-6'>
                          <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </td>
                        {/* Source skeleton */}
                        <td className='items-center px-4 py-4 sm:px-6'>
                          <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </td>
                        {/* Source skeleton */}
                        <td className='items-center px-4 py-4 sm:px-6'>
                          <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </td>
                        {/* Source skeleton */}
                        <td className='items-center px-4 py-4 sm:px-6'>
                          <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </td>
                        {/* Source skeleton */}
                        <td className='items-center px-4 py-4 sm:px-6'>
                          <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </td>
                        {/* Source skeleton */}
                        <td className='items-center px-4 py-4 sm:px-6'>
                          <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </td>
                      </tr>
                    ))}
                  {/* history */}
                  {isHistoryLoaded &&
                    history?.rows &&
                    history.rows.map((contact: any, index: number) => (
                      <tr key={index}>
                        <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6'>
                          <div className='flex items-center'>
                            <div className=''>
                              <div className='font-medium text-gray-900 dark:text-gray-100'>
                                {moment(contact.time * 1000).format('LL')}
                              </div>
                              <div className='text-gray-500'>
                                {moment.utc(contact.time * 1000).format('LT')}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Source column  */}
                        <td
                          className='max-w-xs	whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-100'
                          onClick={
                            contactType !== 'user'
                              ? () =>
                                  openDrawerHistory(
                                    contact.cnam,
                                    contact.ccompany,
                                    contact.cnum,
                                    dataBegin,
                                    dataEnd,
                                    username,
                                    contactType,
                                    sortBy,
                                    contact.direction,
                                    contact.disposition,
                                  )
                              : undefined
                          }
                        >
                          <div className='flex flex-nowrap'>
                            <span className=''>{checkTypeSource(contact)}</span>
                            <FontAwesomeIcon
                              icon={faAnglesRight}
                              className='ml-2 h-4 w-4 flex-shrink-0 text-gray-900 dark:text-gray-100'
                              aria-hidden='true'
                            />
                          </div>
                        </td>

                        {/* Destination column  */}
                        <td
                          className='max-w-xs whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-100'
                          onClick={
                            contactType !== 'user'
                              ? () =>
                                  openDrawerHistory(
                                    contact.dst_cnam,
                                    contact.dst_ccompany,
                                    contact.dst,
                                    dataBegin,
                                    dataEnd,
                                    username,
                                    contactType,
                                    sortBy,
                                    contact.direction,
                                    contact.disposition,
                                  )
                              : contactType === 'user' && contact.direction === 'out'
                              ? () =>
                                  openDrawerHistory(
                                    contact.dst_cnam,
                                    contact.dst_ccompany,
                                    contact.dst_cnum,
                                    dataBegin,
                                    dataEnd,
                                    username,
                                    contactType,
                                    sortBy,
                                    contact.direction,
                                    contact.disposition,
                                  )
                              : () =>
                                  openDrawerHistory(
                                    contact.cnam,
                                    contact.ccompany,
                                    contact.cnum,
                                    dataBegin,
                                    dataEnd,
                                    username,
                                    contactType,
                                    sortBy,
                                    contact.direction,
                                    contact.disposition,
                                  )
                          }
                        >
                          {checkTypeDestination(contact)}
                        </td>

                        {/* Duration column  */}
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-gray-100'>
                          <div className='text-gray-900 dark:text-gray-100'>
                            {!contact.duration
                              ? '0 second'
                              : toDaysMinutesSeconds(contact.duration)}
                          </div>
                        </td>

                        {/* Status column  */}
                        {checkIconUser(contact)}

                        {/* Recording column  */}
                        <td className='whitespace-nowrap px-3 py-4 text-sm '>
                          {contact.recordingfile && (
                            <div>
                              <Button variant='white'>
                                <FontAwesomeIcon
                                  icon={faPlay}
                                  className='h-4 w-4 flex-shrink-0 text-gray-900 dark:text-gray-100'
                                  aria-hidden='true'
                                />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* </div> */}

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
                of <span className='font-medium'>{history?.count}</span> contacts
              </p>
            </div>
            <div className='flex flex-1 justify-between sm:justify-end'>
              <Button
                type='button'
                variant='white'
                disabled={isPreviousPageButtonDisabled()}
                onClick={() => goToPreviousPage()}
              >
                Previous page
              </Button>
              <Button
                type='button'
                variant='white'
                className='ml-3'
                disabled={isNextPageButtonDisabled()}
                onClick={() => goToNextPage()}
              >
                Next page
              </Button>
            </div>
          </nav>
        )}
      </div>
    </>
  )
}

export default History
