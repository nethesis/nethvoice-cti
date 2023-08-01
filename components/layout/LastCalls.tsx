// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { SpeedDialType } from '../../services/types'
import { useState, useEffect, useRef, MutableRefObject, useCallback } from 'react'
import { Button, Avatar, Modal, Dropdown, InlineNotification, EmptyState } from '../common'
import {
  deleteSpeedDial,
  deleteAllSpeedDials,
  getSpeedDials,
  importCsvSpeedDial,
} from '../../services/phonebook'
import {
  sortSpeedDials,
  openCreateSpeedDialDrawer,
  openEditSpeedDialDrawer,
  exportSpeedDial,
} from '../../lib/speedDial'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faEllipsisVertical,
  faPen,
  faBolt,
  faTrashCan,
  faFileImport,
  faFileArrowDown,
  faCheckCircle,
} from '@nethesis/nethesis-solid-svg-icons'
import { callPhoneNumber } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import { getJSONItem } from '../../lib/storage'
import { getLastCalls } from '../../lib/history'
import { getNMonthsAgoDate } from '../../lib/utils'
import { formatDateLoc } from '../../lib/dateTime'
import { type LastCallsResponse } from '../../lib/history'

interface AvatarTypes {
  [key: string]: string
}

export const LastCalls = () => {
  const { t } = useTranslation()

  const avatars = useSelector((state: RootState) => state.operators.avatars)
  const operators = useSelector((state: RootState) => state.operators.operators)
  const username = useSelector((state: RootState) => state.user.username)

  const [lastCalls, setLastCalls] = useState<LastCallsResponse>()

  useEffect(() => {
    // console.warn('operators')
    // console.warn(operators)
  }, [operators])

  useEffect(() => {
    // console.warn('avatars')
    // console.warn(avatars)
  }, [avatars])

  const firstLoadedRef = useRef<boolean>(false)

  const getLastCallsList = useCallback(async () => {
    const dateStart = getNMonthsAgoDate(2)
    const dateEnd = getNMonthsAgoDate()
    const dateStartString = formatDateLoc(dateStart, 'yyyyMMdd')
    const dateEndString = formatDateLoc(dateEnd, 'yyyyMMdd')
    const lastCalls = await getLastCalls(username, dateStartString, dateEndString)
    console.warn(lastCalls)
    if (lastCalls) {
      setLastCalls(lastCalls)
    }
  }, [username])

  useEffect(() => {
    if (username && !firstLoadedRef.current) {
      firstLoadedRef.current = true
      getLastCallsList()
    }
  }, [username, getLastCallsList])

  return (
    <>
      {/* Secondary column (hidden on smaller screens) */}
      <aside className='hidden lg:w-72 xl:w-80 2xl:w-96 border-l lg:block h-full border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
        <div className='flex h-full flex-col bg-white dark:bg-gray-900'>
          <div className='py-6 px-5'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                {t('LastCalls.Last calls')}
              </h2>
              <div className='flex gap-2 items-center'> </div>
            </div>
          </div>
          <span className='border-b border-gray-200 dark:border-gray-700'></span>
          <ul
            role='list'
            className='flex-1 divide-y overflow-y-auto divide-gray-200 dark:divide-gray-700'
          >
            {/* skeleton */}
            {Array.from(Array(4)).map((e, index) => (
              <li key={index}>
                <div className='flex items-center px-4 py-4 sm:px-6'>
                  {/* avatar skeleton */}
                  <div className='animate-pulse rounded-full h-12 w-12 bg-gray-300 dark:bg-gray-600'></div>
                  <div className='min-w-0 flex-1 px-4'>
                    <div className='flex flex-col justify-center'>
                      {/* line skeleton */}
                      <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {/* empty state */}
            {
              <EmptyState
                title={t('LastCalls.No calls')}
                icon={
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='mx-auto h-12 w-12'
                    aria-hidden='true'
                  />
                }
              ></EmptyState>
            }
            {/* Iterate through speed dial list */}
            {[{ name: 'aaa', speeddial_num: 1234 }].map((speedDial, key) => (
              <li key={key}>
                <div className='group relative flex items-center py-6 px-5'>
                  <div
                    className='absolute inset-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                    aria-hidden='true'
                  />
                  <div className='relative flex min-w-0 flex-1 items-center justify-between'>
                    <div className='flex items-center'>
                      <span className='text-gray-300 dark:text-gray-600'>
                        <Avatar size='base' placeholderType='person' />
                      </span>
                      <div className='ml-4 truncate'>
                        <p className='truncate text-sm font-medium text-gray-700 dark:text-gray-200'>
                          {speedDial.name}
                        </p>
                        <div className='truncate text-sm mt-1 text-primary dark:text-primary'>
                          <div className='flex items-center'>
                            <FontAwesomeIcon
                              icon={faPhone}
                              className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                              aria-hidden='true'
                            />
                            <span className='cursor-pointer hover:underline' onClick={() => {}}>
                              {speedDial.speeddial_num}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      {/* Actions */}
                      <Button variant='white' className='gap-2'>
                        <FontAwesomeIcon icon={faPhone} size='lg' className='text-gray-500' />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}
