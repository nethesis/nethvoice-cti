// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Button, Dropdown, EmptyState, IconSwitch, TextInput } from '../common'
import { isEmpty, debounce } from 'lodash'
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

  const [zoomedCardIndex, setZoomedCardIndex] = useState(null)

  const handleZoom = (index: any) => {
    if (zoomedCardIndex === index) {
      setZoomedCardIndex(null) // Ripristina le dimensioni originali se la card è già ingrandita
    } else {
      setZoomedCardIndex(index) // Ingrandisci la card se è diversa da quella attualmente ingrandita
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
                      icon={faArrowLeft}
                      className='h-6 w-6 cursor-pointer -rotate-45 text-emerald-600 dark:text-emerald-600'
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
                      icon={faMissed}
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
              icon={faChevronDown}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              // onClick={() => toggleExpandQueue(queue)}
            />
          </div>
        </div>
        <div className='flex-grow border-b border-gray-300'></div>
      </div>

      {/* Queues statistics section */}
      <div className='py-2 relative'>
        <div className='flex items-center space-x-1'>
          <div className='flex-grow'>
            <h2 className='text-md font-semibold ml-2'>{t('QueueManager.Queues statistics')}</h2>
          </div>
          <div className='flex items-center justify-end h-6 w-6'>
            <FontAwesomeIcon
              icon={faChevronDown}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              // onClick={() => toggleExpandQueue(queue)}
            />
          </div>
        </div>
        <div className='flex-grow border-b border-gray-300'></div>
      </div>
    </>
  )
}

QueueManagerDashboard.displayName = 'QueueManagerDashboard'
