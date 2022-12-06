// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState } from 'react'
import classNames from 'classnames'
import { searchDrawerHistoryUser, searchDrawerHistorySwitchboard } from '../../lib/history'
import { Avatar, Button } from '../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faPlus, faBuilding } from '@fortawesome/free-solid-svg-icons'
import { HiArrowDownLeft, HiArrowUpRight } from 'react-icons/hi2'
import { MdCallMissed, MdPhoneCallback } from 'react-icons/md'

import moment from 'moment'

export interface ShowContactHistorytProps extends ComponentPropsWithRef<'div'> {
  config: any
}

function checkTitle(config: any) {
  if (config.name) {
    return (
      <div className='flex items-center'>
        <div className='flex-shrink-0 mr-4'>
          <Avatar size='large' placeholderType='person' bordered />
        </div>
        <div>
          <h2 className='text-xl font-medium text-gray-700 dark:text-gray-200'>{config.name}</h2>
        </div>
      </div>
    )
  } else if (!config.name && config.company) {
    return (
      <div className='flex items-center'>
        <div className='flex-shrink-0 mr-4'>
          <Avatar size='large' placeholderType='company' bordered />
        </div>
        <div>
          <h2 className='text-xl font-medium text-gray-700 dark:text-gray-200'>
            {config.company}
          </h2>
        </div>
      </div>
    )
  } else {
    return (
      <div className='flex items-center'>
        <div className='flex-shrink-0 mr-4'>
          <Avatar size='large' placeholderType='person' bordered />
        </div>
        <div>
          <h2 className='text-xl font-medium text-gray-700 dark:text-gray-200'>{config.number}</h2>
        </div>
      </div>
    )
  }
}


export const ShowContactHistory = forwardRef<HTMLButtonElement, ShowContactHistorytProps>(
  ({ config, className, ...props }, ref) => {
    const auth = useSelector((state: RootState) => state.authentication)

    const [isDrawerLoaded, setIsDrawerLoaded] = useState(false)

    const [drawerError, setDrawerError] = useState('')

    const [drawer, setDrawer] = useState<any>([])

    //Get the history drawer for the user type filter selected
    useEffect(() => {
      async function drawerUser() {
        console.log('this is res', config)
        if (!isDrawerLoaded && config.selectionType === 'user') {
          try {
            const res = await searchDrawerHistoryUser(
              config.username,
              config.dateBegin,
              config.dateEnd,
              config.number,
              config.sort,
            )
            setDrawer(res)
          } catch (e) {
            setDrawerError('Cannot retrieve user drawer history')
          }
          setIsDrawerLoaded(true)
        }
      }
      drawerUser()
    }, [
      config.username,
      config.dataEnd,
      config.dataBegin,
      config.sort,
      config.selectionType,
      config.number,
      isDrawerLoaded,
    ])

    //Get the history drawer for the user type filter selected
    useEffect(() => {
      async function drawerSwitchboard() {
        console.log('this is res', config)
        if (!isDrawerLoaded && config.selectionType === 'switchboard') {
          try {
            const res = await searchDrawerHistorySwitchboard(
              config.dateBegin,
              config.dateEnd,
              config.number,
              config.sort,
            )
            setDrawer(res)
          } catch (e) {
            setDrawerError('Cannot retrieve switchboard drawer history')
          }
          setIsDrawerLoaded(true)
        }
      }
      drawerSwitchboard()
    }, [
      config.dataEnd,
      config.dataBegin,
      config.sort,
      config.selectionType,
      config.number,
      isDrawerLoaded,
    ])

    //Check the icon for the status column
    function checkIconUser(contact: any) {
      if (contact.selectionType === 'user') {
        return (
          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
            <div className='mt-1 flex items-center text-sm'>
              <div>
                {contact.direction === 'in' && (
                  <div>
                    {contact.disposition === 'ANSWERED' ? (
                      <div className='flex flex-nowrap'>
                        <HiArrowDownLeft
                          className='mr-2 h-5 w-5 text-green-400'
                          aria-hidden='true'
                        />
                        <span className=''>Incoming answered</span>
                      </div>
                    ) : (
                      <div className='flex flex-nowrap'>
                        <MdCallMissed className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                        <span className=''>Incoming missed</span>
                      </div>
                    )}
                  </div>
                )}
                {contact.direction === 'out' && (
                  <div>
                    {contact.disposition === 'ANSWERED' ? (
                      <div className='flex flex-nowrap'>
                        <HiArrowUpRight
                          className='mr-2 h-5 w-5 text-green-400'
                          aria-hidden='true'
                        />
                        <span className=''>Outgoing answered</span>
                      </div>
                    ) : (
                      <div className='flex flex-nowrap'>
                        <HiArrowUpRight className='mr-2 h-5 w-5 text-red-400' aria-hidden='true' />
                        <span className=''>Outgoing missed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        )
      } else {
        return (
          <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
            <div className='mt-1 flex items-center text-sm'>
              <div>
                {contact.type === 'internal' && (
                  <div>
                    {contact.disposition === 'ANSWERED' ? (
                      <div className='flex flex-nowrap'>
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className='mr-2 h-4 w-4 flex-shrink-0 text-green-400'
                          aria-hidden='true'
                        />
                        <span>Internal answered</span>
                      </div>
                    ) : (
                      <div className='flex flex-nowrap'>
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className='mr-2 h-4 w-4 flex-shrink-0 text-red-400'
                          aria-hidden='true'
                        />
                        <span>Internal missed</span>
                      </div>
                    )}
                  </div>
                )}
                {contact.type !== 'internal' && (
                  <div>
                    {contact.type === 'in' && (
                      <div>
                        {contact.disposition === 'ANSWERED' ? (
                          <div className='flex flex-nowrap'>
                            <HiArrowDownLeft
                              className='mr-2 h-5 w-5 text-green-400'
                              aria-hidden='true'
                            />
                            <span className=''>Incoming answered</span>
                          </div>
                        ) : (
                          <div className='flex flex-nowrap'>
                            <MdCallMissed
                              className='mr-2 h-5 w-5 text-red-400'
                              aria-hidden='true'
                            />
                            <span className=''>Incoming missed</span>
                          </div>
                        )}
                      </div>
                    )}
                    {contact.type === 'out' && (
                      <div>
                        {contact.disposition === 'ANSWERED' ? (
                          <div className='flex flex-nowrap'>
                            <HiArrowUpRight
                              className='mr-2 h-5 w-5 text-green-400'
                              aria-hidden='true'
                            />
                            <span className=''>Outgoing answered</span>
                          </div>
                        ) : (
                          <div className='flex flex-nowrap'>
                            <HiArrowUpRight
                              className='mr-2 h-5 w-5 text-red-400'
                              aria-hidden='true'
                            />
                            <span className=''>Outgoing missed</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </td>
        )
      }
    }

    return (
      <>
        {/* drawer content */}
        <div className={classNames('p-1', className)} {...props}>
          <div className='flex min-w-0 flex-1 items-center justify-between'>
            {checkTitle(config)}
          </div>
          <div className='mt-8 flex items-center gap-2'>
            <div>
              <Button variant='primary' className='mr-2'>
                <FontAwesomeIcon icon={faPhone} className='h-4 w-4 xl:mr-2' />
                <span className='hidden xl:inline-block'>Call</span>
                <span className='sr-only'>Call</span>
              </Button>
            </div>
            <div>
              {!config.name && !config.company && (
                <Button variant='white' className='mr-2'>
                  <FontAwesomeIcon
                    icon={faPlus}
                    className='h-4 w-4 xl:mr-2 text-gray-500 dark:text-gray-400'
                  />
                  <span className='hidden xl:inline-block'>Create contact</span>
                  <span className='sr-only'>Create contact</span>
                </Button>
              )}
            </div>
          </div>
          <div>
            {config.company && (
              <div className='mt-6 border-t border-gray-200 dark:border-gray-700'>
                <dl className='sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700'>
                  {/* Company name */}
                  <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                    <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Company name
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                      <div className='flex items-center text-sm text-primary dark:text-primary'>
                        <span className='truncate cursor-pointer'>{config.company}</span>
                      </div>
                    </dd>
                  </div>
                  {/* Phone number */}
                  <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                    <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Phone number
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                      <div className='flex items-center text-sm text-primary dark:text-primary'>
                        <FontAwesomeIcon
                          icon={faPhone}
                          className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                          aria-hidden='true'
                        />
                        <span className='truncate cursor-pointer'>{config.number}</span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
            {config.name && !config.company && config.number &&(
              <div className='mt-6 border-t border-gray-200 dark:border-gray-700'>
                <dl className='sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700'>
                  {/* Phone number */}
                  <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                    <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      Phone number
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                      <div className='flex items-center text-sm text-primary dark:text-primary'>
                        <FontAwesomeIcon
                          icon={faPhone}
                          className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                          aria-hidden='true'
                        />
                        <span className='truncate cursor-pointer'>{config.number}</span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
          <div className='mt-8 flex flex-col'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300'>
                    <tbody className='divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700'>
                      {isDrawerLoaded &&
                        drawer?.rows &&
                        drawer.rows.map((contact: any, index: number) => (
                          <tr key={index}>
                            <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6'>
                              <div className='flex items-center'>
                                <div className=''>
                                  <div className='font-medium text-gray-900 dark:text-gray-100'>
                                    {moment(contact.time * 1000).format('LL')}
                                  </div>
                                  <div className='text-gray-500'>
                                    {moment.utc(contact.time * 1000).format('LT')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            {checkIconUser(config)}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  },
)

ShowContactHistory.displayName = 'ShowContactHistory'
