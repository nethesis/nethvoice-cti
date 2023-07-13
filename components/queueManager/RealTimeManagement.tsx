// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, EmptyState, IconSwitch, TextInput } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { Tooltip } from 'react-tooltip'
import { debounce, isEmpty } from 'lodash'
import {
  faChevronDown,
  faChevronUp,
  faUserCheck,
  faUserClock,
  faUserXmark,
  faHeadset,
  faStar as faStarSolid,
  faCircleNotch,
  faStopwatch,
  faUser,
  faPhone,
  faCircleXmark,
  faFilter,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarLight } from '@nethesis/nethesis-light-svg-icons'
import {
  searchStringInQueue,
  addQueueToFavorites,
  removeQueueFromFavorites,
  addQueueToExpanded,
  removeQueueFromExpanded,
} from '../../lib/queuesLib'

import {
  getAgentsStats,
  getExpandedRealtimeValue,
  searchOperatorsInQueuesMembers,
} from '../../lib/queueManager'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getInfiniteScrollOperatorsPageSize } from '../../lib/operators'
import { sortByProperty, sortByFavorite } from '../../lib/utils'
import { savePreference } from '../../lib/storage'
import BarChartHorizontalWithTitle from '../chart/HorizontalWithTitle'
import { RealTimeOperatorsFilter } from './RealTimeOperatorsFilter'
import { openShowOperatorDrawer } from '../../lib/operators'

export interface RealTimeManagementProps extends ComponentProps<'div'> {}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const RealTimeManagement: FC<RealTimeManagementProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()

  const infiniteScrollOperatorsPageSize = getInfiniteScrollOperatorsPageSize()
  const [infiniteScrollLastIndex, setInfiniteScrollLastIndex] = useState(
    infiniteScrollOperatorsPageSize,
  )
  const [infiniteScrollOperators, setInfiniteScrollOperators] = useState<any>([])
  const [infiniteScrollHasMore, setInfiniteScrollHasMore] = useState(false)

  const [queuesStatisticsExpanded, setQueuesStatisticsExpanded] = useState(false)
  const [operatorsStatisticsExpanded, setOperatorsStatisticsExpanded] = useState(false)

  const [realTimeAgent, setRealTimeAgent] = useState<any>({})
  const [realTimeAgentConvertedArray, setRealTimeAgentConvertedArray] = useState<any>([])

  const authStore = useSelector((state: RootState) => state.authentication)

  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

  // load extensions information from the store
  const { operators } = useSelector((state: RootState) => state.operators) as Record<string, any>

  const toggleFavoriteQueue = (queue: any) => {
    const queueId = queue.queue
    const isFavorite = !queue.favorite
    store.dispatch.queueManagerQueues.setQueueFavorite(queueId, isFavorite)

    if (isFavorite) {
      addQueueToFavorites(queueId, authStore.username)
    } else {
      removeQueueFromFavorites(queueId, authStore.username)
    }
  }

  const toggleExpandQueuesStatistics = () => {
    setQueuesStatisticsExpanded(!queuesStatisticsExpanded)
    let correctExpandQueuesStatistics = !queuesStatisticsExpanded
    savePreference(
      'queueManagerRealtimeQueuesPreference',
      correctExpandQueuesStatistics,
      authStore.username,
    )
  }

  const toggleExpandOperatorsStatistics = () => {
    setOperatorsStatisticsExpanded(!operatorsStatisticsExpanded)
    let correctExpandOperatorsStatistics = !operatorsStatisticsExpanded
    savePreference(
      'queueManagerRealtimeOperatorPreference',
      correctExpandOperatorsStatistics,
      authStore.username,
    )
  }

  //Load expanded chevron values from local storage
  useEffect(() => {
    const expandedValues = getExpandedRealtimeValue(authStore.username)
    setQueuesStatisticsExpanded(expandedValues.expandedQueuesStatistics)
    setOperatorsStatisticsExpanded(expandedValues.expandedOperatorsStatistics)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Queues filter section
  const [textFilter, setTextFilter]: any = useState('')
  const [debouncedTextFilter, setDebouncedTextFilter] = useState(false)

  const toggleDebouncedTextFilter = () => {
    setDebouncedTextFilter(!debouncedTextFilter)
  }

  const changeTextFilter = (event: any) => {
    const newTextFilter = event.target.value
    setTextFilter(newTextFilter)
    debouncedUpdateTextFilter()
  }

  const debouncedUpdateTextFilter = useMemo(
    () => debounce(toggleDebouncedTextFilter, 400),
    [debouncedTextFilter],
  )

  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const clearTextFilter = () => {
    setTextFilter('')
    debouncedUpdateTextFilter()
    textFilterRef.current.focus()
  }

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilter.cancel()
    }
  }, [debouncedUpdateTextFilter])

  //End of queues text filter

  // Operators filter section
  const [textFilterOperators, setTextFilterOperators]: any = useState('')
  const updateTextFilterOperators = (newTextFilterOperators: string) => {
    setTextFilterOperators(newTextFilterOperators)
  }

  const debouncedUpdateTextFilterOperator = useMemo(
    () => debounce(updateTextFilterOperators, 400),
    [],
  )

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilterOperator.cancel()
    }
  }, [debouncedUpdateTextFilterOperator])

  //Update selected queues
  const [queuesFilter, setQueuesFilter]: any = useState([])
  const updateQueuesFilter = (newQueuesFilter: string[]) => {
    setQueuesFilter(newQueuesFilter)
    // setCallsLoaded(false)
  }

  //End of operators filter

  const [filteredQueues, setFilteredQueues]: any = useState({})

  const [isApplyingFilters, setApplyingFilters]: any = useState(false)

  //declaration of apply filter
  const applyFiltersQueues = () => {
    setApplyingFilters(true)

    // text filter
    let filteredQueues = Object.values(queueManagerStore.queues).filter((queue) =>
      searchStringInQueue(queue, textFilter),
    )

    // sort queues
    filteredQueues.sort(sortByProperty('name'))
    filteredQueues.sort(sortByProperty('queue'))
    filteredQueues.sort(sortByFavorite)

    setFilteredQueues(filteredQueues)
    setApplyingFilters(false)
  }

  const [filteredAgentMembers, setFilteredAgentMembers]: any = useState([])

  const [isApplyingFiltersOperators, setApplyingFiltersOperators]: any = useState(false)

  const applyFiltersOperators = () => {
    setApplyingFiltersOperators(true)
    // text filter
    let filteredAgentMembers: any = Object.values(realTimeAgentConvertedArray).filter((op) =>
      searchOperatorsInQueuesMembers(op, textFilterOperators, queuesFilter),
    )

    setFilteredAgentMembers(filteredAgentMembers)

    setInfiniteScrollOperators(filteredAgentMembers.slice(0, infiniteScrollLastIndex))
    const hasMore = infiniteScrollLastIndex < filteredAgentMembers.length
    setInfiniteScrollHasMore(hasMore)
    setApplyingFiltersOperators(false)
  }

  // filtered queues
  useEffect(() => {
    applyFiltersQueues()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueManagerStore, textFilter])

  // filtered operators
  useEffect(() => {
    if (realTimeAgentConvertedArray) {
      applyFiltersOperators()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realTimeAgentConvertedArray, textFilterOperators, queuesFilter])

  const toggleExpandQueue = (queue: any) => {
    const queueId = queue.queue
    const isExpanded = !queue.expanded
    store.dispatch.queueManagerQueues.setQueueExpanded(queueId, isExpanded)

    if (isExpanded) {
      addQueueToExpanded(queueId, authStore.username)
    } else {
      removeQueueFromExpanded(queueId, authStore.username)
    }
    applyFiltersQueues()
  }

  const [openedCardIndexes, setOpenedCardIndexes] = useState<number[]>([])

  const toggleExpandAgentCard = (index: number) => {
    if (openedCardIndexes.includes(index)) {
      setOpenedCardIndexes(openedCardIndexes.filter((i) => i !== index))
    } else {
      setOpenedCardIndexes([...openedCardIndexes, index])
    }
  }

  // load extensions information from the store
  const operatorsStore = useSelector((state: RootState) => state.operators) as Record<string, any>

  const [realTimeAgentCounters, setRealTimeAgentCounters] = useState<any>({})

  useEffect(() => {
    const updateCounters = () => {
      let updatedCounters: Record<string, any> = {
        counters: {},
        waiting: 0,
        connected: 0,
        online: 0,
        offline: 0,
        paused: 0,
        busy: 0,
        free: 0,
        tot: 0,
      }

      for (const q in queueManagerStore?.queues) {
        updatedCounters.counters[q] = {
          total: 0,
          waiting: 0,
          connected: 0,
          online: 0,
          offline: 0,
          paused: 0,
          busy: 0,
          free: 0,
        }
      }

      let waitingCount = 0
      let connectedCount = 0
      let onlineCount = 0
      let offlineCount = 0
      let pausedCount = 0
      let busyCount = 0
      let freeCount = 0

      for (const q in queueManagerStore?.queues) {
        const waitingCallersCount = Object.keys(queueManagerStore?.queues[q].waitingCallers).length
        updatedCounters.counters[q].waiting = waitingCallersCount
        waitingCount += waitingCallersCount

        for (const m in queueManagerStore?.queues[q].members) {
          const member = queueManagerStore?.queues[q].members[m]

          if (member.loggedIn === true) {
            updatedCounters.counters[q].online += 1
            onlineCount += 1
          } else {
            updatedCounters.counters[q].offline += 1
            offlineCount += 1
          }

          if (member.paused === true) {
            updatedCounters.counters[q].paused += 1
            pausedCount += 1
          }

          const memberConversations = operatorsStore.extensions[m]?.conversations
          if (
            memberConversations &&
            Object.keys(memberConversations).length > 0 &&
            memberConversations[Object.keys(memberConversations)[0]].connected === true
          ) {
            updatedCounters.counters[q].busy += 1
            busyCount += 1
          } else if (member.paused === false && member.loggedIn === true) {
            updatedCounters.counters[q].free += 1
            freeCount += 1
          }
        }
      }

      for (const e in operatorsStore.extensions) {
        const conversations = operatorsStore.extensions[e].conversations
        for (const c in conversations) {
          const conversation = conversations[c]
          if (
            conversation.connected === true &&
            conversation.throughQueue === true &&
            queueManagerStore?.queues[conversation.queueId] !== undefined
          ) {
            const queueId = conversation.queueId
            if (updatedCounters.counters[queueId]) {
              updatedCounters.counters[queueId].connected += 1
            } else {
              updatedCounters.counters[queueId] = {
                total: 0,
                waiting: 0,
                connected: 1,
                online: 0,
                offline: 0,
                paused: 0,
                busy: 0,
                free: 0,
              }
            }
            connectedCount += 1
          }
        }
      }

      const total = waitingCount + connectedCount

      for (const q in updatedCounters.counters) {
        updatedCounters.counters[q].total =
          updatedCounters.counters[q].waiting + updatedCounters.counters[q].connected
      }

      updatedCounters.waiting = waitingCount
      updatedCounters.connected = connectedCount
      updatedCounters.online = onlineCount
      updatedCounters.offline = offlineCount
      updatedCounters.paused = pausedCount
      updatedCounters.busy = busyCount
      updatedCounters.free = freeCount
      updatedCounters.tot = total

      setRealTimeAgentCounters(updatedCounters)
    }

    updateCounters()
  }, [queueManagerStore, operatorsStore])

  useEffect(() => {
    // Function to fetch real-time agent data
    const getRealTimeAgents = async () => {
      try {
        const newRealTimeAgents: any = {} // New object for agents

        // Iterate through each queue in queuesList
        for (const queueId in queueManagerStore?.queues) {
          const queue = queueManagerStore?.queues[queueId]

          // Iterate through each member in the queue
          for (const memberId in queue.members) {
            const member = queue.members[memberId]

            // If the agent doesn't exist in the new object, add them
            if (!newRealTimeAgents[memberId]) {
              newRealTimeAgents[memberId] = {
                queues: {},
                answeredcalls: 0,
                lastcall: 0,
                name: member.name,
                member: member.member,
              }
            }

            // Add the queue details to the agent in the new object
            newRealTimeAgents[memberId].queues[queueId] = {
              ...member,
              qname: queue.name,
            }
          }
        }

        // Fetch the real-time stats for agents
        const res = await getAgentsStats()
        const agentsRealTimeStats = res

        // Update the agents' data with the real-time stats
        for (const agentId in newRealTimeAgents) {
          const agent = newRealTimeAgents[agentId]

          for (const queueId in agent.queues) {
            const queue = agent.queues[queueId]

            // Check if the real-time stats exist for the agent and queue
            if (agentsRealTimeStats[agent.name] && agentsRealTimeStats[agent.name][queueId]) {
              queue.stats = agentsRealTimeStats[agent.name][queueId]

              // Update answered calls count
              if (queue.stats.calls_taken) {
                agent.answeredcalls += queue.stats.calls_taken
              }

              // Update last call time
              if (queue.stats.last_call_time) {
                const lastCallTime = queue.stats.last_call_time
                if (lastCallTime > agent.lastcall) {
                  agent.lastcall = lastCallTime
                }
              }

              // Update from last pause time
              if (queue.stats.last_unpaused_time) {
                updateFromLastPause(agentId, queueId, 'realtime')
              }

              // Update from last call time
              if (queue.stats.last_call_time) {
                updateFromLastCall(agentId, queueId, 'realtime')
              }
            }
          }
        }

        // Update state with the new agent object
        setRealTimeAgent(newRealTimeAgents)

        // Convert object to an array
        const agentArray: any[] = Object.values(newRealTimeAgents)

        agentArray.forEach((member: any) => {
          Object.values(member.queues).some((queue: any) => {
            member.shortname = queue.shortname
            return
          })
        })
        setRealTimeAgentConvertedArray(agentArray)
        // setInfiniteScrollOperators(agentArray.slice(0, infiniteScrollLastIndex))
        // const hasMore = infiniteScrollLastIndex < agentArray.length
        // setInfiniteScrollHasMore(hasMore)
        // setApplyingFilters(false)
      } catch (err) {
        console.error(err)
      }
    }

    getRealTimeAgents()
  }, [queueManagerStore])

  const updateFromLastPause = (u: string, n: string, type: string) => {
    // TODO
  }

  const updateFromLastCall = (u: string, n: string, type: string) => {
    // TODO
  }

  const showMoreInfiniteScrollOperators = () => {
    const lastIndex = infiniteScrollLastIndex + infiniteScrollOperatorsPageSize
    setInfiniteScrollLastIndex(lastIndex)
    setInfiniteScrollOperators(filteredAgentMembers.slice(0, lastIndex))
    const hasMore = lastIndex < filteredAgentMembers.length
    setInfiniteScrollHasMore(hasMore)
  }

  // Labels for queues chart
  const labelsCalls = ['Waiting calls', 'Connected calls', 'Total']
  const labelsOperators = ['Online', 'On a break', 'Offline', 'Busy', 'Free']

  return (
    <>
      {/* Dashboard queue active section */}
      <div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Connected calls */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.connected}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Connected calls')}
                </span>
              </div>
            </div>
          </div>

          {/* Online operators */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faUserClock}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.online}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Online operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Free operators */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.free}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Free operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Waiting calls */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.waiting}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Waiting calls')}
                </span>
              </div>
            </div>
          </div>

          {/* On break operators */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faUserXmark}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.paused}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.On break operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Busy operators ( in queue ) */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.busy}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Busy operators (in queue)')}
                </span>
              </div>
            </div>
          </div>

          {/* Busy operators ( total calls ) */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.tot}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Total calls')}
                </span>
              </div>
            </div>
          </div>

          {/* Offline operators */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {realTimeAgentCounters.offline}
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Offline operators')}
                </span>
              </div>
            </div>
          </div>

          {/* Busy operators ( out queue ) */}
          <div>
            <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
              <div className='flex items-center space-x-4'>
                <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                  <FontAwesomeIcon
                    icon={faHeadset}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex justify-center'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    0
                  </p>
                </div>
                <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Busy operators (out queue)')}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* ... */}
      </div>

      {/* Queues statistics*/}
      <div className='pt-8 relative mt-4'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {t('QueueManager.Queues statistics')}
            </h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={queuesStatisticsExpanded ? faChevronDown : faChevronUp}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandQueuesStatistics}
            />
          </div>
        </div>
        {/* divider */}
        <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>

        {queuesStatisticsExpanded && (
          <div className='mx-auto text-center'>
            <TextInput
              placeholder={t('Queues.Filter queues') || ''}
              value={textFilter}
              onChange={changeTextFilter}
              ref={textFilterRef}
              icon={textFilter.length ? faCircleXmark : undefined}
              onIconClick={() => clearTextFilter()}
              trailingIcon={true}
              className='max-w-sm mb-6 mt-8'
            />
            {/* no search results */}
            {queueManagerStore.isLoaded && isEmpty(filteredQueues) && (
              <EmptyState
                title={t('Queues.No queues')}
                description={t('Common.Try changing your search filters') || ''}
                icon={
                  <FontAwesomeIcon
                    icon={faFilter}
                    className='mx-auto h-12 w-12'
                    aria-hidden='true'
                  />
                }
              />
            )}

            <ul role='list' className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3'>
              {/* skeleton */}
              {(!queueManagerStore.isLoaded || isApplyingFilters) &&
                Array.from(Array(3)).map((e, i) => (
                  <li
                    key={i}
                    className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'
                  >
                    <div className='px-5 py-4'>
                      {Array.from(Array(3)).map((e, j) => (
                        <div key={j} className='space-y-4 mb-4'>
                          <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                          <div className='animate-pulse h-5 rounded max-w-[75%] bg-gray-300 dark:bg-gray-600'></div>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              {/* queues */}
              {queueManagerStore.isLoaded &&
                Object.keys(filteredQueues).map((key) => {
                  const queue = filteredQueues[key]
                  const datasetsQueues = [
                    {
                      label: 'Calls',
                      data: [
                        queue.waitingCallersList.length || 0,
                        queue.connectedCalls.length || 0,
                        queue.waitingCallersList.length + queue.connectedCalls.length || 0,
                      ],
                      backgroundColor: [
                        '#059669', // Lost calls
                        '#064E3B', // Expired time
                        '#E5E7EB', // Total
                      ],
                      borderRadius: 10,
                      barPercentage: 1,
                      borderWidth: 0,
                      borderSkipped: false,
                      categorySpacing: 6,
                      barThickness: 25,
                    },
                  ]
                  const datasetsOperators = [
                    {
                      label: 'Operators',
                      data: [
                        queue.onlineOperators || 0,
                        queue.numAPausedOperators || 0,
                        queue.totalOperators - queue.numActiveOperators || 0,
                        queue.busyOperators || 0,
                        queue.numActiveOperators - queue.busyOperators || 0,
                      ],
                      backgroundColor: [
                        '#059669', // Online
                        '#eab308', // On a break
                        '#E5E7EB', // Offline
                        '#4b5563', // Busy
                        '#4ade80', // Free
                      ],
                      borderRadius: 10,
                      barPercentage: 1,
                      borderWidth: 0,
                      borderSkipped: false,
                      categorySpacing: 6,
                      barThickness: 10,
                    },
                  ]
                  return (
                    <div key={queue.queue}>
                      <li className='col-span-1 rounded-md shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                        {/* card header */}
                        <div className='flex flex-col pt-3 pb-5 px-5'>
                          <div className='flex w-full items-center justify-between space-x-6'>
                            <div className='flex-1 truncate'>
                              <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                                <h3 className='truncate text-lg leading-6 font-medium'>
                                  {queue.name}
                                </h3>
                                <span>{queue.queue}</span>
                                <IconSwitch
                                  on={queue.favorite}
                                  size='large'
                                  onIcon={<FontAwesomeIcon icon={faStarSolid} />}
                                  offIcon={<FontAwesomeIcon icon={faStarLight} />}
                                  changed={() => toggleFavoriteQueue(queue)}
                                  key={queue.queue}
                                  className={`tooltip-favorite-${queue.queue}`}
                                >
                                  <span className='sr-only'>
                                    {t('Queues.Toggle favorite queue')}
                                  </span>
                                </IconSwitch>
                                <Tooltip
                                  anchorSelect={`.tooltip-favorite-${queue.queue}`}
                                  place='top'
                                >
                                  {queue.favorite
                                    ? t('Common.Remove from favorites') || ''
                                    : t('Common.Add to favorites') || ''}
                                </Tooltip>
                              </div>
                            </div>
                            <FontAwesomeIcon
                              icon={queue.expanded ? faChevronUp : faChevronDown}
                              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                              aria-hidden='true'
                              onClick={() => toggleExpandQueue(queue)}
                            />
                          </div>
                        </div>
                        {/* card body */}
                        {queue.expanded && (
                          <>
                            {/* divider */}
                            {/* <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div> */}
                            <div className='w-full px-8 pt-1'>
                              <BarChartHorizontalWithTitle
                                labels={labelsCalls}
                                datasets={datasetsQueues}
                                tickColor='#374151'
                                titleText='Calls'
                              />
                            </div>
                            <div className='w-full px-8 pt-1 pb-6'>
                              <BarChartHorizontalWithTitle
                                labels={labelsOperators}
                                datasets={datasetsOperators}
                                tickColor='#374151'
                                titleText='Operators'
                              />
                            </div>
                          </>
                        )}
                      </li>
                    </div>
                  )
                })}
            </ul>
          </div>
        )}
      </div>

      {/* Operators statistics*/}
      <div className='py-8 relative'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {t('QueueManager.Operators statistics')}
            </h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={operatorsStatisticsExpanded ? faChevronDown : faChevronUp}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandOperatorsStatistics}
            />
          </div>
        </div>
        {/* divider */}
        <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>

        {operatorsStatisticsExpanded && (
          <>
            <div>
              <RealTimeOperatorsFilter
                updateTextFilter={debouncedUpdateTextFilterOperator}
                updateQueuesFilter={updateQueuesFilter}
                className='pt-6'
              ></RealTimeOperatorsFilter>
              <div className='mx-auto text-center 5xl:max-w-screen-2xl'>
                {/* empty state */}
                {filteredAgentMembers.length === 0 && (
                  <EmptyState
                    title='No agents'
                    description='There is no agent'
                    icon={
                      <FontAwesomeIcon
                        icon={faHeadset}
                        className='mx-auto h-12 w-12'
                        aria-hidden='true'
                      />
                    }
                  ></EmptyState>
                )}
                {/* skeleton */}
                {!queueManagerStore.isLoaded && (
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
                {filteredAgentMembers.length > 0 && (
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
                      className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3 overflow-y-hidden'
                    >
                      {infiniteScrollOperators.map((operator: any, index: number) => {
                        const isCardOpen = openedCardIndexes.includes(index)

                        return (
                          <li
                            key={index}
                            className={`col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900 ${
                              isCardOpen ? 'h-auto' : 'h-20'
                            }`}
                          >
                            {/* card header */}
                            <div className='flex flex-col pt-3 pb-5 px-5'>
                              <div className='flex w-full items-center justify-between space-x-6'>
                                <div className='flex items-center justify-between py-1 text-gray-700 dark:text-gray-200'>
                                  <div className='flex items-center space-x-2'>
                                    <span className='block flex-shrink-0'>
                                      <Avatar
                                        rounded='full'
                                        src={operators[operator.shortname].avatarBase64}
                                        placeholderType='operator'
                                        size='small'
                                        status={operators[operator.shortname].mainPresence}
                                        onClick={() =>
                                          openShowOperatorDrawer(operators[operator.shortname])
                                        }
                                        className='cursor-pointer'
                                      />
                                    </span>
                                    <div className='flex-1 pl-2'>
                                      <h3 className='truncate text-lg leading-6 font-medium'>
                                        {operator.name}
                                      </h3>
                                      <span className='block truncate mt-1 text-sm text-left font-medium text-gray-500 dark:text-gray-500'>
                                        <span>{operator.member}</span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className='flex items-center ml-4'>
                                    {' '}
                                    <IconSwitch
                                      on={operator.favorite}
                                      size='large'
                                      onIcon={<FontAwesomeIcon icon={faStarSolid} />}
                                      offIcon={<FontAwesomeIcon icon={faStarLight} />}
                                      // changed={() => toggleFavoriteQueue(quoperatoreue)}
                                      key={operator.queue}
                                      className={`tooltip-favorite-${operator.queue}`}
                                    >
                                      <span className='sr-only'>
                                        {t('Queues.Toggle favorite queue')}
                                      </span>
                                    </IconSwitch>
                                    <Tooltip
                                      anchorSelect={`.tooltip-favorite-${operator.queue}`}
                                      place='top'
                                    >
                                      {operator.favorite
                                        ? t('Common.Remove from favorites') || ''
                                        : t('Common.Add to favorites') || ''}
                                    </Tooltip>
                                  </div>
                                </div>
                                <FontAwesomeIcon
                                  icon={faChevronUp}
                                  className='h-3 w-3 text-gray-400 dark:text-gray-500 cursor-pointer ml-auto'
                                  aria-hidden='true'
                                  onClick={() => toggleExpandAgentCard(index)}
                                />
                              </div>
                            </div>
                            {/* Agent card body  */}
                            {isCardOpen && (
                              <>
                                {/* divider */}
                                <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>

                                {/* login stats */}
                                <div className='pt-2'>
                                  <div className='col-span-1 divide-y divide-gray-200 bg-white text-gray-700 dark:divide-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                                    {/* card header */}
                                    <div className='px-5 py-4'>
                                      <h3 className='truncate text-base leading-6 font-medium flex items-center'>
                                        <FontAwesomeIcon
                                          icon={faUser}
                                          className='h-4 w-4 mr-2'
                                          aria-hidden='true'
                                        />
                                        <span>{t('Queues.Login')}</span>
                                      </h3>
                                    </div>
                                    {/* card body */}
                                    <div className='flex flex-col divide-y divide-gray-200 dark:divide-gray-700'>
                                      {/* last login */}
                                      <div className='flex py-2 px-5'>
                                        <div className='text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Last login')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {stats.lastLogin || '-'} */}
                                        </div>
                                      </div>
                                      {/* last logout */}
                                      <div className='flex py-2 px-5'>
                                        <div className='text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Last logout')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {stats.lastLogout || '-'} */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* call stats */}
                                <div className='pt-4'>
                                  <div className='col-span-1 divide-y divide-gray-200 bg-white text-gray-700 dark:divide-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                                    {/* card header */}
                                    <div className='px-5 py-4'>
                                      <h3 className='truncate text-base leading-6 font-medium flex items-center justify-start'>
                                        <FontAwesomeIcon
                                          icon={faPhone}
                                          className='h-4 w-4 mr-2'
                                          aria-hidden='true'
                                        />
                                        <span>{t('Queues.Calls')}</span>
                                      </h3>
                                    </div>
                                    {/* card body */}
                                    <div className='flex flex-col divide-y divide-gray-200 dark:divide-gray-700'>
                                      {/* answered calls */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Answered calls')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {stats.answeredCalls || '-'} */}
                                        </div>
                                      </div>
                                      {/* outgoing calls */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Outgoing calls')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {stats.outgoingCalls?.outgoing_calls || '-'} */}
                                        </div>
                                      </div>
                                      {/* missed calls */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Missed calls')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {stats.missedCalls || '-'} */}
                                        </div>
                                      </div>
                                      {/* from last call */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.From last call')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {stats.fromLastCall || '-'} */}
                                        </div>
                                      </div>
                                      {/* time at phone */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Time at phone')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {stats.timeAtPhone || '-'} */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* call durations */}
                                <div className='pt-4'>
                                  <div className='col-span-1 divide-y divide-gray-200 bg-white text-gray-700 dark:divide-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                                    {/* card header */}
                                    <div className='px-5 py-4'>
                                      <h3 className='truncate text-base leading-6 font-medium flex items-center justify-start'>
                                        <FontAwesomeIcon
                                          icon={faStopwatch}
                                          className='h-4 w-4 mr-2'
                                          aria-hidden='true'
                                        />
                                        <span>{t('Queues.Calls duration')}</span>
                                      </h3>
                                    </div>

                                    {/* card body */}
                                    <div className='flex flex-col divide-y divide-gray-200 dark:divide-gray-700'>
                                      {/* minimum */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Minimum')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {formatDurationLoc(stats.allCalls?.min_duration) || '-'} */}
                                        </div>
                                      </div>
                                      {/* maximum */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Maximum')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {formatDurationLoc(stats.allCalls?.max_duration) || '-'} */}
                                        </div>
                                      </div>
                                      {/* average */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Average')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {formatDurationLoc(stats.allCalls?.avg_duration) || '-'} */}
                                        </div>
                                      </div>
                                      {/* total incoming */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Total incoming')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {formatDurationLoc(stats.incomingCalls?.duration_incoming) || */}
                                          {/* '-'} */}
                                        </div>
                                      </div>
                                      {/* total outgoing */}
                                      <div className='flex py-2 px-5'>
                                        <div className=' text-gray-500 dark:text-gray-400'>
                                          {t('Queues.Total outgoing')}
                                        </div>
                                        <div className='w-1/2'>
                                          {/* {formatDurationLoc(stats.outgoingCalls?.duration_outgoing) || */}
                                          {/* '-'} */}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </InfiniteScroll>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

RealTimeManagement.displayName = 'RealTimeManagement'
