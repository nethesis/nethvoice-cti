// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadset, faUserCheck, faUserClock, faUserXmark } from '@fortawesome/free-solid-svg-icons'

export interface QueueManagementHeaderProps extends ComponentProps<'div'> {
  agentCountersSelectedQueue: any
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const QueueManagementHeader: FC<QueueManagementHeaderProps> = ({
  className,
  agentCountersSelectedQueue,
}): JSX.Element => {
  const { t } = useTranslation()

  return (
    <>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
        {/* Online operators */}
        <div>
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-1 sm: mt-1 relative flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                <FontAwesomeIcon
                  icon={faUserCheck}
                  className='h-6 w-6 text-emerald-600 dark:text-emerald-600'
                  aria-hidden='true'
                />
              </div>
              <div className='flex justify-center'>
                <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                  {agentCountersSelectedQueue?.online ? agentCountersSelectedQueue?.online : 0}
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
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-1 sm: mt-1 relative flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                <FontAwesomeIcon
                  icon={faUserClock}
                  className='h-6 w-6 text-emerald-600 dark:text-emerald-600'
                  aria-hidden='true'
                />
              </div>
              <div className='flex justify-center'>
                <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                  {agentCountersSelectedQueue?.paused ? agentCountersSelectedQueue?.paused : 0}
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
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-1 sm: mt-1 relative flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                <FontAwesomeIcon
                  icon={faUserXmark}
                  className='h-6 w-6 text-emerald-600 dark:text-emerald-600'
                  aria-hidden='true'
                />
              </div>
              <div className='flex justify-center'>
                <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                  {agentCountersSelectedQueue?.offline ? agentCountersSelectedQueue?.offline : 0}
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
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-1 sm: mt-1 relative flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                <FontAwesomeIcon
                  icon={faHeadset}
                  className='h-6 w-6 text-emerald-600 dark:text-emerald-600'
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
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-1 sm: mt-1 relative flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                <FontAwesomeIcon
                  icon={faHeadset}
                  className='h-6 w-6 text-emerald-600 dark:text-emerald-600'
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
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-1 sm: mt-1 relative flex items-center'>
            <div className='flex items-center space-x-4'>
              <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                <FontAwesomeIcon
                  icon={faHeadset}
                  className='h-6 w-6 text-emerald-600 dark:text-emerald-600'
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
    </>
  )
}

QueueManagementHeader.displayName = 'QueueManagementHeader'
