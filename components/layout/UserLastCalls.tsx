// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Avatar, EmptyState, Dropdown } from '../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faChevronDown, faRotate } from '@nethesis/nethesis-solid-svg-icons'
import { callPhoneNumber } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import { CallTypes, getLastCalls } from '../../lib/history'
import { getNMonthsAgoDate } from '../../lib/utils'
import { formatDateLoc } from '../../lib/dateTime'
import type { LastCallsResponse, SortTypes } from '../../lib/history'
import { UserCallStatusIcon } from '../history/UserCallStatusIcon'
import { CallsDate } from '../history/CallsDate'
import { CallsDestination } from '../history/CallsDestination'
import { getCallName } from '../history/CallsDestination'
import { StatusTypes } from '../../theme/Types'
import { getJSONItem, setJSONItem } from '../../lib/storage'

export const UserLastCalls = () => {
  const { t } = useTranslation()

  const avatars = useSelector((state: RootState) => state.operators.avatars)
  const operators = useSelector((state: RootState) => state.operators.operators)
  const username = useSelector((state: RootState) => state.user.username)

  const [lastCalls, setLastCalls] = useState<LastCallsResponse>()

  const firstLoadedRef = useRef<boolean>(false)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const updateIntervalId = useRef<ReturnType<typeof setTimeout>>()

  const defaultSort: string = getJSONItem(`preferences-${username}`).lastUserCallsSort || ''
  const [sort, setSort] = useState<SortTypes>(defaultSort || 'time_desc')

  const getLastCallsList = useCallback(
    async (newSort: SortTypes) => {
      const dateStart = getNMonthsAgoDate(2)
      const dateEnd = getNMonthsAgoDate()
      const dateStartString = formatDateLoc(dateStart, 'yyyyMMdd')
      const dateEndString = formatDateLoc(dateEnd, 'yyyyMMdd')
      const lastCalls = await getLastCalls(username, dateStartString, dateEndString, newSort)
      if (lastCalls) {
        setLastCalls(lastCalls)
        setIsLoading(false)
      }
    },
    [username],
  )

  useEffect(() => {
    if (username && !firstLoadedRef.current) {
      firstLoadedRef.current = true
      setIsLoading(true)
      getLastCallsList(sort)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, getLastCallsList])

  function getOperator(call: CallTypes) {
    const callName = getCallName(call)
    const operator: any = Object.values(operators).find(
      (operator: any) => operator.name === callName,
    )
    return operator
  }

  function checkOperatorsAvatar(call: CallTypes): string {
    const avatarUsername: string = getOperator(call)?.username
    return username ? avatars[avatarUsername] || '' : ''
  }

  function checkOperatorPresence(call: CallTypes): StatusTypes | undefined {
    const operatorPresence: string = getOperator(call)?.mainPresence
    if (operatorPresence) {
      return operatorPresence === 'online'
        ? 'online'
        : operatorPresence === 'offline'
        ? 'offline'
        : 'busy'
    } else {
      return undefined
    }
  }

  function sortCalls(newSort: SortTypes): void {
    getLastCallsList(newSort)
    setSort(newSort)
    const preferences = getJSONItem(`preferences-${username}`)
    preferences['lastUserCallsSort'] = newSort
    setJSONItem(`preferences-${username}`, preferences)
  }

  useEffect(() => {
    updateIntervalId.current = setInterval(() => {
      getLastCallsList(sort)
    }, 1000 * 10)
    return () => clearInterval(updateIntervalId.current)
  }, [sort, getLastCallsList])

  return (
    <>
      {/* Secondary column (hidden on smaller screens) */}
      <aside className='hidden lg:w-72 xl:w-80 2xl:w-96 border-l lg:block h-full border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
        <div className='flex h-full flex-col bg-white dark:bg-gray-900'>
          <div className='py-6 px-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                {t('LastCalls.Last calls')}
              </h2>
              <div className='flex gap-1'>
                <Dropdown
                  items={
                    <>
                      <Dropdown.Item onClick={() => sortCalls('time_desc')}>
                        <input
                          type='radio'
                          checked={sort === 'time_desc'}
                          onChange={() => sortCalls('time_desc')}
                          className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                        />
                        {t('LastCalls.Newest')}
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => sortCalls('time_asc')}>
                        <input
                          type='radio'
                          checked={sort === 'time_asc'}
                          onChange={() => sortCalls('time_asc')}
                          className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                        />
                        {t('LastCalls.Oldest')}
                      </Dropdown.Item>
                    </>
                  }
                  position='left'
                >
                  <Button className='flex gap-2' variant='white'>
                    {t('LastCalls.Sort by')}
                    <FontAwesomeIcon icon={faChevronDown} />
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
          <span className='border-b border-gray-200 dark:border-gray-700'></span>
          <ul
            role='list'
            className='flex-1 divide-y overflow-y-auto divide-gray-200 dark:divide-gray-700'
          >
            {/* skeleton */}
            {isLoading &&
              Array.from(Array(4)).map((e, index) => (
                <li key={index}>
                  <div className='flex items-center px-4 py-4 sm:px-6'>
                    {/* avatar skeleton */}
                    <div className='animate-pulse rounded-full h-12 w-12 bg-gray-300 dark:bg-gray-600'></div>
                    <div className='min-w-0 flex-1 px-4'>
                      <div className='flex flex-col justify-center'>
                        {/* line skeleton */}
                        <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            {/* empty state */}
            {lastCalls?.rows?.length === 0 && (
              <EmptyState
                title={t('LastCalls.No calls')}
                icon={
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='mx-auto h-12 w-12'
                    aria-hidden='true'
                  />
                }
              ></EmptyState>
            )}
            {/* Iterate through speed dial list */}
            {lastCalls?.rows?.length! > 0 &&
              lastCalls?.rows.map((call, key) => (
                <li key={key}>
                  <div className='group relative flex items-center py-6 px-5'>
                    <div
                      className='absolute inset-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                      aria-hidden='true'
                    />
                    <div className='relative flex min-w-0 flex-1 items-center justify-between'>
                      <div className='flex items-center'>
                        <span className='text-gray-300 dark:text-gray-600'>
                          <Avatar
                            size='base'
                            placeholderType='person'
                            src={checkOperatorsAvatar(call)}
                            status={checkOperatorPresence(call)}
                          />
                        </span>
                        <div className='ml-4 truncate flex flex-col gap-1.5'>
                          <div className='truncate text-sm font-medium text-gray-700 dark:text-gray-200'>
                            <CallsDestination call={call} operators={operators} hideName={true} />
                          </div>
                          <div className='truncate text-sm text-primary dark:text-primary'>
                            <div className='flex items-center'>
                              <UserCallStatusIcon call={call} />
                              <span
                                className='cursor-pointer hover:underline'
                                onClick={() => callPhoneNumber(call.dst)}
                              >
                                {call.dst_cnam !== '' || call.dst_ccompany !== '' ? (
                                  <CallsDestination
                                    call={call}
                                    operators={operators}
                                    hideNumber={true}
                                    highlightNumber={true}
                                  />
                                ) : (
                                  call.dst
                                )}
                              </span>
                            </div>
                          </div>
                          <CallsDate call={call} spaced={true} />
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        {/* Actions */}
                        <Button
                          variant='white'
                          className='gap-2'
                          onClick={() => callPhoneNumber(call.cnum)}
                        >
                          <FontAwesomeIcon icon={faPhone} size='lg' className='text-gray-500' />
                          {t('LastCalls.Call')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </aside>
    </>
  )
}
