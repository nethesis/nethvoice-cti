// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import {
  faChevronDown,
  faCheck,
  faMinus,
  faPlus,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { CallDuration } from '../../operators/CallDuration'
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'
import { Button, EmptyState } from '../../common'

export interface MonitorQueueCardProps {
  queue: any
  rowCount: number
  isFullscreen: boolean
  onQueueChange: (queue: any) => void
  onAdd?: () => void
  onRemove?: () => void
}

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const MonitorQueueCard: FC<MonitorQueueCardProps> = ({
  queue,
  rowCount,
  isFullscreen,
  onQueueChange,
  onAdd,
  onRemove,
}): JSX.Element => {
  const { t } = useTranslation()
  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

  const textSize = isFullscreen ? 'text-2xl' : 'text-base'
  const cellTextSize = isFullscreen ? 'text-2xl' : 'text-sm'
  const headerTextSize = isFullscreen ? 'text-2xl' : 'text-sm '

  const waitingCallers = queueManagerStore?.queues[queue?.queue]?.waitingCallers
  const callerArray: any[] = waitingCallers ? Object.values(waitingCallers) : []
  const waitingCallsCount = waitingCallers ? Object.keys(waitingCallers).length : 0

  const columns = [t('QueueManager.Position'), t('QueueManager.Calls'), t('QueueManager.Waiting')]

  return (
    <div className='border-b rounded-lg shadow-md border-gray-200 dark:border-gray-700 bg-cardBackgroud dark:bg-cardBackgroudDark px-5 py-4 sm:mt-1 relative'>
      <div className='flex items-center space-x-2' data-monitor-card-header>
        <div className='flex-grow'>
          <div className='flex items-center space-x-2'>
            <Listbox value={queue} onChange={onQueueChange}>
              {({ open }) => (
                <>
                  <div className='flex items-center'>
                    <div className='relative'>
                      <ListboxButton
                        className={`relative  cursor-default rounded-md py-1.5 pr-10 text-left text-gray-950 dark:text-gray-300 focus:outline-none sm:text-sm sm:leading-6 ${
                          isFullscreen ? 'w-96' : 'w-48'
                        }  `}
                      >
                        <span className={`block truncate mr-1 font-semibold ${textSize}  `}>
                          {queue?.name ? queue.name + ' ' + queue.queue : t('QueueManager.Select queue')}
                        </span>
                        <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                            aria-hidden='true'
                          />
                        </span>
                      </ListboxButton>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave='transition ease-in duration-100'
                        leaveFrom='opacity-100'
                        leaveTo='opacity-0'
                      >
                        <ListboxOptions className='absolute z-10 mt-1 w-full overflow-auto  scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 rounded-md bg-white py-1 text-base shadow-lg ring-1 dark:bg-gray-900 ring-black ring-opacity-5 dark:ring-gray-700 dark:ring-opacity-100 focus:outline-none sm:text-sm h-auto'>
                          {Object.keys(queueManagerStore.queues).length === 0 && (
                            <div className='relative select-none px-4 py-2 text-sm text-gray-500 dark:text-gray-400'>
                              {t('Queues.No queues')}
                            </div>
                          )}
                          {Object.entries<any>(queueManagerStore.queues).map(
                            ([queueId, queueInfo]) => (
                              <ListboxOption
                                key={queueId}
                                className={() =>
                                  classNames(
                                    'relative cursor-default select-none py-2 pl-8 pr-4 data-[focus]:text-white data-[focus]:bg-primary text-gray-900 dark:text-gray-100',
                                    textSize,
                                  )
                                }
                                value={queueInfo}
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={classNames(
                                        selected ? 'font-semibold' : 'font-normal',
                                        'block truncate',
                                      )}
                                    >
                                      {queueInfo.name} ({queueInfo.queue})
                                    </span>

                                    {selected || queue?.queue === queueId ? (
                                      <span className='data-[focus]:text-white text-primary absolute inset-y-0 left-0 flex items-center pl-1.5'>
                                        <FontAwesomeIcon
                                          icon={faCheck}
                                          className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                                          aria-hidden='true'
                                        />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </ListboxOption>
                            ),
                          )}
                        </ListboxOptions>
                      </Transition>
                    </div>
                  </div>
                </>
              )}
            </Listbox>
          </div>
        </div>

        <div className='flex items-center ml-auto space-x-5'>
          <div className='text-sm text-gray-500 whitespace-nowrap'>
            <span className={`text-amber-700 dark:text-amber-500 font-semibold mr-2 ${textSize}  `}>
              {waitingCallsCount}
            </span>
            <span className={`text-amber-700 dark:text-amber-500 ${textSize}  `}>
              {t('QueueManager.Waiting calls')}
            </span>
          </div>

          {onAdd && !isFullscreen && (
            <Button variant='white' className='ml-2' onClick={onAdd} size='base'>
              <FontAwesomeIcon icon={faPlus} />
              <span className='ml-2'>{t('QueueManager.Add queue')} </span>
            </Button>
          )}

          {onRemove && !isFullscreen && (
            <Button variant='white' className='ml-2' onClick={onRemove} size='base'>
              <FontAwesomeIcon icon={faMinus} />
              <span className='ml-2'>{t('QueueManager.Remove')}</span>
            </Button>
          )}
        </div>
      </div>

      {!queue?.queue && (
        <div className='pt-6'>
          <EmptyState
            title={t('QueueManager.No queue selected') || ''}
            description={t('QueueManager.Please select a queue') || ''}
            icon={<FontAwesomeIcon icon={faUsers} className='mx-auto h-12 w-12' aria-hidden='true' />}
          ></EmptyState>
        </div>
      )}

      {!!queue?.queue && (
        <div className='mt- flow-root'>
          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-4 align-middle sm:px-6 lg:px-8'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-600'>
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column}
                        scope='col'
                        className={`py-3.5 pl-4 pr-3 text-left font-semibold text-gray-700 dark:text-gray-200 sm:pl-0 ${headerTextSize}`}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className='divide-y divide-gray-200 dark:divide-gray-600'>
                  {Array.from({ length: rowCount }, (_, index) => {
                    const caller: any = callerArray[index]
                    const isDataPresent = !!caller && !!caller.name

                    return (
                      <tr key={index}>
                        <td
                          className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 ${
                            isDataPresent ? 'text-gray-900' : 'text-primary'
                          }`}
                        >
                          <div className='flex items-center ml-2'>
                            <div
                              className={`${
                                isFullscreen ? 'w-12 h-12' : 'w-6 h-6'
                              } rounded-full flex items-center justify-center ${
                                isDataPresent ? 'dark:bg-amber-700' : 'bg-emerald-50 dark:bg-emerald-700'
                              }`}
                            >
                              <span
                                className={`${
                                  isDataPresent
                                    ? 'text-amber-600 dark:text-amber-50'
                                    : 'text-primary dark:text-green-50'
                                } ${cellTextSize}`}
                              >
                                {index + 1}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td
                          className={`whitespace-nowrap py-4 text-gray-500 dark:text-gray-300 leading-5 font-normal ${cellTextSize}`}
                        >
                          {isDataPresent ? caller.name : '-'}
                        </td>
                        <td
                          className={`whitespace-nowrap py-4 text-gray-500 dark:text-gray-300 leading-5 font-normal ${cellTextSize}`}
                        >
                          <CallDuration startTime={caller?.waitingTime} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

MonitorQueueCard.displayName = 'MonitorQueueCard'
