// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState, FC } from 'react'
import { searchDrawerHistoryUser, searchDrawerHistorySwitchboard } from '../../lib/history'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import {
  faBuilding,
  faArrowRight,
  faPhone,
  faXmark,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import { formatDateLoc } from '../../lib/dateTime'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { EmptyState, InlineNotification } from '../common'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { isEqual } from 'lodash'
import { UserCallStatusIcon } from './UserCallStatusIcon'
import { CallsDate } from './CallsDate'
import { CallDetails } from './CallDetails'

export interface LastCallsDrawerTableProps extends ComponentPropsWithRef<'div'> {
  callType: string
  dateFrom: Date
  dateTo: Date
  // number of calls to display
  limit: number
  // search a single phone number or all extensions of an operator (main extension must be at the first position of array)
  phoneNumbers: string[]
  isCustomerCard?: boolean
}

export const LastCallsDrawerTable = forwardRef<HTMLButtonElement, LastCallsDrawerTableProps>(
  (
    { callType, dateFrom, dateTo, limit, phoneNumbers, isCustomerCard, className, ...props },
    ref,
  ) => {
    const { t } = useTranslation()
    const [isLoaded, setLoaded] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [lastCalls, setLastCalls] = useState<any>([])
    const [firstRender, setFirstRender]: any = useState(true)
    const { operators } = useSelector((state: RootState) => state.operators)
    const authStore = useSelector((state: RootState) => state.authentication)
    const [previousPhoneNumbers, setPreviousPhoneNumbers]: any = useState([])
    const user = useSelector((state: RootState) => state.user)

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
              authStore?.username,
              dateStart,
              dateEnd,
              phoneNumbers[0],
              'time%20desc',
              pageSize,
            )

            res.rows = filterLastCalls(res)
            setLastCalls(res)
          } catch (e) {
            setErrorMessage(t('Phonebook.Cannot retrieve last calls of user') || '')
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
            setErrorMessage(t('Phonebook.Cannot retrieve last calls of switchboard') || '')
          }
          setLoaded(true)
        }
      }

      if (!isLoaded) {
        retrieveLastCalls()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [firstRender, isLoaded])

    useEffect(() => {
      if (isEqual(phoneNumbers, previousPhoneNumbers)) {
        return
      }
      setPreviousPhoneNumbers(phoneNumbers)

      // reload last calls
      setLoaded(false)
    }, [phoneNumbers])

    const filterLastCalls = (lastCalls: any) => {
      // If privacy is active, not filter
      if (user?.profile?.macro_permissions?.nethvoice_cti?.permissions?.privacy?.value) {
        return lastCalls.rows.slice(0, limit)
      }
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

    function checkIconSwitchboard(call: any) {
      return (
        <>
          <div className='text-sm md:mt-0 flex'>
            <div>
              {call.type === 'internal' && (
                <div>
                  {call.disposition === 'ANSWERED' ? (
                    <>
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className='tooltip-switchboard-internal-answered h-4 w-4 text-green-600 dark:text-green-500'
                        aria-hidden='true'
                        data-tooltip-id='tooltip-switchboard-internal-answered'
                        data-tooltip-content={t('History.Internal answered') || ''}
                      />

                      <Tooltip
                        id='tooltip-switchboard-internal-answered'
                        place='left'
                        className='pi-z-20'
                      />
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className='tooltip-switchboard-internal-missed h-4 w-4 text-red-400'
                        aria-hidden='true'
                        data-tooltip-id='tooltip-switchboard-internal-missed'
                        data-tooltip-content={t('History.Internal missed') || ''}
                      />

                      <Tooltip
                        id='tooltip-switchboard-internal-missed'
                        place='left'
                        className='pi-z-20'
                      />
                    </>
                  )}
                </div>
              )}
              {call.type !== 'internal' && (
                <div>
                  {call.type === 'in' && (
                    <div>
                      {call.disposition === 'ANSWERED' ? (
                        <>
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className='tooltip-switchboard-incoming-answered -rotate-45 h-5 w-3.5 text-green-600 dark:text-green-500'
                            aria-hidden='true'
                            data-tooltip-id='tooltip-switchboard-incoming-answered'
                            data-tooltip-content={t('History.Incoming answered') || ''}
                          />

                          <Tooltip
                            id='tooltip-switchboard-incoming-answered'
                            place='left'
                            className='pi-z-20'
                          />
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faMissed}
                            className='tooltip-switchboard-incoming-missed h-5 w-4 text-red-400'
                            aria-hidden='true'
                            data-tooltip-id='tooltip-switchboard-incoming-missed'
                            data-tooltip-content={t('History.Incoming missed') || ''}
                          />

                          <Tooltip
                            id='tooltip-switchboard-incoming-missed'
                            place='left'
                            className='pi-z-20'
                          />
                        </>
                      )}
                    </div>
                  )}
                  {call.type === 'out' && (
                    <div>
                      {call.disposition === 'ANSWERED' ? (
                        <>
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className='tooltip-switchboard-outgoing-answered h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500'
                            aria-hidden='true'
                            data-tooltip-id='tooltip-switchboard-outgoing-answered'
                            data-tooltip-content={t('History.Outgoing answered') || ''}
                          />

                          <Tooltip
                            id='tooltip-switchboard-outgoing-answered'
                            place='left'
                            className='pi-z-20'
                          />
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon
                            icon={faXmark}
                            className='tooltip-switchboard-outgoing-missed h-5 w-3.5 text-red-400'
                            aria-hidden='true'
                            data-tooltip-id='tooltip-switchboard-outgoing-missed'
                            data-tooltip-content={t('History.Outgoing missed') || ''}
                          />

                          <Tooltip
                            id='tooltip-switchboard-outgoing-missed'
                            place='left'
                            className='pi-z-20'
                          />
                        </>
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

    return (
      <>
        {/* Last calls title */}
        <h4 className='mt-6 text-base font-medium text-gray-700 dark:text-gray-200'>
          {callType === 'switchboard' && !isCustomerCard
            ? `${t('Phonebook.Last switchboard calls')}`
            : callType === 'personal' && !isCustomerCard
            ? `${t('Phonebook.Last personal calls')}`
            : isCustomerCard
            ? `${t('Phonebook.Last calls')}`
            : ''}
        </h4>
        {/* Divider */}
        <div className='mt-4 border-t border-gray-200 dark:border-gray-700'></div>
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
            title={t('Phonebook.No recent calls') || ''}
            icon={
              <FontAwesomeIcon icon={faPhone} className='mx-auto h-12 w-12' aria-hidden='true' />
            }
          ></EmptyState>
        )}
        {/* Last calls list */}
        {isLoaded && !errorMessage && lastCalls?.rows && !!lastCalls.rows.length && (
          <div className='mx-auto'>
            <div className='flex flex-col'>
              <div className='-my-2 -mx-4 overflow-x-hidden'>
                <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                  {isLoaded && lastCalls?.rows && (
                    <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                      <div>
                        <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
                          <tbody className='divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 text-gray-700 text-sm'>
                            {/* Not empty state  */}
                            {isLoaded &&
                              lastCalls?.rows &&
                              lastCalls.rows.map((call: any, index: number) => (
                                <tr key={index}>
                                  {/* Date */}
                                  <td className='whitespace-nowrap py-4 pr-3'>
                                    {/* Date column */}
                                    <CallsDate call={call} />
                                  </td>

                                  {/* Source */}
                                  <td className='px-3 py-4 whitespace-nowrap'>
                                    <CallDetails
                                      call={call}
                                      operators={operators}
                                      fromHistory
                                      direction='in'
                                    />
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
                                  <td className='px-3 py-4 whitespace-nowrap'>
                                    {/* Destination column */}
                                    <CallDetails
                                      call={call}
                                      operators={operators}
                                      fromHistory
                                      direction='out'
                                    />
                                  </td>

                                  {/* Outcome */}
                                  <td className='px-3 py-4'>
                                    {callType === 'user' && <UserCallStatusIcon call={call} />}
                                    {callType === 'switchboard' && checkIconSwitchboard(call)}{' '}
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
        )}
      </>
    )
  },
)

LastCallsDrawerTable.displayName = 'LastCallsDrawerTable'
