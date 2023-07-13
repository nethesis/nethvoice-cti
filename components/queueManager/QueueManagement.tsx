// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatDateLoc, getCallTimeToDisplay } from '../../lib/dateTime'
import { Tooltip } from 'react-tooltip'
import { savePreference } from '../../lib/storage'
import { LoggedStatus } from '../queues'
import Link from 'next/link'

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
  faArrowRight,
  faUser,
} from '@fortawesome/free-solid-svg-icons'

import { openShowOperatorDrawer } from '../../lib/operators'

import { Listbox, Transition } from '@headlessui/react'
import { QueueManagementFilterOperators } from './QueueManagementFilterOperators'
import {
  searchStringInQueuesMembers,
  getExpandedQueueManagamentValue,
  retrieveSelectedNotManaged,
  openShowQueueCallDrawer,
  getCallIcon,
} from '../../lib/queueManager'

import { getQueues, getQueueStats } from '../../lib/queueManager'
import { isEmpty, debounce } from 'lodash'
import { EmptyState, Avatar } from '../common'
import InfiniteScroll from 'react-infinite-scroll-component'
import { getInfiniteScrollOperatorsPageSize } from '../../lib/operators'
import { CallDuration } from '../operators/CallDuration'
import { sortByProperty, sortByBooleanProperty } from '../../lib/utils'
import BarChartHorizontal from '../chart/HorizontalBarChart'
import LineChart from '../chart/LineChart'

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

  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

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

  // Call api interval update ( every 2 minutes)
  const [updateDashboardInterval, SetUpdateDashboardInterval] = useState(120000)

  useEffect(() => {
    //every tot seconds set loaded queues to false to call api
    const interval = setInterval(() => {
      setLoadedQueues(false)
    }, updateDashboardInterval)

    // After unmount clean interval
    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [allQueuesStats, setAllQueuesStats] = useState(false)
  const [firstRenderQueuesStats, setFirstRenderQueuesStats]: any = useState(true)
  const [isLoadedQueuesStats, setLoadedQueuesStats] = useState(false)
  const [selectedValue, setSelectedValue] = useState<any>(
    Object.keys(queueManagerStore.queues)?.[0] || '',
  )

  // //get queues status information
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
  }, [isLoadedQueues, isLoadedQueuesStats, firstRenderQueuesStats])

  // const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)
  const [calls, setCalls]: any = useState({})
  const [firstRenderNotManaged, setFirstRenderNotManaged]: any = useState(true)
  const [isLoadedQueuesNotManaged, setLoadedQueuesNotManaged] = useState(false)

  //get queues list information
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderNotManaged) {
      setFirstRenderNotManaged(false)
      return
    }
    if (isEmpty(selectedValue)) {
      return
    }
    async function getQueuesNotManaged() {
      setLoadedQueuesNotManaged(false)
      try {
        let selectedQueue = selectedValue.queue
        const res = await retrieveSelectedNotManaged(selectedQueue)
        setCalls(res)
      } catch (err) {
        console.error(err)
      }
      setLoadedQueuesNotManaged(true)
    }
    if (!isLoadedQueuesNotManaged) {
      getQueuesNotManaged()
    }
  }, [firstRenderNotManaged, isLoadedQueuesNotManaged, queueManagerStore.isLoaded, selectedValue])

  // Chart functions section

  // Connected calls
  const [mininumConnectedCallsDatasets, setMininumConnectedCallsDatasets] = useState(0)
  const [averageConnectedCallsDatasets, setAverageConnectedCallsDatasets] = useState(0)
  const [maximumConnectedCallsDatasets, setMaximumConnectedCallsDatasets] = useState(0)

  // Waiting calls
  const [mininumWaitingCallsDatasets, setMininumWaitingCallsDatasets] = useState(0)
  const [averageWaitingCallsDatasets, setAverageWaitingCallsDatasets] = useState(0)
  const [maximumWaitingCallsDatasets, setMaximumWaitingCallsDatasets] = useState(0)

  // Calls status

  //Totals
  const [totalCallsStatus, setTotalCallsStatus] = useState(0)
  const [totalCallsAnsweredStatus, setTotalCallsAnsweredStatus] = useState(0)
  const [totalCallsMissedStatus, setTotalCallsMissedStatus] = useState(0)
  const [totalNullCalls, setTotalNullCalls] = useState(0)
  const [inProgress, setInProgress] = useState(0)

  //Details answered
  const [answeredBeforeSeconds, setAnsweredBeforeSeconds] = useState(0)
  const [answeredAfterSeconds, setAnsweredAfterSeconds] = useState(0)

  //Details failed
  const [expiredTime, setExpiredTime] = useState(0)
  const [abandonedCalls, setAbandonedCalls] = useState(0)
  const [failedNoagentsOutqueue, setFailedNoagentsOutqueue] = useState(0)
  const [failedNoagentsInqueue, setFailedNoagentsInqueue] = useState(0)

  useEffect(() => {
    //check if queue list is already loaded and queue is selected
    if (queuesList && selectedValue?.queue && allQueuesStats) {
      const qstats = queuesList[selectedValue.queue]?.qstats || {}

      if (!isEmpty(qstats)) {
        const connectedCallsStats = calculateConnectedCallsStats(qstats)
        const waitingCallsStats = calculateWaitingCallsStats(qstats)
        const callStatus = calculateCallsStats(qstats)

        // Calls duration charts status

        // Connected calls
        setMininumConnectedCallsDatasets(connectedCallsStats.minimum)
        setAverageConnectedCallsDatasets(connectedCallsStats.average)
        setMaximumConnectedCallsDatasets(connectedCallsStats.maximum)

        // Waiting calls
        setMininumWaitingCallsDatasets(waitingCallsStats.minimum)
        setAverageWaitingCallsDatasets(waitingCallsStats.average)
        setMaximumWaitingCallsDatasets(waitingCallsStats.maximum)

        // Calls chart status

        // Total calls section
        // Total calls
        setTotalCallsStatus(callStatus.total)
        // Answered calls
        setTotalCallsAnsweredStatus(callStatus.answered)
        // Lost calls
        setTotalCallsMissedStatus(callStatus.notAnswerCalls)
        // Null calls
        setTotalNullCalls(callStatus.totNull)
        // In progress call
        let inProgressValue =
          callStatus.total - callStatus.answered - callStatus.notAnswerCalls - callStatus.totNull
        setInProgress(inProgressValue)

        // Answred calls details
        // Answered before seconds
        setAnsweredBeforeSeconds(callStatus.beforeSecondsCalls)
        setAnsweredAfterSeconds(callStatus.afterSecondsCalls)

        // Failed section details
        setExpiredTime(callStatus.expiredTime)
        setAbandonedCalls(callStatus.abandon)
        setFailedNoagentsOutqueue(callStatus.outqueueNoAgents)
        setFailedNoagentsInqueue(callStatus.inqueueNoAgents)
      }
    }
  }, [queuesList, selectedValue, allQueuesStats])

  //Connected calls chart values
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

  //Connected calls chart values
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

  //Customers to manage calls values
  function calculateCallsStats(qstats: any) {
    //total sections
    const totalCalls = qstats.tot || 0
    const notAnswerCalls = qstats.tot_failed || 0
    const answeredCalls = qstats.tot_processed || 0
    const totNull = qstats.tot_null || 0

    //details answered section
    const beforeSecondsCalls = qstats.processed_less_sla || 0
    const afterSecondsCalls = qstats.processed_greater_sla || 0

    //details failed section
    const expiredTime = qstats.failed_timeout || 0
    const abandon = qstats.failed_abandon || 0
    const outqueueNoAgents = qstats.failed_outqueue_noagents || 0
    const inqueueNoAgents = qstats.failed_inqueue_noagents || 0

    return {
      //total sections
      total: totalCalls,
      answered: answeredCalls,
      notAnswerCalls: notAnswerCalls,
      totNull: totNull,

      //details answered section
      beforeSecondsCalls: beforeSecondsCalls,
      afterSecondsCalls: afterSecondsCalls,

      //details failed section
      expiredTime: expiredTime,
      abandon: abandon,
      outqueueNoAgents: outqueueNoAgents,
      inqueueNoAgents: inqueueNoAgents,
    }
  }

  //Connected calls chart functions section
  const connectedCallsLabels = [t('QueueManager.Connected calls')]

  const ConnectedCallsDatasets = [
    {
      label: `${t('Queues.Minimum')}`,
      data: [mininumConnectedCallsDatasets],
      backgroundColor: '#6EE7B7',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,

      borderSkipped: false,
    },
    {
      label: `${t('Queues.Average')}`,
      data: [averageConnectedCallsDatasets],
      backgroundColor: '#10B981',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
    {
      label: `${t('Queues.Maximum')}`,
      data: [maximumConnectedCallsDatasets],
      backgroundColor: '#047857',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
  ]

  //Waiting calls chart functions section
  const waitingCallsLabels = [t('QueueManager.Waiting calls')]

  const WaitingCallsDatasets = [
    {
      label: `${t('Queues.Minimum')}`,
      data: [mininumWaitingCallsDatasets],
      backgroundColor: '#D1D5DB',
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
    {
      label: `${t('Queues.Average')}`,
      data: [averageWaitingCallsDatasets],
      backgroundColor: '#6B7280',
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
    {
      label: `${t('Queues.Maximum')}`,
      data: [maximumWaitingCallsDatasets],
      backgroundColor: '#374151',
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
  ]

  //total calls chart functions section
  const totalCallsLabels = [t('QueueManager.Total calls')]

  const totalCallsDatasets = [
    {
      label: `${t('QueueManager.Null')}`,
      data: [totalNullCalls],
      backgroundColor: '#a7f3d0',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
    {
      label: `${t('QueueManager.Failed')}`,
      data: [totalCallsMissedStatus],
      backgroundColor: '#6EE7B7',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,

      borderSkipped: false,
    },
    {
      label: `${t('QueueManager.Answered')}`,
      data: [totalCallsAnsweredStatus],
      backgroundColor: '#10B981',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
    {
      label: `${t('QueueManager.In progress')}`,
      data: [inProgress],
      backgroundColor: '#047857',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
  ]

  const AnsweredCallsLabels = [t('QueueManager.Answered details')]

  const AnsweredCallsDatasets = [
    {
      label: `${t('QueueManager.Before 60s')}`,
      data: [answeredBeforeSeconds],
      backgroundColor: '#6EE7B7',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,

      borderSkipped: false,
    },
    {
      label: `${t('QueueManager.After 60s')}`,
      data: [answeredAfterSeconds],
      backgroundColor: '#10B981',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
  ]

  const failedCallsLabels = [t('QueueManager.Failed details')]

  const failedCallsDatasets = [
    {
      label: `${t('QueueManager.Expired')}`,
      data: [expiredTime],
      backgroundColor: '#6EE7B7',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
    {
      label: `${t('QueueManager.Abandoned')}`,
      data: [abandonedCalls],
      backgroundColor: '#10B981',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 0.5,
      borderWidth: 0,
      borderSkipped: false,
    },
    {
      label: `${t('QueueManager.No agents outqueue')}`,
      data: [failedNoagentsOutqueue],
      backgroundColor: '#10B981',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 1,
      borderWidth: 0.5,
      borderSkipped: false,
    },
    {
      label: `${t('QueueManager.No agents inqueue')}`,
      data: [failedNoagentsInqueue],
      backgroundColor: '#10B981',
      // borderRadius: [20, 20, 10, 10],
      borderRadius: 10,
      barPercentage: 1,
      borderWidth: 0.5,
      borderSkipped: false,
    },
  ]

  const labelsOutcome = ['January', 'February', 'March', 'April', 'May', 'June']
  const datasetsCallsHour = [
    {
      label: 'Dataset 1',
      data: [10, 20, 15, 25, 18, 30],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'Dataset 2',
      data: [5, 12, 8, 20, 10, 15],
      fill: false,
      borderColor: 'rgb(192, 75, 192)',
      tension: 0.1,
    },
  ]

  // load extensions information from the store
  const operatorsStore = useSelector((state: RootState) => state.operators) as Record<string, any>

  const [agentCounters, setAgentCounters] = useState<any>({})
  //get agent values from queues list
  useEffect(() => {
    if (allQueuesStats) {
      for (const q in queueManagerStore.queues) {
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

        for (const m in queueManagerStore.queues[q].members) {
          if (queueManagerStore.queues[q].members[m].loggedIn) {
            agentCounters[q].online += 1
          } else {
            agentCounters[q].offline += 1
          }
          if (queueManagerStore.queues[q].members[m].paused) {
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
            queueManagerStore.queues[q].members[m].loggedIn === true &&
            queueManagerStore.queues[q].members[m].paused === false
          ) {
            agentCounters[q].free += 1
          }
        }
      }
      setAgentCounters({ ...agentCounters })
    }
  }, [queueManagerStore.isLoaded, allQueuesStats, operatorsStore])

  const [agentCountersSelectedQueue, setAgentCountersSelectedQueue] = useState<any>({})
  const [agentMembers, setAgentMembers] = useState<any>({})

  useEffect(() => {
    if (selectedValue && !isEmpty(agentCounters)) {
      const selectedQueue = selectedValue.queue

      const selectedQueueAgents = agentCounters[selectedQueue]
      setAgentCountersSelectedQueue(selectedQueueAgents)

      // setAgentMembers(Object.values(queuesList[selectedQueue]?.members ?? {}))
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

  // apply filters when operators data has been loaded and operator menu is opened
  useEffect(() => {
    if (
      queueManagerStore?.isLoaded &&
      queueManagerStore?.queues[selectedValue?.queue]?.allQueueOperators
    ) {
      applyFilters(queueManagerStore?.queues[selectedValue?.queue]?.allQueueOperators)
    }
  }, [selectedValue, textFilter, sortByFilter, statusFilter, queueManagerStore.isLoaded])

  const handleSelectedValue = (newValueQueue: any) => {
    setSelectedValue(newValueQueue)
    let currentSelectedQueue = newValueQueue
    savePreference('queueManagementSelectedQueue', currentSelectedQueue, auth.username)
    setLoadedQueuesNotManaged(false)
  }

  const { operators } = useSelector((state: RootState) => state.operators)

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
                    {Object.entries<any>(queueManagerStore.queues).map(([queueId, queueInfo]) => (
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
                <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative h-full'>
                  <div className='pt-3'>
                    <span className='text-lg font-semibold leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Calls duration')}
                    </span>
                  </div>
                  <div className='flex justify-center pt-2'>
                    <div className='w-full h-full'>
                      <BarChartHorizontal
                        labels={connectedCallsLabels}
                        datasets={ConnectedCallsDatasets}
                        titleText={t('QueueManager.Connected calls')}
                        numericTooltip={false}
                      />
                      <BarChartHorizontal
                        labels={waitingCallsLabels}
                        datasets={WaitingCallsDatasets}
                        titleText={t('QueueManager.Waiting calls')}
                        numericTooltip={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Calls */}
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm:mt-1 relative w-full h-full'>
                  <div className='flex justify-between'>
                    <div className='pt-3'>
                      <span className='text-lg font-semibold leading-6 text-center text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Calls')}
                      </span>
                    </div>
                    <div className='pt-3'>
                      <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Details')}
                      </span>
                    </div>
                  </div>
                  <div className='flex justify-center items-center px-3 pt-2'>
                    <div className='w-full h-full flex flex-col space-y-4'>
                      <BarChartHorizontal
                        labels={totalCallsLabels}
                        datasets={totalCallsDatasets}
                        titleText={`${t('QueueManager.Total calls')}: ${totalCallsStatus}`}
                        numericTooltip={true}
                      />
                      <BarChartHorizontal
                        labels={AnsweredCallsLabels}
                        datasets={AnsweredCallsDatasets}
                        titleText={`${t(
                          'QueueManager.Answered calls',
                        )}: ${totalCallsAnsweredStatus}`}
                        numericTooltip={true}
                      />
                      <BarChartHorizontal
                        labels={failedCallsLabels}
                        datasets={failedCallsDatasets}
                        titleText={`${t('QueueManager.Failed calls')}: ${totalCallsMissedStatus}`}
                        numericTooltip={true}
                      />
                    </div>
                  </div>
                  <div className='w-full h-full flex '></div>
                </div>
              </div>

              {/* Customers to manage */}
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative h-full'>
                  <div className='flex justify-between'>
                    <div className='pt-3'>
                      <span className='text-lg font-semibold leading-6 text-center text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Customers to manage')}
                      </span>
                    </div>
                    <div className='pt-3'>
                      <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                        {t('QueueManager.Details')}
                      </span>
                    </div>
                  </div>
                  <div className='flex flex-col justify-center items-center px-4'>
                    <div className='w-full h-full'>
                      <LineChart labels={labelsOutcome} datasets={datasetsCallsHour} />
                    </div>
                    <div className='overflow-auto mt-12 h-56 w-full'>
                      <ul
                        role='list'
                        className=' divide-gray-300 dark:divide-gray-600 bg-white dark:bg-gray-900'
                      >
                        <li className='flex items-center justify-between gap-x-6 border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-gray-200 py-2 px-2'>
                          <div className='py-1 px-2'>
                            <strong>{t('QueueManager.Date')}</strong>
                          </div>
                          <div className='px-3'>
                            <strong>{t('QueueManager.Caller')}</strong>
                          </div>
                          <div className='px-3'>
                            <strong>{t('QueueManager.Outcome')}</strong>
                          </div>
                        </li>
                        {isLoadedQueuesNotManaged && calls.count === 0 && (
                          <EmptyState
                            title={t('QueueManager.No customers to manage')}
                            description={t('QueueManager.There are no customers to manage') || ''}
                            icon={
                              <FontAwesomeIcon
                                icon={faUser}
                                className='mx-auto h-12 w-12'
                                aria-hidden='true'
                              />
                            }
                            className='bg-white dark:bg-gray-900'
                          ></EmptyState>
                        )}
                        {/* skeleton */}
                        {!isLoadedQueuesNotManaged &&
                          Array.from(Array(6)).map((e, index) => (
                            <li key={index}>
                              <div className='flex items-center py-4'>
                                {/* avatar skeleton */}
                                <div className='min-w-0 flex-1 px-2 py-2'>
                                  <div className='flex flex-col justify-center'>
                                    {/* line skeleton */}
                                    <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        {isLoadedQueuesNotManaged &&
                          calls?.rows?.map((call: any, index: number) => (
                            <li
                              key={index}
                              className='flex justify-between gap-x-6 pt-1 items-center'
                            >
                              {/* time */}
                              <div className='py-4 px-2 pr-3'>
                                <div className='flex flex-col'>
                                  <div>{formatDateLoc(call.time * 1000, 'PP')}</div>
                                  <div className='text-gray-500 dark:text-gray-500'>
                                    {getCallTimeToDisplay(call.time * 1000)}
                                  </div>
                                </div>
                              </div>

                              {/* name / number */}
                              <div className='px-3 py-4'>
                                {call.name && (
                                  <div
                                    onClick={() =>
                                      openShowQueueCallDrawer(call, queueManagerStore.queues)
                                    }
                                  >
                                    <span
                                      className={classNames(
                                        call.cid && 'cursor-pointer hover:underline',
                                      )}
                                    >
                                      {call.name}
                                    </span>
                                  </div>
                                )}
                                <div
                                  onClick={() =>
                                    openShowQueueCallDrawer(call, queueManagerStore.queues)
                                  }
                                  className={classNames(
                                    call.name && 'text-gray-500 dark:text-gray-500',
                                  )}
                                >
                                  <span className='cursor-pointer hover:underline'>{call.cid}</span>
                                </div>
                              </div>

                              {/* outcome */}
                              <div className='whitespace-nowrap px-3 py-4'>
                                <div className='flex items-center'>
                                  <span
                                    className='tooltip-outcome-value'
                                    id={`tooltip-outcome-value-${index}`}
                                  >
                                    {getCallIcon(call)}
                                  </span>
                                  <Tooltip
                                    anchorSelect={`#tooltip-outcome-value-${index}`}
                                    place='left'
                                  >
                                    {t(`Queues.outcome_${call.event}`)}
                                  </Tooltip>
                                </div>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>
                  <div className='pt-8 px-4 flex items-center justify-between'>
                    <Link
                      href={{ pathname: '/queueuManager', query: { section: 'notManagedCalls' } }}
                    >
                      <a className='hover:underline text-gray-900 font-semibold dark:text-gray-100'>
                        {t('QueueManager.Go to not managed customers')}
                      </a>
                    </Link>
                    <Link
                      href={{ pathname: '/queueuManager', query: { section: 'notManagedCalls' } }}
                    >
                      <FontAwesomeIcon
                        icon={faArrowRight}
                        className='h-5 w-5 pr-2 cursor-pointer text-gray-600 dark:text-gray-200'
                        aria-hidden='true'
                      />
                    </Link>
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
            {expandedWaitingCall && (
              <>
                <div className='text-sm'>
                  <div className='border rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'>
                    {queueManagerStore &&
                    queueManagerStore?.isLoaded &&
                    queueManagerStore?.queues[selectedValue?.queue] &&
                    isEmpty(queueManagerStore?.queues[selectedValue.queue]?.waitingCallersList) ? (
                      <div className='p-4'>{t('Queues.No calls')}</div>
                    ) : (
                      <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                        <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                          <div className='sm:rounded-md max-h-[12.7rem] overflow-auto'>
                            <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                              <thead className='bg-gray-100 dark:bg-gray-800'>
                                <tr>
                                  <th
                                    scope='col'
                                    className='py-3 pl-4 pr-2 text-left font-semibold'
                                  >
                                    {t('Queues.Caller')}
                                  </th>
                                  <th scope='col' className='px-2 py-3 text-left font-semibold'>
                                    {t('Queues.Position')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='pl-2 pr-4 py-3 text-left font-semibold'
                                  >
                                    {t('Queues.Wait')}
                                  </th>
                                </tr>
                              </thead>
                              <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                                {queueManagerStore?.queues[selectedValue.queue]
                                  ?.waitingCallersList &&
                                  Object.values(
                                    queueManagerStore?.queues[selectedValue.queue]
                                      ?.waitingCallersList,
                                  )?.map((call: any, index: number) => (
                                    <tr key={index}>
                                      <td className='py-3 pl-4 pr-2'>
                                        <div className='flex flex-col'>
                                          <div className='font-medium'>{call.name}</div>
                                          {call.name !== call.num && <div>{call.num}</div>}
                                        </div>
                                      </td>
                                      <td className='px-2 py-3'>{call.position}</td>
                                      <td className='pl-2 pr-4 py-3'>
                                        <CallDuration startTime={call.waitingTime} />
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

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

            {expandedConnectedCall && (
              <div className='text-sm'>
                <div className='border rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'>
                  {queueManagerStore &&
                  queueManagerStore?.isLoaded &&
                  queueManagerStore?.queues[selectedValue?.queue] &&
                  isEmpty(queueManagerStore?.queues[selectedValue.queue]?.connectedCalls) ? (
                    <div className='p-4'>{t('Queues.No calls')}</div>
                  ) : (
                    <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <div className='sm:rounded-md max-h-[17rem] overflow-auto'>
                          <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                            <thead className='bg-gray-100 dark:bg-gray-800'>
                              <tr>
                                <th scope='col' className='py-3 pl-4 pr-2 text-left font-semibold'>
                                  {t('Queues.Caller')}
                                </th>
                                <th scope='col' className='px-2 py-3 text-left font-semibold'>
                                  {t('Queues.Operator')}
                                </th>
                                <th scope='col' className='pl-2 pr-4 py-3 text-left font-semibold'>
                                  {t('Queues.Duration')}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                              {queueManagerStore?.queues[selectedValue.queue]?.connectedCalls &&
                                Object.values(
                                  queueManagerStore?.queues[selectedValue.queue]?.connectedCalls,
                                )?.map((call: any, index: number) => (
                                  <tr key={index}>
                                    <td className='py-3 pl-4 pr-2'>
                                      <div className='flex flex-col'>
                                        <div className='font-medium'>
                                          {call.conversation.counterpartName}
                                        </div>
                                        {call.conversation.counterpartName !==
                                          call.conversation.counterpartNum && (
                                          <div>{call.conversation.counterpartNum}</div>
                                        )}
                                      </div>
                                    </td>
                                    <td className='px-2 py-3'>
                                      <div className='flex items-center gap-3 overflow-hidden'>
                                        <Avatar
                                          rounded='full'
                                          src={operators[call.operatorUsername].avatarBase64}
                                          placeholderType='operator'
                                          size='small'
                                          status={operators[call.operatorUsername].mainPresence}
                                          onClick={() =>
                                            openShowOperatorDrawer(operators[call.operatorUsername])
                                          }
                                          className='cursor-pointer'
                                        />
                                        <div className='flex flex-col overflow-hidden'>
                                          <div>{operators[call.operatorUsername].name}</div>
                                          <div className='text-gray-500 dark:text-gray-400'>
                                            {
                                              operators[call.operatorUsername].endpoints
                                                .mainextension[0].id
                                            }
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className='pl-2 pr-4 py-3'>
                                      <CallDuration
                                        key={`callDuration-${call.conversation.id}`}
                                        startTime={call.conversation.startTime}
                                      />
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
                  {!allQueuesStats && !queueManagerStore?.isLoaded && (
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
                  {allQueuesStats &&
                    queueManagerStore?.queues[selectedValue.queue]?.allQueueOperators?.length >
                      0 && (
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
                                    openShowOperatorDrawer(operators[operator.shortname])
                                  }
                                  className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-primary dark:focus:ring-primary'
                                >
                                  <span className='flex min-w-0 flex-1 items-center space-x-3'>
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
          </div>
        </div>
      </div>
    </>
  )
}

QueueManagement.displayName = 'QueueManagement'
