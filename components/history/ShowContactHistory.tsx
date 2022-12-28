// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState } from 'react'
import classNames from 'classnames'
import { searchDrawerHistoryUser, searchDrawerHistorySwitchboard } from '../../lib/history'
import { Avatar, Button } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faPlus, faBuilding, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { HiArrowDownLeft, HiArrowUpRight } from 'react-icons/hi2'
import { MdCallMissed } from 'react-icons/md'
import { formatDate, formatInTimeZone } from '../../lib/utils'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export interface ShowContactHistoryProps extends ComponentPropsWithRef<'div'> {
  config: any
}

function checkTitle(config: any) {
  if (config.name) {
    return (
      <div className='flex items-center'>
        <div className='flex-shrink-0 mr-4'>
          <Avatar size='large' placeholderType='person' bordered />
        </div>
        <div className='flex-shrink-0 mr-4'>
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
        <div className='flex-shrink-0 mr-4'>
          <h2 className='text-xl font-medium text-gray-700 dark:text-gray-200'>{config.company}</h2>
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

export const ShowContactHistory = forwardRef<HTMLButtonElement, ShowContactHistoryProps>(
  ({ config, className, ...props }, ref) => {
    const [isDrawerLoaded, setIsDrawerLoaded] = useState(false)

    const [drawerError, setDrawerError] = useState('')

    const [drawer, setDrawer] = useState<any>([])

    //Get the operators information
    const operatorStore = useSelector((state: RootState) => state.operators)
    const operators = operatorStore.operators

    //Get the history drawer for the user type filter selected
    useEffect(() => {
      async function drawerUser() {
        if (!isDrawerLoaded && config.selectionType === 'user') {
          try {
            const res = await searchDrawerHistoryUser(
              config.username,
              config.dateBegin,
              config.dateEnd,
              config.number,
              config.sort,
            )
            res.rows = res.rows.filter(
              (call: any) =>
                call.src === config.number ||
                call.cnum === config.number ||
                call.dst === config.number,
            )
            setDrawer(res)
          } catch (e) {
            setDrawerError('Cannot retrieve user drawer history')
          }
          setIsDrawerLoaded(true)
        } else {
          if (!isDrawerLoaded && config.selectionType === 'switchboard') {
            try {
              const res = await searchDrawerHistorySwitchboard(
                config.dateBegin,
                config.dateEnd,
                config.number,
                config.sort,
              )
              res.rows = res.rows.filter(
                (call: any) =>
                  call.src === config.number ||
                  call.cnum === config.number ||
                  call.dst === config.number,
              )
              setDrawer(res)
            } catch (e) {
              setDrawerError('Cannot retrieve switchboard drawer history')
            }
            setIsDrawerLoaded(true)
          }
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
      config.dateBegin,
      config.dateEnd,
      isDrawerLoaded,
    ])

    useEffect(() => {
      setIsDrawerLoaded(false)
    }, [config.number])

    //Check the icon for the status column
    function checkIconUser(call: any) {
      return (
        <div className='mt-1 text-sm md:mt-0 flex'>
          <div>
            {call.direction === 'in' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <HiArrowDownLeft
                    className='mr-2 h-5 w-5 text-green-400'
                    aria-hidden='true'
                    title='Incoming answered'
                  />
                ) : (
                  <MdCallMissed
                    className='mr-2 h-5 w-5 text-red-400'
                    aria-hidden='true'
                    title='Incoming missed'
                  />
                )}
              </div>
            )}
            {call.direction === 'out' && (
              <div>
                {call.disposition === 'ANSWERED' ? (
                  <HiArrowUpRight
                    className='mr-2 h-5 w-5 text-green-400'
                    aria-hidden='true'
                    title='Outgoing answered'
                  />
                ) : (
                  <HiArrowUpRight
                    className='mr-2 h-5 w-5 text-red-400'
                    aria-hidden='true'
                    title='Outgoing missed'
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    function checkIconSwitchboard(call: any) {
      return (
        <>
          <div className='text-sm md:mt-0 flex'>
            <div>
              {call.type === 'internal' && (
                <div>
                  {call.disposition === 'ANSWERED' ? (
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className='h-4 w-4 text-green-400'
                      aria-hidden='true'
                      title='Internal answered'
                    />
                  ) : (
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className='h-4 w-4 text-red-400'
                      aria-hidden='true'
                      title='Internal missed'
                    />
                  )}
                </div>
              )}
              {call.type !== 'internal' && (
                <div>
                  {call.type === 'in' && (
                    <div>
                      {call.disposition === 'ANSWERED' ? (
                        <HiArrowDownLeft
                          className='h-5 w-5 text-green-400'
                          aria-hidden='true'
                          title='Incoming answered'
                        />
                      ) : (
                        <MdCallMissed
                          className='h-5 w-5 text-red-400'
                          aria-hidden='true'
                          title='Incoming missed'
                        />
                      )}
                    </div>
                  )}
                  {call.type === 'out' && (
                    <div>
                      {call.disposition === 'ANSWERED' ? (
                        <HiArrowUpRight
                          className='h-5 w-5 text-green-400'
                          aria-hidden='true'
                          title='Outgoing answered'
                        />
                      ) : (
                        <HiArrowUpRight
                          className='h-5 w-5 text-red-400'
                          aria-hidden='true'
                          title='Outgoing missed'
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )
    }

    function conversionToUtcHour(date: any) {
      const hour: any = date * 1000
      let hourWithMilliseconds = new Date(hour)
      let convertedUtcHour = formatInTimeZone(hourWithMilliseconds, 'HH:mm', 'UTC')
      return convertedUtcHour
    }

    function sourceColumn(call: any) {
      //Check if a user does not have a name and add the name of the operator
      if (call.cnam === '') {
        let foundOperator: any = Object.values(operators).find((operator: any) =>
          operator.endpoints.extension.find(
            (device: any) => device.id === call.cnum || device.id === call.src,
          ),
        )

        if (foundOperator) {
          call.cnam = foundOperator.name
        }
      }

      return (
        <div className='flex flex-col justify-center text-sm mt-4 text-gray-900 dark:text-gray-100 md:mt-0'>
          <div className='truncate'>
            {call.cnam !== '' ? call.cnam : call.ccompany !== '' ? call.ccompany : call.cnum || '-'}
          </div>
          {call.cnum !== '' && (
            <div className='truncate text-sm text-gray-500 dark:text-gray-500'>{call.src}</div>
          )}
        </div>
      )
    }

    function destinationColumn(call: any) {
      //Check if a user does not have a name and add the name of the operator
      if (call.dst_cnam === '') {
        let foundOperator: any = Object.values(operators).find((operator: any) =>
          operator.endpoints.extension.find((device: any) => device.id === call.dst),
        )

        if (foundOperator) {
          call.dst_cnam = foundOperator.name
        }
      }

      return (
        <div className='flex flex-col justify-center mt-4 md:mt-0'>
          <div className='truncate text-sm text-gray-900 dark:text-gray-100'>
            {call.dst_cnam !== ''
              ? call.dst_cnam
              : call.dst_ccompany !== ''
              ? call.dst_ccompany
              : call.dst || '-'}
          </div>
          {(call.dst_cnam !== '' || call.dst_ccompany !== '') && (
            <div className='truncate text-sm text-gray-500 dark:text-gray-500'>{call.dst}</div>
          )}
        </div>
      )
    }

    return (
      <>
        {/* drawer content */}
        <div className={classNames('p-5', className)} {...props}>
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
                      <div className='flex items-center text-sm'>
                        <span className='truncate '>{config.company}</span>
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
                        <span className='truncate cursor-pointer hover:underline'>
                          {config.number}
                        </span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
            {config.name && !config.company && config.number && (
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
                        <span className='truncate cursor-pointer hover:underline'>
                          {config.number}
                        </span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Switchboard last calls title */}
          {config.selectionType === 'switchboard' && (
            <h4 className='mt-6 text-md font-medium text-gray-700 dark:text-gray-200'>
              Last switchboard calls
            </h4>
          )}

          {/* User last calls title */}
          {config.selectionType === 'user' && (
            <h4 className='mt-6 text-md font-medium text-gray-700 dark:text-gray-200'>
              Last personal calls
            </h4>
          )}

          {/* Divider  */}
          <div className='mt-4 border-t border-gray-200 dark:border-gray-700'>
            <dl className='sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700'></dl>
          </div>

          {/* Last calls list */}
          <div className='overflow-hidden  sm:rounded-md bg-white dark:bg-gray-900'>
            <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
              {isDrawerLoaded &&
                drawer?.rows &&
                drawer.rows.map((call: any, index: number) => (
                  <li key={index}>
                    <div className='flex items-center py-4'>
                      <div className='flex min-w-0 flex-1 items-center'>
                        <div className='min-w-0 flex-1 px-2 md:grid md:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-5'>
                          {/* Date column */}
                          <div className='flex flex-col justify-center'>
                            <div className=''>
                              <div className='text-sm text-gray-900 dark:text-gray-100'>
                                {formatDate(call.time * 1000, 'PP')}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {conversionToUtcHour(call.time)}
                              </div>
                            </div>
                          </div>
                          {/* Source column  */}
                          {sourceColumn(call)}

                          {/* Icon column */}
                          <div className='mt-4 md:mt-0 flex items-center 2xl:justify-center'>
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className='h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-600'
                              aria-hidden='true'
                            />
                          </div>

                          {/* Destination column */}
                          {destinationColumn(call)}

                          {/* icon user column */}
                          {config.selectionType === 'user' && (
                            <div className='flex items-center md:mt-0 2xl:justify-center'>
                              {checkIconUser(call)}{' '}
                            </div>
                          )}

                          {/* icon user column */}
                          {config.selectionType === 'switchboard' && (
                            <div className='flex items-center md:mt-0 2xl:justify-center'>
                              {checkIconSwitchboard(call)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </>
    )
  },
)

ShowContactHistory.displayName = 'ShowContactHistory'
