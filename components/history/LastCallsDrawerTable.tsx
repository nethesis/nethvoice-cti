// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState } from 'react'
import {
  searchDrawerHistoryUser,
  searchDrawerHistorySwitchboard,
  getCallTimeToDisplay,
} from '../../lib/history'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBuilding,
  faArrowRight,
  faPhone,
  faPhoneMissed,
  faPhoneArrowDown,
  faPhoneArrowUp,
  faPhoneXmark,
} from '@nethesis/nethesis-solid-svg-icons'
import { formatDateLoc } from '../../lib/dateTime'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { EmptyState, InlineNotification } from '../common'
import { getOperatorByPhoneNumber } from '../../lib/operators'

export interface LastCallsDrawerTableProps extends ComponentPropsWithRef<'div'> {
  callType: string
  dateFrom: Date
  dateTo: Date
  // number of calls to display
  limit: number
  // search a single phone number or all extensions of an operator (main extension must be at the first position of array)
  phoneNumbers: string[]
}

export const LastCallsDrawerTable = forwardRef<HTMLButtonElement, LastCallsDrawerTableProps>(
  ({ callType, dateFrom, dateTo, limit, phoneNumbers, className, ...props }, ref) => {
    const [isLoaded, setLoaded] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [lastCalls, setLastCalls] = useState<any>([])
    const [firstRender, setFirstRender]: any = useState(true)
    const { operators } = useSelector((state: RootState) => state.operators)
    const authStore = useSelector((state: RootState) => state.authentication)
    // history API returns irrelevant calls that need to be filtered, pageSize specifies the total number of calls to retrieve from backend
    const pageSize = 100

    useEffect(() => {
      if (firstRender) {
        setFirstRender(false)
        return
      }

      async function retrieveLastCalls() {
        setLoaded(false)
        setErrorMessage('')
        setLastCalls({})
        const dateStart = formatDateLoc(dateFrom, 'yyyyMMdd')
        const dateEnd = formatDateLoc(dateTo, 'yyyyMMdd')

        if (callType === 'user') {
          try {
            const res = await searchDrawerHistoryUser(
              authStore.username,
              dateStart,
              dateEnd,
              phoneNumbers[0],
              'time%20desc',
              pageSize,
            )

            res.rows = filterLastCalls(res)
            setLastCalls(res)
          } catch (e) {
            setErrorMessage('Cannot retrieve last calls of user')
          }
          setLoaded(true)
        } else if (callType === 'switchboard') {
          try {
            const res = await searchDrawerHistorySwitchboard(
              dateStart,
              dateEnd,
              phoneNumbers[0],
              'time%20desc',
              pageSize,
            )
            res.rows = filterLastCalls(res)
            setLastCalls(res)
          } catch (e) {
            setErrorMessage('Cannot retrieve last calls of switchboard')
          }
          setLoaded(true)
        }
      }

      if (!isLoaded) {
        retrieveLastCalls()
      }
    }, [firstRender, isLoaded, dateFrom, dateTo, callType])

    useEffect(() => {
      setLoaded(false)
    }, [phoneNumbers])

    const filterLastCalls = (lastCalls: any) => {
      // discard irrelevant calls (e.g. a call with 0721456229 while searching '229') but include calls of secondary extensions
      const relevantCalls = lastCalls.rows.filter((call: any) => {
        return (
          phoneNumbers.includes(call.src) ||
          phoneNumbers.includes(call.cnum) ||
          phoneNumbers.includes(call.dst)
        )
      })

      // limit the number of calls to show
      return relevantCalls.slice(0, limit)
    }

    //Check the icon for the status column
    function checkIconUser(call: any) {
      return (
        <div className='mt-1 text-sm md:mt-0 flex'>
          <div>
            {call.direction === 'in' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <FontAwesomeIcon
                    icon={faPhoneArrowDown}
                    className='mr-2 h-5 w-3.5 text-green-600 dark:text-green-500'
                    aria-hidden='true'
                    title='Incoming answered'
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faPhoneMissed}
                    className='mr-2 h-5 w-4 text-red-400'
                    aria-hidden='true'
                    title='Incoming missed'
                  />
                )}
              </div>
            )}
            {call.direction === 'out' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <FontAwesomeIcon
                    icon={faPhoneArrowUp}
                    className='mr-2 h-5 w-3.5 text-green-600 dark:text-green-500'
                    aria-hidden='true'
                    title='Outgoing answered'
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faPhoneXmark}
                    className='mr-2 h-5 w-3.5 text-red-400'
                    aria-hidden='true'
                    title='Outgoing missed'
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    function checkIconSwitchboard(call: any) {
      return (
        <>
          <div className='text-sm md:mt-0 flex'>
            <div>
              {call.type === 'internal' && (
                <div>
                  {call.disposition === 'ANSWERED' ? (
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className='h-4 w-4 text-green-600 dark:text-green-500'
                      aria-hidden='true'
                      title='Internal answered'
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className='h-4 w-4 text-red-400'
                      aria-hidden='true'
                      title='Internal missed'
                    />
                  )}
                </div>
              )}
              {call.type !== 'internal' && (
                <div>
                  {call.type === 'in' && (
                    <div>
                      {call.disposition === 'ANSWERED' ? (
                        <FontAwesomeIcon
                          icon={faPhoneArrowDown}
                          className='h-5 w-3.5 text-green-600 dark:text-green-500'
                          aria-hidden='true'
                          title='Incoming answered'
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faPhoneMissed}
                          className='h-5 w-4 text-red-400'
                          aria-hidden='true'
                          title='Incoming missed'
                        />
                      )}
                    </div>
                  )}
                  {call.type === 'out' && (
                    <div>
                      {call.disposition === 'ANSWERED' ? (
                        <FontAwesomeIcon
                          icon={faPhoneArrowUp}
                          className='h-5 w-3.5 text-green-600 dark:text-green-500'
                          aria-hidden='true'
                          title='Outgoing answered'
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faPhoneXmark}
                          className='h-5 w-3.5 text-red-400'
                          aria-hidden='true'
                          title='Outgoing missed'
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )
    }

    function sourceColumn(call: any) {
      //Check if a user does not have a name and add the name of the operator
      if (call.cnam === '') {
        const operatorFound: any = getOperatorByPhoneNumber(call.cnum, operators)

        if (operatorFound) {
          call.cnam = operatorFound.name
        }
      }

      return (
        <div className='flex flex-col justify-center text-sm mt-4 text-gray-900 dark:text-gray-100 md:mt-0'>
          <div
            title={
              call.cnam !== '' ? call.cnam : call.ccompany !== '' ? call.ccompany : call.cnum || '-'
            }
            className='truncate max-w-[6rem] md:max-w-[8rem] lg:max-w-[9rem] xl:max-w-[10rem]'
          >
            {call.cnam !== '' ? call.cnam : call.ccompany !== '' ? call.ccompany : call.cnum || '-'}
          </div>
          {call.cnum !== '' && (
            <div className='truncate text-sm text-gray-500 dark:text-gray-500'>{call.src}</div>
          )}
        </div>
      )
    }

    function destinationColumn(call: any) {
      //Check if a user does not have a name and add the name of the operator
      if (call.dst_cnam === '') {
        const operatorFound: any = getOperatorByPhoneNumber(call.dst, operators)

        if (operatorFound) {
          call.dst_cnam = operatorFound.name
        }
      }

      return (
        <div className='flex flex-col justify-center mt-4 md:mt-0'>
          <div
            title={
              call.dst_cnam !== ''
                ? call.dst_cnam
                : call.dst_ccompany !== ''
                ? call.dst_ccompany
                : call.dst || '-'
            }
            className='truncate text-sm max-w-[6rem] md:max-w-[8rem] lg:max-w-[9rem] xl:max-w-[10rem] text-gray-900 dark:text-gray-100'
          >
            {call.dst_cnam !== ''
              ? call.dst_cnam
              : call.dst_ccompany !== ''
              ? call.dst_ccompany
              : call.dst || '-'}
          </div>
          {(call.dst_cnam !== '' || call.dst_ccompany !== '') && (
            <div className='truncate text-sm text-gray-500 dark:text-gray-500'>{call.dst}</div>
          )}
        </div>
      )
    }

    return (
      <>
        {/* Last calls title */}
        <h4 className='mt-6 text-md font-medium text-gray-700 dark:text-gray-200'>
          {callType === 'switchboard' ? 'Last switchboard calls' : 'Last personal calls'}
        </h4>
        {/* Divider */}
        <div className='mt-4 border-t border-gray-200 dark:border-gray-700'>
          <dl className='sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700'></dl>
        </div>
        {/* error */}
        {errorMessage && (
          <InlineNotification
            type='error'
            title={errorMessage}
            className='my-4'
          ></InlineNotification>
        )}
        {/* skeleton */}
        {!isLoaded && !errorMessage && (
          <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
            {Array.from(Array(9)).map((e, index) => (
              <li key={index} className='py-4 px-5'>
                <div className='animate-pulse h-3 rounded mb-6 bg-gray-300 dark:bg-gray-600'></div>
                <div className='animate-pulse h-3 max-w-[75%] rounded bg-gray-300 dark:bg-gray-600'></div>
              </li>
            ))}
          </ul>
        )}
        {/* empty state */}
        {isLoaded && !errorMessage && lastCalls?.rows && !lastCalls.rows.length && (
          <EmptyState
            title='No recent calls'
            icon={
              <FontAwesomeIcon icon={faPhone} className='mx-auto h-12 w-12' aria-hidden='true' />
            }
          ></EmptyState>
        )}
        {/* Last calls list */}
        {isLoaded && !errorMessage && lastCalls?.rows && !!lastCalls.rows.length && (
          <div className='overflow-hidden sm:rounded-md bg-white dark:bg-gray-900'>
            <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
              {isLoaded &&
                lastCalls?.rows &&
                lastCalls.rows.map((call: any, index: number) => (
                  <li key={index}>
                    <div className='flex items-center py-4'>
                      <div className='flex min-w-0 flex-1 items-center'>
                        <div className='min-w-0 flex-1 2xl:grid 2xl:grid-cols-4 gap-4'>
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

                          <div className='mt-4 2xl:mt-0 flex col-span-3 flex-wrap gap-2 justify-between'>
                            <div className='flex'>
                              {/* Source column  */}
                              {sourceColumn(call)}

                              {/* Icon column */}
                              <div className='mx-4 mt-4 md:mt-0 flex items-center 2xl:justify-center'>
                                <FontAwesomeIcon
                                  icon={faArrowRight}
                                  className='h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-600'
                                  aria-hidden='true'
                                />
                              </div>

                              {/* Destination column */}
                              {destinationColumn(call)}
                            </div>

                            {/* icon user column */}
                            <div className='flex items-center md:mt-0 2xl:justify-center'>
                              {callType === 'user' && checkIconUser(call)}
                              {callType === 'switchboard' && checkIconSwitchboard(call)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </>
    )
  },
)

LastCallsDrawerTable.displayName = 'LastCallsDrawerTable'
