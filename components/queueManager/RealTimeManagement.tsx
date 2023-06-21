// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, Button, Dropdown, EmptyState, IconSwitch, TextInput } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { Tooltip } from 'react-tooltip'
import { debounce } from 'lodash'
import {
  faChevronDown,
  faChevronUp,
  faUserCheck,
  faUserClock,
  faUserXmark,
  faHeadset,
  faStar as faStarSolid,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarLight } from '@nethesis/nethesis-light-svg-icons'
import {
  searchStringInQueue,
  addQueueToFavorites,
  removeQueueFromFavorites,
  addQueueToExpanded,
  removeQueueFromExpanded,
} from '../../lib/queuesLib'

import { getQueues, getAgentsStats } from '../../lib/queueManager'
import { RealTimeOperatorsFilter } from './RealTimeOperatorsFilter'
import { RealTimeQueuesFilter } from './RealTimeQueuesFilter'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getInfiniteScrollOperatorsPageSize } from '../../lib/operators'
import { sortByProperty, invertObject } from '../../lib/utils'

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
  const [queueExpanded, setQueueExpanded] = useState(false)
  const [pageNum, setPageNum]: any = useState(1)

  const authStore = useSelector((state: RootState) => state.authentication)

  const toggleFavoriteQueue = (queue: any) => {
    const queueId = queue.queue
    const isFavorite = !queue.favorite
    store.dispatch.queues.setQueueFavorite(queueId, isFavorite)

    if (isFavorite) {
      addQueueToFavorites(queueId, authStore.username)
    } else {
      removeQueueFromFavorites(queueId, authStore.username)
    }
  }

  const toggleExpandQueuesStatistics = () => {
    setQueuesStatisticsExpanded(!queuesStatisticsExpanded)
  }

  const toggleExpandOperatorsStatistics = () => {
    setOperatorsStatisticsExpanded(!operatorsStatisticsExpanded)
  }

  const [textFilter, setTextFilter]: any = useState('')

  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
    setPageNum(1)
  }

  const debouncedUpdateTextFilterQueuesStatistics = useMemo(
    () => debounce(updateTextFilter, 400),
    [],
  )

  const debouncedUpdateTextFilterOperatorsStatistics = useMemo(
    () => debounce(updateTextFilter, 400),
    [],
  )

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilterQueuesStatistics.cancel()
    }
  }, [debouncedUpdateTextFilterQueuesStatistics])

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilterOperatorsStatistics.cancel()
    }
  }, [debouncedUpdateTextFilterOperatorsStatistics])

  const [outcomeFilterQueues, setOutcomeFilterQueues]: any = useState('')
  const updateOutcomeFilterQueues = (newOutcomeFilter: string) => {
    setOutcomeFilterQueues(newOutcomeFilter)
    setPageNum(1)
  }

  const [queuesFilterQueues, setQueuesFilterQueues]: any = useState([])
  const updateQueuesFilterQueues = (newQueuesFilter: string[]) => {
    setQueuesFilterQueues(newQueuesFilter)
    setPageNum(1)
  }

  const [outcomeFilterOperators, setOutcomeFilterOperators]: any = useState('')
  const updateOutcomeFilterOperators = (newOutcomeFilter: string) => {
    setOutcomeFilterQueues(newOutcomeFilter)
    setPageNum(1)
  }

  const [queuesFilterOperators, setQueuesFilterOperators]: any = useState([])
  const updateQueuesFilterOperators = (newQueuesFilter: string[]) => {
    setQueuesFilterQueues(newQueuesFilter)
    setPageNum(1)
  }

  const [filteredQueues, setFilteredQueues]: any = useState({})

  const { name, mainPresence, mainextension, avatar, profile } = useSelector(
    (state: RootState) => state.user,
  )

  const [isApplyingFilters, setApplyingFilters]: any = useState(false)

  const queuesStore = useSelector((state: RootState) => state.queues)

  const getQueuesUserLoggedIn = () => {
    return Object.values(queuesStore.queues)
      .filter((queue: any) => {
        return (
          queue.members[mainextension].loggedIn && queue.members[mainextension].type !== 'static'
        )
      })
      .map((queue: any) => queue.queue)
  }

  const applyFilters = () => {
    setApplyingFilters(true)

    // text filter
    let filteredQueues = Object.values(queuesStore.queues).filter((queue) =>
      searchStringInQueue(queue, textFilter),
    )

    // sort queues
    // filteredQueues.sort(sortByProperty('name'))
    // filteredQueues.sort(sortByProperty('queue'))
    // filteredQueues.sort(sortByFavorite)

    setFilteredQueues(filteredQueues)
    setApplyingFilters(false)
  }

  // filtered queues
  useEffect(() => {
    applyFilters()
  }, [queuesStore.queues])

  const toggleExpandQueue = (queue: any) => {
    const queueId = queue.queue
    const isExpanded = !queue.expanded
    store.dispatch.queues.setQueueExpanded(queueId, isExpanded)

    if (isExpanded) {
      addQueueToExpanded(queueId, authStore.username)
    } else {
      removeQueueFromExpanded(queueId, authStore.username)
    }
    applyFilters()
  }

  const [openedCardIndexes, setOpenedCardIndexes] = useState<number[]>([])

  const toggleExpandAgentCard = (index: number) => {
    if (openedCardIndexes.includes(index)) {
      setOpenedCardIndexes(openedCardIndexes.filter((i) => i !== index))
    } else {
      setOpenedCardIndexes([...openedCardIndexes, index])
    }
  }

  const [firstRenderQueuesList, setFirstRenderQueuesList]: any = useState(true)
  const [isLoadedQueues, setLoadedQueues] = useState(false)
  const [queuesList, setQueuesList] = useState<any>({})
  const [openedCardAgent, setOpenedCardAgent] = useState<number | null>(null)

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

      for (const q in queuesList) {
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

      for (const q in queuesList) {
        const waitingCallersCount = Object.keys(queuesList[q].waitingCallers).length
        updatedCounters.counters[q].waiting = waitingCallersCount
        waitingCount += waitingCallersCount

        for (const m in queuesList[q].members) {
          const member = queuesList[q].members[m]

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
            queuesList[conversation.queueId] !== undefined
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
  }, [queuesList, operatorsStore])

  const [realTimeAgent, setRealTimeAgent] = useState<any>({})
  const [realTimeAgentConvertedArray, setRealTimeAgentConvertedArray] = useState<any>([])

  useEffect(() => {
    // Function to fetch real-time agent data
    const getRealTimeAgents = async () => {
      try {
        const newRealTimeAgents: any = {} // New object for agents

        // Iterate through each queue in queuesList
        for (const queueId in queuesList) {
          const queue = queuesList[queueId]

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

        // Apply your additional logic here
        agentArray.forEach((member: any) => {
          if (invertedOperatorInformation[member.name]) {
            member.shortname = invertedOperatorInformation[member.name]
          }
        })

        setRealTimeAgentConvertedArray(agentArray)
        setInfiniteScrollOperators(agentArray.slice(0, infiniteScrollLastIndex))
        const hasMore = infiniteScrollLastIndex < agentArray.length
        setInfiniteScrollHasMore(hasMore)
        setApplyingFilters(false)
      } catch (err) {
        console.error(err)
      }
    }

    getRealTimeAgents()
  }, [queuesList])

  const updateFromLastPause = (u: string, n: string, type: string) => {
    // TODO
  }

  const updateFromLastCall = (u: string, n: string, type: string) => {
    // TODO
  }

  const showMoreInfiniteScrollOperators = () => {
    const lastIndex = infiniteScrollLastIndex + infiniteScrollOperatorsPageSize
    setInfiniteScrollLastIndex(lastIndex)
    setInfiniteScrollOperators(realTimeAgentConvertedArray.slice(0, lastIndex))
    const hasMore = lastIndex < realTimeAgentConvertedArray.length
    setInfiniteScrollHasMore(hasMore)
  }

  const [invertedOperatorInformation, setInvertedOperatorInformation] = useState<any>()

  // invert key to use getAvatarData function
  useEffect(() => {
    if (operatorsStore) {
      setInvertedOperatorInformation(invertObject(operatorsStore.operators))
    }
  }, [operatorsStore])

  const [avatarIcon, setAvatarIcon] = useState<any>()
  const [operatorInformation, setOperatorInformation] = useState<any>()

  // get operator avatar base64 from the store
  useEffect(() => {
    if (operatorsStore && !avatarIcon) {
      setAvatarIcon(operatorsStore.avatars)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get avatar icon for each selected queue agents
  function getAvatarData(selectedQueueAgent: any) {
    let userAvatarData = ''
    if (selectedQueueAgent.shortname && avatarIcon) {
      for (const username in avatarIcon) {
        if (username === selectedQueueAgent.shortname) {
          userAvatarData = avatarIcon[username]
          break
        }
      }
    }
    return userAvatarData
  }

  // Set status dot to avatar icon
  function getAvatarMainPresence(selectedQueueAgent: any) {
    let userMainPresence = null
    let operatorInformation = operatorsStore.operators
    if (selectedQueueAgent.shortname && operatorInformation) {
      for (const username in operatorInformation) {
        if (username === selectedQueueAgent.shortname) {
          userMainPresence = operatorInformation[username].presence
        }
      }
    }
    return userMainPresence
  }

  return (
    <>
      {/* Dashboard queue active section */}
      <div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {/* Connected calls */}
          <div>
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
            <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
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
        <div className='flex-grow border-b border-gray-300 mt-1'></div>

        {queuesStatisticsExpanded && (
          <>
            <RealTimeQueuesFilter
              updateTextFilter={debouncedUpdateTextFilterQueuesStatistics}
              updateOutcomeFilter={updateOutcomeFilterQueues}
              updateQueuesFilter={updateQueuesFilterQueues}
              className='pt-6'
            ></RealTimeQueuesFilter>
            <ul role='list' className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3'>
              {/* skeleton */}
              {/* {(!queuesStore.isLoaded || isApplyingFilters) &&
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
                ))} */}
              {/* queues */}
              {queuesStore.isLoaded &&
                Object.keys(filteredQueues).map((key) => {
                  const queue = filteredQueues[key]
                  return (
                    <div key={queue.queue}>
                      <li className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
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
                            <div className='flex-grow border-b border-gray-300 mt-1'></div>
                          </>
                        )}
                      </li>
                    </div>
                  )
                })}
            </ul>
          </>
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
        <div className='flex-grow border-b border-gray-300 mt-1'></div>

        {operatorsStatisticsExpanded && (
          <>
            <div>
              <RealTimeOperatorsFilter
                updateTextFilter={debouncedUpdateTextFilterOperatorsStatistics}
                updateOutcomeFilter={updateOutcomeFilterOperators}
                updateQueuesFilter={updateQueuesFilterOperators}
                className='pt-6'
              ></RealTimeOperatorsFilter>
              <div className='mx-auto text-center 5xl:max-w-screen-2xl'>
                {/* empty state */}
                {realTimeAgentConvertedArray.length === 0 && (
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
                {/* {allQueuesStats && agentMembers.length > 0 && (
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
                  )} */}
                {realTimeAgentConvertedArray.length > 0 && (
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
                                        src={getAvatarData(operator)}
                                        placeholderType='operator'
                                        size='large'
                                        bordered
                                        // onClick={() => openShowOperatorDrawer(operator)}
                                        className='mx-auto cursor-pointer'
                                        status={getAvatarMainPresence(operator)}
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
                                <div className='flex-grow border-b border-gray-300 mt-1'></div>
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
