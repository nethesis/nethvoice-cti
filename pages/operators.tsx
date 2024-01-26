// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, Badge, Button, EmptyState, InlineNotification } from '../components/common'
import {
  AVAILABLE_STATUSES,
  callOperator,
  getInfiniteScrollOperatorsPageSize,
  openShowOperatorDrawer,
  searchStringInOperator,
  sortByOperatorStatus,
  UNAVAILABLE_STATUSES,
} from '../lib/operators'
import { isEmpty, debounce, capitalize } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Filter, OperatorStatusBadge } from '../components/operators'
import { closeRightSideDrawer, sortByFavorite, sortByProperty } from '../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faEarListen,
  faExclamationTriangle,
  faFilter,
  faHandPointUp,
  faHeadset,
  faPhone,
  faRecordVinyl,
  faRightLeft,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
import { store } from '../store'
import { CallDuration } from '../components/operators/CallDuration'
import InfiniteScroll from 'react-infinite-scroll-component'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { transferCall } from '../lib/utils'
import { MissingPermission } from '../components/common/MissingPermissionsPage'
import { Tooltip } from 'react-tooltip'

//// use i18n where there is operator.mainPresence

const Operators: NextPage = () => {
  const [filteredOperators, setFilteredOperators]: any = useState([])
  const authStore = useSelector((state: RootState) => state.authentication)
  const operatorsStore = useSelector((state: RootState) => state.operators)
  const [isApplyingFilters, setApplyingFilters]: any = useState(false)
  const infiniteScrollOperatorsPageSize = getInfiniteScrollOperatorsPageSize()
  const [infiniteScrollOperators, setInfiniteScrollOperators] = useState([])
  const [infiniteScrollHasMore, setInfiniteScrollHasMore] = useState(false)
  const [infiniteScrollLastIndex, setInfiniteScrollLastIndex] = useState(
    infiniteScrollOperatorsPageSize,
  )
  const actionInformation = useSelector((state: RootState) => state.userActions)

  const [textFilter, setTextFilter]: any = useState('')
  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
  }

  const debouncedUpdateTextFilter = useMemo(() => debounce(updateTextFilter, 400), [])

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilter.cancel()
    }
  }, [debouncedUpdateTextFilter])

  const [groupFilter, setGroupFilter]: any = useState('')
  const updateGroupFilter = (newGroupFilter: string) => {
    setGroupFilter(newGroupFilter)
  }

  const [statusFilter, setStatusFilter]: any = useState('')
  const updateStatusFilter = (newStatusFilter: string) => {
    setStatusFilter(newStatusFilter)
  }

  const [sortByFilter, setSortByFilter]: any = useState('')
  const updateSort = (newSortBy: string) => {
    setSortByFilter(newSortBy)
  }

  const [layout, setLayout] = useState('')
  const updateLayout = (newLayout: string) => {
    setLayout(newLayout)
  }

  const applyFilters = (operators: any) => {
    if (!(groupFilter && statusFilter && sortByFilter)) {
      return
    }
    setApplyingFilters(true)

    // text filter
    let filteredOperators: any = Object.values(operators).filter((op) =>
      searchStringInOperator(op, textFilter),
    )

    // group filter
    if (groupFilter === 'favorites') {
      filteredOperators = filteredOperators.filter((op: any) => {
        return op.favorite
      })
    } else {
      filteredOperators = filteredOperators.filter((op: any) => {
        return groupFilter === 'all' || op.groups?.includes(groupFilter)
      })
    }

    // status filter
    filteredOperators = filteredOperators.filter((op: any) => {
      return (
        statusFilter === 'all' ||
        (statusFilter === 'available' && AVAILABLE_STATUSES.includes(op.mainPresence)) ||
        (statusFilter === 'unavailable' && UNAVAILABLE_STATUSES.includes(op.mainPresence)) ||
        (statusFilter === 'offline' && op.mainPresence === 'offline') ||
        (statusFilter === 'allExceptOffline' && op.mainPresence !== 'offline')
      )
    })

    // sort operators
    switch (sortByFilter) {
      case 'name':
        filteredOperators.sort(sortByProperty('name'))
        break
      case 'status':
        filteredOperators.sort(sortByProperty('name'))
        filteredOperators.sort(sortByOperatorStatus)
        break
      case 'favorites':
        filteredOperators.sort(sortByProperty('name'))
        filteredOperators.sort(sortByOperatorStatus)
        filteredOperators.sort(sortByFavorite)
        break
    }

    setFilteredOperators(filteredOperators)

    setInfiniteScrollOperators(filteredOperators.slice(0, infiniteScrollLastIndex))
    const hasMore = infiniteScrollLastIndex < filteredOperators.length
    setInfiniteScrollHasMore(hasMore)
    setApplyingFilters(false)
  }

  // load operators when navigating to operators page
  useEffect(() => {
    store.dispatch.operators.setOperatorsLoaded(false)
  }, [])

  // apply filters when operators data has been loaded
  useEffect(() => {
    if (operatorsStore.isOperatorsLoaded) {
      applyFilters(operatorsStore.operators)
    }
  }, [operatorsStore.isOperatorsLoaded])

  // filtered operators
  useEffect(() => {
    applyFilters(operatorsStore.operators)
  }, [operatorsStore.operators, textFilter, groupFilter, statusFilter, sortByFilter])

  const showMoreInfiniteScrollOperators = () => {
    const lastIndex = infiniteScrollLastIndex + infiniteScrollOperatorsPageSize
    setInfiniteScrollLastIndex(lastIndex)
    setInfiniteScrollOperators(filteredOperators.slice(0, lastIndex))
    const hasMore = lastIndex < filteredOperators.length
    setInfiniteScrollHasMore(hasMore)
  }

  const { profile } = useSelector((state: RootState) => state.user)

  const openDrawerOperator = (operator: any) => {
    if (operator) {
      closeRightSideDrawer()
      openShowOperatorDrawer(operator)
    }
  }

  return (
    <>
      {profile?.macro_permissions?.presence_panel?.value ? (
        <div>
          <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>
            {t('Operators.Operators')}
          </h1>
          <Filter
            groups={operatorsStore.groups}
            updateTextFilter={debouncedUpdateTextFilter}
            updateGroupFilter={updateGroupFilter}
            updateStatusFilter={updateStatusFilter}
            updateSort={updateSort}
            updateLayout={updateLayout}
          />
          {/* operators error */}
          {operatorsStore.errorMessage && (
            <InlineNotification
              type='error'
              title={operatorsStore.errorMessage}
            ></InlineNotification>
          )}
          <div className='mx-auto text-center 5xl:max-w-screen-2xl'>
            {/* empty state */}
            {operatorsStore.isOperatorsLoaded &&
              !operatorsStore.errorMessage &&
              isEmpty(operatorsStore.operators) && (
                <EmptyState
                  title='No operators'
                  description='There is no operator configured'
                  icon={
                    <FontAwesomeIcon
                      icon={faHeadset}
                      className='mx-auto h-12 w-12'
                      aria-hidden='true'
                    />
                  }
                ></EmptyState>
              )}
            {/* no search results */}
            {operatorsStore.isOperatorsLoaded &&
              !operatorsStore.errorMessage &&
              !isEmpty(operatorsStore.operators) &&
              isEmpty(filteredOperators) && (
                <EmptyState
                  title='No operators'
                  description='Try changing your search filters'
                  icon={
                    <FontAwesomeIcon
                      icon={faFilter}
                      className='mx-auto h-12 w-12'
                      aria-hidden='true'
                    />
                  }
                />
              )}
            {/* standard layout skeleton */}
            {((layout === 'standard' && !operatorsStore.isOperatorsLoaded) ||
              isApplyingFilters) && (
              <div className='space-y-8 sm:space-y-12 py-8'>
                <ul
                  role='list'
                  className='mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-5xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-5 5xl:grid-cols-6 5xl:max-w-screen-2xl'
                >
                  {Array.from(Array(15)).map((e, index) => (
                    <li key={index}>
                      <div className='space-y-4'>
                        {/* avatar skeleton */}
                        <div className='animate-pulse rounded-full h-24 w-24 mx-auto bg-gray-300 dark:bg-gray-600'></div>
                        <div className='space-y-2'>
                          {/* name skeleton */}
                          <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                          {/* status skeleton */}
                          <div>
                            <div className='animate-pulse h-8 rounded-full bg-gray-300 dark:bg-gray-600'></div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* standard layout operators */}
            {layout === 'standard' &&
              operatorsStore.isOperatorsLoaded &&
              !operatorsStore.errorMessage &&
              !isEmpty(filteredOperators) && (
                <div className='space-y-8 sm:space-y-12 py-8'>
                  <InfiniteScroll
                    dataLength={infiniteScrollOperators.length}
                    next={showMoreInfiniteScrollOperators}
                    hasMore={infiniteScrollHasMore}
                    scrollableTarget='main-content'
                    loader={
                      <FontAwesomeIcon
                        icon={faCircleNotch}
                        className='inline-block text-center fa-spin h-8 m-10 text-gray-400 dark:text-gray-500'
                      />
                    }
                  >
                    <ul
                      role='list'
                      className='mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-5xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-5 5xl:grid-cols-6 5xl:max-w-screen-2xl'
                    >
                      {infiniteScrollOperators.map((operator: any, index) => {
                        return (
                          <div key={index}>
                            <li key={index}>
                              <div className='space-y-4'>
                                {/* Operator avatar  */}
                                <Avatar
                                  src={operator?.avatarBase64}
                                  placeholderType='operator'
                                  size='extra_large'
                                  bordered
                                  onClick={() => openDrawerOperator(operator)}
                                  className='mx-auto cursor-pointer'
                                  status={operator?.mainPresence}
                                />
                                <div className='space-y-2'>
                                  <div className='text-xs font-medium lg:text-sm'>
                                    {operator?.favorite ? (
                                      <div className='flex items-center space-x-2 justify-center'>
                                        <h3
                                          className='cursor-pointer hover:underline block truncate text-sm font-medium text-gray-900 dark:text-gray-100 leading-5'
                                          onClick={() => openDrawerOperator(operator)}
                                        >
                                          {operator?.name}
                                        </h3>
                                        <FontAwesomeIcon
                                          icon={faStar}
                                          className='inline-block text-center h-4 w-4 text-primary dark:text-primaryDark'
                                        />
                                      </div>
                                    ) : (
                                      <h3
                                        className='cursor-pointer hover:underline text-sm not-italic font-medium leading-5 text-gray-900 dark:text-gray-100'
                                        onClick={() => openDrawerOperator(operator)}
                                      >
                                        {operator?.name}
                                      </h3>
                                    )}

                                    <div>
                                      <span className='block truncate mt-1 text-sm font-medium text-gray-500 dark:text-gray-500'>
                                        {/* If operator is in call */}

                                        {operator?.conversations?.length &&
                                        (operator?.conversations[0]?.connected ||
                                          operator?.conversations[0]?.inConference ||
                                          operator?.conversations[0]?.chDest?.inConference ==
                                            true) ? (
                                          <div className='py-2 px-3'>
                                            <CallDuration
                                              startTime={operator?.conversations[0]?.startTime}
                                              className='relative top-px mr-1.5 text-red-700 dark:text-red-400 leading-5 text-sm font-medium font-mono'
                                            />

                                            {/* Operator recording call  */}
                                            {operator?.conversations[0]?.recording === 'true' && (
                                              <FontAwesomeIcon
                                                icon={faRecordVinyl}
                                                className='inline-block text-center h-4 w-4'
                                              />
                                            )}

                                            {/* Operator is listening */}
                                            {operator?.conversations[0]?.id ===
                                              actionInformation?.listeningInfo?.listening_id && (
                                              <FontAwesomeIcon
                                                icon={faEarListen}
                                                className='inline-block text-center h-4 w-4'
                                              />
                                            )}

                                            {/* Operator is intrude */}
                                            {operator?.conversations[0]?.id ===
                                              actionInformation?.intrudeInfo?.intrude_id && (
                                              <FontAwesomeIcon
                                                icon={faHandPointUp}
                                                className='inline-block text-center h-4 w-4'
                                              />
                                            )}
                                          </div>
                                        ) : // If main user is in call Transfer button is shown
                                        operatorsStore?.operators[authStore.username]
                                            ?.mainPresence === 'busy' &&
                                          operator?.mainPresence === 'online' ? (
                                          <Button
                                            variant='dashboard'
                                            onClick={() => transferCall(operator)}
                                            className='text-primary dark:text-primaryDark dark:disabled:text-gray-700 dark:disabled:hover:text-gray-700 disabled:text-gray-400'
                                          >
                                            <FontAwesomeIcon
                                              icon={faRightLeft}
                                              className='inline-block text-center h-3.5 w-3.5 mr-1.5 rotate-90 '
                                            />
                                            <span className='text-sm not-italic font-medium leading-5'>
                                              {t('Operators.Transfer')}
                                            </span>
                                          </Button>
                                        ) : operator?.mainPresence === 'busy' ||
                                          operator?.mainPresence === 'ringing' ? (
                                          <div className='py-2 px-3 flex justify-center'>
                                            {operator?.mainPresence === 'busy' ? (
                                              <span className='text-sm not-italic font-medium leading-5 text-red-700 dark:text-red-400'>
                                                {t('Operators.Busy')}
                                              </span>
                                            ) : (
                                              <div className='flex items-center text-red-700 dark:text-red-400'>
                                                {/* ringing icon */}
                                                <span className='ringing-animation mr-2 h-4 w-4'></span>
                                                <span className='text-sm not-italic font-medium leading-5'>
                                                  {t('Operators.Ringing')}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <Button
                                            variant='dashboard'
                                            className={`${
                                              operator?.mainPresence === 'online' ||
                                              operator?.mainPresence === 'offline' ||
                                              operator?.mainPresence === 'dnd'
                                                ? 'text-primary dark:text-primaryDark dark:disabled:text-gray-600 dark:disabled:hover:text-gray-600 disabled:text-gray-400'
                                                : 'text-red-700 dark:text-red-400'
                                            }`}
                                            // Button is active only if operator is online
                                            disabled={
                                              operator?.mainPresence === 'offline' ||
                                              operator?.mainPresence === 'dnd' ||
                                              operator?.mainPresence === 'busy' ||
                                              operator?.mainPresence === 'ringing' ||
                                              operator?.username === authStore?.username
                                            }
                                            onClick={() => callOperator(operator)}
                                          >
                                            {operator?.mainPresence === 'busy' ? (
                                              <span className='text-sm not-italic font-medium leading-5'>
                                                {t('Operators.Busy')}
                                              </span>
                                            ) : operator?.mainPresence === 'ringing' ? (
                                              <div className='flex items-center'>
                                                {/* ringing icon */}
                                                <span className='ringing-animation mr-2'></span>
                                                <span className='text-sm not-italic font-medium leading-5'>
                                                  {t('Operators.Ringing')}
                                                </span>
                                              </div>
                                            ) : (
                                              <>
                                                <FontAwesomeIcon
                                                  icon={faPhone}
                                                  className='inline-block text-center h-4 w-4 mr-2'
                                                />
                                                <span className='text-sm not-italic font-medium leading-5'>
                                                  {t('Operators.Call')}
                                                </span>
                                              </>
                                            )}
                                          </Button>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          </div>
                        )
                      })}
                    </ul>
                  </InfiniteScroll>
                </div>
              )}
            {/* compact layout skeleton */}
            {((layout === 'compact' && !operatorsStore.isOperatorsLoaded) || isApplyingFilters) && (
              <ul
                role='list'
                className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 5xl:max-w-screen-2xl'
              >
                {Array.from(Array(24)).map((e, index) => (
                  <li key={index} className='px-1'>
                    <button
                      type='button'
                      className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 cursor-default'
                    >
                      <div className='flex min-w-0 flex-1 items-center space-x-3'>
                        <div className='block flex-shrink-0'>
                          <div className='animate-pulse rounded-full h-10 w-10 mx-auto bg-gray-300 dark:bg-gray-600'></div>
                        </div>
                        <span className='block min-w-0 flex-1'>
                          <div className='animate-pulse h-4 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </span>
                      </div>
                      <span className='inline-flex h-10 w-10 flex-shrink-0 items-center justify-center'>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className='h-3 w-3 text-gray-400 dark:text-gray-500'
                          aria-hidden='true'
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {/* compact layout operators */}
            {layout === 'compact' &&
              operatorsStore.isOperatorsLoaded &&
              !operatorsStore.errorMessage &&
              !isEmpty(filteredOperators) && (
                <InfiniteScroll
                  dataLength={infiniteScrollOperators.length}
                  next={showMoreInfiniteScrollOperators}
                  hasMore={infiniteScrollHasMore}
                  scrollableTarget='main-content'
                  loader={
                    <FontAwesomeIcon
                      icon={faCircleNotch}
                      className='inline-block text-center fa-spin h-8 m-10 text-gray-400 dark:text-gray-500'
                    />
                  }
                >
                  <ul
                    role='list'
                    className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 5xl:max-w-screen-2xl'
                  >
                    {infiniteScrollOperators.map((operator: any, index) => {
                      return (
                        <li key={index} className='px-1'>
                          <div className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 focus:ring-primary dark:focus:ring-primary'>
                            <span className='flex min-w-0 flex-1 items-center space-x-3'>
                              <span className='block flex-shrink-0'>
                                <Avatar
                                  src={operator?.avatarBase64}
                                  placeholderType='operator'
                                  size='large'
                                  bordered
                                  onClick={() => openDrawerOperator(operator)}
                                  className='mx-auto cursor-pointer'
                                  status={operator?.mainPresence}
                                />
                              </span>
                              <span className='block min-w-0 flex-1'>
                                <div className='flex items-center space-x-2'>
                                  <span
                                    className='block truncate text-sm font-medium text-gray-900 dark:text-gray-100 ml-3 cursor-pointer hover:underline'
                                    onClick={() => openDrawerOperator(operator)}
                                  >
                                    {operator?.name}
                                  </span>
                                  {operator?.favorite && (
                                    <FontAwesomeIcon
                                      icon={faStar}
                                      className='inline-block text-center h-4 w-4 text-primary dark:text-primaryDark'
                                    />
                                  )}
                                </div>
                                <span className='block truncate text-sm font-medium text-gray-500 dark:text-gray-500'>
                                  {operator?.conversations?.length &&
                                  (operator?.conversations[0]?.connected ||
                                    operator?.conversations[0]?.inConference ||
                                    operator?.conversations[0]?.chDest?.inConference == true) ? (
                                    <div className={`tooltip-operator-information-${index}`}>
                                      <div className='py-2 px-3'>
                                        <div className='flex w-44'>
                                          <CallDuration
                                            startTime={operator?.conversations[0]?.startTime}
                                            className='relative top-px mr-1.5 text-red-700 dark:text-red-400 leading-5 text-sm font-medium font-mono'
                                          />{' '}
                                          <span className='truncate text-sm not-italic font-medium leading-5 text-red-700 dark:text-red-400'>
                                            -{' '}
                                            {capitalize(
                                              operator?.conversations[0]?.counterpartName,
                                            )}
                                          </span>
                                        </div>

                                        {/* Operator recording call  */}
                                        {operator?.conversations[0]?.recording === 'true' && (
                                          <FontAwesomeIcon
                                            icon={faRecordVinyl}
                                            className='inline-block text-center h-4 w-4'
                                          />
                                        )}

                                        {/* Operator is listening */}
                                        {operator?.conversations[0]?.id ===
                                          actionInformation?.listeningInfo?.listening_id && (
                                          <FontAwesomeIcon
                                            icon={faEarListen}
                                            className='inline-block text-center h-4 w-4'
                                          />
                                        )}

                                        {/* Operator is intrude */}
                                        {operator?.conversations[0]?.id ===
                                          actionInformation?.intrudeInfo?.intrude_id && (
                                          <FontAwesomeIcon
                                            icon={faHandPointUp}
                                            className='inline-block text-center h-4 w-4'
                                          />
                                        )}
                                      </div>
                                      <Tooltip
                                        anchorSelect={`.tooltip-operator-information-${index}`}
                                      >
                                        {operator?.conversations[0]?.counterpartName || '-'}
                                      </Tooltip>
                                    </div>
                                  ) : // If main user is in call Transfer button is shown
                                  operatorsStore?.operators[authStore.username]?.mainPresence ===
                                      'busy' && operator?.mainPresence === 'online' ? (
                                    <Button
                                      variant='dashboard'
                                      onClick={() => transferCall(operator)}
                                      className='text-primary dark:text-primaryDark dark:disabled:text-gray-700 dark:disabled:hover:text-gray-700 disabled:text-gray-400'
                                    >
                                      <FontAwesomeIcon
                                        icon={faRightLeft}
                                        className='inline-block text-center h-4 w-4 mr-1.5 rotate-90'
                                      />
                                      <span className='text-sm not-italic font-medium leading-5'>
                                        {t('Operators.Transfer')}
                                      </span>
                                    </Button>
                                  ) : operator?.mainPresence === 'busy' ||
                                    operator?.mainPresence === 'ringing' ? (
                                    <div className='py-2 px-3'>
                                      {operator?.mainPresence === 'busy' ? (
                                        <span className='text-sm not-italic font-medium leading-5 text-red-700 dark:text-red-400'>
                                          {t('Operators.Busy')}
                                        </span>
                                      ) : (
                                        <div className='flex items-center text-red-700 dark:text-red-400'>
                                          {/* ringing icon */}
                                          <span className='ringing-animation mr-2 h-4 w-4'></span>
                                          <span className='text-sm not-italic font-medium leading-5'>
                                            {t('Operators.Ringing')}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <Button
                                      variant='dashboard'
                                      className={`${
                                        operator?.mainPresence === 'online' ||
                                        operator?.mainPresence === 'offline' ||
                                        operator?.mainPresence === 'dnd'
                                          ? 'text-primary dark:text-primaryDark dark:disabled:text-gray-700 dark:disabled:hover:text-gray-700 disabled:text-gray-400'
                                          : 'text-red-700 dark:text-red-400'
                                      }`}
                                      // Button is active only if operator is online
                                      disabled={
                                        operator?.mainPresence === 'offline' ||
                                        operator?.mainPresence === 'dnd' ||
                                        operator?.username === authStore?.username
                                      }
                                      onClick={() => callOperator(operator)}
                                    >
                                      {operator?.mainPresence === 'busy' ? (
                                        <span className='text-sm not-italic font-medium leading-5'>
                                          {t('Operators.Busy')}
                                        </span>
                                      ) : operator?.mainPresence === 'ringing' ? (
                                        <div className='flex items-center'>
                                          {/* ringing icon */}
                                          <span className='ringing-animation mr-2 h-4 w-4'></span>
                                          <span className='text-sm not-italic font-medium leading-5'>
                                            {t('Operators.Ringing')}
                                          </span>
                                        </div>
                                      ) : (
                                        <>
                                          <FontAwesomeIcon
                                            icon={faPhone}
                                            className='inline-block text-center h-4 w-4 mr-2'
                                          />
                                          <span className='text-sm not-italic font-medium leading-5'>
                                            {t('Operators.Call')}
                                          </span>
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </span>
                              </span>
                            </span>
                            <Button variant='ghost' onClick={() => openDrawerOperator(operator)}>
                              <span className='inline-flex flex-shrink-0 items-center justify-center'>
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  className='h-4 w-4 text-gray-400 dark:text-gray-500 cursor-pointer'
                                  aria-hidden='true'
                                />
                              </span>
                            </Button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </InfiniteScroll>
              )}
          </div>
        </div>
      ) : operatorsStore.isOperatorsLoaded ? (
        <MissingPermission />
      ) : (
        <> </>
      )}
    </>
  )
}

export default Operators
