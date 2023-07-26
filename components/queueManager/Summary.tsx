// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, Avatar } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faChevronDown,
  faChevronUp,
  faCheck,
  faCircleInfo,
  faHeadset,
  faCircleNotch,
  faUser,
  faPhone,
  faStopwatch,
} from '@fortawesome/free-solid-svg-icons'

import { Listbox, Transition } from '@headlessui/react'
import {
  getQueues,
  getQueueStats,
  getAgentsStats,
  getExpandedSummaryValue,
} from '../../lib/queueManager'
import { SummaryFilter } from './SummaryFilter'
import { isEmpty, debounce, capitalize } from 'lodash'
import { sortByProperty, invertObject } from '../../lib/utils'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getInfiniteScrollOperatorsPageSize } from '../../lib/operators'
import { savePreference } from '../../lib/storage'

export interface SummaryProps extends ComponentProps<'div'> {}

const people = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
  { id: 4, name: 'Tom Cook' },
  { id: 5, name: 'Tanya Fox' },
  { id: 6, name: 'Hellen Schmidt' },
  { id: 7, name: 'Caroline Schultz' },
  { id: 8, name: 'Mason Heaney' },
  { id: 9, name: 'Claudie Smitham' },
  { id: 10, name: 'Emil Schaefer' },
]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const Summary: FC<SummaryProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(people[3])

  const [expanded, setExpanded] = useState(false)

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

  //get queues status information
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderQueuesStats) {
      setFirstRenderQueuesStats(false)
      return
    }
    async function getQueuesStats() {
      setLoadedQueuesStats(false)
      try {
        setAllQueuesStats(false)
        //get list of queues from queuesList
        const queuesName = Object.keys(queuesList)
        //get number of queues
        const queuesLength = queuesName.length

        // Get statuses for each queue
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
  }, [queuesList, firstRenderQueuesStats])

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

  const showMoreInfiniteScrollOperators = () => {
    const lastIndex = infiniteScrollLastIndex + infiniteScrollOperatorsPageSize
    setInfiniteScrollLastIndex(lastIndex)
    setInfiniteScrollOperators(summaryAgentConvertedArray.slice(0, lastIndex))
    const hasMore = lastIndex < summaryAgentConvertedArray.length
    setInfiniteScrollHasMore(hasMore)
  }

  const updateFromLastPause = (u: string, n: string, type: string) => {
    // TODO
  }

  const updateFromLastCall = (u: string, n: string, type: string) => {
    // TODO
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
      <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>
      {expandedQueuesSummary && (
        <>
          <Listbox value={selected} onChange={setSelected}>
            {({ open }) => (
              <>
                <div className='flex items-center pt-4'>
                  <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                    {t('QueueManager.Select queue')}
                  </Listbox.Label>
                  <div className='relative'>
                    <Listbox.Button className='relative cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 inline-block'>
                      <span className='block truncate'>Select queue</span>
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
                      <Listbox.Options className='absolute z-10 mt-1 w-full overflow-auto rounded-md dark:bg-gray-900 bg-white py-1 text-base shadow-lg ring-1  ring-black ring-opacity-5 focus:outline-none sm:text-sm h-auto'>
                        {Object.entries<any>(queuesList).map(([queueId, queueInfo]) => (
                          <Listbox.Option
                            key={queueId}
                            className={({ active }) =>
                              classNames(
                                active ? 'bg-primary text-white' : 'text-gray-900',
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

                                {selected ? (
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
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </div>
              </>
            )}
          </Listbox>

          {/* Queues summary */}
          <div className='relative'>
            {/* Dashboard queue active section */}
            <div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {/* Total calls */}
                <div className='pt-8'>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Total calls')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answered calls */}
                <div className='pt-8'>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Answered calls')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calls answered before service level */}
                <div className='pt-8'>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Calls answered before service level')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unanswered calls */}
                <div>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Unanswered calls')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasons for unanswered calls */}
                <div>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Reasons for unanswered calls')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Callback time */}
                <div>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Callback time')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invalid calls */}
                <div>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Invalid calls')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Waiting calls */}
                <div>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Waiting calls')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calls duration */}
                <div>
                  <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Calls duration')}
                      </span>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={faCircleInfo}
                          className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center'
                          aria-hidden='true'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ... */}
            </div>
          </div>
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
          <SummaryFilter
            updateTextFilter={debouncedUpdateTextFilter}
            updateStatusFilter={updateStatusFilter}
            updateSort={updateSort}
          ></SummaryFilter>
          <div className='mx-auto text-center 5xl:max-w-screen-2xl'>
            {/* empty state */}
            {summaryAgentConvertedArray.length === 0 && (
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
            {summaryAgentConvertedArray.length > 0 && (
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
                            </div>
                            <FontAwesomeIcon
                              icon={openedCardIndexes.includes(index) ? faChevronUp : faChevronDown}
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
                                    <div className='w-1/2'>{/* {stats.lastLogin || '-'} */}</div>
                                  </div>
                                  {/* last logout */}
                                  <div className='flex py-2 px-5'>
                                    <div className='text-gray-500 dark:text-gray-400'>
                                      {t('Queues.Last logout')}
                                    </div>
                                    <div className='w-1/2'>{/* {stats.lastLogout || '-'} */}</div>
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
                                    <div className='w-1/2'>{/* {stats.missedCalls || '-'} */}</div>
                                  </div>
                                  {/* from last call */}
                                  <div className='flex py-2 px-5'>
                                    <div className=' text-gray-500 dark:text-gray-400'>
                                      {t('Queues.From last call')}
                                    </div>
                                    <div className='w-1/2'>{/* {stats.fromLastCall || '-'} */}</div>
                                  </div>
                                  {/* time at phone */}
                                  <div className='flex py-2 px-5'>
                                    <div className=' text-gray-500 dark:text-gray-400'>
                                      {t('Queues.Time at phone')}
                                    </div>
                                    <div className='w-1/2'>{/* {stats.timeAtPhone || '-'} */}</div>
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
      )}
    </>
  )
}

Summary.displayName = 'Summary'
