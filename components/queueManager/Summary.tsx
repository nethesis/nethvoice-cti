// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState, Avatar } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faChevronDown,
  faChevronUp,
  faCheck,
  faHeadset,
  faCircleNotch,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { LoggedStatus } from '../queues'
import { openShowOperatorDrawer } from '../../lib/operators'

import { Listbox, Transition } from '@headlessui/react'
import {
  getQueues,
  getQueueStats,
  getAgentsStats,
  getExpandedSummaryValue,
  searchStringInQueuesMembers,
} from '../../lib/queueManager'
import { QueueManagementFilterOperators } from './QueueManagementFilterOperators'
import { isEmpty, debounce, capitalize } from 'lodash'
import { sortByProperty, invertObject, sortByBooleanProperty } from '../../lib/utils'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getInfiniteScrollOperatorsPageSize } from '../../lib/operators'
import { savePreference } from '../../lib/storage'
import { SummaryChart } from './SummaryChart'

export interface SummaryProps extends ComponentProps<'div'> {}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const Summary: FC<SummaryProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()

  const { operators } = useSelector((state: RootState) => state.operators)

  // operator toggle status
  const [expanded, setExpanded] = useState(false)

  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

  const [selectedValue, setSelectedValue] = useState<any>(
    Object.keys(queueManagerStore.queues)?.[0] || '',
  )

  //save selected queue inside local storage
  const handleSelectedValue = (newValueQueue: any) => {
    setSelectedValue(newValueQueue)
    let currentSelectedQueue = newValueQueue
    savePreference('queuesSummarySelectedQueuePreference', currentSelectedQueue, auth.username)
  }

  const auth = useSelector((state: RootState) => state.authentication)

  const [expandedQueuesSummary, setExpandedQueuesSummary] = useState(false)

  const toggleExpandQueue = () => {
    setExpanded(!expanded)
    let correctExpandedOperatorsSummary = !expanded
    savePreference(
      'operatorsSummaryExpandedPreference',
      correctExpandedOperatorsSummary,
      auth.username,
    )
  }

  const toggleQueuesSummary = () => {
    setExpandedQueuesSummary(!expandedQueuesSummary)
    let correctExpandedQueuesSummary = !expandedQueuesSummary
    savePreference('queuesSummaryExpandedPreference', correctExpandedQueuesSummary, auth.username)
  }

  //set expanded values at the beginning
  useEffect(() => {
    const expandedValues = getExpandedSummaryValue(auth.username)
    setExpanded(expandedValues.expandedOperators)
    setExpandedQueuesSummary(expandedValues.expandedQueues)
    setSelectedValue(expandedValues.selectedSummaryQueue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [firstRenderQueuesList, setFirstRenderQueuesList]: any = useState(true)
  const [isLoadedQueues, setLoadedQueues] = useState(false)
  const [queuesList, setQueuesList] = useState<any>({})

  //get queues list
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderQueuesList) {
      setFirstRenderQueuesList(false)
      return
    }
    async function getQueuesInformation() {
      setLoadedQueues(false)
      try {
        const res = await getQueues()
        setQueuesList(res)
      } catch (err) {
        console.error(err)
      }
      setLoadedQueues(true)
    }
    if (!isLoadedQueues) {
      getQueuesInformation()
    }
  }, [firstRenderQueuesList, isLoadedQueues])

  const [allQueuesStats, setAllQueuesStats] = useState(false)
  const [firstRenderQueuesStats, setFirstRenderQueuesStats]: any = useState(true)
  const [isLoadedQueuesStats, setLoadedQueuesStats] = useState(false)

  //get selected queue status information
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderQueuesStats) {
      setFirstRenderQueuesStats(false)
      return
    }
    async function getQueuesStats() {
      //set loaded status to false
      setLoadedQueuesStats(false)
      try {
        setAllQueuesStats(false)
        //get list of queues from queue manager store
        const queuesName = Object.keys(queuesList)
        //get number of queues
        const queuesLength = queuesName.length

        // Get statuses for each queue from webrest/astproxy/qmanager_qstats/name queue
        for (let i = 0; i < queuesLength; i++) {
          const key = queuesName[i]
          const res = await getQueueStats(key)

          if (queuesList[key]) {
            queuesList[key].qstats = res
          }
        }

        setAllQueuesStats(true)
      } catch (err) {
        console.error(err)
      }
    }
    if (!isLoadedQueuesStats) {
      getQueuesStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuesList, selectedValue, firstRenderQueuesStats])

  const [textFilter, setTextFilter]: any = useState('')
  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
  }

  const [statusFilter, setStatusFilter]: any = useState('')
  const updateStatusFilter = (newStatusFilter: string) => {
    setStatusFilter(newStatusFilter)
  }

  const [sortByFilter, setSortByFilter]: any = useState('')
  const updateSort = (newSortBy: string) => {
    setSortByFilter(newSortBy)
  }

  const debouncedUpdateTextFilter = useMemo(() => debounce(updateTextFilter, 400), [])

  const [summaryAgent, setSummaryAgent] = useState<any>({})
  const [summaryAgentConvertedArray, setSummaryAgentConvertedArray] = useState<any>([])
  const [invertedOperatorInformation, setInvertedOperatorInformation] = useState<any>()

  // load operators information from the store
  const operatorsStore = useSelector((state: RootState) => state.operators) as Record<string, any>

  // invert key to use getAvatarData function
  useEffect(() => {
    if (operatorsStore) {
      setInvertedOperatorInformation(invertObject(operatorsStore.operators))
    }
  }, [operatorsStore])

  const [infiniteScrollOperators, setInfiniteScrollOperators] = useState<any>([])
  const infiniteScrollOperatorsPageSize = getInfiniteScrollOperatorsPageSize()

  const [infiniteScrollLastIndex, setInfiniteScrollLastIndex] = useState(
    infiniteScrollOperatorsPageSize,
  )
  const [infiniteScrollHasMore, setInfiniteScrollHasMore] = useState(false)

  const [isApplyingFilters, setApplyingFilters]: any = useState(false)

  useEffect(() => {
    // Function to fetch summary agent data
    const getSummaryAgents = async () => {
      try {
        // New object for agents
        const newSummaryAgents: any = {}

        // Iterate through each queue in queuesList
        for (const queueId in queuesList) {
          const queue = queuesList[queueId]

          // Iterate through each member in the queue
          for (const memberId in queue.members) {
            const member = queue.members[memberId]

            // If the agent doesn't exist in the new object, add them
            if (!newSummaryAgents[memberId]) {
              newSummaryAgents[memberId] = {
                queues: {},
                answeredcalls: 0,
                noanswercalls: 0,
                lastcall: 0,
                name: member.name,
                member: member.member,
              }
            }

            // Add the queue details to the agent in the new object
            newSummaryAgents[memberId].queues[queueId] = {
              ...member,
              qname: queue.name,
            }
          }
        }

        // Fetch the real-time stats for agents
        const res = await getAgentsStats()
        const agentsRealTimeStats = res

        // Update the agents' data with the real-time stats
        for (const agentId in newSummaryAgents) {
          const agent = newSummaryAgents[agentId]

          for (const queueId in agent.queues) {
            const queue = agent.queues[queueId]

            // Check if the real-time stats exist for the agent and queue
            if (agentsRealTimeStats[agent.name] && agentsRealTimeStats[agent.name][queueId]) {
              queue.stats = agentsRealTimeStats[agent.name][queueId]

              // Update answered calls count
              if (queue.stats.calls_taken) {
                agent.answeredcalls += queue.stats.calls_taken
              }
              // Update answered calls count
              if (queue.stats.no_answer_calls) {
                agent.noanswercalls += queue.stats.no_answer_calls
              }
              // Update last call time
              if (queue.stats.last_call_time) {
                const lastCallTime = queue.stats.last_call_time
                if (lastCallTime > agent.lastcall) {
                  agent.lastcall = lastCallTime
                }
              }
            }
          }
        }

        // Update state with the new agent object
        setSummaryAgent(newSummaryAgents)

        // Convert object to an array
        const agentArray: any[] = Object.values(newSummaryAgents)

        agentArray.forEach((member: any) => {
          if (invertedOperatorInformation[member.name]) {
            member.shortname = invertedOperatorInformation[member.name]
          }
        })

        setSummaryAgentConvertedArray(agentArray)
        setInfiniteScrollOperators(agentArray.slice(0, infiniteScrollLastIndex))
        const hasMore = infiniteScrollLastIndex < agentArray.length
        setInfiniteScrollHasMore(hasMore)
        setApplyingFilters(false)
      } catch (err) {
        console.error(err)
      }
    }

    getSummaryAgents()
  }, [queuesList])

  const [filteredAgentMembers, setFilteredAgentMembers]: any = useState([])

  // apply filters when operators data has been loaded and operator menu is opened
  useEffect(() => {
    if (
      queueManagerStore?.isLoaded &&
      queueManagerStore?.queues[selectedValue?.queue]?.allQueueOperators
    ) {
      applyFilters(queueManagerStore?.queues[selectedValue?.queue]?.allQueueOperators)
    }
  }, [selectedValue, textFilter, sortByFilter, statusFilter, queueManagerStore.isLoaded])

  const applyFilters = (operators: any) => {
    if (!(statusFilter && sortByFilter)) {
      return
    }
    setApplyingFilters(true)
    // text filter
    let filteredAgentMembers: any = Object.values(operators).filter((op) =>
      searchStringInQueuesMembers(op, textFilter),
    )

    // status filter
    filteredAgentMembers = filteredAgentMembers.filter((member: any) => {
      return (
        statusFilter === 'all' ||
        (statusFilter === 'connected' && member.loggedIn) ||
        (statusFilter === 'disconnected' && !member.loggedIn)
      )
    })
    // sort operators
    switch (sortByFilter) {
      case 'name':
        filteredAgentMembers.sort(sortByProperty('name'))
        break
      case 'status':
        filteredAgentMembers.sort(sortByBooleanProperty('loggedIn'))
        break
    }

    setFilteredAgentMembers(filteredAgentMembers)

    setInfiniteScrollOperators(filteredAgentMembers.slice(0, infiniteScrollLastIndex))
    const hasMore = infiniteScrollLastIndex < filteredAgentMembers.length
    setInfiniteScrollHasMore(hasMore)
    setApplyingFilters(false)
  }

  const showMoreInfiniteScrollOperators = () => {
    const lastIndex = infiniteScrollLastIndex + infiniteScrollOperatorsPageSize
    setInfiniteScrollLastIndex(lastIndex)
    setInfiniteScrollOperators(summaryAgentConvertedArray.slice(0, lastIndex))
    const hasMore = lastIndex < summaryAgentConvertedArray.length
    setInfiniteScrollHasMore(hasMore)
  }

  const [openedCardIndexes, setOpenedCardIndexes] = useState<number[]>([])
  const toggleExpandAgentCard = (index: number) => {
    const isOpen = openedCardIndexes.includes(index)
    if (isOpen) {
      setOpenedCardIndexes(openedCardIndexes.filter((i) => i !== index))
    } else {
      setOpenedCardIndexes([...openedCardIndexes, index])
    }
  }

  const [avatarIcon, setAvatarIcon] = useState<any>()

  // get operator avatar base64 from the store
  useEffect(() => {
    if (operatorsStore && !avatarIcon) {
      setAvatarIcon(operatorsStore.avatars)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/* Tab title  */}

      {/* Queues summary  */}
      <div className='flex items-center space-x-1'>
        <div className='flex-grow'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {t('QueueManager.Queues summary')}
          </h2>
        </div>
        <div className='flex items-center justify-end h-6 w-6'>
          <FontAwesomeIcon
            icon={expandedQueuesSummary ? faChevronDown : faChevronUp}
            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
            aria-hidden='true'
            onClick={toggleQueuesSummary}
          />
        </div>
      </div>

      {/* divider */}
      <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1 mb-4'></div>
      {expandedQueuesSummary && (
        // Queue selection
        <>
          <Listbox value={selectedValue} onChange={handleSelectedValue}>
            {({ open }) => (
              <>
                <div className='flex items-center'>
                  <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                    {t('QueueManager.Select queue')}
                  </Listbox.Label>
                  <div className='relative'>
                    <Listbox.Button className='relative cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pl-3 pr-10 text-left w-60 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 inline-block'>
                      <span className='block truncate'>
                        {selectedValue.name ? selectedValue.name : 'Select queue'}
                      </span>
                      <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </span>
                    </Listbox.Button>

                    <Transition
                      show={open}
                      as={Fragment}
                      leave='transition ease-in duration-100'
                      leaveFrom='opacity-100'
                      leaveTo='opacity-0'
                    >
                      <Listbox.Options className='absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 dark:bg-gray-900 ring-black ring-opacity-5 focus:outline-none sm:text-sm h-auto'>
                        {Object.entries<any>(queueManagerStore.queues).map(
                          ([queueId, queueInfo]) => (
                            <Listbox.Option
                              key={queueId}
                              className={({ active }) =>
                                classNames(
                                  active
                                    ? 'bg-primary text-white'
                                    : 'text-gray-900 dark:text-gray-100',
                                  'relative cursor-default select-none py-2 pl-8 pr-4',
                                )
                              }
                              value={queueInfo}
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={classNames(
                                      selected ? 'font-semibold' : 'font-normal',
                                      'block truncate',
                                    )}
                                  >
                                    {queueInfo.name} ({queueInfo.queue})
                                  </span>

                                  {selected || selectedValue.queue === queueId ? (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-primary',
                                        'absolute inset-y-0 left-0 flex items-center pl-1.5',
                                      )}
                                    >
                                      <FontAwesomeIcon
                                        icon={faCheck}
                                        className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                                        aria-hidden='true'
                                      />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ),
                        )}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </div>
              </>
            )}
          </Listbox>

          <SummaryChart></SummaryChart>
        </>
      )}

      {/* Operator summary */}
      <div className='flex items-center space-x-1 pt-8'>
        <div className='flex-grow'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {t('QueueManager.Operators summary')}
          </h2>
        </div>
        <div className='flex items-center justify-end h-6 w-6'>
          <FontAwesomeIcon
            icon={expanded ? faChevronDown : faChevronUp}
            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
            aria-hidden='true'
            onClick={toggleExpandQueue}
          />
        </div>
      </div>

      {/* divider */}
      <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>

      {expanded && (
        <div className='pt-6'>
          <QueueManagementFilterOperators
            updateTextFilter={debouncedUpdateTextFilter}
            updateStatusFilter={updateStatusFilter}
            updateSort={updateSort}
          ></QueueManagementFilterOperators>
          <div className='mx-auto text-center max-w-7xl 5xl:max-w-screen-2xl'>
            {/* empty state */}
            {allQueuesStats && isEmpty(queueManagerStore?.queues[selectedValue.queue]?.members) && (
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
            {/* TO DO CHECK THE SKELETON */}
            {/* skeleton */}
            {!allQueuesStats ||
              (!queueManagerStore?.queues && (
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
              ))}
            {/* compact layout operators */}
            {allQueuesStats &&
              queueManagerStore?.queues[selectedValue.queue]?.allQueueOperators?.length > 0 && (
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
                    {infiniteScrollOperators.map((operator: any, index: any) => {
                      return (
                        <li key={index} className='px-1'>
                          <button
                            type='button'
                            onClick={() => openShowOperatorDrawer(operators[operator.shortname])}
                            className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-primary dark:focus:ring-primary'
                          >
                            <span className='flex min-w-0 flex-1 items-center space-x-3'>
                              <span className='block flex-shrink-0'>
                                <Avatar
                                  rounded='full'
                                  src={operators[operator.shortname]?.avatarBase64}
                                  placeholderType='operator'
                                  size='small'
                                  status={operators[operator.shortname]?.mainPresence}
                                  onClick={() =>
                                    openShowOperatorDrawer(operators[operator.shortname])
                                  }
                                />
                              </span>
                              <span className='block min-w-0 flex-1'>
                                <span className='block truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                                  {operator.name}
                                </span>
                                <span className='block truncate mt-1 text-sm font-medium text-gray-500 dark:text-gray-500'>
                                  <LoggedStatus
                                    loggedIn={operator.loggedIn}
                                    paused={operator.paused}
                                  />
                                </span>
                              </span>
                            </span>
                            <span className='inline-flex h-10 w-10 flex-shrink-0 items-center justify-center m-2'>
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
      )}
    </>
  )
}

Summary.displayName = 'Summary'
