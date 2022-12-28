// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState } from 'react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { search } from '../../lib/history'
import { callPhoneNumber, closeSideDrawer, formatDate, formatInTimeZone } from '../../lib/utils'
import { subDays, startOfDay } from 'date-fns'
import { EmptyState, IconSwitch, InlineNotification } from '../common'
import { faCircle, faPhone } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { HiArrowDownLeft, HiArrowUpRight } from 'react-icons/hi2'
import { MdCallMissed } from 'react-icons/md'
import { utcToZonedTime } from 'date-fns-tz'
import { formatDistanceToNowLoc } from '../../lib/dateTime'

export interface CallNotificationsDrawerContentProps extends ComponentPropsWithRef<'div'> {}

export const CallNotificationsDrawerContent = forwardRef<
  HTMLButtonElement,
  CallNotificationsDrawerContentProps
>(({ className, ...props }, ref) => {
  const [firstRender, setFirstRender]: any = useState(true)
  const [isLoaded, setLoaded] = useState(false)
  const authStore = useSelector((state: RootState) => state.authentication)
  const { name, mainextension } = useSelector((state: RootState) => state.user)
  const { operators } = useSelector((state: RootState) => state.operators)
  const [errorMessage, setErrorMessage] = useState('')
  const [lastCalls, setLastCalls]: any = useState({})
  const router = useRouter()

  const tabs = [
    { name: 'Personal', href: '#', current: true },
    { name: 'Queue', href: '#', current: false },
  ]

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }

    async function fetchHistory() {
      setLoaded(false)
      const dateTo: any = formatDate(new Date(), 'yyyyMMdd')
      const dateFrom: any = formatDate(startOfDay(subDays(new Date(), 14)), 'yyyyMMdd')

      try {
        const res = await search(
          'user',
          authStore.username,
          dateFrom,
          dateTo,
          '',
          'time%20desc',
          'all',
          1,
          20,
        )

        console.log('last calls', res) ////

        for (const call of res.rows) {
          const isNotificationUnread = call.direction === 'in' && call.disposition !== 'ANSWERED'
          call.isNotificationUnread = isNotificationUnread

          // sometimes operator name is missing, let's add it if needed
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
        }
        setLastCalls(res)
        setLoaded(true)
      } catch (e) {
        setErrorMessage('Cannot retrieve recent calls')
      }
    }

    if (!isLoaded) {
      fetchHistory()
    }
  }, [firstRender, isLoaded])

  const goToHistory = () => {
    closeSideDrawer()
    router.push('/history')
  }

  const toggleNotificationRead = (call: any) => {
    call.isNotificationUnread = !call.isNotificationUnread
  }

  useEffect(() => {
    console.log('useEffect lastCalls.rows', lastCalls.rows) ////
  }, [lastCalls.rows])

  const getCallIcon = (call: any) => {
    return (
      <div>
        {call.direction === 'in' && (
          <div>
            {call.disposition === 'ANSWERED' ? (
              <HiArrowDownLeft
                className='h-5 w-5 text-green-500 dark:text-green-400'
                aria-hidden='true'
                title='Incoming answered'
              />
            ) : (
              <MdCallMissed
                className='h-5 w-5 text-red-400 dark:text-red-500'
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
                className='h-5 w-5 text-green-400 dark:text-green-500'
                aria-hidden='true'
                title='Outgoing answered'
              />
            ) : (
              <HiArrowUpRight
                className='h-5 w-5 text-red-400 dark:text-red-500'
                aria-hidden='true'
                title='Outgoing missed'
              />
            )}
          </div>
        )}
      </div>
    )
  }

  const getCallContact = (call: any) => {
    if (call.direction === 'in') {
      // show call source
      return (
        <>
          <div className='truncate text-sm mb-1 text-gray-900 dark:text-gray-100'>
            {call.cnam !== '' && call.cnum !== mainextension && call.cnam !== name
              ? call.cnam
              : call.ccompany !== ''
              ? call.ccompany
              : call.cnum !== mainextension
              ? call.cnum
              : 'You'}
          </div>
          {call.cnum !== '' &&
            call.cnum !== mainextension &&
            (call.cnam !== '' || call.ccompany !== '') && (
              <div className='truncate text-sm text-primary dark:text-primary'>
                <div className='flex items-center'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                  />
                  <span
                    className='cursor-pointer hover:underline'
                    onClick={() => callPhoneNumber(call.src)}
                  >
                    {call.src}
                  </span>
                </div>
              </div>
            )}
        </>
      )
    } else if (call.direction === 'out') {
      // show call destination
      return (
        <>
          <div className='truncate text-sm mb-1 text-gray-900 dark:text-gray-100'>
            {call.dst_cnam !== '' && call.dst !== mainextension && call.dst_cnam !== name
              ? call.dst_cnam
              : call.dst_ccompany !== ''
              ? call.dst_ccompany
              : call.dst !== mainextension
              ? call.dst
              : 'You'}
          </div>
          {call.dst !== '' &&
            call.dst !== mainextension &&
            (call.dst_cnam !== '' || call.dst_ccompany !== '') && (
              <div className='truncate text-sm text-primary dark:text-primary'>
                <div className='flex items-center'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                  />
                  <span
                    className='cursor-pointer hover:underline'
                    onClick={() => callPhoneNumber(call.dst)}
                  >
                    {call.dst}
                  </span>
                </div>
              </div>
            )}
        </>
      )
    }
  }

  return (
    <>
      {/* drawer content */}
      <div className={classNames(className)} {...props}>
        <div className='flex min-w-0 flex-1 items-center justify-between mt-5 mx-5'>
          <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Recent calls</h2>
          <span className='text-sm cursor-pointer hover:underline text-gray-700 dark:text-gray-200'>
            Mark all as read
          </span>
        </div>
        {/* mobile tabs selector */}
        <div className='sm:hidden mx-5 my-5'>
          <label htmlFor='tabs' className='sr-only'>
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. //// */}
          <select
            id='tabs'
            name='tabs'
            className='block w-full rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primary dark:focus:ring-primary'
            defaultValue={tabs.find((tab) => tab.current)?.name}
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        {/* desktop tabs selector */}
        <div className='hidden sm:block mx-5'>
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  className={classNames(
                    tab.current
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
        {/* error */}
        {errorMessage && (
          <InlineNotification
            type='error'
            title={errorMessage}
            className='my-4'
          ></InlineNotification>
        )}
        {/* skeleton */}
        {!isLoaded && !errorMessage && (
          <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
            {Array.from(Array(9)).map((e, index) => (
              <li key={index} className='py-4 px-5'>
                <div className='animate-pulse h-3 rounded mb-4 bg-gray-300 dark:bg-gray-600'></div>
                <div className='animate-pulse h-3 max-w-[40%] rounded mb-4 bg-gray-300 dark:bg-gray-600'></div>
                <div className='animate-pulse h-3 max-w-[60%] rounded bg-gray-300 dark:bg-gray-600'></div>
              </li>
            ))}
          </ul>
        )}
        {/* empty state */}
        {isLoaded && lastCalls?.rows && !lastCalls.rows.length && (
          <EmptyState
            title='No recent calls'
            icon={
              <FontAwesomeIcon icon={faPhone} className='mx-auto h-12 w-12' aria-hidden='true' />
            }
          >
            <div
              className='text-sm cursor-pointer hover:underline text-gray-700 dark:text-gray-200'
              onClick={() => goToHistory()}
            >
              Show full history
            </div>
          </EmptyState>
        )}
        {/* last calls list */}
        {isLoaded && lastCalls?.rows && lastCalls.rows.length && (
          <>
            <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
              {lastCalls.rows?.map((call: any, index: number) => (
                <li
                  key={index}
                  className={
                    'flex py-4 items-center px-5' +
                    (call.isNotificationUnread ? ' bg-primaryLighter dark:bg-primaryDarker' : '')
                  }
                >
                  <div>{getCallIcon(call)}</div>
                  <div className='flex justify-between grow'>
                    <div className='ml-5'>
                      <div className={call.isNotificationUnread ? 'font-semibold' : ''}>
                        {getCallContact(call)}
                      </div>
                      <div
                        title={formatInTimeZone(new Date(call.time * 1000), 'PPpp', 'UTC')}
                        className='mt-3 text-sm text-gray-500 dark:text-gray-400'
                      >
                        {formatDistanceToNowLoc(utcToZonedTime(new Date(call.time * 1000), 'UTC'), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                    <div>
                      <IconSwitch
                        on={call.isNotificationUnread}
                        size='small'
                        icon={<FontAwesomeIcon icon={faCircle} />}
                        changed={() => toggleNotificationRead(call)}
                      >
                        <span className='sr-only'>Toggle favorite operator</span>
                      </IconSwitch>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className='flex justify-center'>
              <div
                className='text-sm cursor-pointer hover:underline my-6 mx-auto text-center text-gray-700 dark:text-gray-200'
                onClick={() => goToHistory()}
              >
                Show full history
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
})

CallNotificationsDrawerContent.displayName = 'CallNotificationsDrawerContent'
