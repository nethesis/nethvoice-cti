// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react'
import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faMobileScreenButton, faPhone } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { t } from 'i18next'
import { callPhoneNumber } from '../../lib/utils'
import { callOperator } from '../../lib/operators'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface ButtonDropdownProps {
  operatorDevices?: any
  operator: any
}

export const ButtonDropdown: React.FC<ButtonDropdownProps> = ({ operatorDevices, operator }) => {
  const auth = useSelector((state: RootState) => state.authentication)
  const operatorsStore = useSelector((state: RootState) => state.operators)

  return (
    <div className='inline-flex pb-5'>
      <button
        type='button'
        className='relative inline-flex items-center rounded-l-md px-3 text-sm font-medium leading-5 ring-gray-300 focus:z-10 bg-primary text-white hover:bg-primaryDark  dark:bg-primary dark:text-white dark:hover:bg-primaryDark focus:ring-primaryLight disabled:opacity-50 disabled:cursor-not-allowed'
        onClick={() => callOperator(operator)}
        disabled={
          operatorsStore?.operators[operator?.username]?.endpoints?.extension?.length === 0 ||
          operatorsStore?.operators[operator?.username]?.mainPresence === 'busy' ||
          operatorsStore?.operators[operator?.username]?.status === 'busy' ||
          operatorsStore?.operators[operator?.username]?.status === 'onhold' ||
          operatorsStore?.operators[operator?.username]?.username === auth?.username
            ? true
            : false
        }
      >
        <FontAwesomeIcon icon={faPhone} className='h-4 w-4 mr-2' />
        <span className='inline-block'>{t('Operators.Call')}</span>
        <span className='sr-only'>{t('Operators.Call')}</span>
      </button>

      {/* Vertical divider */}
      <div className='inline-block w-0.5 self-stretch bg-neutral-100 opacity-100 dark:opacity-600 disabled:opacity-50 disabled:cursor-not-allowed'></div>

      <Menu as='div' className='relative -ml-px block '>
        <Menu.Button
          className='relative inline-flex items-center rounded-r-md px-2 py-2 ring-gray-300 focus:z-10 bg-primary text-white hover:bg-primaryDark  dark:bg-primary dark:text-white dark:hover:bg-primaryDark focus:ring-primaryLight disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={
            operatorsStore?.operators[operator?.username]?.endpoints?.extension?.length === 0 ||
            operatorsStore?.operators[operator?.username]?.mainPresence === 'busy' ||
            operatorsStore?.operators[operator?.username]?.status === 'busy' ||
            operatorsStore?.operators[operator?.username]?.status === 'onhold' ||
            operatorsStore?.operators[operator?.username]?.username === auth?.username
              ? true
              : false
          }
        >
          <span className='sr-only'>{t('Operators.Open user devices')}</span>
          <FontAwesomeIcon icon={faChevronDown} className='h-4 w-4' aria-hidden='true' />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='absolute right-[-5rem] z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-white text-gray-400 '>
            <div className='py-1 flex-col overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 ring-opacity-1 rounded-md dark:border-gray-700 dark:bg-gray-900'>
              {Object.entries(operatorDevices)
                .filter(([key, value]) => value !== undefined && value !== null)
                .map(([key, value]: [any, any]) => (
                  <Menu.Item key={key}>
                    {({ active }) => (
                      <div
                        className={classNames(
                          'py-1 px-3.5',
                          active
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900'
                            : 'text-gray-700 dark:text-gray-200',
                        )}
                      >
                        {key === 'mainExtension' && (
                          <div
                            className='py-2 sm:grid sm:grid-cols-2 sm:gap-3 cursor-pointer'
                            onClick={() => callPhoneNumber(value)}
                          >
                            <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                              <div className='flex items-center text-sm text-gray-900 dark:text-gray-200'>
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className='mr-2 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-300'
                                  aria-hidden='true'
                                />
                                <span className='truncate'>{value}</span>
                              </div>
                            </dd>
                          </div>
                        )}
                        {key === 'cellphone' && (
                          <div
                            className='py-2 sm:grid sm:grid-cols-2 sm:gap-3 cursor-pointer'
                            onClick={() => callPhoneNumber(value)}
                          >
                            <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0 '>
                              <div className='flex items-center text-sm text-gray-900 dark:text-gray-200'>
                                <FontAwesomeIcon
                                  icon={faMobileScreenButton}
                                  className='mr-2 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-300'
                                  aria-hidden='true'
                                />
                                <span className='truncate'>{value}</span>
                              </div>
                            </dd>
                          </div>
                        )}
                      </div>
                    )}
                  </Menu.Item>
                ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

ButtonDropdown.displayName = 'ButtonDropdown'
