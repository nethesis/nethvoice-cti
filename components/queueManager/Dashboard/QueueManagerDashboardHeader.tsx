// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPause,
  faChevronDown,
  faTriangleExclamation,
  faPhone,
  faPhoneSlash,
  faArrowLeft,
  faClock,
} from '@fortawesome/free-solid-svg-icons'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import { isEmpty } from 'lodash'
import { Dropdown } from '../../common'
import {
  getFormattedTimeFromAlarmsList,
  getAlarm,
  getAlarmDescription,
} from '../../../lib/queueManager'

export interface QueueManagerDashboardHeaderProps extends ComponentProps<'div'> {
  totalAll: any
  totalAnswered: any
  totalFailed: any
  totalInvalid: any
  totalInProgress: any
  notManaged: any
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const QueueManagerDashboardHeader: FC<QueueManagerDashboardHeaderProps> = ({
  className,
  totalAll,
  totalAnswered,
  totalFailed,
  totalInvalid,
  totalInProgress,
  notManaged,
}): JSX.Element => {
  const { t } = useTranslation()
  const [alarmsList, setAlarmsList] = useState<any>({})

  const [firstRenderAlarmList, setFirstRenderAlarmList]: any = useState(true)
  const [isLoadedAlarms, setLoadedAlarms] = useState(false)

  //get alarm list information
  useEffect(() => {
    // Avoid api double calling
    if (firstRenderAlarmList) {
      setFirstRenderAlarmList(false)
      return
    }
    async function getAlarmList() {
      setLoadedAlarms(false)
      try {
        const res = await getAlarm()
        setAlarmsList(res)
        // only for testing
        // setAlarmsList(alarmListExample)
      } catch (err) {
        console.error(err)
      }
      setLoadedAlarms(true)
    }
    if (!isLoadedAlarms) {
      getAlarmList()
    }
  }, [firstRenderAlarmList, isLoadedAlarms])

  // Alarms section

  // Alarm list example to test
  // const alarmListExample = {
  //   list: {
  //     '211': {
  //       queuefewop: {
  //         status: 'warning',
  //         date: new Date().getTime(),
  //       },
  //     },
  //   },
  //   status: true,
  // }

  // Create a object with all alarms type and description
  const alarmsType = {
    queuefewop: {
      description: `${t('QueueManager.queuefewop alarm')}`,
    },
    queueholdtime: {
      description: `${t('QueueManager.queueholdtime alarm')}`,
    },
    queueload: {
      description: `${t('QueueManager.queueload alarm')}`,
    },
    queuemaxwait: {
      description: `${t('QueueManager.queuemaxwait alarm')}`,
    },
  }

  const dropdownItems = (
    <>
      <div
        className={`cursor-default py-2 w-96 px-2 ${
          isEmpty(alarmsList.list) ? 'bg-gray-100 border-b rounded-lg shadow-md' : 'bg-red-50 border-b rounded-lg shadow-md'
        }`}
      >
        <Dropdown.Header>
          {!isEmpty(alarmsList.list) ? (
            <>
              {/* Header dropdown  */}
              <span className='text-lg font-semibold flex justify-start text-center mb-2'>
                {t('QueueManager.Alarm error detected')}
              </span>
              {/* Divider  */}
              <div className='relative'>
                <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                  <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
                </div>
              </div>

              {/* Body dropdown */}
              <div className='flex flex-col'>
                {/* First row */}
                <div className='flex items-center pt-3 space-x-3'>
                  <FontAwesomeIcon
                    icon={faClock}
                    className='h-5 w-5 py-2 cursor-pointer flex items-center text-gray-500 dark:text-gray-400'
                    aria-hidden='true'
                  />
                  <div className='flex justify-center items-center'>
                    <p className='text-md font-semibold tracking-tight text-left text-gray-900 dark:text-gray-900 mr-1'>
                      {t('QueueManager.Begin hour')}
                    </p>
                    <p className='text-md font-bold leading-6 text-center text-gray-900 dark:text-gray-900'>
                      {getFormattedTimeFromAlarmsList(alarmsList)}
                    </p>
                  </div>
                </div>

                {/* Third row */}
                <span className='pt-3 text-sm'>{getAlarmDescription(alarmsList, alarmsType)}</span>
              </div>
            </>
          ) : (
            <span className='text-sm text-gray-900 dark:text-gray-900 font-medium flex justify-center text-center '>
              {' '}
              {t('QueueManager.No alarm detected')}
            </span>
          )}
        </Dropdown.Header>
      </div>
    </>
  )

  return (
    <>
      <div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
          {/* Alarm */}
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm:mt-1 flex items-center'>
            <div className='mx-3 pt-1 w-full'>
              <Dropdown items={dropdownItems} position='left' divider={true} className=''>
                <div className='flex justify-between items-center'>
                  <div className={`h-14 w-14 flex items-center justify-center rounded-md ${
                        !isEmpty(alarmsList.list)
                          ? 'bg-red-50 dark:bg-emerald-50'
                          : 'bg-emerald-50 dark:bg-emerald-50'
                      }`}>
                    <FontAwesomeIcon
                      icon={faTriangleExclamation}
                      className={`h-6 w-6 py-2 cursor-pointer flex items-center ${
                        !isEmpty(alarmsList.list)
                          ? 'text-red-600'
                          : 'text-emerald-600 dark:text-emerald-600'
                      }`}
                      aria-hidden='true'
                    />
                  </div>
                  <div className='flex flex-col justify-center ml-4'>
                    <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                      {(alarmsList.list && Object.keys(alarmsList.list).length) ?? 0}
                    </p>
                    <p className='text-sm font-medium leading-6 text-left text-gray-500 dark:text-gray-400'>
                      {alarmsList.list && Object.keys(alarmsList.list).length === 1
                        ? t('QueueManager.Alarm')
                        : t('QueueManager.Alarms')}
                    </p>
                  </div>
                  <div className='flex items-center ml-auto'>
                    {' '}
                    {/* Utilizzo della classe justify-end */}
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className='h-3.5 w-3.5 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-600 hover:dark:text-gray-500'
                      aria-hidden='true'
                    />
                  </div>
                </div>
              </Dropdown>
            </div>
          </div>

          {/* not Managed */}
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
            <div className='mx-3 pt-1'>
              <div className='flex items-center w-full'>
                <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {notManaged.count}
                  </p>
                  <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-400'>
                    {t('QueueManager.Not managed customers')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* total calls */}
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
            <div key='totalAll' className='mx-3 pt-1'>
              <div className='flex items-center w-full'>
                <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {totalAll}
                  </p>
                  <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-400'>
                    {t('QueueManager.Total calls')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* total answered */}
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
            <div key='totalAnswered' className='mx-3 pt-1'>
              <div className='flex items-center w-full'>
                <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className='h-6 w-6 cursor-pointer -rotate-45 text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {totalAnswered}
                  </p>
                  <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-400'>
                    {t('QueueManager.Answered calls')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/*lostCalls */}
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
            <div key='lostCalls' className='mx-3 pt-1'>
              <div className='flex items-center w-full'>
                <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                  <FontAwesomeIcon
                    icon={faMissed}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {totalFailed}
                  </p>
                  <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-400'>
                    {t('QueueManager.Lost calls')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* totalInvalid */}
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
            <div key='totalInvalid' className='mx-3 pt-1'>
              <div className='flex items-center w-full'>
                <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                  <FontAwesomeIcon
                    icon={faPhoneSlash}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {totalInvalid}
                  </p>
                  <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-400'>
                    {t('QueueManager.Invalid calls')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* In progress */}
          <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-1 sm: mt-1 relative flex items-center'>
            <div key='inProgress' className='mx-3 pt-1'>
              <div className='flex items-center w-full'>
                <div className='h-14 w-14 flex items-center justify-center rounded-md bg-emerald-50'>
                  <FontAwesomeIcon
                    icon={faPause}
                    className='h-6 w-6 cursor-pointer text-emerald-600 dark:text-emerald-600'
                    aria-hidden='true'
                  />
                </div>
                <div className='flex flex-col justify-center ml-4'>
                  <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-100'>
                    {totalInProgress}
                  </p>
                  <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-400'>
                    {t('QueueManager.In progress')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

QueueManagerDashboardHeader.displayName = 'QueueManagerDashboardHeader'
