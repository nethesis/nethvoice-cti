// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { savePreference } from '../../lib/storage'

import {
  faChevronDown,
  faChevronUp,
  faCheck,
  faPhone,
  faUserCheck,
  faUserClock,
  faUserXmark,
  faHeadset,
  faPause,
  faDownLeftAndUpRightToCenter,
  faChevronRight,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons'

import { Listbox, Transition } from '@headlessui/react'
import { QueueManagementFilterOperators } from './QueueManagementFilterOperators'
import {
  searchStringInQueuesMembers,
  getExpandedQueueManagamentValue,
  setOperatorInformationDrawer,
} from '../../lib/queueManager'

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { getQueues, getQueueStats } from '../../lib/queueManager'
import { isEmpty, debounce, capitalize } from 'lodash'
import { EmptyState, Avatar } from '../common'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getInfiniteScrollOperatorsPageSize } from '../../lib/operators'
import { sortByProperty, invertObject } from '../../lib/utils'
import BarChartHorizontal from '../chart/horizontalBarChart'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const optionsSecond = {
  indexAxis: 'y' as const,
  elements: {
    bar: {
      borderWidth: 1,
    },
  },
  scales: {
    y: {
      display: false,
      stacked: true,
    },
    x: {
      display: false,
      // stacked:true
    },
  },
  responsive: true,
  layout: {
    padding: {
      top: 20,
      bottom: 20,
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
      },
    },
    title: {
      display: true,
      text: 'Waiting calls',
      font: {
        size: 16,
      },
    },
  },
}

let lostCalls = 10
let answeredCalls = 20
let totalCalls = lostCalls + answeredCalls

export const optionsThird = {
  responsive: true,
  maintainAspectRatio: true,
  layout: {
    padding: {
      top: 20,
      bottom: 20,
    },
  },
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        title: function (tooltipItem: any) {
          return ''
        },
        label: function (context: any) {
          const value = context.parsed ? context.parsed : 0
          return value.toFixed(2) + '%'
        },
      },
    },
    title: {
      display: true,
      text: `Total calls: ${totalCalls}`,
      font: {
        size: 16,
      },
    },
  },
}

export const doughnutData = {
  labels: [`Answered calls: ${answeredCalls}`, `Lost calls: ${lostCalls}`],
  datasets: [
    {
      label: 'Answered',
      data: [answeredCalls],
      backgroundColor: ['#10B981', '#6B7280'],
      borderRadius: 50,
      barPercentage: 0.8,
      borderSkipped: false,
      cutout: '80%',
      weight: 0.05,
      rotation: 180,
    },
  ],
}

// Calcolate percentage values
const percentageLostCalls = (lostCalls / totalCalls) * 100
const percentageAnsweredCalls = (answeredCalls / totalCalls) * 100

// Update graphics data
doughnutData.datasets[0].data = [percentageAnsweredCalls, 100 - percentageAnsweredCalls]

export interface QueueManagementProps extends ComponentProps<'div'> {}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const QueueManagement: FC<QueueManagementProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()

  const auth = useSelector((state: RootState) => state.authentication)

  const infiniteScrollOperatorsPageSize = getInfiniteScrollOperatorsPageSize()
  const [infiniteScrollLastIndex, setInfiniteScrollLastIndex] = useState(
    infiniteScrollOperatorsPageSize,
  )
  const [infiniteScrollOperators, setInfiniteScrollOperators] = useState([])
  const [infiniteScrollHasMore, setInfiniteScrollHasMore] = useState(false)

  const [expandedDashboard, setExpandedDashboard] = useState(true)

  const [expandedWaitingCall, setExpandedWaitingCall] = useState(false)

  const [expandedConnectedCall, setExpandedConnectedCall] = useState(false)

  const [expandedQueueOperators, setExpandedQueueOperators] = useState(false)

  const toggleExpandDashboard = () => {
    setExpandedDashboard(!expandedDashboard)
    let correctExpandedDashboard = !expandedDashboard
    savePreference(
      'queueManagementDashboardExpandedPreference',
      correctExpandedDashboard,
      auth.username,
    )
  }

  const toggleWaitingCall = () => {
    setExpandedWaitingCall(!expandedWaitingCall)
    let correctExpandedWaitingCall = !expandedWaitingCall
    savePreference(
      'queueManagementQueueWaitingCallsExpandedPreference',
      correctExpandedWaitingCall,
      auth.username,
    )
  }

  const toggleConnectedCall = () => {
    setExpandedConnectedCall(!expandedConnectedCall)
    let correctExpandedConnectedCall = !expandedConnectedCall
    savePreference(
      'queueManagementQueueConnectedCallsExpandedPreference',
      correctExpandedConnectedCall,
      auth.username,
    )
  }

  const toggleQueueOperators = () => {
    setExpandedQueueOperators(!expandedQueueOperators)
    let correctExpandedQueueOperators = !expandedQueueOperators
    savePreference(
      'queueManagementQueueOperatorsExpandedPreference',
      correctExpandedQueueOperators,
      auth.username,
    )
  }

  //Load expanded chevron values from local storage
  useEffect(() => {
    const expandedValues = getExpandedQueueManagamentValue(auth.username)
    setExpandedDashboard(expandedValues.expandedQueueDashboard)
    setExpandedQueueOperators(expandedValues.expandedQueueOperators)
    setExpandedConnectedCall(expandedValues.expandedConnectedCalls)
    setExpandedWaitingCall(expandedValues.expandedWaitingCalls)
    setSelectedValue(expandedValues.selectedQueue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const [updateDashboardInterval, SetUpdateDashboardInterval] = useState(3000)

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
  const [selectedValue, setSelectedValue] = useState<any>(Object.keys(queuesList)[0] || '')

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

  const [mininumConnectedCallsDatasets, setMininumConnectedCallsDatasets] = useState(0)
  const [averageConnectedCallsDatasets, setAverageConnectedCallsDatasets] = useState(0)
  const [maximumConnectedCallsDatasets, setMaximumConnectedCallsDatasets] = useState(0)

  const [mininumWaitingCallsDatasets, setMininumWaitingCallsDatasets] = useState(0)
  const [averageWaitingCallsDatasets, setAverageWaitingCallsDatasets] = useState(0)
  const [maximumWaitingCallsDatasets, setMaximumWaitingCallsDatasets] = useState(0)

  // Chart functions section
  useEffect(() => {
    if (queuesList && selectedValue?.queue && allQueuesStats) {
      const qstats = queuesList[selectedValue.queue]?.qstats || {}

      if (!isEmpty(qstats)) {
        const connectedCallsStats = calculateConnectedCallsStats(qstats)
        const waitingCallsStats = calculateWaitingCallsStats(qstats)

        setMininumConnectedCallsDatasets(connectedCallsStats.minimum)
        setAverageConnectedCallsDatasets(connectedCallsStats.average)
        setMaximumConnectedCallsDatasets(connectedCallsStats.maximum)

        setMininumWaitingCallsDatasets(waitingCallsStats.minimum)
        setAverageWaitingCallsDatasets(waitingCallsStats.average)
        setMaximumWaitingCallsDatasets(waitingCallsStats.maximum)
      }
    }
  }, [queuesList, selectedValue, allQueuesStats])

  function calculateConnectedCallsStats(qstats: any) {
    const minDurationConnected = qstats.min_duration || 0
    const avgDurationConnected = qstats.avg_duration || 0
    const maxDurationConnected = qstats.max_duration || 0

    return {
      minimum: minDurationConnected,
      average: avgDurationConnected,
      maximum: maxDurationConnected,
    }
  }

  function calculateWaitingCallsStats(qstats: any) {
    const minDurationWaiting = qstats.min_wait || 0
    const avgDurationWaiting = qstats.avg_wait || 0
    const maxDurationWaiting = qstats.max_wait || 0

    return {
      minimum: minDurationWaiting,
      average: avgDurationWaiting,
      maximum: maxDurationWaiting,
    }
  }
  //Connected calls chart functions section
  const connectedCallsLabels = [t('QueueManager.Connected calls')]

  const ConnectedCallsDatasets = [
    {
      label: 'Minimum',
      data: [mininumConnectedCallsDatasets],
      backgroundColor: '#6EE7B7',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: 'Average',
      data: [averageConnectedCallsDatasets],
      backgroundColor: '#10B981',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: 'Maximum',
      data: [maximumConnectedCallsDatasets],
      backgroundColor: '#047857',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
  ]

  //Waiting calls chart functions section
  const waitingCallsLabels = [t('QueueManager.Waiting calls')]

  const WaitingCallsDatasets = [
    {
      label: 'Minimum',
      data: [mininumWaitingCallsDatasets],
      backgroundColor: '#D1D5DB',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: 'Average',
      data: [averageWaitingCallsDatasets],
      backgroundColor: '#6B7280',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: `Maximum`,
      data: [maximumWaitingCallsDatasets],
      backgroundColor: '#374151',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
  ]

  // load extensions information from the store
  const operatorsStore = useSelector((state: RootState) => state.operators) as Record<string, any>
  const [invertedOperatorInformation, setInvertedOperatorInformation] = useState<any>()

  const [agentCounters, setAgentCounters] = useState<any>({})
  //get agent values from queues list
  useEffect(() => {
    if (allQueuesStats) {
      for (const q in queuesList) {
        if (!agentCounters[q]) {
          agentCounters[q] = {}
        }
        // Initialize all counters to 0
        agentCounters[q].online = 0
        agentCounters[q].offline = 0
        agentCounters[q].paused = 0
        agentCounters[q].connected = 0
        agentCounters[q].free = 0
        agentCounters[q].busy = 0

        for (const m in queuesList[q].members) {
          if (queuesList[q].members[m].loggedIn) {
            agentCounters[q].online += 1
          } else {
            agentCounters[q].offline += 1
          }
          if (queuesList[q].members[m].paused) {
            agentCounters[q].paused += 1
          }

          if (
            operatorsStore &&
            operatorsStore.extensions &&
            operatorsStore.extensions[m] &&
            Object.keys(operatorsStore.extensions[m].conversations).length > 0
          ) {
            for (const c in operatorsStore.extensions[m].conversations) {
              if (
                operatorsStore.extensions[m].conversations[c].throughQueue &&
                operatorsStore.extensions[m].conversations[c].queueId === q &&
                operatorsStore.extensions[m].conversations[c].connected
              ) {
                agentCounters[q].connected += 1
              } else if (
                operatorsStore.extensions[m].conversations[c].queueId !== q &&
                operatorsStore.extensions[m].conversations[c].connected
              ) {
                agentCounters[q].busy += 1
              }
            }
          }

          if (
            operatorsStore &&
            operatorsStore.extensions &&
            operatorsStore.extensions[m] &&
            operatorsStore.extensions[m].status === 'online' &&
            operatorsStore.extensions[m].cf === '' &&
            operatorsStore.extensions[m].dnd === false &&
            queuesList[q].members[m].loggedIn === true &&
            queuesList[q].members[m].paused === false
          ) {
            agentCounters[q].free += 1
          }
        }
      }
      setAgentCounters({ ...agentCounters })
    }
  }, [queuesList, allQueuesStats, operatorsStore])

  const [agentCountersSelectedQueue, setAgentCountersSelectedQueue] = useState<any>({})
  const [agentMembers, setAgentMembers] = useState<any>({})

  useEffect(() => {
    if (selectedValue && !isEmpty(agentCounters)) {
      const selectedQueue = selectedValue.queue

      const selectedQueueAgents = agentCounters[selectedQueue]
      setAgentCountersSelectedQueue(selectedQueueAgents)

      setAgentMembers(Object.values(queuesList[selectedQueue]?.members ?? {}))
    }
  }, [selectedValue, agentCounters])

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

  const [statusFilter, setStatusFilter]: any = useState('')
  const updateStatusFilter = (newStatusFilter: string) => {
    setStatusFilter(newStatusFilter)
  }

  const [sortByFilter, setSortByFilter]: any = useState('')
  const updateSort = (newSortBy: string) => {
    setSortByFilter(newSortBy)
  }

  const showMoreInfiniteScrollOperators = () => {
    const lastIndex = infiniteScrollLastIndex + infiniteScrollOperatorsPageSize
    setInfiniteScrollLastIndex(lastIndex)
    setInfiniteScrollOperators(filteredAgentMembers.slice(0, lastIndex))
    const hasMore = lastIndex < filteredAgentMembers.length
    setInfiniteScrollHasMore(hasMore)
  }

  const [isApplyingFilters, setApplyingFilters]: any = useState(false)
  const [filteredAgentMembers, setFilteredAgentMembers]: any = useState([])

  const applyFilters = (operators: any) => {
    if (!(statusFilter && sortByFilter)) {
      return
    }
    setApplyingFilters(true)
    // text filter
    let filteredAgentMembers: any = Object.values(operators).filter((op) =>
      searchStringInQueuesMembers(op, textFilter),
    )

    filteredAgentMembers.forEach((member: any) => {
      if (invertedOperatorInformation[member.name]) {
        member.shortname = invertedOperatorInformation[member.name]
      }
    })

    // sort operators
    switch (sortByFilter) {
      case 'name':
        filteredAgentMembers.sort(sortByProperty('name'))
        break
      case 'status':
        filteredAgentMembers.sort(sortByProperty('name'))
        break
    }

    setFilteredAgentMembers(filteredAgentMembers)

    setInfiniteScrollOperators(filteredAgentMembers.slice(0, infiniteScrollLastIndex))
    const hasMore = infiniteScrollLastIndex < filteredAgentMembers.length
    setInfiniteScrollHasMore(hasMore)
    setApplyingFilters(false)
  }

  // apply filters when operators data has been loaded and operator menu is opened
  useEffect(() => {
    if (agentMembers.length > 0) {
      applyFilters(agentMembers)
    }
  }, [expandedQueueOperators, agentMembers, textFilter])

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

  const handleSelectedValue = (newValueQueue: any) => {
    setSelectedValue(newValueQueue)
    let currentSelectedQueue = newValueQueue
    savePreference('queueManagementSelectedQueue', currentSelectedQueue, auth.username)
  }

  return (
    <>
      <Listbox value={selectedValue} onChange={handleSelectedValue}>
        {({ open }) => (
          <>
            <div className='flex items-center'>
              <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                {t('QueueManager.Select queue')}
              </Listbox.Label>
              <div className='relative'>
                <Listbox.Button className='relative cursor-default rounded-md bg-white dark:bg-gray-900 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6 inline-block'>
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
                    {Object.entries<any>(queuesList).map(([queueId, queueInfo]) => (
                      <Listbox.Option
                        key={queueId}
                        className={({ active }) =>
                          classNames(
                            active ? 'bg-primary text-white' : 'text-gray-900 dark:text-gray-100',
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

      {/* Queue Dashboard*/}
      <div className='py-2 relative mt-4'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {t('QueueManager.Queue Dashboard')}
            </h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={expandedDashboard ? faChevronDown : faChevronUp}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandDashboard}
            />
          </div>
        </div>

        {/* divider */}
        <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1 mb-6'></div>

        {/* Dashboard queue active section */}
        {expandedDashboard && (
          <div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
              {/* Online operators */}
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
                        {agentCountersSelectedQueue?.online
                          ? agentCountersSelectedQueue?.online
                          : 0}
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Online operators')}
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
                        icon={faUserClock}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        {agentCountersSelectedQueue?.paused
                          ? agentCountersSelectedQueue?.paused
                          : 0}
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.On break operators')}
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
                        icon={faUserXmark}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        {agentCountersSelectedQueue?.offline
                          ? agentCountersSelectedQueue?.offline
                          : 0}
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Offline operators')}
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
                        {agentCountersSelectedQueue?.free ? agentCountersSelectedQueue?.free : 0}
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Free operators')}
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
                        {agentCountersSelectedQueue?.connected
                          ? agentCountersSelectedQueue?.connected
                          : 0}
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Busy operators (in queue)')}
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
                        {agentCountersSelectedQueue?.busy ? agentCountersSelectedQueue?.busy : 0}
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Busy operators (out queue)')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart section  */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'>
              {/* Calls duration */}

              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative'>
                  <div className='pt-3'>
                    <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Calls duration')}
                    </span>
                  </div>
                  <div className='flex justify-center'>
                    <div className='w-full h-full'>
                      <BarChartHorizontal
                        labels={connectedCallsLabels}
                        datasets={ConnectedCallsDatasets}
                        titleText={t('QueueManager.Connected calls')}
                      />
                      <BarChartHorizontal
                        labels={waitingCallsLabels}
                        datasets={WaitingCallsDatasets}
                        titleText={t('QueueManager.Waiting calls')}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Calls */}
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm:mt-1 relative'>
                  <div className='flex justify-between'>
                    <div className='pt-3'>
                      <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Calls')}
                      </span>
                    </div>
                    <div className='pt-3'>
                      <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Details')}
                      </span>
                    </div>
                  </div>
                  <div className='w-full h-full'>
                    <Doughnut data={doughnutData} options={optionsThird} />
                  </div>
                </div>
              </div>

              {/* Customers to manage */}
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex justify-between'>
                  <div className='pt-3'>
                    <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Customers to manage')}
                    </span>
                  </div>
                  <div className='pt-3'>
                    <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Details')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer section */}

      <div className='py-2 relative mt-8'>
        <div className='flex'>
          {/* Footer left  */}
          <div className='w-1/3'>
            {/* Waiting calls */}
            <div className='flex items-center'>
              <div className='flex items-center'>
                <FontAwesomeIcon
                  icon={faPause}
                  className='h-4 w-4 mr-2 py-2 cursor-pointer flex items-center'
                  aria-hidden='true'
                />
                <h2 className='text-md font-semibold text-gray-900 dark:text-gray-100 mr-4'>
                  {t('QueueManager.Waiting calls')}
                </h2>
              </div>
              <div className='flex-grow'></div>
              <div className='flex items-center justify-end h-6 w-6'>
                <FontAwesomeIcon
                  icon={expandedWaitingCall ? faChevronDown : faChevronUp}
                  className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                  aria-hidden='true'
                  onClick={toggleWaitingCall}
                />
              </div>
            </div>

            {/* divider */}
            <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>

            {/* Connected calls */}
            <div className='flex items-center mt-6'>
              <div className='flex items-center'>
                <FontAwesomeIcon
                  icon={faDownLeftAndUpRightToCenter}
                  className='h-4 w-4 mr-2 py-2 cursor-pointer flex items-center'
                  aria-hidden='true'
                />
                <h2 className='text-md font-semibold text-gray-900 dark:text-gray-100 mr-4'>
                  {t('QueueManager.Connected calls')}
                </h2>
              </div>
              <div className='flex-grow'></div>
              <div className='flex items-center justify-end h-6 w-6'>
                <FontAwesomeIcon
                  icon={expandedConnectedCall ? faChevronDown : faChevronUp}
                  className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                  aria-hidden='true'
                  onClick={toggleConnectedCall}
                />
              </div>
            </div>

            {/* divider */}
            <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>
          </div>

          {/* Footer right  */}
          <div className='w-2/3 ml-8'>
            {/* Queue operators */}
            <div className='flex items-center'>
              <div className='flex items-center'>
                <FontAwesomeIcon
                  icon={faHeadset}
                  className='h-4 w-4 mr-2 py-2 cursor-pointer flex items-center'
                  aria-hidden='true'
                />
                <h2 className='text-md font-semibold text-gray-900 dark:text-gray-100 mr-4'>
                  {t('QueueManager.Queue operators')}
                </h2>
              </div>
              <div className='flex-grow'></div>
              <div className='flex items-center justify-end h-6 w-6'>
                <FontAwesomeIcon
                  icon={expandedQueueOperators ? faChevronDown : faChevronUp}
                  className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                  aria-hidden='true'
                  onClick={toggleQueueOperators}
                />
              </div>
            </div>

            {/* divider */}
            <div className='flex-grow border-b border-gray-200 dark:border-gray-700 mt-1'></div>
            {expandedQueueOperators && (
              <div className='pt-6'>
                <QueueManagementFilterOperators
                  updateTextFilter={debouncedUpdateTextFilter}
                  updateStatusFilter={updateStatusFilter}
                  updateSort={updateSort}
                ></QueueManagementFilterOperators>
                <div className='mx-auto text-center max-w-7xl 5xl:max-w-screen-2xl'>
                  {/* empty state */}
                  {allQueuesStats && agentMembers.length === 0 && (
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
                  {/* compact layout operators */}
                  {allQueuesStats && agentMembers.length > 0 && (
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
                                onClick={() =>
                                  setOperatorInformationDrawer(operator, operatorsStore)
                                }
                                className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-primary dark:focus:ring-primary'
                              >
                                <span className='flex min-w-0 flex-1 items-center space-x-3'>
                                  <span className='block flex-shrink-0'>
                                    <Avatar
                                      src={getAvatarData(operator)}
                                      placeholderType='operator'
                                      size='large'
                                      bordered
                                      className='mx-auto cursor-pointer'
                                      status={getAvatarMainPresence(operator)}
                                    />
                                  </span>
                                  <span className='block min-w-0 flex-1'>
                                    <span className='block truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                                      {operator.name}
                                    </span>
                                    <span className='block truncate mt-1 text-sm font-medium text-gray-500 dark:text-gray-500'>
                                      <FontAwesomeIcon
                                        icon={operator.loggedIn ? faUserCheck : faUserXmark}
                                        className={`h-4 w-4 mr-2 ${
                                          operator.loggedIn ? 'text-primary' : 'text-red-400'
                                        } dark:text-gray-500 cursor-pointer`}
                                        aria-hidden='true'
                                      />
                                      <span
                                        className={`${
                                          operator.loggedIn ? 'text-primary' : 'text-red-400'
                                        } `}
                                      >
                                        {operator.loggedIn
                                          ? `${t('QueueManager.Logged_in')}`
                                          : `${t('QueueManager.Logged_out')}`}
                                      </span>
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
            )}
          </div>
        </div>
      </div>
    </>
  )
}

QueueManagement.displayName = 'QueueManagement'
