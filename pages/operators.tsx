// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, Badge, Button, EmptyState, InlineNotification } from '../components/common'
import {
  AVAILABLE_STATUSES,
  callOperator,
  getFilterValues,
  getInfiniteScrollOperatorsPageSize,
  getUserGroups,
  openShowOperatorDrawer,
  searchStringInOperator,
  sortByOperatorStatus,
  UNAVAILABLE_STATUSES,
} from '../lib/operators'
import { isEmpty, debounce, capitalize } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Filter } from '../components/operators'
import { closeRightSideDrawer, sortByFavorite, sortByProperty } from '../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faChevronRight,
  faEarListen,
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
import { faGrid2, faGridDividers } from '@nethesis/nethesis-solid-svg-icons'
import { savePreference } from '../lib/storage'
import TextScroll from '../components/common/TextScroll'

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
  const auth = useSelector((state: RootState) => state.authentication)

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

  const [groupedSortByFilter, setGroupedSortByFilter]: any = useState('')
  const updateGroupedSort = (newGroupedSortBy: string) => {
    setGroupedSortByFilter(newGroupedSortBy)
  }

  const [groupedGroupByFilter, setGroupedGroupByFilter]: any = useState('')
  const updateGroupedGroupBy = (newGroupedGroupBy: string) => {
    setGroupedGroupByFilter(newGroupedGroupBy)
  }

  const [layout, setLayout] = useState('')
  const { profile } = useSelector((state: RootState) => state?.user)

  const allowedGroupsIds = store.select.user.allowedOperatorGroupsIds(store.getState())
  const { username } = store.getState().user

  const userGroups = useMemo(() => {
    return getUserGroups(allowedGroupsIds, operatorsStore.groups, username)
  }, [allowedGroupsIds, operatorsStore.groups, username])

  const applyFilters = (operators: any) => {
    if (!(groupFilter && statusFilter && sortByFilter)) {
      return
    }
    setApplyingFilters(true)

    // text filter
    let filteredOperators: any = Object.values(operators).filter((op) =>
      searchStringInOperator(op, textFilter),
    )

    if (layout !== 'grouped') {
      // group filter
      if (groupFilter === 'favorites') {
        filteredOperators = filteredOperators.filter((op: any) => {
          return op.favorite && userGroups.some((g) => op.groups?.includes(g))
        })
      } else if (groupFilter === 'all') {
        filteredOperators = filteredOperators.filter((op: any) => {
          return userGroups.some((g) => op.groups?.includes(g))
        })
      } else {
        filteredOperators = filteredOperators.filter((op: any) => {
          return groupFilter === 'all' || op.groups?.includes(groupFilter)
        })
      }

      // sort operators
      switch (sortByFilter) {
        case 'favorites':
          filteredOperators.sort(sortByProperty('name'))
          // filteredOperators.sort(sortByOperatorStatus)
          filteredOperators.sort(sortByFavorite)
          break
        case 'extension':
          filteredOperators.sort((a: any, b: any) =>
            a?.endpoints?.extension[0]?.id > b?.endpoints?.extension[0]?.id ? 1 : -1,
          )
          break
        case 'az':
          // Sort operators alphabetically
          filteredOperators.sort((a: any, b: any) => (a?.name > b?.name ? 1 : -1))
          break
        case 'za':
          // Sort operators reverse alphabetically
          filteredOperators.sort((a: any, b: any) => (a?.name < b?.name ? 1 : -1))
          break
      }

      filteredOperators = filteredOperators.filter((op: any) => {
        return (
          statusFilter === 'all' ||
          (statusFilter === 'available' && AVAILABLE_STATUSES.includes(op.mainPresence)) ||
          (statusFilter === 'unavailable' && UNAVAILABLE_STATUSES.includes(op.mainPresence)) ||
          (statusFilter === 'offline' && op.mainPresence === 'offline') ||
          (statusFilter === 'allExceptOffline' && op.mainPresence !== 'offline')
        )
      })
    } else {
      // group filter
      if (groupFilter === 'favorites') {
        filteredOperators = filteredOperators.filter((op: any) => {
          return op.favorite && userGroups.some((g) => op.groups?.includes(g))
        })
      } else if (groupFilter === 'all') {
        filteredOperators = filteredOperators.filter((op: any) => {
          return userGroups.some((g) => op.groups?.includes(g))
        })
      } else {
        filteredOperators = filteredOperators.filter((op: any) => {
          return groupFilter === 'all' || op.groups?.includes(groupFilter)
        })
      }

      // sort operators
      switch (groupedSortByFilter) {
        case 'extension':
          filteredOperators.sort((a: any, b: any) =>
            a?.endpoints?.extension[0]?.id > b?.endpoints?.extension[0]?.id ? 1 : -1,
          )
          break
        case 'az':
          // Sort operators alphabetically
          filteredOperators.sort((a: any, b: any) => (a?.name > b?.name ? 1 : -1))
          break
        case 'za':
          // Sort operators reverse alphabetically
          filteredOperators.sort((a: any, b: any) => (a?.name < b?.name ? 1 : -1))
          break
        case 'favorites':
          filteredOperators.sort(sortByProperty('name'))
          filteredOperators.sort(sortByOperatorStatus)
          filteredOperators.sort(sortByFavorite)
          break
      }

      // group filter
      switch (groupedGroupByFilter) {
        case 'az':
          // Group by first letter of name and sort alphabetically within each category
          const letterGroupsAZ: { [key: string]: any[] } = {}
          filteredOperators.forEach((op: any) => {
            const firstLetter = op?.name?.charAt(0)?.toUpperCase()
            if (!letterGroupsAZ[firstLetter]) {
              letterGroupsAZ[firstLetter] = []
            }
            letterGroupsAZ[firstLetter].push(op)
          })
          filteredOperators = []
          Object.keys(letterGroupsAZ)
            .sort()
            .forEach((letter: string) => {
              filteredOperators.push({ category: letter, members: letterGroupsAZ[letter] })
            })
          break
        case 'za':
          // Group by first letter of name and sort reverse alphabetically within each category
          const letterGroupsZA: { [key: string]: any[] } = {}
          filteredOperators.forEach((op: any) => {
            const firstLetter = op?.name?.charAt(0)?.toUpperCase()
            if (!letterGroupsZA[firstLetter]) {
              letterGroupsZA[firstLetter] = []
            }
            letterGroupsZA[firstLetter].push(op)
          })
          filteredOperators = []
          Object.keys(letterGroupsZA)
            .sort()
            .reverse()
            .forEach((letter: string) => {
              filteredOperators.push({ category: letter, members: letterGroupsZA[letter] })
            })
          break
        case 'team':
          // Group by team and sort alphabetically within each team
          const teams: { [key: string]: any[] } = {}
          filteredOperators.forEach((op: any) => {
            op.groups?.forEach((group: string) => {
              if (!teams[group]) {
                teams[group] = []
              }
              teams[group].push(op)
            })
          })
          filteredOperators = []
          Object.keys(teams)
            .sort()
            .forEach((team: string) => {
              filteredOperators.push({
                category: team,
                members: teams[team],
              })
            })
          break
        case 'status':
          // Group by status and sort according to custom order within each status
          const statusGroups: { [key: string]: any[] } = {}
          filteredOperators.forEach((op: any) => {
            let status = op.mainPresence
            if (status === 'incoming' || status === 'ringing') {
              status = 'busy'
            }
            if (!statusGroups[status]) {
              statusGroups[status] = []
            }
            statusGroups[status].push(op)
          })
          filteredOperators = []
          // Define custom order for statuses
          const customStatusOrder = [
            'busy',
            'online',
            'cellphone',
            'callforward',
            'voicemail',
            'dnd',
            'offline',
          ]
          // Iterate through custom status order
          customStatusOrder.forEach((status: string) => {
            // Check if status exists in statusGroups
            if (statusGroups.hasOwnProperty(status)) {
              // Push category with sorted members according to custom order
              filteredOperators.push({
                category: status,
                members: statusGroups[status],
              })
            }
          })
          break
      }

      // status filter
      // Filter operators by status within each category
      filteredOperators.forEach((category: any) => {
        category.members = category?.members?.filter((op: any) => {
          return (
            statusFilter === 'all' ||
            (statusFilter === 'available' && AVAILABLE_STATUSES?.includes(op?.mainPresence)) ||
            (statusFilter === 'unavailable' && UNAVAILABLE_STATUSES?.includes(op?.mainPresence)) ||
            (statusFilter === 'offline' && op?.mainPresence === 'offline') ||
            (statusFilter === 'allExceptOffline' && op?.mainPresence !== 'offline')
          )
        })
      })

      // Filter categories based on the presence of members after status filtering
      filteredOperators = filteredOperators?.filter((category: any) => {
        return category?.members?.length > 0
      })
    }

    setFilteredOperators(filteredOperators)

    setInfiniteScrollOperators(filteredOperators?.slice(0, infiniteScrollLastIndex))
    const hasMore = infiniteScrollLastIndex < filteredOperators?.length
    setInfiniteScrollHasMore(hasMore)
    setApplyingFilters(false)
  }

  // load operators when navigating to operators page
  useEffect(() => {
    store?.dispatch?.operators?.setOperatorsLoaded(false)
  }, [])

  // apply filters when operators data has been loaded
  useEffect(() => {
    if (operatorsStore?.isOperatorsLoaded) {
      applyFilters(operatorsStore?.operators)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operatorsStore?.isOperatorsLoaded])

  // filtered operators
  useEffect(() => {
    applyFilters(operatorsStore?.operators)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    operatorsStore?.operators,
    textFilter,
    groupFilter,
    statusFilter,
    sortByFilter,
    groupedSortByFilter,
    groupedGroupByFilter,
    layout,
    profile?.macro_permissions?.presence_panel?.permissions,
  ])

  const showMoreInfiniteScrollOperators = () => {
    const lastIndex = infiniteScrollLastIndex + infiniteScrollOperatorsPageSize
    setInfiniteScrollLastIndex(lastIndex)
    setInfiniteScrollOperators(filteredOperators?.slice(0, lastIndex))
    const hasMore = lastIndex < filteredOperators?.length
    setInfiniteScrollHasMore(hasMore)
  }

  const openDrawerOperator = (operator: any) => {
    if (operator) {
      closeRightSideDrawer()
      openShowOperatorDrawer(operator)
    }
  }
  const [selectedLayout, setSelectedLayout] = useState('standard')

  const [isGroupedLayot, setIsGroupedLayout] = useState(false)

  // edit selected operators layout
  const selectLayoutOperators = (layout: string) => {
    setSelectedLayout(layout)
    setLayout(layout)
    // save selected layout to local storage
    savePreference('operatorsLayout', layout, auth?.username)
    if (layout === 'grouped') {
      setIsGroupedLayout(true)
    } else {
      setIsGroupedLayout(false)
    }
  }

  // retrieve layout values from local storage
  useEffect(() => {
    const filterValues = getFilterValues(auth.username)
    setLayout(filterValues?.layout)
    setSelectedLayout(filterValues?.layout)
    if (filterValues?.layout === 'grouped') {
      setIsGroupedLayout(true)
    } else {
      setIsGroupedLayout(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const upperCaseFirstLetter = (string: string) => {
    return string?.charAt(0)?.toUpperCase() + string?.slice(1)
  }

  return (
    <>
      {profile?.macro_permissions?.presence_panel?.value ? (
        <div>
          <h1 className='text-2xl font-semibold mb-6 text-title dark:text-titleDark'>
            {t('Operators.Operators')}
          </h1>
          <div className='flex items-center'>
            <div className='grow items-center'>
              {layout === 'grouped' ? (
                <>
                  <Filter
                    groups={operatorsStore.groups}
                    updateTextFilter={debouncedUpdateTextFilter}
                    updateGroupFilter={updateGroupFilter}
                    updateStatusFilter={updateStatusFilter}
                    updateSort={updateSort}
                    updateGroupedSort={updateGroupedSort}
                    updateGroupedGroupBy={updateGroupedGroupBy}
                    isGroupedLayot={isGroupedLayot}
                  />
                </>
              ) : (
                <>
                  <Filter
                    groups={operatorsStore.groups}
                    updateTextFilter={debouncedUpdateTextFilter}
                    updateGroupFilter={updateGroupFilter}
                    updateStatusFilter={updateStatusFilter}
                    updateSort={updateSort}
                    updateGroupedSort={updateGroupedSort}
                    updateGroupedGroupBy={updateGroupedGroupBy}
                    isGroupedLayot={isGroupedLayot}
                  />
                </>
              )}
            </div>
            <div className='hidden sm:flex sm:justify-end sm:space-x-4 sm:items-center mt-7'>
              <button className='bg-transparent' onClick={() => selectLayoutOperators('standard')}>
                <FontAwesomeIcon
                  icon={faGrid2}
                  className={`${
                    selectedLayout === 'standard'
                      ? 'text-primary dark:text-primaryDark'
                      : 'text-gray-600 dark:text-gray-500'
                  } inline-block text-center h-5 w-5 cursor-pointer`}
                />
              </button>
              <button className='bg-transparent' onClick={() => selectLayoutOperators('compact')}>
                <FontAwesomeIcon
                  icon={faBars}
                  className={`${
                    selectedLayout === 'compact'
                      ? 'text-primary dark:text-primaryDark'
                      : 'text-gray-600 dark:text-gray-500'
                  } inline-block text-center h-5 w-5 cursor-pointer`}
                />
              </button>
              <button className='bg-transparent' onClick={() => selectLayoutOperators('grouped')}>
                <FontAwesomeIcon
                  icon={faGridDividers}
                  className={`${
                    selectedLayout === 'grouped'
                      ? 'text-primary dark:text-primaryDark'
                      : 'text-gray-600 dark:text-gray-500'
                  } inline-block text-center h-5 w-5 cursor-pointer`}
                />
              </button>
            </div>
          </div>
          <div className='sm:hidden space-x-4'>
            <button className='bg-transparent' onClick={() => selectLayoutOperators('standard')}>
              <FontAwesomeIcon
                icon={faGrid2}
                className={`${
                  selectedLayout === 'standard'
                    ? 'text-primary dark:text-primaryDark'
                    : 'text-gray-600 dark:text-gray-300'
                }, inline-block text-center h-5 w-5 cursor-pointer`}
              />
            </button>
            <button className='bg-transparent' onClick={() => selectLayoutOperators('compact')}>
              <FontAwesomeIcon
                icon={faBars}
                className={`${
                  selectedLayout === 'compact'
                    ? 'text-primary dark:text-primaryDark'
                    : 'text-gray-600 dark:text-gray-300'
                }, inline-block text-center h-5 w-5 cursor-pointer`}
              />
            </button>
            <button className='bg-transparent' onClick={() => selectLayoutOperators('grouped')}>
              <FontAwesomeIcon
                icon={faGridDividers}
                className={`${
                  selectedLayout === 'grouped'
                    ? 'text-primary dark:text-primaryDark'
                    : 'text-gray-600 dark:text-gray-300'
                }, inline-block text-center h-5 w-5 cursor-pointer`}
              />
            </button>
          </div>

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
                                              className='relative top-px mr-1.5 text-cardTextBusy dark:text-cardTextBusy leading-5 text-sm font-medium font-mono'
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
                                              <span className='text-sm not-italic font-medium leading-5 text-cardTextBusy dark:text-cardTextBusy'>
                                                {t('Operators.Busy')}
                                              </span>
                                            ) : (
                                              <div className='flex items-center text-cardTextBusy dark:text-cardTextBusy'>
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
                                                : 'text-cardTextBusy dark:text-cardTextBusy'
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
                className='grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 5xl:max-w-screen-2xl'
              >
                {Array.from(Array(24)).map((e, index) => (
                  <li key={index} className='px-1'>
                    <button
                      type='button'
                      className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 cursor-default'
                    >
                      <div className='flex min-w-0 flex-1 items-center space-x-3'>
                        <div className='block flex-shrink-0'>
                          <div className='animate-pulse rounded-full h-10 w-10 mx-auto bg-cardBackgroud dark:bg-cardBackgroudDark '></div>
                        </div>
                        <span className='block min-w-0 flex-1'>
                          <div className='animate-pulse h-4 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </span>
                      </div>
                      <span className='inline-flex h-10 w-10 flex-shrink-0 items-center justify-center'>
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className='h-3 w-3 text-cardIcon dark:text-cardIconDark'
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
                    className='grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 5xl:max-w-screen-2xl'
                  >
                    {infiniteScrollOperators.map((operator: any, index) => {
                      return (
                        <li key={index} className='px-1'>
                          <div className='group flex w-full items-center justify-between space-x-3 rounded-lg py-2 pr-2 pl-6 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cardBackgroud dark:bg-cardBackgroudDark focus:ring-primary dark:focus:ring-primary'>
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
                                    className='block truncate text-sm font-medium text-cardText dark:text-cardTextDark ml-3 cursor-pointer hover:underline'
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
                                    <div
                                      className={`tooltip-operator-information-${index}`}
                                      data-tooltip-id={`tooltip-operator-information-${index}`}
                                      data-tooltip-content={
                                        operator?.conversations[0]?.counterpartName || '-'
                                      }
                                    >
                                      <div className='py-2 px-3 flex items-center'>
                                        <div className='flex w-45 items-center'>
                                          <CallDuration
                                            startTime={operator?.conversations[0]?.startTime}
                                            className='relative top-px mr-1.5 text-cardTextBusy dark:text-cardTextBusy leading-5 text-sm font-medium font-mono'
                                          />
                                          <TextScroll
                                            text={operator?.conversations[0]?.counterpartName}
                                          ></TextScroll>
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
                                        id={`tooltip-operator-information-${index}`}
                                        className='pi-z-20'
                                      />
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
                                        <span className='text-sm not-italic font-medium leading-5 text-cardTextBusy dark:text-cardTextBusy'>
                                          {t('Operators.Busy')}
                                        </span>
                                      ) : (
                                        <div className='flex items-center text-cardTextBusy dark:text-cardTextBusy'>
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
                                          : 'text-cardTextBusy dark:text-cardTextBusy'
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
                                  className='h-4 w-4 text-cardIcon dark:text-cardIconDark cursor-pointer'
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

            {/* grouped layout skeleton */}
            {((layout === 'grouped' && !operatorsStore.isOperatorsLoaded) || isApplyingFilters) && (
              <ul
                role='list'
                className='grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 5xl:max-w-screen-2xl'
              >
                {Array.from(Array(24)).map((e, index) => (
                  <li key={index} className='px-1'>
                    <button
                      type='button'
                      className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cardBackgroud dark:bg-cardBackgroudDark  cursor-default'
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
                          className='h-3 w-3 text-cardIcon dark:text-cardIconDark'
                          aria-hidden='true'
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* compact layout operators */}
            {layout === 'grouped' &&
              operatorsStore?.isOperatorsLoaded &&
              !operatorsStore?.errorMessage &&
              !isEmpty(filteredOperators) && (
                <InfiniteScroll
                  dataLength={infiniteScrollOperators?.length}
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
                  {infiniteScrollOperators.map((category: any, index: number) => (
                    <div key={index} className='mb-4'>
                      <div className='flex items-start'>
                        <Badge
                          size='small'
                          variant='category'
                          rounded='full'
                          className='overflow-hidden ml-1 mb-5 mt-4'
                        >
                          <div className='truncate w-20 lg:w-16 xl:w-20'>
                            {upperCaseFirstLetter(category?.category || '')}
                          </div>
                        </Badge>
                      </div>

                      <ul
                        role='list'
                        className='grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 5xl:max-w-screen-2xl'
                      >
                        {category?.members?.map((operator: any, operatorIndex: number) => (
                          <li key={operatorIndex} className='px-1'>
                            <div className='group flex w-full items-center justify-between space-x-3 rounded-lg py-2 pr-2 pl-6 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cardBackgroud dark:bg-cardBackgroudDark  focus:ring-primary dark:focus:ring-primary'>
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
                                      <div
                                        className={`tooltip-operator-information-${index}`}
                                        data-tooltip-id={`tooltip-operator-information-${index}`}
                                        data-tooltip-content={
                                          operator?.conversations[0]?.counterpartName || '-'
                                        }
                                      >
                                        <div className='py-2 px-3 flex items-center'>
                                          <div className='flex w-45 items-center'>
                                            <CallDuration
                                              startTime={operator?.conversations[0]?.startTime}
                                              className='relative top-px mr-1.5 text-cardTextBusy dark:text-cardTextBusy leading-5 text-sm font-medium font-mono'
                                            />
                                            <TextScroll
                                              text={operator?.conversations[0]?.counterpartName}
                                            ></TextScroll>
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
                                          id={`tooltip-operator-information-${index}`}
                                          className='pi-z-20'
                                        />
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
                                          <span className='text-sm not-italic font-medium leading-5 text-cardTextBusy dark:text-cardTextBusy'>
                                            {t('Operators.Busy')}
                                          </span>
                                        ) : (
                                          <div className='flex items-center text-cardTextBusy dark:text-cardTextBusy'>
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
                                            : 'text-cardTextBusy dark:text-cardTextBusy'
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
                                    className='h-4 w-4 text-cardIcon dark:text-cardIconDark cursor-pointer'
                                    aria-hidden='true'
                                  />
                                </span>
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
