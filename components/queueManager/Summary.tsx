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
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons'

import { Listbox, Transition } from '@headlessui/react'

export interface SummaryProps extends ComponentProps<'div'> {}

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

export const Summary: FC<SummaryProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(people[3])

  const [expanded, setExpanded] = useState(false)

  const [expandedQueuesSummary, setExpandedQueuesSummary] = useState(false)

  const toggleExpandQueue = () => {
    setExpanded(!expanded)
  }

  const toggleQueuesSummary = () => {
    setExpandedQueuesSummary(!expandedQueuesSummary)
  }

  return (
    <>
      {/* Queues summary  */}
      <div className='flex items-center space-x-1'>
        <div className='flex-grow'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {t('QueueManager.Queues summary')}
          </h2>
        </div>
        <div className='flex items-center justify-end h-6 w-6'>
          <FontAwesomeIcon
            icon={expandedQueuesSummary ? faChevronDown : faChevronUp}
            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
            aria-hidden='true'
            onClick={toggleQueuesSummary}
          />
        </div>
      </div>

      {/* divider */}
      <div className='flex-grow border-b border-gray-300 mt-1'></div>
      {expandedQueuesSummary && (
        <>
          <Listbox value={selected} onChange={setSelected}>
            {({ open }) => (
              <>
                <div className='flex items-center pt-6'>
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

          {/* Queues summary */}
          <div className='relative'>
            {/* Dashboard queue active section */}
            <div>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                {/* Total calls */}
                <div className='pt-8'>
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
                  <div className='border-b rounded-lg shadow-md bg-white px-5 py-3 sm:mt-1 relative flex items-center'>
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
      )}

      {/* Operator summary */}
      <div className='flex items-center space-x-1 pt-8'>
        <div className='flex-grow'>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
            {t('QueueManager.Operators summary')}
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

      {expanded && <></>}
    </>
  )
}

Summary.displayName = 'Summary'
