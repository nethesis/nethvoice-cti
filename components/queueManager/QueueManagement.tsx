// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
} from '@fortawesome/free-solid-svg-icons'

import { Listbox, Transition } from '@headlessui/react'

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
      text: 'Connected calls',
    },
    // avoid to show labels inside tooltip
    //   tooltip: {
    //     callbacks: {
    //        title : () => null // or function () { return null; }
    //     }
    //  },
  },
}

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
    },
  },
}

const labels = ['Connected calls']

let mininum = 2
let average = 5
let maximum = 30

export const data = {
  labels,
  datasets: [
    {
      label: 'Minimum',
      data: [mininum],
      backgroundColor: '#6EE7B7',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: 'Average',
      data: [average],
      backgroundColor: '#10B981',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: `Maximum`,
      data: [maximum],
      backgroundColor: '#047857',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
  ],
}

export const dataSecond = {
  labels,
  datasets: [
    {
      label: 'Minimum',
      data: [mininum],
      backgroundColor: '#D1D5DB',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: 'Average',
      data: [average],
      backgroundColor: '#6B7280',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
    {
      label: `Maximum`,
      data: [maximum],
      backgroundColor: '#374151',
      borderRadius: [20, 20, 10, 10],
      barPercentage: 0.5,
      borderSkipped: false,
    },
  ],
}
export interface QueueManagementProps extends ComponentProps<'div'> {}

const people = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
  { id: 4, name: 'Tom Cook' },
  { id: 5, name: 'Tanya Fox' },
  { id: 6, name: 'Hellen Schmidt' },
  { id: 7, name: 'Caroline Schultz' },
  { id: 8, name: 'Mason Heaney' },
  { id: 9, name: 'Claudie Smitham' },
  { id: 10, name: 'Emil Schaefer' },
]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const QueueManagement: FC<QueueManagementProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(people[3])

  const [expanded, setExpanded] = useState(true)

  const [expandedWaitingCall, setExpandedWaitingCall] = useState(false)

  const [expandedConnectedCall, setExpandedConnectedCall] = useState(false)

  const [expandedQueueOperators, setExpandedQueueOperators] = useState(false)

  const toggleExpandQueue = () => {
    setExpanded(!expanded)
  }

  const toggleWaitingCall = () => {
    setExpandedWaitingCall(!expandedWaitingCall)
  }

  const toggleConnectedCall = () => {
    setExpandedConnectedCall(!expandedConnectedCall)
  }

  const toggleQueueOperators = () => {
    setExpandedQueueOperators(!expandedQueueOperators)
  }

  return (
    <>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className='flex items-center'>
              <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                {t('QueueManager.Select queue')}
              </Listbox.Label>
              <div className='relative '>
                <Listbox.Button className='relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6'>
                  <span className='block truncate'>{selected.name}</span>
                  <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                      aria-hidden='true'
                      // onClick={() => toggleExpandQueue(queue)}
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
                  <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                    {people.map((person) => (
                      <Listbox.Option
                        key={person.id}
                        className={({ active }) =>
                          classNames(
                            active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                            'relative cursor-default select-none py-2 pl-8 pr-4',
                          )
                        }
                        value={person}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={classNames(
                                selected ? 'font-semibold' : 'font-normal',
                                'block truncate',
                              )}
                            >
                              {person.name}
                            </span>

                            {selected ? (
                              <span
                                className={classNames(
                                  active ? 'text-white' : 'text-indigo-600',
                                  'absolute inset-y-0 left-0 flex items-center pl-1.5',
                                )}
                              >
                                <FontAwesomeIcon
                                  icon={faCheck}
                                  className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                                  aria-hidden='true'
                                  // onClick={() => toggleExpandQueue(queue)}
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
              icon={expanded ? faChevronDown : faChevronUp}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
              onClick={toggleExpandQueue}
            />
          </div>
        </div>

        {/* divider */}
        <div className='flex-grow border-b border-gray-300 mt-1'></div>

        {/* Dashboard queue active section */}
        {expanded && (
          <div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {/* Online operators */}
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                      <FontAwesomeIcon
                        icon={faUserCheck}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                        // onClick={() => toggleExpandQueue(queue)}
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        0
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Online operators')}
                    </span>
                  </div>
                </div>
              </div>

              {/* On break operators */}
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                      <FontAwesomeIcon
                        icon={faUserClock}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                        // onClick={() => toggleExpandQueue(queue)}
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        0
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.On break operators')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offline operators */}
              <div className='pt-8'>
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                      <FontAwesomeIcon
                        icon={faUserXmark}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                        // onClick={() => toggleExpandQueue(queue)}
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        0
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
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                      <FontAwesomeIcon
                        icon={faHeadset}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                        // onClick={() => toggleExpandQueue(queue)}
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        0
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
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                      <FontAwesomeIcon
                        icon={faHeadset}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                        // onClick={() => toggleExpandQueue(queue)}
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        0
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
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex items-center'>
                  <div className='flex items-center space-x-4'>
                    <div className='h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 mt-1 mb-1'>
                      <FontAwesomeIcon
                        icon={faHeadset}
                        className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                        aria-hidden='true'
                        // onClick={() => toggleExpandQueue(queue)}
                      />
                    </div>
                    <div className='flex justify-center'>
                      <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                        0
                      </p>
                    </div>
                    <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Busy operators (out queue)')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calls duration */}
              <div>
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative'>
                  <div className='pt-3'>
                    <span className='text-sm font-medium leading-6 text-center text-gray-700 dark:text-gray-100'>
                      {t('QueueManager.Calls duration')}
                    </span>
                  </div>
                  <div className='flex justify-center'>
                    <div className='w-full'>
                      <Bar options={options} data={data} />
                      <Bar options={optionsSecond} data={dataSecond} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Calls */}
              <div>
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex justify-between'>
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
              </div>

              {/* Customers to manage */}
              <div>
                <div className='border-b rounded-lg shadow-md bg-white px-5 py-1 sm: mt-1 relative flex justify-between'>
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
            {/* ... */}
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
            <div className='flex-grow border-b border-gray-300 mt-1'></div>

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
            <div className='flex-grow border-b border-gray-300 mt-1'></div>
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
            <div className='flex-grow border-b border-gray-300 mt-1'></div>
          </div>
        </div>
      </div>
    </>
  )
}

QueueManagement.displayName = 'QueueManagement'
