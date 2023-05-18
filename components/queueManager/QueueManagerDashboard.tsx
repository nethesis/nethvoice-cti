// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Button, Dropdown, EmptyState, IconSwitch, TextInput } from '../common'
import { isEmpty, debounce } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faTriangleExclamation,
  faPhone,
  faPhoneArrowDownLeft,
  faPhoneMissed,
  faPhoneSlash,
  faPause,
} from '@nethesis/nethesis-solid-svg-icons'

export interface QueueManagerDashboardProps extends ComponentProps<'div'> {}

export const QueueManagerDashboard: FC<QueueManagerDashboardProps> = ({
  className,
}): JSX.Element => {
  const { t } = useTranslation()

  return (
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
                    // onClick={() => toggleExpandQueue(queue)}
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left'>0</p>
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
                    icon={faPhoneArrowDownLeft}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                    // onClick={() => toggleExpandQueue(queue)}
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left'>0</p>
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
                    icon={faPhoneMissed}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                    // onClick={() => toggleExpandQueue(queue)}
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left'>0</p>
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
                  <p className='text-3xl font-semibold tracking-tight text-left'>0</p>
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
                    // onClick={() => toggleExpandQueue(queue)}
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
  )
}

QueueManagerDashboard.displayName = 'QueueManagerDashboard'
