// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { Avatar, Badge, EmptyState, InlineNotification } from '../components/common'
import {
  AVAILABLE_STATUSES,
  callOperator,
  getAllAvatars,
  getExtensions,
  getGroups,
  getUserEndpointsAll,
  openShowOperatorDrawer,
  searchStringInOperator,
  sortByFavorite,
  sortByOperatorStatus,
  UNAVAILABLE_STATUSES,
} from '../lib/operators'
import { isEmpty, debounce } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { Filter, OperatorStatusBadge } from '../components/operators'
import { sortByProperty } from '../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faFilter, faHeadset } from '@fortawesome/free-solid-svg-icons'
import { loadPreference } from '../lib/storage'

//// use i18n where there is operator.mainPresence

const Operators: NextPage = () => {
  const [isOperatorsLoaded, setOperatorsLoaded] = useState(false)
  const [operators, setOperators]: any = useState({})
  const [filteredOperators, setFilteredOperators]: any = useState({})
  const [operatorsError, setOperatorsError] = useState('')
  const [groups, setGroups]: any = useState({})
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

  const [layout, setLayout] = useState('')
  const updateLayout = (newLayout: string) => {
    setLayout(newLayout)
  }

  const applyFilters = (operators: any) => {
    if (!(groupFilter && statusFilter && sortByFilter)) {
      return
    }

    // text filter
    let filteredOperators = Object.values(operators).filter((op) =>
      searchStringInOperator(op, textFilter),
    )

    // group filter
    if (groupFilter === 'favorites') {
      filteredOperators = filteredOperators.filter((op: any) => {
        return op.favorite
      })
    } else {
      filteredOperators = filteredOperators.filter((op: any) => {
        return groupFilter === 'all' || op.group === groupFilter
      })
    }

    // status filter
    filteredOperators = filteredOperators.filter((op: any) => {
      return (
        statusFilter === 'all' ||
        (statusFilter === 'available' && AVAILABLE_STATUSES.includes(op.mainPresence)) ||
        (statusFilter === 'unavailable' && UNAVAILABLE_STATUSES.includes(op.mainPresence)) ||
        (statusFilter === 'offline' && op.mainPresence === 'offline') ||
        (statusFilter === 'allButOffline' && op.mainPresence !== 'offline')
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
  }

  // retrieve operators
  useEffect(() => {
    async function fetchOperators() {
      if (!isOperatorsLoaded) {
        try {
          // get operators
          let operators = await getUserEndpointsAll()

          // get favorites
          const favoriteOperators = loadPreference('favoriteOperators', auth.username) || []

          for (const username of favoriteOperators) {
            operators[username].favorite = true
          }

          //// remove mock
          // let i = 0
          // Object.keys(operators).map((key, index) => {
          //   const operator = operators[key]
          //   const statuses = [
          //     'online',
          //     'dnd',
          //     'voicemail',
          //     'cellphone',
          //     'callforward',
          //     'busy',
          //     'incoming',
          //     'ringing',
          //     'offline',
          //   ]
          //   operator.mainPresence = statuses[i]
          //   i = (i + 1) % statuses.length

          //   // mock email
          //   operator.endpoints.email.push({
          //     id: `${operator.username}@test.org`,
          //   })
          // })

          try {
            // get avatars
            const avatars = await getAllAvatars()

            for (const [username, avatarBase64] of Object.entries(avatars)) {
              if (operators[username]) {
                operators[username].avatarBase64 = avatarBase64
              }
            }

            try {
              // get groups
              const groups = await getGroups()
              setGroups(Object.keys(groups))

              for (let [group, users] of Object.entries(groups)) {
                // @ts-ignore
                for (const username of users.users) {
                  if (operators[username]) {
                    operators[username].group = group
                  }
                }
              }

              try {
                // get conversations
                const extensions = await getExtensions()

                for (const [extNum, extData] of Object.entries(extensions)) {
                  // @ts-ignore
                  if (!isEmpty(extData.conversations)) {
                    const opFound: any = Object.values(operators).find((op: any) => {
                      return op.endpoints.extension.some((ext: any) => ext.id === extNum)
                    })

                    if (opFound) {
                      // @ts-ignore
                      Object.values(extData.conversations).forEach((conv) => {
                        let conversations = opFound.conversations || []
                        conversations.push(conv)
                        opFound.conversations = conversations
                      })
                    }
                  }
                }
                setOperators(operators)
                applyFilters(operators)
                setOperatorsLoaded(true)
              } catch (e) {
                console.error(e)
                setOperatorsError('Cannot retrieve conversations')
                setOperatorsLoaded(true)
              }
            } catch (e) {
              console.error(e)
              setOperatorsError('Cannot retrieve groups')
              setOperatorsLoaded(true)
            }
          } catch (e) {
            console.error(e)
            setOperatorsError('Cannot retrieve avatars')
            setOperatorsLoaded(true)
          }
        } catch (e) {
          console.error(e)
          setOperatorsError('Cannot retrieve user endpoints')
          setOperatorsLoaded(true)
        }
      }
    }
    fetchOperators()
  }, [isOperatorsLoaded, operators])

  // filtered operators
  useEffect(() => {
    applyFilters(operators)
  }, [operators, textFilter, groupFilter, statusFilter, sortByFilter])

  const operatorsStore = useSelector((state: RootState) => state.operators)

  // reload operators
  useEffect(() => {
    setOperatorsLoaded(false)
  }, [operatorsStore])

  return (
    <>
      <div>
        <Filter
          groups={groups}
          updateTextFilter={debouncedUpdateTextFilter}
          updateGroupFilter={updateGroupFilter}
          updateStatusFilter={updateStatusFilter}
          updateSort={updateSort}
          updateLayout={updateLayout}
        />
        {/* operators error */}
        {operatorsError && (
          <InlineNotification type='error' title={operatorsError}></InlineNotification>
        )}
        <div className='mx-auto max-w-7xl text-center'>
          {/* empty state */}
          {isOperatorsLoaded && !operatorsError && isEmpty(operators) && (
            <EmptyState
              title='No operator'
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
          {isOperatorsLoaded && !operatorsError && isEmpty(filteredOperators) && (
            <EmptyState
              title='No operator'
              description='Try changing your search filters'
              icon={
                <FontAwesomeIcon icon={faFilter} className='mx-auto h-12 w-12' aria-hidden='true' />
              }
            />
          )}
          {/* standard layout skeleton */}
          {layout === 'standard' && !isOperatorsLoaded && (
            <div className='space-y-8 sm:space-y-12 py-8'>
              <ul
                role='list'
                className='mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-5xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-5'
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
            isOperatorsLoaded &&
            !operatorsError &&
            !isEmpty(filteredOperators) && (
              <div className='space-y-8 sm:space-y-12 py-8'>
                <ul
                  role='list'
                  className='mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-5xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-5'
                >
                  {isOperatorsLoaded &&
                    !isEmpty(filteredOperators) &&
                    Object.keys(filteredOperators).map((key, index) => {
                      const operator = filteredOperators[key]
                      return (
                        <li key={index}>
                          <div className='space-y-4'>
                            <Avatar
                              src={operator.avatarBase64}
                              placeholderType='person'
                              size='extra_large'
                              bordered
                              star={operator.favorite}
                              onClick={() => openShowOperatorDrawer(operator)}
                              className='mx-auto cursor-pointer'
                            />
                            <div className='space-y-2'>
                              <div className='text-xs font-medium lg:text-sm'>
                                <h3
                                  className='cursor-pointer hover:underline'
                                  onClick={() => openShowOperatorDrawer(operator)}
                                >
                                  {operator.name}
                                </h3>
                                <div className='mt-3'>
                                  <OperatorStatusBadge
                                    operator={operator}
                                    currentUsername={auth.username}
                                    callEnabled={true}
                                    onCall={callOperator}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                </ul>
              </div>
            )}
          {/* compact layout skeleton */}
          {layout === 'compact' && !isOperatorsLoaded && (
            <ul role='list' className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3'>
              {Array.from(Array(24)).map((e, index) => (
                <li key={index}>
                  <button
                    type='button'
                    className='group flex w-full items-center justify-between space-x-3 rounded-lg border p-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-primary dark:focus:ring-primary cursor-default'
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
            isOperatorsLoaded &&
            !operatorsError &&
            !isEmpty(filteredOperators) && (
              <ul
                role='list'
                className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3'
              >
                {Object.keys(filteredOperators).map((key, index) => {
                  const operator = filteredOperators[key]
                  return (
                    <li key={index}>
                      <button
                        type='button'
                        onClick={() => openShowOperatorDrawer(operator)}
                        className='group flex w-full items-center justify-between space-x-3 rounded-lg border p-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-primary dark:focus:ring-primary'
                      >
                        <span className='flex min-w-0 flex-1 items-center space-x-3'>
                          <span className='block flex-shrink-0'>
                            <Avatar
                              src={operator.avatarBase64}
                              placeholderType='person'
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
                              {operator.mainPresence === 'busy' &&
                              operator.conversations?.length ? (
                                <Badge rounded='full' variant='busy' size='small'>
                                  <span className='mr-3'>
                                    {operator.conversations[0].counterpartName ||
                                      operator.conversations[0].counterpartNum}
                                  </span>
                                  {/* //// TODO format duration */}
                                  <span>{operator.conversations[0].duration}</span>
                                </Badge>
                              ) : (
                                <OperatorStatusBadge
                                  operator={operator}
                                  currentUsername={auth.username}
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
            )}
        </div>
      </div>
    </>
  )
}

export default Operators
