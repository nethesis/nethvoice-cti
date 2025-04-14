// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faUsers,
  faSortAmountAsc,
  faCheck,
  faEllipsisVertical,
  faArrowRightLong,
} from '@fortawesome/free-solid-svg-icons'
import { Button, Avatar, EmptyState, Dropdown, Badge } from '../../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { useTranslation } from 'react-i18next'
import { CallTypes, getLastCalls } from '../../../lib/history'
import { getNMonthsAgoDate } from '../../../lib/utils'
import { formatDateLoc } from '../../../lib/dateTime'
import type { SortTypes } from '../../../lib/history'
import { UserCallStatusIcon } from '../../history/UserCallStatusIcon'
import { CallsDate } from '../../history/CallsDate'
import { getJSONItem, setJSONItem } from '../../../lib/storage'
import { Tooltip } from 'react-tooltip'
import { openCreateLastCallContact, openShowContactDrawer } from '../../../lib/phonebook'
import { CallDetails } from '../../history/CallDetails'
import Link from 'next/link'

interface LastCallTypes extends CallTypes {
  username: string
}

type LastCallsTypes = LastCallTypes[]

export const UserLastCallsContent = () => {
  const { t } = useTranslation()
  const operators = useSelector((state: RootState) => state.operators.operators)
  const username = useSelector((state: RootState) => state.user.username)
  const queuesStore = useSelector((state: RootState) => state.queues)
  const [lastCalls, setLastCalls] = useState<LastCallsTypes>()
  const firstLoadedRef = useRef<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const defaultSort: string = getJSONItem(`preferences-${username}`).lastUserCallsSort || ''
  const [sort, setSort] = useState<SortTypes>(defaultSort || 'time_desc')
  const { profile } = useSelector((state: RootState) => state.user)

  const getLastCallsList = useCallback(
    async (newSort: SortTypes) => {
      if (profile?.macro_permissions?.cdr?.value) {
        const dateStart = getNMonthsAgoDate(2)
        const dateEnd = getNMonthsAgoDate()
        const dateStartString = formatDateLoc(dateStart, 'yyyyMMdd')
        const dateEndString = formatDateLoc(dateEnd, 'yyyyMMdd')
        const callsData = await getLastCalls(username, dateStartString, dateEndString, newSort)
        if (callsData) {
          const callsFinalInformations = getLastCallsUsername(callsData.rows)
          setLastCalls(callsFinalInformations)
          setIsLoading(false)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [username, profile?.macro_permissions?.cdr?.value],
  )

  const getLastCallsUsername = (callsData: CallTypes[]) => {
    if (callsData) {
      const updatedCalls = callsData.map((call: CallTypes) => {
        let callName =
          call.direction === 'out'
            ? call.dst_cnam || call.dst_ccompany
            : call.direction === 'in'
            ? call.cnam || call.ccompany
            : ''

        let operator: any = null

        if (callName) {
          operator = Object.values(operators).find((operator: any) => operator.name === callName)
        } else {
          operator = Object.values(operators).find((operator: any) => {
            const isExten = operator.endpoints.extension.find((exten: any) => exten.id === call.dst)
            return isExten ? true : false
          })
        }
        return { ...call, username: operator?.username || '' }
      })
      return updatedCalls
    }
  }

  function sortCalls(newSort: SortTypes): void {
    getLastCallsList(newSort)
    setSort(newSort)
    const preferences = getJSONItem(`preferences-${username}`)
    preferences['lastUserCallsSort'] = newSort
    setJSONItem(`preferences-${username}`, preferences)
  }

  const [firstRender, setFirstRender]: any = useState(true)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    if (username && !firstLoadedRef.current) {
      firstLoadedRef.current = true
      setIsLoading(true)
      getLastCallsList(sort)
    }

    return () => {
      !firstLoadedRef.current
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, firstRender])

  const lastCallsUpdate = useSelector((state: RootState) => state.lastCalls)

  useEffect(() => {
    if (lastCallsUpdate.isReload) {
      setIsLoading(true)
      getLastCallsList(sort)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCallsUpdate.isReload])

  const openLastCardUserDrawer = (userInformation: any) => {
    let updatedUserInformation: any = {}
    let createContactObject: any = {}

    if (userInformation?.direction === 'in') {
      if (userInformation?.cnam || userInformation?.ccompany) {
        updatedUserInformation.displayName =
          userInformation?.cnam || userInformation?.ccompany || '-'
        updatedUserInformation.kind = 'person'
        if (userInformation?.src) {
          updatedUserInformation.extension = userInformation?.src
        }
        if (updatedUserInformation) {
          openShowContactDrawer(updatedUserInformation)
        }
      } else {
        if (userInformation?.src) {
          createContactObject.extension = userInformation?.src
          openCreateLastCallContact(createContactObject)
        }
      }
    } else {
      if (userInformation?.dst_cnam || userInformation?.dst_ccompany) {
        updatedUserInformation.displayName =
          userInformation?.dst_cnam || userInformation?.dst_ccompany || '-'
        updatedUserInformation.kind = 'person'
        if (userInformation?.dst) {
          updatedUserInformation.extension = userInformation?.dst
        }
        if (updatedUserInformation) {
          openShowContactDrawer(updatedUserInformation)
        }
      } else {
        if (userInformation?.dst) {
          createContactObject.extension = userInformation?.dst
          openCreateLastCallContact(createContactObject)
        }
      }
    }
  }

  return (
    <>
      <div className='flex h-full flex-col bg-sidebar dark:bg-sidebarDark'>
        <div className='py-4 px-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium text-textLight dark:text-textDark leading-7'>
              {t('LastCalls.Last calls')}
            </h2>
            <div className='flex gap-2 items-center'>
              <Dropdown
                items={
                  <>
                    <Dropdown.Header>
                      <span className='font-poppins font-light'>{t('LastCalls.Sort by')}</span>
                    </Dropdown.Header>
                    <Dropdown.Item onClick={() => sortCalls('time_desc')}>
                      <span className='font-poppins font-light'>{t('LastCalls.Newest')}</span>
                      {sort === 'time_desc' && (
                        <FontAwesomeIcon icon={faCheck} className='ml-auto text-emerald-700' />
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => sortCalls('time_asc')}>
                      <span className='font-poppins font-light'>{t('LastCalls.Oldest')}</span>
                      {sort === 'time_asc' && (
                        <FontAwesomeIcon icon={faCheck} className='ml-auto text-emerald-700' />
                      )}
                    </Dropdown.Item>
                  </>
                }
                position='left'
              >
                <Button className='flex gap-2 h-9 w-9' variant='white'>
                  <FontAwesomeIcon icon={faSortAmountAsc} className='h-4 w-4' />
                </Button>
              </Dropdown>
              <Dropdown
                items={
                  <>
                    <Link
                      href={{ pathname: '/history', query: { section: 'Calls' } }}
                      className='w-full'
                    >
                      <Dropdown.Item icon={faArrowRightLong}>
                        {t('LastCalls.Go to history')}
                      </Dropdown.Item>
                    </Link>
                  </>
                }
                position='left'
              >
                <Button variant='ghost' className='py-2 px-2 h-9 w-9'>
                  <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                  <span className='sr-only'>{t('LastCalls.Open lastcalls menu')}</span>
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
        <span className='border-b border-gray-200 dark:border-gray-700'></span>
        <ul
          role='list'
          className='px-6 flex-1 divide-y overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 divide-gray-200 dark:divide-gray-700'
        >
          {/* skeleton */}
          {isLoading &&
            Array.from(Array(4)).map((e, index) => (
              <li key={index}>
                <div className='gap-4 py-4 px-0'>
                  <div className='flex justify-between gap-3'>
                    <div className='flex shrink-0 h-min items-center min-w-[48px]'>
                      <div className='h-2 w-2 flex'>
                        <span className='h-2 w-2'></span>
                      </div>
                      <div className='animate-pulse rounded-full h-12 w-12 bg-gray-300 dark:bg-gray-600'></div>
                    </div>
                    <div className='flex flex-col gap-1.5 min-w-0 flex-1'>
                      <div className='animate-pulse h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600'></div>
                      <div className='animate-pulse h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600'></div>
                      <div className='animate-pulse h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-600'></div>
                      <div className='animate-pulse h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-600'></div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          {/* empty state */}
          {lastCalls?.length === 0 && (
            <div className='py-4'>
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
            </div>
          )}
          {/* Iterate through speed dial list */}
          {lastCalls?.length! > 0 &&
            lastCalls?.map((call: any, key: any) => (
              <li key={key}>
                <div className='group relative flex items-center py-6 px-5'>
                  <div
                    className='absolute inset-0 group-hover:bg-dropdownBgHover dark:group-hover:bg-dropdownBgHoverDark'
                    aria-hidden='true'
                  />
                  <div className='relative flex min-w-0 flex-1 items-center justify-between'>
                    <div className='flex items-start'>
                      <Avatar
                        size='base'
                        placeholderType='person'
                        src={operators[call.username]?.avatarBase64}
                        status={operators[call.username]?.mainPresence}
                        onClick={() => openLastCardUserDrawer(call)}
                      />
                      <div className='ml-4 truncate flex flex-col gap-1.5'>
                        <div className='flex items-center'>
                          <div
                            className={` text-sm font-medium text-gray-700 dark:text-gray-200 ${
                              call.channel.includes('from-queue')
                                ? 'w-24 lg:w-16 xl:w-24 truncate'
                                : 'w-64'
                            }`}
                          >
                            {call?.direction === 'in' ? (
                              <CallDetails
                                call={call}
                                operators={operators}
                                hideName={true}
                                fromHistory={false}
                                isQueueBadgeAvailable={
                                  call.channel.includes('from-queue') ? true : false
                                }
                                direction='in'
                              />
                            ) : (
                              <CallDetails
                                call={call}
                                operators={operators}
                                hideName={true}
                                fromHistory={false}
                                isQueueBadgeAvailable={
                                  call.channel.includes('from-queue') ? true : false
                                }
                                direction='out'
                              />
                            )}
                          </div>
                        </div>
                        <div className='truncate text-sm text-primary dark:text-primaryDark'>
                          <div className='flex items-center'>
                            <UserCallStatusIcon call={call} />
                            <span className='cursor-pointer hover:underline'>
                              {call.direction === 'in' ? (
                                <CallDetails
                                  call={call}
                                  operators={operators}
                                  hideNumber={true}
                                  highlightNumber={true}
                                  isExtensionNumberLastCalls={true}
                                  direction='in'
                                />
                              ) : (
                                <CallDetails
                                  call={call}
                                  operators={operators}
                                  hideNumber={true}
                                  highlightNumber={true}
                                  isExtensionNumberLastCalls={true}
                                  direction='out'
                                />
                              )}
                            </span>
                          </div>
                        </div>
                        <CallsDate call={call} spaced={true} />
                        <div>
                          {call.channel.includes('from-queue') && (
                            <>
                              <Badge
                                size='small'
                                variant='offline'
                                rounded='full'
                                className={`overflow-hidden tooltip-queue-${call?.queue}`}
                                data-tooltip-id={`tooltip-queue-${call?.queue}`}
                                data-tooltip-content={
                                  queuesStore?.queues[call?.queue]?.name
                                    ? `${queuesStore.queues[call.queue].name} ${call.queue}`
                                    : t('QueueManager.Queue')
                                }
                              >
                                <FontAwesomeIcon
                                  icon={faUsers}
                                  className='h-4 w-4 mr-2 ml-1'
                                  aria-hidden='true'
                                />
                                <div
                                  className={`truncate ${
                                    call?.queue ? 'w-20 lg:w-16 xl:w-20' : ''
                                  }`}
                                >
                                  {queuesStore?.queues[call?.queue]?.name
                                    ? `${queuesStore.queues[call.queue].name} ${call.queue}`
                                    : t('QueueManager.Queue')}
                                </div>
                              </Badge>

                              <Tooltip
                                id={`tooltip-queue-${call?.queue}`}
                                className='pi-z-20'
                                place='left'
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </>
  )
}
