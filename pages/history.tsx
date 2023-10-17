// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { Filter } from '../components/history/Filter'
import { Button, EmptyState, InlineNotification } from '../components/common'
import { useState, useEffect, useMemo } from 'react'
import { search, PAGE_SIZE, openDrawerHistory } from '../lib/history'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import {
  faBuilding,
  faPlay,
  faArrowRight,
  faChevronRight,
  faChevronLeft,
  faXmark,
  faArrowLeft,
  faVoicemail,
  faPhone,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import { formatDateLoc } from '../lib/dateTime'
import { subDays, startOfDay } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { playFileAudio } from '../lib/utils'
import { Tooltip } from 'react-tooltip'
import { CallsDate } from '../components/history/CallsDate'
import { MissingPermission } from '../components/common/MissingPermissionsPage'

const History: NextPage = () => {
  const [isHistoryLoaded, setHistoryLoaded] = useState(false)
  const [history, setHistory]: any = useState({})
  const [pageNum, setPageNum]: any = useState(1)
  const { t } = useTranslation()

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

  const [callType, setCallType]: any = useState('user')

  const updateCallTypeFilter = (newCallType: string) => {
    setPageNum(1)
    setCallType(newCallType)
    setHistoryLoaded(false)
  }

  const [callDirection, setCallDirection]: any = useState('all')

  const updateCallDirectionFilter = (newCallDirection: string) => {
    setPageNum(1)
    setCallDirection(newCallDirection)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              'truncate text-gray-900 dark:text-gray-100 text-sm ' +
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
          <div className='truncate text-sm cursor-pointer hover:underline text-gray-900 dark:text-gray-100'>
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
              'truncate text-gray-900 dark:text-gray-100 text-sm ' +
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
          <div className='truncate text-sm cursor-pointer hover:underline text-gray-900 dark:text-gray-100'>
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
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className='mr-2 h-5 w-3.5 -rotate-45 text-green-600 dark:text-green-500 z-0'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>
                      {' '}
                      {t('History.Incoming answered')}
                    </span>
                    {/* Answered by voicemail */}
                    {call.lastapp === 'VoiceMail' && (
                      <FontAwesomeIcon
                        icon={faVoicemail}
                        className='ml-2 h-4 w-4 text-green-600 dark:text-green-500 tooltip-user-internal-answered-voicemail'
                        aria-hidden='true'
                      />
                    )}
                    <Tooltip anchorSelect='.tooltip-user-internal-answered-voicemail' place='top'>
                      {t('History.Call in Voicemail') || ''}
                    </Tooltip>
                  </div>
                ) : (
                  <div className='flex flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faMissed}
                      className='mr-2 h-5 w-4 text-red-400'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>
                      {t('History.Incoming missed')}
                    </span>
                  </div>
                )}
              </div>
            )}
            {call.direction === 'out' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <div className='flex flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className='mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500 z-0'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>
                      {' '}
                      {t('History.Outgoing answered')}
                    </span>
                  </div>
                ) : (
                  <div className='flex flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faXmark}
                      className='mr-2 h-5 w-3.5 text-red-400'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>
                      {' '}
                      {t('History.Outgoing missed')}
                    </span>
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
                    <span className='text-gray-900 dark:text-gray-100'>
                      {' '}
                      {t('History.Internal answered')}
                    </span>
                    {/* Answered by voicemail */}
                    {call.lastapp === 'VoiceMail' && (
                      <FontAwesomeIcon
                        icon={faVoicemail}
                        className='ml-2 h-4 w-4 text-green-600 dark:text-green-500 tooltip-switchboard-internal-answered-voicemail'
                        aria-hidden='true'
                      />
                    )}
                    <Tooltip
                      anchorSelect='.tooltip-switchboard-internal-answered-voicemail'
                      place='top'
                    >
                      {t('History.Call in Voicemail') || ''}
                    </Tooltip>
                  </div>
                ) : (
                  <div className='flex flex-nowrap'>
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-red-400'
                      aria-hidden='true'
                    />
                    <span className='text-gray-900 dark:text-gray-100'>
                      {t('History.Internal missed')}
                    </span>
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
                        <FontAwesomeIcon
                          icon={faArrowLeft}
                          className='mr-2 h-5 w-3.5 -rotate-45 text-green-600 dark:text-green-500 z-0'
                          aria-hidden='true'
                        />
                        <span className='text-gray-900 dark:text-gray-100'>
                          {t('History.Incoming answered')}
                        </span>
                        {/* Answered by voicemail */}
                        {call.lastapp === 'VoiceMail' && (
                          <FontAwesomeIcon
                            icon={faVoicemail}
                            className='ml-2 h-4 w-4 text-green-600 dark:text-green-500 tooltip-switchboard-not-internal-answered-voicemail'
                            aria-hidden='true'
                          />
                        )}
                        <Tooltip
                          anchorSelect='.tooltip-switchboard-not-internal-answered-voicemail'
                          place='top'
                        >
                          {t('History.Call in Voicemail') || ''}
                        </Tooltip>
                      </div>
                    ) : (
                      <div className='flex flex-nowrap'>
                        <FontAwesomeIcon
                          icon={faMissed}
                          className='mr-2 h-5 w-4 text-red-400'
                          aria-hidden='true'
                        />
                        <span className='text-gray-900 dark:text-gray-100'>
                          {' '}
                          {t('History.Incoming missed')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {/* Check if the call is incoming or outgoing */}
                {call.type === 'out' && (
                  <div>
                    {call.disposition === 'ANSWERED' ? (
                      <div className='flex flex-nowrap items-center'>
                        <FontAwesomeIcon
                          icon={faArrowLeft}
                          className='mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500 z-0'
                          aria-hidden='true'
                        />
                        <span className='text-gray-900 dark:text-gray-100'>
                          {' '}
                          {t('History.Outgoing answered')}
                        </span>
                      </div>
                    ) : (
                      <div className='flex flex-nowrap'>
                        <FontAwesomeIcon
                          icon={faXmark}
                          className='mr-2 h-5 w-3.5 text-red-400'
                          aria-hidden='true'
                        />
                        <span className='text-gray-900 dark:text-gray-100'>
                          {' '}
                          {t('History.Outgoing missed')}
                        </span>
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

  async function playSelectedAudioFile(callId: any) {
    if (callId) {
      playFileAudio(callId, 'recordingFile')
    }
  }

  const { profile } = useSelector((state: RootState) => state.user)

  return (
    <>
      {profile?.macro_permissions?.cdr?.value ? (
        <div>
          <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>
            {t('History.History')}
          </h1>
          <Filter
            updateFilterText={debouncedUpdateFilterText}
            updateCallTypeFilter={updateCallTypeFilter}
            updateSortFilter={updateSortFilter}
            updateCallDirectionFilter={updateCallDirectionFilter}
            updateDateBeginFilter={updateDateBeginFilter}
            updateDateEndFilter={updateDateEndFilter}
          />
          {historyError && (
            <InlineNotification type='error' title={historyError}></InlineNotification>
          )}
          {!historyError && (
            <div className='mx-auto'>
              <div className='flex flex-col'>
                <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                  <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                    <div className='shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                      {/* empty state */}
                      {isHistoryLoaded && history?.count === 0 && (
                        <EmptyState
                          title={t('History.No calls')}
                          description={t('History.There are no calls in your history') || ''}
                          icon={
                            <FontAwesomeIcon
                              icon={faPhone}
                              className='mx-auto h-12 w-12'
                              aria-hidden='true'
                            />
                          }
                        ></EmptyState>
                      )}
                      {isHistoryLoaded && history?.count !== 0 && (
                        <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                          <div className='max-h-[36rem]'>
                            <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
                              <thead className='sticky top-0 bg-white dark:bg-gray-900 z-[1]'>
                                <tr>
                                  <th
                                    scope='col'
                                    className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-100 sm:pl-6'
                                  >
                                    {t('History.Date')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                  >
                                    {t('History.Source')}
                                  </th>
                                  {/* Arrow column */}
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                  ></th>
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                  >
                                    {t('History.Destination')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                  >
                                    {t('History.Duration')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                  >
                                    {t('History.Outcome')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                  >
                                    {t('History.Recording')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-700 text-sm'>
                                {/* Not empty state  */}
                                {isHistoryLoaded &&
                                  history?.rows &&
                                  history.rows.map((call: any, index: number) => (
                                    <tr key={index}>
                                      {/* Date */}
                                      <td className='whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6'>
                                        <CallsDate call={call} />
                                      </td>

                                      {/* Source */}
                                      <td className='px-3 py-4'>
                                        <div
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
                                      </td>

                                      {/* Icon column */}
                                      <td className='pl-2 pr-6 py-4'>
                                        <FontAwesomeIcon
                                          icon={faArrowRight}
                                          className='ml-0 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-600'
                                          aria-hidden='true'
                                        />
                                      </td>

                                      {/* Destination */}
                                      <td className='px-3 py-4'>
                                        <div
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
                                      </td>

                                      {/* Duration */}
                                      <td className='px-3 py-4'>
                                        <div className='text-sm text-gray-900 dark:text-gray-100'>
                                          {!call.duration
                                            ? '0 second'
                                            : toDaysMinutesSeconds(call.duration)}
                                        </div>
                                      </td>

                                      {/* Outcome */}
                                      <td className='px-3 py-4'>
                                        <div>{checkIconUser(call)}</div>
                                      </td>

                                      {/* Recording */}
                                      {call.recordingfile && (
                                        <td className='px-3 py-4'>
                                          <div>
                                            {' '}
                                            <Button
                                              variant='white'
                                              onClick={() => playSelectedAudioFile(call.uniqueid)}
                                            >
                                              <FontAwesomeIcon
                                                icon={faPlay}
                                                className='h-4 w-4 mr-2 text-gray-900 dark:text-gray-100'
                                                aria-hidden='true'
                                              />{' '}
                                              {t('History.Play')}
                                            </Button>
                                          </div>
                                        </td>
                                      )}
                                      {/* No recording file available */}
                                      {!call.recordingfile && (
                                        <td className='px-3 py-4'>
                                          <div className='flex text-gray-500 dark:text-gray-600'>
                                            -
                                          </div>
                                        </td>
                                      )}
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
            </div>
          )}

          {/* skeleton  */}
          {!isHistoryLoaded && (
            <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-700 bg-white dark:bg-gray-900 overflow-hidden rounded-lg'>
              <thead>
                <tr>
                  {Array.from(Array(6)).map((_, index) => (
                    <th key={`th-${index}`}>
                      <div className='px-6 py-3.5'>
                        <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(Array(8)).map((_, secondIndex) => (
                  <tr key={`tr-${secondIndex}`}>
                    {Array.from(Array(6)).map((_, thirdIndex) => (
                      <td key={`td-${secondIndex}-${thirdIndex}`}>
                        <div className='px-6 py-6'>
                          <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <nav
              className='flex items-center justify-between border-t px-0 py-4 border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800'
              aria-label='Pagination'
            >
              <div className='hidden sm:block'>
                <p className='text-sm text-gray-700 dark:text-gray-200'>
                  {t('Common.Showing')}{' '}
                  <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> -&nbsp;
                  <span className='font-medium'>
                    {PAGE_SIZE * (pageNum - 1) + PAGE_SIZE < history?.count
                      ? PAGE_SIZE * (pageNum - 1) + PAGE_SIZE
                      : history?.count}
                  </span>{' '}
                  {t('Common.of')} <span className='font-medium'>{history?.count}</span>{' '}
                  {t('History.calls')}
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
                  <span>{t('Common.Previous page')}</span>
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
      ) : (
        <MissingPermission />
      )}
    </>
  )
}

export default History
