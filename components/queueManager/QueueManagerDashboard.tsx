// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Button, Dropdown, EmptyState, IconSwitch, TextInput } from '../common'
import { isEmpty, debounce, get } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import {
  faPause,
  faChevronDown,
  faTriangleExclamation,
  faPhone,
  faExpand,
  faPhoneSlash,
  faArrowLeft,
  faChevronUp,
  faArrowUpWideShort,
  faArrowDownWideShort,
} from '@fortawesome/free-solid-svg-icons'
import {
  getAlarm,
  getQueues,
  getAgentsStats,
  getQueueStats,
  getTotalsForEachKey,
  sortAgentsData,
  convertToHumanReadable,
  getQueuesHistory,
  groupDataByHour,
  groupDataByHourLineChart,
  getRandomColor,
  groupDataByHourLineCallsChart,
} from '../../lib/queueManager'
import { invertObject } from '../../lib/utils'
import BarChart from '../chart/BarChart'
import LineChart from '../chart/LineChart'

export interface QueueManagerDashboardProps extends ComponentProps<'div'> {}

export const QueueManagerDashboard: FC<QueueManagerDashboardProps> = ({
  className,
}): JSX.Element => {
  const { t } = useTranslation()

  const [firstRenderQueuesList, setFirstRenderQueuesList]: any = useState(true)
  const [firstRenderQueuesStats, setFirstRenderQueuesStats]: any = useState(true)
  const [firstRenderQueuesHistory, setFirstRenderQueuesHistory]: any = useState(true)
  const [firstRenderQueuesAgents, setFirstRenderQueuesAgents]: any = useState(true)

  // load operators information from the store
  const operatorsStore = useSelector((state: RootState) => state.operators)
  const [avatarIcon, setAvatarIcon] = useState<any>()
  const [operatorInformation, setOperatorInformation] = useState<any>()

  // get operator avatar base64 from the store
  useEffect(() => {
    if (operatorsStore && !avatarIcon) {
      setAvatarIcon(operatorsStore.avatars)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // get operator information from the store
  useEffect(() => {
    if (operatorsStore && !operatorInformation) {
      setOperatorInformation(operatorsStore.operators)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function getAvatarData(announcement: any) {
    let userAvatarData = ''
    if (announcement.shortname && avatarIcon) {
      for (const username in avatarIcon) {
        if (username === announcement.shortname) {
          userAvatarData = avatarIcon[username]
          break
        }
      }
    }
    return userAvatarData
  }

  const [zoomedCardIndex, setZoomedCardIndex] = useState(null)

  const handleZoom = (index: any) => {
    if (zoomedCardIndex === index) {
      setZoomedCardIndex(null) // Ripristina le dimensioni originali se la card è già ingrandita
    } else {
      setZoomedCardIndex(index) // Ingrandisci la card se è diversa da quella attualmente ingrandita
    }
  }

  const [expandedOperators, setExpandedOperators] = useState(false)
  const [expandedQueues, setExpandedQueues] = useState(true)

  const toggleExpandedOperators = () => {
    setExpandedOperators(!expandedOperators)
  }

  const toggleExpandedQueues = () => {
    setExpandedQueues(!expandedQueues)
  }

  const [queuesList, setQueuesList] = useState<any>({})
  const [agentsStatsList, setAgentsStatsList] = useState<any>({})
  const [isLoadedQueues, setLoadedQueues] = useState(false)
  const [isLoadedQueuesStats, setLoadedQueuesStats] = useState(false)
  const [isLoadedQueuesAgents, setLoadedQueuesAgents] = useState(false)
  const [isLoadedQueuesHistory, setLoadedQueuesHistory] = useState(false)
  const [queuesHistory, setQueuesHistory] = useState<any>({})

  // const [updateDashboardInterval, SetUpdateDashboardInterval] = useState(3000)

  //get queues list information
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

  // Get queues history information
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderQueuesHistory) {
      setFirstRenderQueuesHistory(false)
      return
    }
    async function getQueueHistory() {
      setLoadedQueuesHistory(false)
      try {
        const res = await getQueuesHistory()
        setQueuesHistory(res)
      } catch (err) {
        console.error(err)
      }
      setLoadedQueuesHistory(true)
    }
    if (!isLoadedQueuesHistory) {
      getQueueHistory()
    }
  }, [firstRenderQueuesHistory, isLoadedQueuesHistory])

  const [dashboardData, setDashboardData] = useState<any>(0)
  const [totalHoursNumber, setTotalHoursNumber] = useState<any>(0)
  const [answeredAverage, setAnsweredAverage] = useState(0)

  useEffect(() => {
    if (isLoadedQueuesHistory && queuesHistory && queuesList) {
      let test = initTopSparklineChartsData(queuesHistory)
      extractStartHour(test)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadedQueuesHistory, queuesHistory, queuesList])

  useEffect(() => {
    if (isLoadedQueuesHistory && queuesHistory && queuesList && dashboardData !== 0) {
      let hourlydistribution = initHourlyChartsDataPerQueues(queuesHistory)
      creationBarChart(hourlydistribution.stackedBarComparison)
      creationLineChartCallsHour(hourlydistribution.lineTotal)
      creationEnterCallsHour(hourlydistribution.stacked)
    }
  }, [dashboardData, isLoadedQueuesHistory, queuesHistory, queuesList])

  const [labelsOutcome, setLabelsOutcome] = useState<any>([])
  const [datasetsOutcome, setDatasetsOutcome] = useState<any>([])

  const [labelsCallsHour, setLabelsCallsHour] = useState<any>([])
  const [datasetsCallsHour, setDatasetsCallsHour] = useState<any>([])

  const [labelsIncomingCallsHour, setLabelsIncomingCallsHour] = useState<any>([])
  const [datasetsIncomingCallsHour, setDatasetsIncomingCallsHour] = useState<any>([])

  const creationBarChart = (chartValue: any) => {
    let groupedChartInformation = groupDataByHour(chartValue)
    const labels = Object.keys(groupedChartInformation)
    setLabelsOutcome(labels)
    const datasets = [
      {
        label: 'Answered',
        data: [] as number[],
        backgroundColor: '#10B981',
        // borderRadius: [20, 20, 0, 0],
        // borderSkipped: false,
        borderRadius: 5,
      },
      {
        label: 'Failed',
        data: [] as number[],
        backgroundColor: '#6b7280',
        // borderRadius: [20, 20, 0, 0],
        // borderSkipped: false,
        borderRadius: 5,
      },
      {
        label: 'Invalid',
        data: [] as number[],
        backgroundColor: '#ff0000',
        // borderRadius: [20, 20, 0, 0],
        // borderSkipped: false,
        borderRadius: 5,
      },
    ]

    labels.forEach((label) => {
      const data = groupedChartInformation[label]
      datasets[0].data.push(data.answered)
      datasets[1].data.push(data.failed)
      datasets[2].data.push(data.invalid)
    })

    setDatasetsOutcome(datasets)
  }

  const creationLineChartCallsHour = (chartValue: any) => {
    const groupedLineChartInformation = groupDataByHourLineChart(chartValue)
    const labels = Object.keys(groupedLineChartInformation)
    setLabelsCallsHour(labels)

    const datasets = labels.map((label, index) => {
      const randomColor = getRandomColor(index)
      return {
        label: label,
        data: groupedLineChartInformation[label],
        backgroundColor: randomColor,
        borderRadius: 5,
        tension: 0.4,
        fill: true,
      }
    })

    setDatasetsCallsHour(datasets)
  }

  //line chart incoming call hours
  const creationEnterCallsHour = (chartValue: any) => {
    const groupedLineChartCallsHourInformation = groupDataByHourLineCallsChart(chartValue)
  
    const labels = Object.keys(groupedLineChartCallsHourInformation)
    //first label should keep all the hours values
    const hours = Object.keys(groupedLineChartCallsHourInformation[labels[0]])
  
    setLabelsIncomingCallsHour(hours)
  
    const datasets = labels.map((label, index) => {
      const randomColor = getRandomColor(index)
      const data = hours.map((hour) => groupedLineChartCallsHourInformation[label][hour])
      return {
        label: label,
        data: data,
        backgroundColor: randomColor,
        borderRadius: 5,
        tension: 0.4,
        fill: true,
      }
    })
  
    setDatasetsIncomingCallsHour(datasets)
  }

  const initHourlyChartsDataPerQueues = (queuesHistoryData: any) => {
    //create an empty object to collect chart data
    var queuesHistoryUnified: {
      stacked: {
        data: any[]
      }
      lineTotal: {
        dataByTopic: any[]
      }
      lineFailed: {
        dataByTopic: any[]
      }
      stackedBarComparison: {
        data: any[]
      }
    } = {
      stacked: {
        data: [],
      },
      lineTotal: {
        dataByTopic: [],
      },
      lineFailed: {
        dataByTopic: [],
      },
      stackedBarComparison: {
        data: [],
      },
    }

    let queuesUnified = {} as Record<string, any>

    //cycle through all queueHistory elements
    for (var q in queuesHistoryData) {
      setTotalHoursNumber(0)
      let counter = 0

      for (let i = 0; i < queuesHistoryData[q].answered.length; i++) {
        //check if queueHistoryData is more than dashboard begin time
        if (new Date(queuesHistoryData[q].answered[i].fullDate) > dashboardData) {
          queuesHistoryData[q].answered[i].name = queuesList[q].name
          queuesHistoryUnified.stacked.data.push(queuesHistoryData[q].answered[i])

          counter++
          if (counter === 2) {
            setTotalHoursNumber(totalHoursNumber + 1)
            counter = 0
          }
        }
      }

      // line chart total object
      var totalTopic: {
        topic: string
        topicName: string
        dates: any[]
      } = {
        topic: q,
        topicName: queuesList[q].name,
        dates: [],
      }
      for (let i = 0; i < queuesHistoryData[q]?.total?.length; i++) {
        if (new Date(queuesHistoryData[q]?.total[i]?.fullDate) > dashboardData) {
          totalTopic.dates.push(queuesHistoryData[q]?.total[i])
        }
      }

      queuesHistoryUnified.lineTotal.dataByTopic.push(totalTopic)

      // line chart failed
      var failedTopic: {
        topic: string
        topicName: string
        dates: any[]
      } = {
        topic: q,
        topicName: queuesList[q].name,
        dates: [],
      }
      for (let i = 0; i < queuesHistoryData[q]?.failed?.length; i++) {
        if (new Date(queuesHistoryData[q]?.failed[i]?.fullDate) > dashboardData) {
          failedTopic.dates.push(queuesHistoryData[q]?.failed[i])
        }
      }

      queuesHistoryUnified.lineFailed.dataByTopic.push(failedTopic)

      for (let i = 0; i < queuesHistoryData[q].total.length; i++) {
        const date = new Date(queuesHistoryData[q].total[i].fullDate)

        const hour = date.getHours()

        const minutes = date.getMinutes()

        const dateName = `${hour < 10 ? '0' + hour : hour}:${minutes == 0 ? '00' : minutes}`
        if (!queuesUnified[dateName])
          queuesUnified[dateName] = {
            date: date,
            answered: 0,
            failed: 0,
            invalid: 0,
          }
        queuesUnified[dateName].answered += queuesHistoryData[q].answered[i].value || 0
        queuesUnified[dateName].failed += queuesHistoryData[q].failed[i].value || 0
        queuesUnified[dateName].invalid += queuesHistoryData[q].invalid[i].value || 0
      }

      //cycle hours
      for (let k in queuesUnified) {
        //check if hour is inside date
        if (new Date(queuesUnified[k].date) > dashboardData) {
          queuesHistoryUnified.stackedBarComparison.data.push({
            date: k,
            stack: 'answered',
            views: queuesUnified[k].answered,
            valueLabel:
              (100 * queuesUnified[k].answered) /
              (queuesUnified[k].answered + queuesUnified[k].failed + queuesUnified[k].invalid),
          })
          queuesHistoryUnified.stackedBarComparison.data.push({
            date: k,
            stack: 'failed',
            views: queuesUnified[k].failed,
            valueLabel:
              (100 * queuesUnified[k].failed) /
              (queuesUnified[k].answered + queuesUnified[k].failed + queuesUnified[k].invalid),
          })
          queuesHistoryUnified.stackedBarComparison.data.push({
            date: k,
            stack: 'invalid',
            views: queuesUnified[k].invalid,
            valueLabel:
              (100 * queuesUnified[k].invalid) /
              (queuesUnified[k].answered + queuesUnified[k].failed + queuesUnified[k].invalid),
          })
        }
      }
    }
    return queuesHistoryUnified
  }

  //find totals
  const initTopSparklineChartsData = (queuesHistoryData: any) => {
    const queuesHistoryTotalized = {} as Record<string, any>

    for (const q in queuesHistoryData) {
      for (const c in queuesHistoryData[q]) {
        if (!queuesHistoryTotalized[c]) {
          queuesHistoryTotalized[c] = []
        }

        for (let i = 0; i < queuesHistoryData[q][c].length; i++) {
          if (!queuesHistoryTotalized[c][i]) {
            queuesHistoryTotalized[c][i] = {}
          }

          queuesHistoryTotalized[c][i].name = c
          queuesHistoryTotalized[c][i].fullDate = queuesHistoryData[q][c][i].fullDate
          queuesHistoryTotalized[c][i].date = queuesHistoryData[q][c][i].date

          if (!queuesHistoryTotalized[c][i].value) {
            queuesHistoryTotalized[c][i].value = 0
          }

          queuesHistoryTotalized[c][i].value += queuesHistoryData[q][c][i].value
        }
      }
    }
    return queuesHistoryTotalized
  }

  const extractStartHour = (totalizedData: any) => {
    let beginTime = 0
    for (var h in totalizedData.total) {
      if (totalizedData.total[h].value > 0) {
        beginTime = new Date(totalizedData.total[h].fullDate).getTime() - 3600000
        setDashboardData(beginTime)
        break
      }
    }

    for (var c in totalizedData) {
      for (var h in totalizedData[c]) {
        if (new Date(totalizedData[c][h].fullDate).getTime() < beginTime) {
          delete totalizedData[c][h]
        }
      }
    }
    return totalizedData
  }

  const [allQueuesStats, setAllQueuesStats] = useState(false)
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

  // Function to retrieve the queues' dashboard rank based on specified keys
  const getQueuesDashboardRank = (keys: any) => {
    // Array to store queue data
    const result = []
    // Temporary variable to iterate over queues
    let queue: any

    for (queue of Object.values(queuesList)) {
      // Iterate over each queue in the queuesList object
      if (!isNaN(queue.queue)) {
        // Check if the 'queue' field of the queue is a number
        const queueData = {
          name: queue.name,
          queue: queue.queue,
          // Object to store queue statistics values
          values: {} as Record<string, any>,
        }

        // Iterate over the specified keys
        for (const key of keys) {
          // Assign the corresponding statistic value to the queue
          queueData.values[key] = queue.qstats?.[key] || 0
        }
        // Add the queue data to the result array
        result.push(queueData)
      }
    }

    // Return the array of queue data
    return result
  }

  const [totalAll, setTotalAll] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [totalFailed, setTotalFailed] = useState(0)
  const [totalInvalid, setTotalInvalid] = useState(0)

  const [queuesAnswered, setQueuesAnswered] = useState({} as Record<string, any>)
  const [queuesTotalCalls, setQueuesTotalCalls] = useState({} as Record<string, any>)
  const [queuesFailedCalls, setQueuesFailedCalls] = useState({} as Record<string, any>)
  const [queuesInvalidCalls, setQueuesInvalidCalls] = useState({} as Record<string, any>)
  const [queuesFailures, setQueuesFailures] = useState({} as Record<string, any>)

  const [sortOrderQueuesAnswered, setSortOrderQueuesAnswered] = useState<'asc' | 'desc'>('desc')
  const [sortOrderQueuesTotalCalls, setSortOrderQueuesTotalCalls] = useState<'asc' | 'desc'>('desc')
  const [sortOrderQueuesFailedCalls, setSortOrderQueuesFailedCalls] = useState<'asc' | 'desc'>(
    'desc',
  )
  const [sortOrderQueuesInvalidCalls, setSortOrderQueuesInvalidCalls] = useState<'asc' | 'desc'>(
    'desc',
  )
  const [sortOrderQueuesFailures, setSortOrderQueuesFailures] = useState<'asc' | 'desc'>('desc')

  function handleSortOrderQueuesAnsweredToggle() {
    setSortOrderQueuesAnswered(sortOrderQueuesAnswered === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderQueuesTotalCallsToggle() {
    setSortOrderQueuesTotalCalls(sortOrderQueuesTotalCalls === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderQueuesFailedCallsToggle() {
    setSortOrderQueuesFailedCalls(sortOrderQueuesFailedCalls === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderQueuesInvalidCallsToggle() {
    setSortOrderQueuesInvalidCalls(sortOrderQueuesInvalidCalls === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderQueuesFailuresToggle() {
    setSortOrderQueuesFailures(sortOrderQueuesFailures === 'asc' ? 'desc' : 'asc')
  }

  //get total calls for headers cards Dashboard
  useEffect(() => {
    // carry out the operations only after the data has been inserted to the queues
    if (allQueuesStats) {
      //total calls tables section
      const keys = ['tot_processed', 'tot_failed', 'tot', 'tot_null']
      const calculatedRank = getQueuesDashboardRank(keys)

      const queuesAnsweredData = Object.values(calculatedRank).map((agent: any, index: number) => ({
        name: agent.name,
        queue: agent.queue,
        values: agent.values.tot_processed,
      }))

      const queuesTotalCallsData = Object.values(calculatedRank).map(
        (agent: any, index: number) => ({
          name: agent.name,
          queue: agent.queue,
          values: agent.values.tot,
        }),
      )

      const queuesFailedCallsData = Object.values(calculatedRank).map(
        (agent: any, index: number) => ({
          name: agent.name,
          queue: agent.queue,
          values: agent.values.tot_failed,
        }),
      )

      const queuesInvalidCallsData = Object.values(calculatedRank).map(
        (agent: any, index: number) => ({
          name: agent.name,
          queue: agent.queue,
          values: agent.values.tot_null,
        }),
      )

      const sortedQueuesAgentsAnswered = sortAgentsData(queuesAnsweredData, sortOrderQueuesAnswered)
      const sortedQueuesTotalCallsData = sortAgentsData(
        queuesTotalCallsData,
        sortOrderQueuesTotalCalls,
      )
      const sortedQueuesFailedCalls = sortAgentsData(
        queuesFailedCallsData,
        sortOrderQueuesFailedCalls,
      )
      const sortedQueuesInvalidCalls = sortAgentsData(
        queuesInvalidCallsData,
        sortOrderQueuesInvalidCalls,
      )

      setQueuesAnswered(sortedQueuesAgentsAnswered)
      setQueuesTotalCalls(sortedQueuesTotalCallsData)
      setQueuesFailedCalls(sortedQueuesFailedCalls)
      setQueuesInvalidCalls(sortedQueuesInvalidCalls)

      //failure calls tables section
      const reasonsToFailCallsKeys = [
        'failed_abandon',
        'failed_full',
        'failed_inqueue_noagents',
        'failed_outqueue_noagents',
        'failed_timeout',
        'failed_withkey',
      ]

      const failureCallRank = getQueuesDashboardRank(reasonsToFailCallsKeys)
      const totalValueForEachFailuerType = getTotalsForEachKey(failureCallRank)

      const queuesFailuresData = Object.values(totalValueForEachFailuerType).map(
        (agent: any, index: number) => ({
          name: agent.name,
          queue: agent.queue,
          values: agent.values.value,
          note: agent.note,
        }),
      )

      const sortedQueuesFailuresData = sortAgentsData(queuesFailuresData, sortOrderQueuesFailures)
      setQueuesFailures(sortedQueuesFailuresData)

      // top section of the dashboard page
      // total counts cards section
      // Initialize variables to hold the total counts
      let totalAllCount = 0
      let totalAnsweredCount = 0
      let totalFailedCount = 0
      let totalInvalidCount = 0

      // Iterate over each queue in calculatedRank and calculate the totals
      calculatedRank.forEach((queue) => {
        totalAllCount += queue.values.tot
        totalAnsweredCount += queue.values.tot_processed
        totalFailedCount += queue.values.tot_failed
        totalInvalidCount += queue.values.tot_null
      })

      // Update the state with the calculated totals
      setTotalAll(totalAllCount)
      setTotalAnswered(totalAnsweredCount)
      setTotalFailed(totalFailedCount)
      setTotalInvalid(totalInvalidCount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allQueuesStats,
    queuesList,
    sortOrderQueuesAnswered,
    sortOrderQueuesFailedCalls,
    sortOrderQueuesTotalCalls,
    sortOrderQueuesInvalidCalls,
    sortOrderQueuesFailures,
  ])

  //get queues agents stats
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderQueuesAgents) {
      setFirstRenderQueuesAgents(false)
      return
    }
    async function getQueuesAgentsStats() {
      setLoadedQueuesAgents(false)
      try {
        const res = await getAgentsStats()
        setAgentsStatsList(res)
      } catch (err) {
        console.error(err)
      }
      setLoadedQueuesAgents(true)
    }
    if (!isLoadedQueuesAgents) {
      getQueuesAgentsStats()
    }
  }, [firstRenderQueuesAgents, isLoadedQueuesAgents])

  const agentsDashboardRanks = (keys: any) => {
    let n = 0
    const list = {} as Record<string, any>
    let q: any

    for (const agent in agentsStatsList) {
      for (q in agentsStatsList[agent]) {
        if (!isNaN(q)) {
          list[n] = {
            name: agent,
            queue: q,
            values: {},
          }

          for (const key of keys) {
            list[n].values[key] = agentsStatsList[agent][q][key] || 0
          }
          n++
        }
      }
    }

    return list
  }

  function getFullUsername(announcement: any, operatorInformation: any) {
    let shortname = ''
    if (announcement.name && operatorInformation) {
      const username = operatorInformation[announcement.name]
      if (username) {
        shortname = username
      }
    }
    return shortname
  }

  function getAvatarMainPresence(announcement: any) {
    let userMainPresence = null
    if (announcement.shortname && operatorInformation) {
      for (const username in operatorInformation) {
        if (username === announcement.shortname) {
          userMainPresence = operatorInformation[username].presence
        }
      }
    }
    return userMainPresence
  }

  const [agentsAnswered, setAgentsAnswered] = useState({} as Record<string, any>)
  const [agentsLost, setAgentsLost] = useState({} as Record<string, any>)
  const [agentsPauseOnLogon, setAgentsPauseOnLogon] = useState({} as Record<string, any>)

  const [agentsLoginTime, setAgentsLoginTime] = useState({} as Record<string, any>)
  const [agentsPauseTime, setAgentsPauseTime] = useState({} as Record<string, any>)
  const [inCallPercentage, setInCallPercentage] = useState({} as Record<string, any>)

  const [sortOrderAnsweredCalls, setSortOrderAnsweredCalls] = useState<'asc' | 'desc'>('desc')
  const [sortOrderUnansweredCalls, setSortOrderUnansweredCalls] = useState<'asc' | 'desc'>('desc')
  const [sortOrderPauseOnLogin, setSortOrderPauseOnLogin] = useState<'asc' | 'desc'>('desc')

  const [sortOrderAgentsLoginTime, setSortOrderAgentsLoginTime] = useState<'asc' | 'desc'>('desc')
  const [sortOrderAgentsPauseTime, setSortOrderAgentsPauseTime] = useState<'asc' | 'desc'>('desc')
  const [sortOrderInCallPercentage, setSortOrderInCallPercentage] = useState<'asc' | 'desc'>('desc')

  function handleSortOrderAnsweredCallsToggle() {
    setSortOrderAnsweredCalls(sortOrderAnsweredCalls === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderUnansweredCallsToggle() {
    setSortOrderUnansweredCalls(sortOrderUnansweredCalls === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderPauseOnLoginToggle() {
    setSortOrderPauseOnLogin(sortOrderPauseOnLogin === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderAgentsLoginTimeToggle() {
    setSortOrderAgentsLoginTime(sortOrderAgentsLoginTime === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderAgentsPauseTimeToggle() {
    setSortOrderAgentsPauseTime(sortOrderAgentsPauseTime === 'asc' ? 'desc' : 'asc')
  }

  function handleSortOrderInCallPercentageToggle() {
    setSortOrderInCallPercentage(sortOrderInCallPercentage === 'asc' ? 'desc' : 'asc')
  }

  // const avgRecallTimeRanks = (queuesInformation: any) => {
  //   const newQueuesInformation = { ...queuesInformation };

  //   for (const agent in newQueuesInformation) {
  //     if (
  //       !newQueuesInformation[agent].allQueues ||
  //       (!newQueuesInformation[agent].allQueues.avg_recall_time &&
  //         !newQueuesInformation[agent].allQueues.min_recall_time &&
  //         !newQueuesInformation[agent].allQueues.max_recall_time)
  //     ) {
  //       delete newQueuesInformation[agent];
  //     }
  //   }
  //   return newQueuesInformation;
  // }

  // useEffect(() => {
  //   if (isLoadedQueuesAgents) {
  //     let avgRecallTime = avgRecallTimeRanks(agentsStatsList)
  //   }
  // },[isLoadedQueuesAgents, sortOrderAnsweredCalls])

  useEffect(() => {
    if (isLoadedQueuesAgents) {
      const keys = [
        'calls_taken',
        'no_answer_calls',
        'pause_percent',
        'time_in_logon',
        'time_in_pause',
        'conversation_percent',
      ]
      let calculatedAgent = agentsDashboardRanks(keys)
      const invertedOperatorInformation = invertObject(operatorInformation)

      const agentsAnsweredData = Object.values(calculatedAgent).map(
        (agent: any, index: number) => ({
          name: agent.name,
          shortname: getFullUsername(agent, invertedOperatorInformation),
          queue: agent.queue,
          values: agent.values.calls_taken,
        }),
      )

      const agentsLostData = Object.values(calculatedAgent).map((agent: any, index: number) => ({
        name: agent.name,
        shortname: getFullUsername(agent, invertedOperatorInformation),
        queue: agent.queue,
        values: agent.values.no_answer_calls,
      }))

      const agentsPauseOnLogonData = Object.values(calculatedAgent).map(
        (agent: any, index: number) => ({
          name: agent.name,
          shortname: getFullUsername(agent, invertedOperatorInformation),
          queue: agent.queue,
          values: agent.values.pause_percent,
        }),
      )

      const agentsLoginTimeData = Object.values(calculatedAgent).map(
        (agent: any, index: number) => ({
          name: agent.name,
          shortname: getFullUsername(agent, invertedOperatorInformation),
          queue: agent.queue,
          values: agent.values.time_in_logon,
        }),
      )

      const agentsPauseTimeData = Object.values(calculatedAgent).map(
        (agent: any, index: number) => ({
          name: agent.name,
          shortname: getFullUsername(agent, invertedOperatorInformation),
          queue: agent.queue,
          values: agent.values.time_in_pause,
        }),
      )

      const inCallPercentageData = Object.values(calculatedAgent).map(
        (agent: any, index: number) => ({
          name: agent.name,
          shortname: getFullUsername(agent, invertedOperatorInformation),
          queue: agent.queue,
          values: agent.values.conversation_percent,
        }),
      )

      const sortedAgentsAnswered = sortAgentsData(agentsAnsweredData, sortOrderAnsweredCalls)
      const sortedAgentsLost = sortAgentsData(agentsLostData, sortOrderUnansweredCalls)
      const sortedAgentsPauseOnLogon = sortAgentsData(agentsPauseOnLogonData, sortOrderPauseOnLogin)

      const sortedAgentsLoginTimeData = sortAgentsData(
        agentsLoginTimeData,
        sortOrderAgentsLoginTime,
      )
      const sortedAgentsPauseTimeData = sortAgentsData(
        agentsPauseTimeData,
        sortOrderAgentsPauseTime,
      )

      const sortedInCallPercentageData = sortAgentsData(
        inCallPercentageData,
        sortOrderInCallPercentage,
      )

      setAgentsAnswered(sortedAgentsAnswered)
      setAgentsLost(sortedAgentsLost)
      setAgentsPauseOnLogon(sortedAgentsPauseOnLogon)
      setAgentsLoginTime(sortedAgentsLoginTimeData)
      setAgentsPauseTime(sortedAgentsPauseTimeData)
      setInCallPercentage(sortedInCallPercentageData)
    }
  }, [
    isLoadedQueuesAgents,
    sortOrderAnsweredCalls,
    sortOrderUnansweredCalls,
    sortOrderPauseOnLogin,
    sortOrderAgentsLoginTime,
    sortOrderAgentsPauseTime,
    sortOrderInCallPercentage,
  ])

  return (
    <>
      {/* Top page section */}
      <div className='border-b rounded-md shadow-md border-gray-200 bg-white dark:bg-gray-900 px-4 py-1 sm:px-6'>
        <div className=''>
          <div className='mx-auto'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6'>
              {/* Alarms section */}
              <div className='flex items-center justify-between px-4 mt-2 mb-2 bg-gray-100 rounded-md'>
                <div className='flex items-center'>
                  <FontAwesomeIcon
                    // icon={queue.expanded ? faChevronUp : faChevronDown}
                    icon={faTriangleExclamation}
                    className='h-6 w-6 pr-6 py-2 cursor-pointer flex items-center text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                    // onClick={() => toggleExpandQueue(queue)}
                  />
                  <div className='flex flex-col justify-center'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>0</p>
                    <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-500'>
                      {t('QueueManager.Alarms')}
                    </p>
                  </div>
                </div>
                <FontAwesomeIcon
                  // icon={queue.expanded ? faChevronUp : faChevronDown}
                  icon={faChevronDown}
                  className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                  aria-hidden='true'
                  // onClick={() => toggleExpandQueue(queue)}
                />
              </div>

              {/* Total calls section */}
              <div className='flex items-center justify-between px-4 mt-2 mb-2'>
                <div className='flex items-center'>
                  <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>{totalAll}</p>
                    <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-500'>
                      {t('QueueManager.Total calls')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answered calls section */}
              <div className='flex items-center justify-between px-4 mt-2 mb-2'>
                <div className='flex items-center'>
                  <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className='h-6 w-6 cursor-pointer -rotate-45 text-emerald-600 dark:text-emerald-600'
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>
                      {totalAnswered}
                    </p>
                    <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-500'>
                      {t('QueueManager.Answered calls')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lost calls section */}
              <div className='flex items-center justify-between px-4 mt-2 mb-2'>
                <div className='flex items-center'>
                  <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                    <FontAwesomeIcon
                      icon={faMissed}
                      className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>{totalFailed}</p>
                    <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-500'>
                      {t('QueueManager.Lost calls')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invalid calls section */}
              <div className='flex items-center justify-between px-4 mt-2 mb-2'>
                <div className='flex items-center'>
                  <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                    <FontAwesomeIcon
                      icon={faPhoneSlash}
                      className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>
                      {totalInvalid}
                    </p>
                    <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-500'>
                      {t('QueueManager.Invalid calls')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Waiting calls section */}
              <div className='flex items-center justify-between px-4 mt-5 mb-5'>
                <div className='flex items-center'>
                  <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                    <FontAwesomeIcon
                      icon={faPause}
                      className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>0</p>
                    <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-500'>
                      {t('QueueManager.Waiting calls')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart section */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2'>
        {/* Hourly distribution of incoming calls section*/}
        <div className={`pt-8 ${zoomedCardIndex === 0 ? 'col-span-2' : 'col-span-1'}`}>
          {/* title */}
          <h2 className='text-md ml-4 font-semibold mb-4'>
            {t('QueueManager.Hourly distribution of incoming calls')}
          </h2>

          <div className='border-b rounded-md shadow-md bg-white dark:bg-gray-900 px-4 py-5 sm:px-6 mt-1 relative w-full min-h-full'>
            <div className='flex space-x-3 h-96'>
              <div className='min-w-0 flex-1 '>
                {/* ... */}
                <LineChart labels={labelsOutcome} datasets={datasetsCallsHour} />
              </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-10 w-10 flex items-center justify-center rounded-md'
                variant='white'
                onClick={() => handleZoom(0)}
              >
                <FontAwesomeIcon
                  icon={faExpand}
                  className='h-6 w-6 cursor-pointer text-gray-500 dark:text-gray-500'
                  aria-hidden='true'
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Hourly distribution of call results */}
        <div
          className={`pt-8 ${zoomedCardIndex === 1 ? 'col-span-2 ' : 'col-span-1'} ${
            zoomedCardIndex === 0 ? 'mt-4 ' : ''
          }`}
        >
          {/* title */}
          <h2 className='text-md ml-4 font-semibold mb-4'>
            {t('QueueManager.Hourly distribution of call results')}
          </h2>

          <div className='border-b rounded-md shadow-md bg-white dark:bg-gray-900 px-4 py-5 sm:px-6 mt-1 relative w-full h-full'>
            <div className='flex space-x-3 h-96'>
              <div className='flex-1 w-full'>
                {/* ... */}
                <BarChart labels={labelsOutcome} datasets={datasetsOutcome} />
              </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-10 w-10 flex items-center justify-center rounded-md'
                variant='white'
                onClick={() => handleZoom(1)}
              >
                <FontAwesomeIcon
                  icon={faExpand}
                  className='h-6 w-6 cursor-pointer text-gray-500 dark:text-gray-500'
                  aria-hidden='true'
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Hourly distribution of calls answered*/}
        <div className={`pt-12 ${zoomedCardIndex === 2 ? 'col-span-2' : 'col-span-1'}`}>
          {/* title */}
          <h2 className='text-md ml-4 font-semibold mb-4'>
            {t('QueueManager.Hourly distribution of calls answered')}
          </h2>

          <div className='border-b rounded-md shadow-md bg-white dark:bg-gray-900 px-4 py-5 sm:px-6 mt-1 relative w-full h-full'>
            <div className='flex space-x-3 h-96'>
              <div className='min-w-0 flex-1 '>
                {/* ... */}
                <LineChart labels={labelsIncomingCallsHour} datasets={datasetsIncomingCallsHour} />
              </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-10 w-10 flex items-center justify-center rounded-md'
                variant='white'
                onClick={() => handleZoom(2)}
              >
                <FontAwesomeIcon
                  icon={faExpand}
                  className='h-6 w-6 cursor-pointer text-gray-500 dark:text-gray-500'
                  aria-hidden='true'
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Hourly distribution of not answered calls*/}
        <div className={`pt-12 ${zoomedCardIndex === 3 ? 'col-span-2' : 'col-span-1'}`}>
          {/* title */}
          <h2 className='text-md ml-4 font-semibold mb-4'>
            {t('QueueManager.Hourly distribution of not answered calls')}
          </h2>

          <div className='border-b rounded-md shadow-md bg-white dark:bg-gray-900 px-4 py-5 sm:px-6 mt-1 relative w-full h-full'>
            <div className='flex space-x-3 h-96'>
              <div className='min-w-0 flex-1 '>
                {/* ... */}
                {/* <BarChart labels={labelsOutcome} datasets={datasetsOutcome} /> */}
              </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-10 w-10 flex items-center justify-center rounded-md'
                variant='white'
                onClick={() => handleZoom(3)}
              >
                <FontAwesomeIcon
                  icon={faExpand}
                  className='h-6 w-6 cursor-pointer text-gray-500 dark:text-gray-500'
                  aria-hidden='true'
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Operator statistics section */}
      <div className='py-12 mt-8 relative'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-md font-semibold ml-2'>{t('QueueManager.Operators statistics')}</h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={expandedOperators ? faChevronUp : faChevronDown}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandedOperators}
            />
          </div>
        </div>
        <div className='flex-grow border-b border-gray-300'></div>
        {expandedOperators && (
          <>
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3 pt-6'>
              {/* Number of answered calls  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Number of answered calls')}
                          </h3>
                        </div>
                      </div>
                      <Button variant='white' onClick={() => handleSortOrderAnsweredCallsToggle()}>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderAnsweredCalls === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  {/* <div className='flex-grow border-b border-gray-300'></div> */}
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white'>
                            {Object.values(agentsAnswered).map((agent: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center'>
                                    <div className='h-9 w-9 flex-shrink-0 mr-2'>
                                      <Avatar
                                        src={getAvatarData(agentsAnswered[index])}
                                        placeholderType='operator'
                                        size='small'
                                        bordered
                                        className='cursor-pointer'
                                        status={getAvatarMainPresence(agentsAnswered[index])}
                                      />
                                    </div>
                                    <div className='text-gray-900'>{agent.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {agent.values}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Number of unanswered calls  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Number of unanswered calls')}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant='white'
                        onClick={() => handleSortOrderUnansweredCallsToggle()}
                      >
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderUnansweredCalls === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white'>
                            {Object.values(agentsLost).map((agent: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center'>
                                    <div className='h-9 w-9 flex-shrink-0 mr-2'>
                                      <Avatar
                                        src={getAvatarData(agentsLost[index])}
                                        placeholderType='operator'
                                        size='small'
                                        bordered
                                        className='cursor-pointer'
                                        status={getAvatarMainPresence(agentsLost[index])}
                                      />
                                    </div>
                                    <div className='text-gray-900'>{agent.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {agent.values}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pause on login  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Pause on login')}
                          </h3>
                        </div>
                      </div>
                      <Button variant='white' onClick={() => handleSortOrderPauseOnLoginToggle()}>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderPauseOnLogin === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white'>
                            {Object.values(agentsPauseOnLogon).map((agent: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center'>
                                    <div className='h-9 w-9 flex-shrink-0 mr-2'>
                                      <Avatar
                                        src={getAvatarData(agentsPauseOnLogon[index])}
                                        placeholderType='operator'
                                        size='small'
                                        bordered
                                        className='cursor-pointer'
                                        status={getAvatarMainPresence(agentsPauseOnLogon[index])}
                                      />
                                    </div>
                                    <div className='text-gray-900'>{agent.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {agent.values}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time on login  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Time on login')}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant='white'
                        onClick={() => handleSortOrderAgentsLoginTimeToggle()}
                      >
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderAgentsLoginTime === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white'>
                            {Object.values(agentsLoginTime).map((agent: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center'>
                                    <div className='h-9 w-9 flex-shrink-0 mr-2'>
                                      <Avatar
                                        src={getAvatarData(agentsLoginTime[index])}
                                        placeholderType='operator'
                                        size='small'
                                        bordered
                                        className='cursor-pointer'
                                        status={getAvatarMainPresence(agentsLoginTime[index])}
                                      />
                                    </div>
                                    <div className='text-gray-900'>{agent.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {convertToHumanReadable(agent.values)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pause time  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Pause time')}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant='white'
                        onClick={() => handleSortOrderAgentsPauseTimeToggle()}
                      >
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderAgentsPauseTime === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white'>
                            {Object.values(agentsPauseTime).map((agent: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center'>
                                    <div className='h-9 w-9 flex-shrink-0 mr-2'>
                                      <Avatar
                                        src={getAvatarData(agentsPauseTime[index])}
                                        placeholderType='operator'
                                        size='small'
                                        bordered
                                        className='cursor-pointer'
                                        status={getAvatarMainPresence(agentsPauseTime[index])}
                                      />
                                    </div>
                                    <div className='text-gray-900'>{agent.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {convertToHumanReadable(agent.values)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* In call percentage */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.In call percentage')}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant='white'
                        onClick={() => handleSortOrderInCallPercentageToggle()}
                      >
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderInCallPercentage === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white'>
                            {Object.values(inCallPercentage).map((agent: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center'>
                                    <div className='h-9 w-9 flex-shrink-0 mr-2'>
                                      <Avatar
                                        src={getAvatarData(inCallPercentage[index])}
                                        placeholderType='operator'
                                        size='small'
                                        bordered
                                        className='cursor-pointer'
                                        status={getAvatarMainPresence(inCallPercentage[index])}
                                      />
                                    </div>
                                    <div className='text-gray-900'>{agent.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {agent.values}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Queues statistics section */}
      <div className='py-2 relative'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-md font-semibold ml-2'>{t('QueueManager.Queues statistics')}</h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={expandedQueues ? faChevronUp : faChevronDown}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandedQueues}
            />
          </div>
        </div>
        <div className='flex-grow border-b border-gray-300'></div>
        {expandedQueues && (
          <>
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3 pt-6'>
              {/* Total calls  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Total calls')}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant='white'
                        onClick={() => handleSortOrderQueuesTotalCallsToggle()}
                      >
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderQueuesTotalCalls === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  {/* <div className='flex-grow border-b border-gray-300'></div> */}
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white dark:bg-gray-900'>
                            {Object.values(queuesTotalCalls).map((queue: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center py-3'>
                                    <div className='text-gray-900'>{queue.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {queue.values}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Unanswered calls  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Unanswered calls')}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant='white'
                        onClick={() => handleSortOrderQueuesFailedCallsToggle()}
                      >
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderQueuesFailedCalls === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  {/* <div className='flex-grow border-b border-gray-300'></div> */}
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white dark:bg-gray-900'>
                            {Object.values(queuesFailedCalls).map((queue: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center py-3'>
                                    <div className='text-gray-900'>{queue.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {queue.values}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invalid calls  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Invalid calls')}
                          </h3>
                        </div>
                      </div>
                      <Button
                        variant='white'
                        onClick={() => handleSortOrderQueuesInvalidCallsToggle()}
                      >
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderQueuesInvalidCalls === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  {/* <div className='flex-grow border-b border-gray-300'></div> */}
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white dark:bg-gray-900'>
                            {Object.values(queuesInvalidCalls).map((queue: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center py-3'>
                                    <div className='text-gray-900'>{queue.name}</div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {queue.values}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Missed call reasons  */}
              <div>
                <div className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                  {/* card header */}
                  <div className='flex flex-col pt-3 pb-5 px-5'>
                    <div className='flex w-full items-center justify-between space-x-6'>
                      <div className='flex-1 truncate'>
                        <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                          <h3 className='truncate text-lg leading-6 font-medium'>
                            {t('QueueManager.Missed call reasons')}
                          </h3>
                        </div>
                      </div>
                      <Button variant='white' onClick={() => handleSortOrderQueuesFailuresToggle()}>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={
                              sortOrderQueuesFailures === 'desc'
                                ? faArrowUpWideShort
                                : faArrowDownWideShort
                            }
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  {/* <div className='flex-grow border-b border-gray-300'></div> */}
                  {/* card body */}
                  <div className='flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 pl-2 pr-2'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <tbody className='divide-y divide-gray-200 bg-white dark:bg-gray-900'>
                            {Object.values(queuesFailures).map((queue: any, index: number) => (
                              <tr key={index}>
                                <td className='whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center justify-center h-full'>
                                    {index + 1}.
                                  </div>
                                </td>
                                <td className='whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-0'>
                                  <div className='flex items-center py-3'>
                                    <div className='text-gray-900'>
                                      {queue.name} ({queue.queue})
                                    </div>
                                  </div>
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {t(`QueueManager.${queue.note}`)}
                                </td>
                                <td className='relative whitespace-nowrap py-2 pl-3 pr-4 text-right text-sm font-medium sm:pr-0'>
                                  {queue.values}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

QueueManagerDashboard.displayName = 'QueueManagerDashboard'
