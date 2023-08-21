// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SliderCarousel from '../../SlideCarousel'
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
import { NotManagedCalls } from '../NotManagedCalls'

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
          isEmpty(alarmsList.list) ? 'bg-gray-100' : 'bg-red-50'
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

                {/* Second row */}
                {/* <div className='flex items-center pt-2 space-x-3'>
                  <FontAwesomeIcon
                    icon={faUsers}
                    className='h-5 w-5 py-2 cursor-pointer flex items-center text-gray-500 dark:text-gray-400'
                    aria-hidden='true'
                  />
                  <div className='flex justify-center items-center'>
                    <p className='text-md font-semibold tracking-tight text-left text-gray-900 dark:text-gray-900 mr-1'>
                      {t('QueueManager.Queue')}:
                    </p>
                    <p className='text-md font-bold leading-6 text-center mr-1 text-gray-900 dark:text-gray-900'>
                      Assistenza Clienti
                    </p>
                    <p className='text-md font-bold leading-6 text-center text-gray-900 dark:text-gray-900'>
                      500
                    </p>
                  </div>
                </div> */}

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

  const cardGroups = [
    [
      <div key='alarms' className='mx-3'>
        <Dropdown items={dropdownItems} position='left' divider={true} className='pl-3'>
          <div
            className={`flex items-center justify-between px-4 mt-1 mb-2 bg-gray-100 rounded-md py-1 ${
              !isEmpty(alarmsList.list) ? 'bg-red-50' : ''
            }`}
          >
            <div className='flex items-center'>
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className={`h-6 w-6 pr-6 py-2 cursor-pointer flex items-center ${
                  !isEmpty(alarmsList.list) ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                }`}
                aria-hidden='true'
              />
              <div className='flex flex-col justify-center'>
                <p className='text-3xl font-semibold tracking-tight text-left text-gray-900 dark:text-gray-900'>
                  {(alarmsList.list && Object.keys(alarmsList.list).length) ?? 0}
                </p>
                <p className='text-sm font-medium leading-6 text-center text-gray-500 dark:text-gray-400'>
                  {alarmsList.list && Object.keys(alarmsList.list).length === 1
                    ? t('QueueManager.Alarm')
                    : t('QueueManager.Alarms')}
                </p>
              </div>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
              aria-hidden='true'
            />
          </div>
        </Dropdown>
      </div>,
    ],
    [
      <div key='notManaged' className='mx-3 pt-1'>
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
      </div>,
    ],
    [
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
      </div>,
    ],
    [
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
      </div>,
    ],
    [
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
      </div>,
    ],
    [
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
      </div>,
    ],
    [
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
      </div>,
    ],
  ]

  return (
    <>
      <div className='border-b rounded-md shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4'>
        <SliderCarousel>
          {cardGroups.map((cardGroup, groupIndex) => (
            <div key={groupIndex} className='flex items-center'>
              {cardGroup.map((card, cardIndex) => (
                <div
                  key={cardIndex}
                  className={`col-span-1 mx-3 ${
                    cardIndex === cardGroup.length - 1 ? 'mb-0' : 'mb-4'
                  }`}
                >
                  {card}
                </div>
              ))}
            </div>
          ))}
        </SliderCarousel>
      </div>
    </>
  )
}

QueueManagerDashboardHeader.displayName = 'QueueManagerDashboardHeader'
