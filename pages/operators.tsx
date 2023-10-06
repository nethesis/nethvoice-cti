// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, Badge, EmptyState, InlineNotification } from '../components/common'
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
import { sortByFavorite, sortByProperty } from '../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronRight,
  faEarListen,
  faExclamationTriangle,
  faFilter,
  faHandPointUp,
  faHeadset,
  faRecordVinyl,
  faRightLeft,
} from '@fortawesome/free-solid-svg-icons'
import { store } from '../store'
import { CallDuration } from '../components/operators/CallDuration'
import InfiniteScroll from 'react-infinite-scroll-component'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { transferCall } from '../lib/utils'

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

  return (
    <>
      {profile?.macro_permissions?.presence_panel?.value ? (
        <div>
          <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>
            Operators
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
          <div className='mx-auto text-center max-w-7xl 5xl:max-w-screen-2xl'>
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
                                <Avatar
                                  src={operator?.avatarBase64}
                                  placeholderType='operator'
                                  size='extra_large'
                                  bordered
                                  star={operator?.favorite}
                                  onClick={() => openShowOperatorDrawer(operator)}
                                  className='mx-auto cursor-pointer'
                                />
                                <div className='space-y-2'>
                                  <div className='text-xs font-medium lg:text-sm'>
                                    <h3
                                      className='cursor-pointer hover:underline'
                                      onClick={() => openShowOperatorDrawer(operator)}
                                    >
                                      {operator?.name}
                                    </h3>
                                    <div className='mt-3'>
                                      <span className='block truncate mt-1 text-sm font-medium text-gray-500 dark:text-gray-500'>
                                        {operator?.conversations?.length &&
                                        (operator?.conversations[0]?.connected ||
                                          operator?.conversations[0]?.inConference ||
                                          operator?.conversations[0]?.chDest?.inConference ==
                                            true) ? (
                                          <Badge
                                            rounded='full'
                                            variant='busy'
                                            className='flex items-center'
                                          >
                                            <span className='mr-1.5'>
                                              {capitalize(operator?.mainPresence)}
                                            </span>
                                            <CallDuration
                                              startTime={operator?.conversations[0]?.startTime}
                                              className='font-mono relative top-px mr-1.5'
                                            />
                                            {operator?.conversations[0]?.recording === 'true' && (
                                              <FontAwesomeIcon
                                                icon={faRecordVinyl}
                                                className='inline-block text-center h-4 w-4'
                                              />
                                            )}
                                            {operator?.conversations[0]?.id ===
                                              actionInformation?.listeningInfo?.listening_id && (
                                              <FontAwesomeIcon
                                                icon={faEarListen}
                                                className='inline-block text-center h-4 w-4'
                                              />
                                            )}
                                            {operator?.conversations[0]?.id ===
                                              actionInformation?.intrudeInfo?.intrude_id && (
                                              <FontAwesomeIcon
                                                icon={faHandPointUp}
                                                className='inline-block text-center h-4 w-4'
                                              />
                                            )}
                                          </Badge>
                                        ) : operatorsStore?.operators[authStore.username]
                                            ?.mainPresence === 'busy' &&
                                          operator?.mainPresence === 'online' ? (
                                          <>
                                            <Badge
                                              rounded='full'
                                              variant='online'
                                              className='flex items-center cursor-pointer'
                                              onClick={() => transferCall(operator)}
                                            >
                                              <FontAwesomeIcon
                                                icon={faRightLeft}
                                                className='inline-block text-center h-3.5 w-3.5 mr-1.5 rotate-90'
                                              />
                                              <span>{t('Operators.Transfer')}</span>
                                            </Badge>
                                          </>
                                        ) : (
                                          <OperatorStatusBadge
                                            operator={operator}
                                            currentUsername={authStore.username}
                                            callEnabled={true}
                                            onCall={callOperator}
                                          />
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
                          <button
                            type='button'
                            onClick={() => openShowOperatorDrawer(operator)}
                            className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-primary dark:focus:ring-primary'
                          >
                            <span className='flex min-w-0 flex-1 items-center space-x-3'>
                              <span className='block flex-shrink-0'>
                                <Avatar
                                  src={operator.avatarBase64}
                                  placeholderType='operator'
                                  size='large'
                                  bordered
                                  star={operator.favorite}
                                  onClick={() => openShowOperatorDrawer(operator)}
                                  className='mx-auto cursor-pointer'
                                />
                              </span>
                              <span className='block min-w-0 flex-1'>
                                <span className='block truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                                  {operator.name}
                                </span>
                                <span className='block truncate mt-1 text-sm font-medium text-gray-500 dark:text-gray-500'>
                                  {operator.conversations?.length &&
                                  (operator.conversations[0].connected ||
                                    operator.conversations[0].inConference ||
                                    operator.conversations[0].chDest?.inConference == true) ? (
                                    <Badge
                                      rounded='full'
                                      variant='busy'
                                      size='small'
                                      className='flex items-center'
                                    >
                                      <span className='mr-1.5'>
                                        {capitalize(operator.mainPresence)}
                                      </span>
                                      <CallDuration
                                        startTime={operator.conversations[0].startTime}
                                        className='font-mono relative top-px mr-1.5'
                                      />
                                      {operator?.conversations[0]?.recording === 'true' && (
                                        <FontAwesomeIcon
                                          icon={faRecordVinyl}
                                          className='inline-block text-center h-4 w-4 text-gray-400 dark:text-gray-500'
                                        />
                                      )}
                                    </Badge>
                                  ) : (
                                    <OperatorStatusBadge
                                      operator={operator}
                                      currentUsername={authStore.username}
                                      callEnabled={true}
                                      onCall={callOperator}
                                      size='small'
                                    />
                                  )}
                                </span>
                              </span>
                            </span>
                            <span className='inline-flex h-10 w-10 flex-shrink-0 items-center justify-center'>
                              <FontAwesomeIcon
                                icon={faChevronRight}
                                className='h-3 w-3 text-gray-400 dark:text-gray-500 cursor-pointer'
                                aria-hidden='true'
                              />
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </InfiniteScroll>
              )}
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-center h-screen'>
          <div className='text-center'>
            <FontAwesomeIcon icon={faExclamationTriangle} className='text-red-500 text-6xl mb-4' />
            <p className='text-xl text-red-500'>{t('Common.Permission error')}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Operators
