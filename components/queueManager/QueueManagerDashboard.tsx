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
} from '@fortawesome/free-solid-svg-icons'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { getAlarm, getQueues, getAgentsStats, getQueueStats } from '../../lib/queueManager'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export const options = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: true,
      // text: 'Chart.js Bar Chart',
    },
  },
}

const labels = [
  '09.00',
  '10.00',
  '11.00',
  '12.00',
  '13.00',
  '14.00',
  '15.00',
  '16.00',
  '17.00',
  '18.00',
]

export const data = {
  labels,
  datasets: [
    {
      label: 'Unanswered calls',
      data: [4, 6, 2, 8, 5, 9, 3, 7, 4, 6],
      backgroundColor: '#10B981',
      borderRadius: [20, 20, 10, 10],
      borderSkipped: false,
    },
    {
      label: 'Answered calls',
      data: [0, 2, 4, 1, 3, 2, 5, 1, 4, 2],
      backgroundColor: '#6b7280',
      borderRadius: [20, 20, 10, 10],
      borderSkipped: false,
    },
  ],
}

export interface QueueManagerDashboardProps extends ComponentProps<'div'> {}

export const QueueManagerDashboard: FC<QueueManagerDashboardProps> = ({
  className,
}): JSX.Element => {
  const { t } = useTranslation()

  const [firstRenderQueuesList, setFirstRenderQueuesList]: any = useState(true)

  const [zoomedCardIndex, setZoomedCardIndex] = useState(null)

  const handleZoom = (index: any) => {
    if (zoomedCardIndex === index) {
      setZoomedCardIndex(null) // Ripristina le dimensioni originali se la card è già ingrandita
    } else {
      setZoomedCardIndex(index) // Ingrandisci la card se è diversa da quella attualmente ingrandita
    }
  }

  const [expandedOperators, setExpandedOperators] = useState(false)
  const [expandedQueues, setExpandedQueues] = useState(false)

  const toggleExpandedOperators = () => {
    setExpandedOperators(!expandedOperators)
  }

  const toggleExpandedQueues = () => {
    setExpandedQueues(!expandedQueues)
  }

  const [dashboardData, setDashboardData] = useState<any>({
    alarms: {
      loading: true,
      list: {},
    },
    const: {
      queuefewop: {
        description:
          'The ratio between the number of calls waiting and the number of agents has exceeded the alarm threshold',
      },
      queueholdtime: {
        description: 'The average waiting time has exceeded the alarm threshold',
      },
      queueload: {
        description:
          'There are many calls waiting and the average waiting time has exceeded the alarm threshold',
      },
      queuemaxwait: {
        description: 'There are many calls waiting and the first call is on hold for a long time',
      },
    },
    agentsAnswered: {},
    agentsLost: {},
    agentsPauseOnLogon: {},
    agentsRecallTime: {},
    queuesRecallTime: {},
    totalAll: 0,
    totalAnswered: 0,
    totalFailed: 0,
    totalInvalid: 0,
    answeredAverage: 0,
    graphsStartHour: null,
    stackedAreaFirst: true,
  })

  const [queuesList, setQueuesList] = useState<any>({})
  const [isLoadedQueues, setLoadedQueues] = useState(false)
  const [queuesRecallTimeOrder, setQueuesRecallTimeOrder] = useState(true)
  const [agentsRecallTimeOrder, setAgentsRecallTimeOrder] = useState(true)
  const [updateDashboardInterval, SetUpdateDashboardInterval] = useState(10000)

  //get queues list information
  useEffect(() => {
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

  const getQueuesStats = () => {
    const keys = Object.keys(queuesList)
    const len = keys.length
    let i = 1

    if (len === 0) {
      // queuesList is empty, no need to fetch queue stats
      return
    }

    //for each queue set the stats
    keys.forEach((key) => {
      getQueueStats(key)
        .then((res) => {
          setQueuesList((prevQueues: any) => ({
            ...prevQueues,
            [key]: {
              ...prevQueues[key],
              qstats: res,
            },
          }))

          if (i === len) {
            // CALL FUNCTIONS TO MAKE GRAPHICS
            loadQueuesRanksFirst()
          }

          i++
        })
        .catch((err) => {
          console.error(err)
        })
    })
  }

  //check lost, total, answered, unanswered call
  const queuesDashboardRank = (keys: string[]) => {
    return new Promise((resolve) => {
      let n = 0
      const list: any = {}
      for (const q in queuesList) {
        if (!isNaN(Number(q))) {
          list[n] = {
            name: queuesList[q].name,
            queue: q,
            values: {},
          }
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            list[n].values[key] = queuesList[q]?.qstats?.[key] || 0
          }
        }
        n++
      }
      resolve(list)
    })
  }

  const sortDashboard = (obj: any, valKey: string, order: string) => {
    const sortable: any[] = []
    const sorted: any = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const temparr = [obj[key].name, obj[key].queue]
        if (valKey) {
          temparr.push(obj[key].values[valKey])
        } else {
          temparr.push(obj[key].value)
        }
        if (obj[key].note) {
          temparr.push(obj[key].note)
        }
        sortable.push(temparr)
      }
    }

    sortable.sort((a, b) => {
      if (order === 'asc') {
        return a[2] - b[2]
      } else if (order === 'desc') {
        return b[2] - a[2]
      }
      return 0
    })

    for (let i = 0; i < sortable.length; i++) {
      sorted[i] = {
        name: sortable[i][0],
        queue: sortable[i][1],
        value: sortable[i][2],
      }
      if (sortable[i][3]) {
        sorted[i].note = sortable[i][3]
      }
    }

    return sorted
  }

  const loadQueuesRanksFirst = () => {
    queuesDashboardRank(['tot_processed', 'tot_failed', 'tot', 'tot_null']).then((value: any) => {
      const initTopSparklineTotals = () => {
        for (const h in dashboardData.queuesTotalCalls) {
          dashboardData.totalAll += dashboardData.queuesTotalCalls[h].value
        }
        for (const h in dashboardData.queuesAnswered) {
          dashboardData.totalAnswered += dashboardData.queuesAnswered[h].value
        }
        for (const h in dashboardData.queuesFailedCalls) {
          dashboardData.totalFailed += dashboardData.queuesFailedCalls[h].value
        }
        for (const h in dashboardData.queuesInvalidCalls) {
          dashboardData.totalInvalid += dashboardData.queuesInvalidCalls[h].value
        }
      }
      setDashboardData((prevData: any) => ({
        ...prevData,
        queuesAnswered: sortDashboard(value, 'tot_processed', 'desc'),
        queuesTotalCalls: sortDashboard(value, 'tot', 'desc'),
        queuesFailedCalls: sortDashboard(value, 'tot_failed', 'desc'),
        queuesInvalidCalls: sortDashboard(value, 'tot_null', 'desc'),
      }))

      initTopSparklineTotals()
      // loadQueuesRanksSecond();
    })
  }

  const getQueuesRecallTime = (data: any) => {
    const queuesRecallTime: any = {}

    // Set available queues
    for (const queue in queuesList) {
      queuesRecallTime[queue] = {
        min_recall_time: [],
        max_recall_time: [],
        avg_recall_time: [],
      }
    }

    // Get values from agents stats
    for (const agent in data) {
      for (const queue in queuesRecallTime) {
        if (Object.hasOwnProperty.call(data[agent], queue)) {
          if (data[agent][queue].min_recall_time)
            queuesRecallTime[queue].min_recall_time.push(data[agent][queue].min_recall_time)
          if (data[agent][queue].max_recall_time)
            queuesRecallTime[queue].max_recall_time.push(data[agent][queue].max_recall_time)
          if (data[agent][queue].avg_recall_time)
            queuesRecallTime[queue].avg_recall_time.push(data[agent][queue].avg_recall_time)
        }
      }
    }

    // Retrieve values for every queue
    for (const queue in queuesRecallTime) {
      if (
        queuesRecallTime[queue].min_recall_time.length > 0 &&
        queuesRecallTime[queue].max_recall_time.length > 0 &&
        queuesRecallTime[queue].avg_recall_time.length > 0
      ) {
        queuesRecallTime[queue] = {
          min_recall_time: Math.min(...queuesRecallTime[queue].min_recall_time),
          max_recall_time: Math.max(...queuesRecallTime[queue].max_recall_time),
          avg_recall_time: Math.round(
            queuesRecallTime[queue].avg_recall_time.reduce((a: number, b: number) => a + b) /
              queuesRecallTime[queue].avg_recall_time.length,
          ),
        }
      } else {
        delete queuesRecallTime[queue]
      }
    }

    // Return retrieved recall_time values
    return queuesRecallTime
  }

  const orderRecallTimeAgents = (direction: string) => {
    const agents: any[] = []
    const ordered: any = {}
    let n = 0

    for (const agent in dashboardData.agentsRecallTime) {
      agents[n] = {
        agent: agent,
      }

      for (const key in dashboardData.agentsRecallTime[agent]) {
        agents[n][key] = dashboardData.agentsRecallTime[agent][key]
      }

      n++
    }

    if (direction === 'asc') {
      agents.sort((a, b) =>
        a.allQueues.avg_recall_time > b.allQueues.avg_recall_time
          ? 1
          : b.allQueues.avg_recall_time > a.allQueues.avg_recall_time
          ? -1
          : 0,
      )
    } else if (direction === 'desc') {
      agents.sort((a, b) =>
        a.allQueues.avg_recall_time > b.allQueues.avg_recall_time
          ? -1
          : b.allQueues.avg_recall_time > a.allQueues.avg_recall_time
          ? 1
          : 0,
      )
    }

    agents.forEach((el) => {
      ordered[el.agent] = el
      delete ordered[el.agent].agent
    })

    setAgentsRecallTimeOrder(!agentsRecallTimeOrder)
    setDashboardData((prevData: typeof dashboardData) => ({
      ...prevData,
      agentsRecallTime: ordered,
    }))
  }

  const orderRecallTimeQueues = (direction: string) => {
    const queues: any[] = []
    const ordered: any = {}
    let n = 0
    for (const queue in dashboardData.queuesRecallTime) {
      queues[n] = {
        queue: queue,
      }
      for (const key in dashboardData.queuesRecallTime[queue]) {
        queues[n][key] = dashboardData.queuesRecallTime[queue][key]
      }
      n++
    }
    if (direction === 'asc') {
      queues.sort((a, b) =>
        a.avg_recall_time > b.avg_recall_time ? 1 : b.avg_recall_time > a.avg_recall_time ? -1 : 0,
      )
    } else if (direction === 'desc') {
      queues.sort((a, b) =>
        a.avg_recall_time > b.avg_recall_time ? -1 : b.avg_recall_time > a.avg_recall_time ? 1 : 0,
      )
    }
    queues.forEach((el) => {
      ordered[`queue_${el.queue}`] = el
    })
    setDashboardData((prevData: typeof dashboardData) => ({
      ...prevData,
      queuesRecallTime: ordered,
    }))
  }

  const avgRecallTimeRanks = (data: any) => {
    const newData = { ...data }
    for (const agent in newData) {
      if (
        !newData[agent].allQueues ||
        (newData[agent].allQueues &&
          !newData[agent].allQueues.avg_recall_time &&
          !newData[agent].allQueues.min_recall_time &&
          !newData[agent].allQueues.max_recall_time)
      ) {
        delete newData[agent]
      }
    }

    setDashboardData((prevData: any) => ({
      ...prevData,
      agentsRecallTime: newData,
      queuesRecallTime: getQueuesRecallTime(newData),
    }))

    orderRecallTimeAgents('asc')
    orderRecallTimeQueues('asc')
  }

  const getUsersStats = (): void => {
    getAgentsStats()
      .then((res: { data: any }) => {
        avgRecallTimeRanks(res.data)
        // loadAgentsRanksFirst(res.data)
      })
      .catch((err: any) => {
        console.error(err)
      })
  }

  const initDashboard = function () {
    getUsersStats()
    getQueuesStats()
  }

  useEffect(() => {
    initDashboard()
    const interval = setInterval(() => {
      if (document.hasFocus()) {
        initDashboard()
      }
    }, updateDashboardInterval)

    return () => {
      clearInterval(interval)
    }
  }, [isLoadedQueues])

  const renderAlarms = (data: any, source: string) => {
    if (source === 'api') {
      setDashboardData((prevData: any) => ({
        ...prevData,
        alarms: data,
      }))
    }
  }

  const getQueueManagerAlarm = async () => {
    try {
      const res = await getAlarm()
      renderAlarms(res.data, 'api')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className='border-b rounded-md shadow-md border-gray-200 bg-white px-4 py-1 sm:px-6'>
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
                    <p className='text-3xl font-semibold tracking-tight text-left'>
                      {dashboardData.totalAll}
                    </p>
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
                      {dashboardData.totalAnswered}
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
                      // onClick={() => toggleExpandQueue(queue)}
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>
                      {dashboardData.totalFailed}
                    </p>
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
                      // onClick={() => toggleExpandQueue(queue)}
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left'>
                      {dashboardData.totalInvalid}
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
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-2'>
        {/* Hourly distribution of incoming calls section*/}
        <div className={`pt-8 ${zoomedCardIndex === 0 ? 'col-span-2' : 'col-span-1'}`}>
          {/* title */}
          <h2 className='text-md ml-4 font-semibold mb-4'>
            {t('QueueManager.Hourly distribution of incoming calls')}
          </h2>

          <div className='border-b rounded-md shadow-md bg-white px-4 py-5 sm:px-6 mt-1 relative w-full h-full'>
            <div className='flex space-x-3'>
              <div className='min-w-0 flex-1'>
                {/* ... */}
                <Bar options={options} data={data}></Bar>
              </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-14 w-14 flex items-center justify-center rounded-md'
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

        {/* Hourly distribution of call results*/}
        <div className={`pt-8 ${zoomedCardIndex === 1 ? 'col-span-2' : 'col-span-1'}`}>
          {/* title */}
          <h2 className='text-md ml-4 font-semibold mb-4'>
            {t('QueueManager.Hourly distribution of call results')}
          </h2>

          <div className='border-b rounded-md shadow-md bg-white px-4 py-5 sm:px-6 mt-1 relative w-full h-full'>
            <div className='flex space-x-3'>
              <div className='min-w-0 flex-1'>{/* ... */} </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-14 w-14 flex items-center justify-center rounded-md'
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

          <div className='border-b rounded-md shadow-md bg-white px-4 py-5 sm:px-6 mt-1 relative w-full h-full'>
            <div className='flex space-x-3'>
              <div className='min-w-0 flex-1'>{/* ... */} </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-14 w-14 flex items-center justify-center rounded-md'
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

          <div className='border-b rounded-md shadow-md bg-white px-4 py-5 sm:px-6 mt-1 relative w-full h-full'>
            <div className='flex space-x-3'>
              <div className='min-w-0 flex-1'>{/* ... */} </div>
            </div>
            {/* Zoom button */}
            <div className='absolute top-2 right-2 pt-3 pr-3'>
              <Button
                className='h-14 w-14 flex items-center justify-center rounded-md'
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
              icon={expandedOperators ? faChevronDown : faChevronUp}
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
                      <Button variant='white'>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronUp}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                            // onClick={() => toggleExpandQueue(queue)}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
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
                      <Button variant='white'>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronUp}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                            // onClick={() => toggleExpandQueue(queue)}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
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
                      <Button variant='white'>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronUp}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                            // onClick={() => toggleExpandQueue(queue)}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
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
                      <Button variant='white'>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronUp}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                            // onClick={() => toggleExpandQueue(queue)}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
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
                      <Button variant='white'>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronUp}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                            // onClick={() => toggleExpandQueue(queue)}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
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
                      <Button variant='white'>
                        <div className='flex items-center space-x-2'>
                          <FontAwesomeIcon
                            icon={faArrowUpWideShort}
                            className='h-4 w-4 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                          />
                          <span>{t('QueueManager.Order')}</span>
                          <FontAwesomeIcon
                            icon={faChevronUp}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                            aria-hidden='true'
                            // onClick={() => toggleExpandQueue(queue)}
                          />
                        </div>
                      </Button>
                    </div>
                  </div>
                  <div className='flex-grow border-b border-gray-300'></div>
                  {/* card body */}
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
              icon={expandedQueues ? faChevronDown : faChevronUp}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandedQueues}
            />
          </div>
        </div>
        <div className='flex-grow border-b border-gray-300'></div>
        {expandedQueues && (
          <>
            {/* <ul role='list' className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3'></ul> */}
          </>
        )}
      </div>
    </>
  )
}

QueueManagerDashboard.displayName = 'QueueManagerDashboard'
