// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

export interface SummaryChartProps extends ComponentProps<'div'> {}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const SummaryChart: FC<SummaryChartProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()

  return (
    <>
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
  )
}

SummaryChart.displayName = 'SummaryChart'
