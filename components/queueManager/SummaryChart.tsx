// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from 'react-tooltip'
import { getQueueStats } from '../../lib/queueManager'

import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import BarChartHorizontalWithTitle from '../chart/HorizontalWithTitle'

export interface SummaryChartProps extends ComponentProps<'div'> {
  selectedQueues: any
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const SummaryChart: FC<SummaryChartProps> = ({ className, selectedQueues }): JSX.Element => {
  const { t } = useTranslation()

  const [firstRenderQueuesStats, setFirstRenderQueuesStats]: any = useState(true)
  const [isLoadedQueuesStats, setLoadedQueuesStats] = useState(false)
  const [allQueuesStats, setAllQueuesStats] = useState(false)

  const [queuesStatus, setQueuesStatus] = useState<any>({})

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
        const queuesName = selectedQueues
        //get number of queues
        const queuesLength = queuesName.length
        let status = {} as Record<string, any>

        // Get statuses for each queue
        for (let i = 0; i < queuesLength; i++) {
          const key = queuesName[i]
          const res = await getQueueStats(key)
          status[key] = res
        }
        setAllQueuesStats(true)
        setQueuesStatus(status)
      } catch (err) {
        console.error(err)
      }
    }
    if (!isLoadedQueuesStats) {
      getQueuesStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRenderQueuesStats, selectedQueues])

 const [datasetsQueues, setDatasetsQueues] = useState<any[]>([]);
const [labelsCalls, setLabelsCalls] = useState<string[]>([]);

// Cycle through queuesStatus
useEffect(() => {
  // Funzione per creare i dati del grafico in base alle code selezionate
  const createChartData = () => {
    const newData = [];
    const newLabels = [];

    if (queuesStatus && selectedQueues.length > 0) {
      for (const queueKey of selectedQueues) {
        const queue = queuesStatus[queueKey];
        if (queue) {
          const queueData = [queue.tot || 0]; // Total Calls
          const colors = ['#059669', '#064E3B', '#E5E7EB'];
          const label = `Queue ${queue.queueman}`;

          newData.push({
            label: label,
            data: queueData,
            backgroundColor: colors,
            borderRadius: 10,
            barPercentage: 1,
            borderWidth: 0,
            borderSkipped: false,
            categorySpacing: 6,
            barThickness: 25,
          });

          newLabels.push(label); // Aggiungi l'etichetta al nuovo array
        }
      }
    }

    setDatasetsQueues(newData);
    setLabelsCalls(newLabels); // Imposta il nuovo array di etichette
  };

  // Chiamiamo la funzione per creare i dati del grafico ogni volta che selectedQueues cambia
  createChartData();
}, [selectedQueues, queuesStatus]);

  return (
    <>
      {/* Queues summary */}
      <div className='relative'>
        {/* Dashboard queue active section */}
        <div>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {/* Total calls */}
            <div className='pt-8'>
              <div className='flex flex-col border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative items-center'>
                <div className='flex items-center'>
                  <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                    {t('QueueManager.Total calls')}
                  </span>
                  <div className='flex items-center'>
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-total-calls'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-total-calls' place='left'>
                      {t('QueueManager.SummaryTotalCallChartDescription') || ''}
                    </Tooltip>
                  </div>
                </div>

                <div className='mt-3 mx-auto h-auto w-full'>
                  <BarChartHorizontalWithTitle
                    labels={labelsCalls}
                    datasets={datasetsQueues}
                    tickColor='#374151'
                  />
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
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-answered-before-service'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-answered-before-service' place='left'>
                      {t('QueueManager.SummaryAnsweredBeforeServiceChartDescription') || ''}
                    </Tooltip>
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
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-unanswered'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-unanswered' place='left'>
                      {t('QueueManager.SummaryUnansweredChartDescription') || ''}
                    </Tooltip>
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
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-unanswered-for_reasons'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-unanswered-for_reasons' place='left'>
                      {t('QueueManager.SummaryUnansweredForReasonsChartDescription') || ''}
                    </Tooltip>
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
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-callback'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-callback' place='left'>
                      {t('QueueManager.Callback time') || ''}
                    </Tooltip>
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
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-invalid-calls'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-invalid-calls' place='left'>
                      {t('QueueManager.SummaryInvalidCallsChartDescription') || ''}
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>

            {/* Waiting time */}
            <div>
              <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 sm:mt-1 relative flex items-center'>
                <div className='flex items-center justify-between w-full'>
                  <span className='text-sm font-medium leading-6 text-gray-700 dark:text-gray-100'>
                    {t('QueueManager.Waiting times')}
                  </span>
                  <div className='flex items-center'>
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-waiting-times'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-waiting-times' place='left'>
                      {t('QueueManager.SummaryWaitingTimesChartDescription') || ''}
                    </Tooltip>
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
                      className='h-5 w-5 pl-2 py-2 cursor-pointer flex items-center tooltip-calls-duration'
                      aria-hidden='true'
                    />
                    <Tooltip anchorSelect='.tooltip-calls-duration' place='left'>
                      {t('QueueManager.SummaryCallsDurationChartDescription') || ''}
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

SummaryChart.displayName = 'SummaryChart'
