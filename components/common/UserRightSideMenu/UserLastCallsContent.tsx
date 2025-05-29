// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faUsers,
  faSortAmountAsc,
  faCheck,
  faEllipsisVertical,
  faArrowRightLong,
  faUserPlus,
  faFilter,
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
import { openCreateLastCallContact, openShowContactDrawer } from '../../../lib/phonebook'
import { CallDetails } from '../../history/CallDetails'
import Link from 'next/link'
import { CallSkeleton } from '../../common/Skeleton'
import { customScrollbarClass } from '../../../lib/utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

interface LastCallTypes extends CallTypes {
  username: string
}

type LastCallsTypes = LastCallTypes[]

interface LastCallItemProps {
  call: LastCallTypes
  operators: any
  queuesStore: any
  t: (key: string) => string
  openLastCardUserDrawer: (userInformation: any) => void
  handleCreateContact: (call: any) => void
}

const LastCallItem = memo(
  ({
    call,
    operators,
    queuesStore,
    t,
    openLastCardUserDrawer,
    handleCreateContact,
  }: LastCallItemProps) => {
    const [isHovered, setIsHovered] = useState(false)

    const isIncoming = call.direction === 'in'
    const hasNoInfo = isIncoming
      ? !(call.cnam || call.ccompany)
      : !(call.dst_cnam || call.dst_ccompany)

    const renderCallDetails = (direction: 'in' | 'out') => (
      <CallDetails
        call={call}
        operators={operators}
        hideName={true}
        fromHistory={false}
        isQueueBadgeAvailable={call.channel.includes('from-queue')}
        direction={direction}
      />
    )

    const renderCallNumber = (direction: 'in' | 'out') => (
      <CallDetails
        call={call}
        operators={operators}
        hideNumber={true}
        highlightNumber={true}
        isExtensionNumberLastCalls={true}
        direction={direction}
      />
    )

    return (
      <div
        className='group relative flex items-center py-6 px-3'
        onMouseEnter={() => hasNoInfo && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className='absolute inset-0 group-hover:bg-dropdownBgHover dark:group-hover:bg-dropdownBgHoverDark'
          aria-hidden='true'
        />
        <div className='relative flex min-w-0 flex-1 items-center px-6'>
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
                  className={`text-sm font-medium text-gray-700 dark:text-gray-200 ${
                    call.channel.includes('from-queue') ? 'w-24 lg:w-16 xl:w-24 truncate' : 'w-64'
                  }`}
                >
                  {renderCallDetails(call.direction === 'in' ? 'in' : 'out')}
                </div>
              </div>
              <div className='truncate text-sm text-primary dark:text-primaryDark'>
                <div className='flex items-center'>
                  <UserCallStatusIcon call={call} />
                  <span className='cursor-pointer hover:underline'>
                    {renderCallNumber(call.direction === 'in' ? 'in' : 'out')}
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
                      <div className={`truncate ${call?.queue ? 'w-20 lg:w-16 xl:w-20' : ''}`}>
                        {queuesStore?.queues[call?.queue]?.name
                          ? `${queuesStore.queues[call.queue].name} ${call.queue}`
                          : t('QueueManager.Queue')}
                      </div>
                    </Badge>
                    <CustomThemedTooltip id={`tooltip-queue-${call?.queue}`} place='left' />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Create contact button */}
          {hasNoInfo && isHovered && (
            <div className='absolute right-0 top-0 transform'>
              <Button
                variant='ghost'
                className='flex gap-2 items-center py-1.5 px-2 border dark:border-borderDark border-borderLight dark:hover:bg-hoverDark hover:bg-hoverLight'
                onClick={() => handleCreateContact(call)}
              >
                <FontAwesomeIcon
                  className='text-base dark:text-textBlueDark text-textBlueLight'
                  icon={faUserPlus}
                />
                <span className='dark:text-textBlueDark text-textBlueLight font-medium'>
                  {t('SpeedDial.Create')}
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  },
)

LastCallItem.displayName = 'LastCallItem'

export const UserLastCallsContent = () => {
  const { t } = useTranslation()
  const operators = useSelector((state: RootState) => state.operators.operators)
  const username = useSelector((state: RootState) => state.user.username)
  const queuesStore = useSelector((state: RootState) => state.queues)
  const [lastCalls, setLastCalls]: any = useState<LastCallsTypes>()
  const [filteredCalls, setFilteredCalls]: any = useState<LastCallsTypes>()
  const firstLoadedRef = useRef<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const defaultSort: string = getJSONItem(`preferences-${username}`).lastUserCallsSort || ''
  const [sort, setSort] = useState<SortTypes>(defaultSort || 'time_desc')
  const { profile } = useSelector((state: RootState) => state.user)
  const [directionFilter, setDirectionFilter] = useState<string>('all')

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
          applyFilters(callsFinalInformations, directionFilter)
          setIsLoading(false)
        }
      }
    },
    [username, profile?.macro_permissions?.cdr?.value, directionFilter],
  )

  const getLastCallsUsername = useCallback(
    (callsData: CallTypes[]) => {
      if (!callsData) return []

      return callsData.map((call: CallTypes) => {
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
            return !!isExten
          })
        }
        return { ...call, username: operator?.username || '' }
      })
    },
    [operators],
  )

  const applyFilters = useCallback((calls: LastCallsTypes, direction: string) => {
    if (!calls) return

    let result = [...calls]

    if (direction !== 'all') {
      result = result.filter((call) => call.direction === direction)
    }

    result = result.filter((call) => {
      const numberToCheck = call.direction === 'in' ? call.src : call.dst
      return !numberToCheck?.includes('*43')
    })

    setFilteredCalls(result)
  }, [])

  const handleDirectionFilter = useCallback(
    (direction: string) => {
      setDirectionFilter(direction)
      if (lastCalls) {
        applyFilters(lastCalls, direction)
      }
    },
    [lastCalls, applyFilters],
  )

  const sortCalls = useCallback(
    (newSort: SortTypes): void => {
      getLastCallsList(newSort)
      setSort(newSort)
      const preferences = getJSONItem(`preferences-${username}`)
      preferences['lastUserCallsSort'] = newSort
      setJSONItem(`preferences-${username}`, preferences)
    },
    [getLastCallsList, username],
  )

  const [firstRender, setFirstRender] = useState(true)

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
      /* cleanup */
    }
  }, [username, firstRender, getLastCallsList, sort])

  const lastCallsUpdate = useSelector((state: RootState) => state.lastCalls)

  useEffect(() => {
    if (lastCallsUpdate.isReload) {
      setIsLoading(true)
      getLastCallsList(sort)
    }
  }, [lastCallsUpdate.isReload, getLastCallsList, sort])

  const openLastCardUserDrawer = useCallback((userInformation: any) => {
    const isIncoming = userInformation?.direction === 'in'
    const name = isIncoming ? userInformation?.cnam : userInformation?.dst_cnam
    const company = isIncoming ? userInformation?.ccompany : userInformation?.dst_ccompany
    const extension = isIncoming ? userInformation?.src : userInformation?.dst

    if (name || company) {
      const contact = {
        displayName: name || company || '-',
        kind: 'person',
        extension: extension,
      }
      openShowContactDrawer(contact)
    } else if (extension) {
      openCreateLastCallContact({ extension })
    }
  }, [])

  const handleCreateContact = useCallback((call: any) => {
    const isIncoming = call?.direction === 'in'
    const extension = isIncoming ? call?.src : call?.dst
    if (extension) {
      openCreateLastCallContact({ extension })
    }
  }, [])

  useEffect(() => {
    if (lastCalls) {
      applyFilters(lastCalls, directionFilter)
    }
  }, [lastCalls, directionFilter, applyFilters])

  return (
    <>
      <div className='flex h-full flex-col bg-elevation0 dark:bg-elevation0Dark'>
        <div className='py-4 px-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium text-primaryNeutral dark:text-primaryNeutralDark leading-7'>
              {t('LastCalls.Last calls')}
            </h2>
            <div className='flex gap-2 items-center'>
              <Dropdown
                items={
                  <>
                    <Dropdown.Header>
                      <span className='font-poppins font-light'>{t('LastCalls.Filter by')}</span>
                    </Dropdown.Header>
                    <Dropdown.Item onClick={() => handleDirectionFilter('all')}>
                      <span className='font-poppins font-light'>{t('LastCalls.All calls')}</span>
                      {directionFilter === 'all' && (
                        <FontAwesomeIcon icon={faCheck} className='ml-auto text-emerald-700' />
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDirectionFilter('in')}>
                      <span className='font-poppins font-light'>{t('LastCalls.Incoming')}</span>
                      {directionFilter === 'in' && (
                        <FontAwesomeIcon icon={faCheck} className='ml-auto text-emerald-700' />
                      )}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleDirectionFilter('out')}>
                      <span className='font-poppins font-light'>{t('LastCalls.Outgoing')}</span>
                      {directionFilter === 'out' && (
                        <FontAwesomeIcon icon={faCheck} className='ml-auto text-emerald-700' />
                      )}
                    </Dropdown.Item>
                  </>
                }
                position='left'
              >
                <Button className='flex gap-2 h-9 w-9' variant='white'>
                  <FontAwesomeIcon icon={faFilter} className='h-4 w-4' />
                </Button>
              </Dropdown>

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
        <span className='border-b border-layoutDivider dark:border-layoutDividerDark'></span>
        <ul role='list' className={`flex-1 ${customScrollbarClass}`}>
          {/* Skeleton loader */}
          {isLoading &&
            Array.from(Array(4)).map((_, index) => (
              <li key={`skeleton-${index}`}>
                <div className='gap-4 py-4 px-0'>
                  <CallSkeleton />
                </div>
                {/* Divider */}
                {index !== 3 && (
                  <div className='px-6 relative'>
                    <div className='border-b border-layoutDivider dark:border-layoutDividerDark'></div>
                  </div>
                )}
              </li>
            ))}

          {/* Empty state */}
          {filteredCalls?.length === 0 && (
            <div className='py-4'>
              <EmptyState
                title={
                  directionFilter !== 'all'
                    ? t(`LastCalls.No ${directionFilter === 'in' ? 'incoming' : 'outgoing'} calls`)
                    : t('LastCalls.No calls')
                }
                icon={
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='mx-auto h-12 w-12'
                    aria-hidden='true'
                  />
                }
              />
            </div>
          )}

          {filteredCalls?.length! > 0 &&
            filteredCalls.map((call: any, index: number) => (
              <li key={`${call.id}-${index}`}>
                <LastCallItem
                  call={call}
                  operators={operators}
                  queuesStore={queuesStore}
                  t={t}
                  openLastCardUserDrawer={openLastCardUserDrawer}
                  handleCreateContact={handleCreateContact}
                />
                {/* Avoid to show if latest */}
                {index !== filteredCalls?.length - 1 && (
                  <div className='px-6 relative'>
                    <div className='border-b border-layoutDivider dark:border-layoutDividerDark'></div>
                  </div>
                )}
              </li>
            ))}
        </ul>
      </div>
    </>
  )
}
