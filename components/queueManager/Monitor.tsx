// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { faChevronDown, faChevronUp, faCheck, faMinus } from '@fortawesome/free-solid-svg-icons'

import { Listbox, Transition } from '@headlessui/react'

export interface MonitorProps extends ComponentProps<'div'> {}

const people = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5' },
  { id: 6, name: '6' },
  { id: 7, name: '7' },
  { id: 8, name: '8' },
  { id: 9, name: '9' },
  { id: 10, name: '10' },
]

const peopleOne = [
  {
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    email: 'lindsay.walton@example.com',
    position: '1',
    number: '3985645123',
    waitingTime: '00:03:00',
  },
  {
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    email: 'lindsay.walton@example.com',
    position: '2',
    number: '3985645123',
    waitingTime: '00:03:00',
  },
]

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const Monitor: FC<MonitorProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(people[3])

  return (
    <>
      <Listbox value={selected} onChange={setSelected}>
        {({ open }) => (
          <>
            <div className='flex items-center'>
              <Listbox.Label className='block text-sm font-medium leading-6 text-gray-500 mr-8'>
                {t('QueueManager.Calls to show')}
              </Listbox.Label>
              <div className='relative '>
                <Listbox.Button className='relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6'>
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
                            active ? 'bg-primary text-white' : 'text-gray-900',
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
                                  active ? 'text-white' : 'text-primary',
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
      <div className='relative'>
        {/* Card section */}
        <div>
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-1 xl:grid-cols-1'>
            <div className='pt-8'>
              <div className='border-b rounded-lg shadow-md bg-white px-5 py-4 sm:mt-1 relative'>
                {/* Header section */}
                <div className='flex items-center space-x-2'>
                  {/* left side */}
                  <div className='flex-grow'>
                    <div className='flex items-center space-x-2'>
                      <div className='flex justify-center items-center'>
                        <p className='text-md font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                          Assistenza clienti
                        </p>
                      </div>
                      <span className='text-sm flex justify-center font-medium leading-6 text-center text-gray-500 dark:text-gray-100'>
                        501
                      </span>
                      <div className='flex justify-center items-center'>
                        <FontAwesomeIcon icon={faChevronDown} className='text-gray-500' />
                      </div>
                    </div>
                  </div>
                  {/* right side */}
                  <div className='flex items-center ml-auto space-x-5'>
                    <div className='text-sm text-gray-500'>
                      <span className='mr-2 font-semibold text-orange-700'>6</span>
                      <span className='text-md text-orange-700'>
                        {t('QueueManager.Waiting calls')}
                      </span>
                    </div>
                    <Button variant='white' className='ml-2'>
                      <FontAwesomeIcon icon={faMinus} className='text-gray-500' />
                      <span className='ml-2'>{t('QueueManager.Remove')}</span>
                    </Button>
                  </div>
                </div>

                {/* Body section */}
                <div className=''>
                  <div className='mt-8 flow-root'>
                    <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                        <table className='min-w-full divide-y divide-gray-300'>
                          <thead>
                            <tr>
                              <th
                                scope='col'
                                className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0'
                              >
                                {t('QueueManager.Position')}
                              </th>
                              <th
                                scope='col'
                                className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                {t('QueueManager.Calls')}
                              </th>
                              <th
                                scope='col'
                                className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                              >
                                {t('QueueManager.Waiting')}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='divide-y divide-gray-200'>
                            {peopleOne.map((person) => (
                              <tr key={person.email}>
                                <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0'>
                                  <div className='flex items-center ml-2'>
                                    <div className='w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center'>
                                      <span className='text-orange-600'>{person.position}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                  {person.title}
                                </td>
                                <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                                  {person.waitingTime}
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
          </div>
          {/* ... */}
        </div>
      </div>
    </>
  )
}

Monitor.displayName = 'Monitor'
