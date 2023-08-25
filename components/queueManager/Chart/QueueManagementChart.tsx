// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RootState } from '../../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import {
  getCallIcon,
  openShowQueueCallDrawer,
} from '../../../lib/queueManager'
import BarChartHorizontal from '../../chart/HorizontalBarChart'
import LineChart from '../../chart/LineChart'
import { EmptyState } from '../../common'
import { Tooltip } from 'react-tooltip'
import { faArrowRight, faUser } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { isEmpty } from 'lodash'
import { formatDateLoc, getCallTimeToDisplay } from '../../../lib/dateTime'

export interface QueueManagementChartProps extends ComponentProps<'div'> {
  queuesList: any
  selectedValue: any
  allQueuesStats: boolean
  isLoadedQueuesNotManaged: boolean
  calls: any
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const QueueManagementChart: FC<QueueManagementChartProps> = ({
  className,
  queuesList,
  selectedValue,
  allQueuesStats,
  isLoadedQueuesNotManaged,
  calls,
}): JSX.Element => {
  const { t } = useTranslation()
    const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)


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

  return (
    <>
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
            <div className='flex'>
              <div className='pt-3'>
                <span className='text-lg font-semibold leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Calls')}
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
                  titleText={`${t('QueueManager.Answered calls')}: ${totalCallsAnsweredStatus}`}
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
            <div className='flex'>
              <div className='pt-3'>
                <span className='text-lg font-semibold leading-6 text-center text-gray-700 dark:text-gray-100'>
                  {t('QueueManager.Customers to manage')}
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
                      <li key={index} className='flex justify-between gap-x-6 pt-1 items-center'>
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
                                className={classNames(call.cid && 'cursor-pointer hover:underline')}
                              >
                                {call.name}
                              </span>
                            </div>
                          )}
                          <div
                            onClick={() => openShowQueueCallDrawer(call, queueManagerStore.queues)}
                            className={classNames(call.name && 'text-gray-500 dark:text-gray-500')}
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
                            <Tooltip anchorSelect={`#tooltip-outcome-value-${index}`} place='left'>
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
                href={{
                  pathname: '/queueManager',
                  query: { section: 'Not managed customers' },
                }}
              >
                <a className='hover:underline text-gray-900 font-semibold dark:text-gray-100'>
                  {t('QueueManager.Go to not managed customers')}
                </a>
              </Link>
              <Link
                href={{
                  pathname: '/queueManager',
                  query: { section: 'Not managed customers' },
                }}
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
    </>
  )
}

QueueManagementChart.displayName = 'QueueManagementChart'
