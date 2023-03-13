// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineNotification } from '../common'
import { isEmpty, debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getCallIcon, openShowQueueCallDrawer } from '../../lib/queuesLib'
import { retrieveLines, PAGE_SIZE } from '../../lib/lines'
import { faChevronRight, faChevronLeft, faPhone } from '@nethesis/nethesis-solid-svg-icons'
import classNames from 'classnames'
import { LinesFilter } from './LinesFilter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export interface LinesViewProps extends ComponentProps<'div'> {}

export const LinesView: FC<LinesViewProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [lines, setLines]: any = useState({})
  const [isLinesLoaded, setLinesLoaded]: any = useState(false)
  const [linesError, setLinesError] = useState('')
  const [pageNum, setPageNum]: any = useState(1)
  const [firstRender, setFirstRender]: any = useState(true)
  const [intervalId, setIntervalId]: any = useState(0)
  const queuesStore = useSelector((state: RootState) => state.queues)

  const [textFilter, setTextFilter]: any = useState('')
  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
    setPageNum(1)
  }

  const debouncedUpdateTextFilter = useMemo(() => debounce(updateTextFilter, 400), [])

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilter.cancel()
    }
  }, [debouncedUpdateTextFilter])

  //Get Lines information
  // useEffect(() => {
  //   async function fetchLines() {
  //     if (!isLinesLoaded) {
  //       try {
  //         setLinesError('')
  //         const res = await retrieveLines()
  //         setLines(res)
  //       } catch (e) {
  //         console.error(e)
  //         setLinesError(t('Lines.Cannot retrieve lines') || '')
  //       }
  //       setLinesLoaded(true)
  //     }
  //   }
  //   fetchLines()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isLinesLoaded])

  //   function goToPreviousPage() {
  //     if (pageNum > 1) {
  //       setPageNum(pageNum - 1)
  //     }
  //   }

  //   function goToNextPage() {
  //     if (pageNum < lines.totalPages) {
  //       setPageNum(pageNum + 1)
  //     }
  //   }

  //   function isPreviousPageButtonDisabled() {
  //     return !isLinesLoaded || pageNum <= 1
  //   }

  //   function isNextPageButtonDisabled() {
  //     return !isLinesLoaded || pageNum >= lines?.totalPages
  //   }

  return (
    <div className={classNames(className)}>
      <div className='flex flex-col flex-wrap xl:flex-row justify-between gap-x-4 xl:items-end'>
        <LinesFilter updateTextFilter={debouncedUpdateTextFilter} />
        <div className='flex text-sm gap-4 text-right pb-4 xl:pb-7'>
          <div className='text-gray-500 dark:text-gray-500'></div>
          <button type='button' className='hover:underline text-gray-900 dark:text-gray-100'>
            {t('Queues.Settings')}
          </button>
        </div>
      </div>
      {linesError && <InlineNotification type='error' title={linesError}></InlineNotification>}
      {!linesError && (
        <div className='mx-auto'>
          <div className='flex flex-col overflow-hidden'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 md:rounded-lg ring-opacity-5 dark:ring-opacity-5 ring-gray-900 dark:ring-gray-100'>
                  {/* empty state */}
                  {isLinesLoaded && isEmpty(lines.rows) && (
                    <EmptyState
                      title={t('Lines.No lines')}
                      description={t('Lines.There are no lines with current filters') || ''}
                      icon={
                        <FontAwesomeIcon
                          icon={faPhone}
                          className='mx-auto h-12 w-12'
                          aria-hidden='true'
                        />
                      }
                      className='bg-white dark:bg-gray-900'
                    ></EmptyState>
                  )}
                  {(!isLinesLoaded || !isEmpty(lines.rows)) && (
                    // <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                    //   <thead className='bg-white dark:bg-gray-900'>
                    //     <tr>
                    //       <th
                    //         scope='col'
                    //         className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 text-gray-700 dark:text-gray-200'
                    //       >
                    //         {t('Lines.Name')}
                    //       </th>
                    //       <th
                    //         scope='col'
                    //         className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                    //       >
                    //         {t('Lines.Number')}
                    //       </th>
                    //       <th
                    //         scope='col'
                    //         className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                    //       >
                    //         {t('Lines.Custom configuration')}
                    //       </th>
                    //       <th
                    //         scope='col'
                    //         className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                    //       >
                    //         {t('Lines.Rule')}
                    //       </th>
                    //       <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                    //         <span className='sr-only'>{t('Queues.Details')}</span>
                    //       </th>
                    //     </tr>
                    //   </thead>
                    //   <tbody className=' text-sm divide-y divide-gray-200 bg-white text-gray-700 dark:divide-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                    //     {/* skeleton */}
                    //     {!isLinesLoaded &&
                    //       Array.from(Array(5)).map((e, i) => (
                    //         <tr key={i}>
                    //           {Array.from(Array(5)).map((e, j) => (
                    //             <td key={j}>
                    //               <div className='px-4 py-6'>
                    //                 <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                    //               </div>
                    //             </td>
                    //           ))}
                    //         </tr>
                    //       ))}
                    //     {/* lines */}
                    //     {isLinesLoaded &&
                    //       lines?.rows?.map((call: any, index: number) => (
                    //         <tr key={index}>
                    //           {/* time */}
                    //           <td className='py-4 pl-4 pr-3 sm:pl-6'>
                    //             <div className='flex flex-col'>
                    //               <div></div>
                    //             </div>
                    //           </td>
                    //           {/* queue */}
                    //           <td className='px-3 py-4'>
                    //             <div>{call.queueName}</div>
                    //             <div className='text-gray-500 dark:text-gray-500'>
                    //               {call.queueId}
                    //             </div>
                    //           </td>
                    //           {/* name / number */}
                    //           <td className='px-3 py-4'>
                    //             {call.name && (
                    //               <div
                    //                 onClick={() =>
                    //                   openShowQueueCallDrawer(call, queuesStore.queues)
                    //                 }
                    //               >
                    //                 <span
                    //                   className={classNames(
                    //                     call.cid && 'cursor-pointer hover:underline',
                    //                   )}
                    //                 >
                    //                   {call.name}
                    //                 </span>
                    //               </div>
                    //             )}
                    //             <div
                    //               onClick={() => openShowQueueCallDrawer(call, queuesStore.queues)}
                    //               className={classNames(
                    //                 call.name && 'text-gray-500 dark:text-gray-500',
                    //               )}
                    //             >
                    //               <span className='cursor-pointer hover:underline'>{call.cid}</span>
                    //             </div>
                    //           </td>
                    //           {/* company */}
                    //           <td className='px-3 py-4'>{call.company || '-'}</td>
                    //           {/* outcome */}
                    //           <td className='whitespace-nowrap px-3 py-4'>
                    //             <div className='flex items-center'>
                    //               <span>{getCallIcon(call)}</span>
                    //               <span>{t(`Queues.outcome_${call.event}`)}</span>
                    //             </div>
                    //           </td>
                    //           {/* show details */}
                    //           <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                    //             <FontAwesomeIcon
                    //               icon={faChevronRight}
                    //               className='h-3 w-3 p-2 cursor-pointer text-gray-500 dark:text-gray-500'
                    //               aria-hidden='true'
                    //               onClick={() => openShowQueueCallDrawer(call, queuesStore.queues)}
                    //             />
                    //           </td>
                    //         </tr>
                    //       ))}
                    //   </tbody>
                    // </table>
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* pagination */}
          {/* {!LinesError && !!lines?.rows?.length && (
            <nav
              className='flex items-center justify-between border-t px-0 py-4 mb-8 border-gray-100 dark:border-gray-800'
              aria-label='Pagination'
            >
              <div className='hidden sm:block'>
                <p className='text-sm text-gray-700 dark:text-gray-200'>
                  {t('Common.Showing')}{' '}
                  <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> -&nbsp;
                  <span className='font-medium'>
                    {PAGE_SIZE * (pageNum - 1) + PAGE_SIZE < lines?.count
                      ? PAGE_SIZE * (pageNum - 1) + PAGE_SIZE
                      : lines?.count}
                  </span>{' '}
                  {t('Common.of')} <span className='font-medium'>{lines?.count}</span>{' '}
                  {t('Queues.lines')}
                </p>
              </div>
              <div className='flex flex-1 justify-between sm:justify-end'>
                <Button
                  type='button'
                  variant='white'
                  disabled={isPreviousPageButtonDisabled()}
                  onClick={() => goToPreviousPage()}
                  className='flex items-center'
                >
                  <FontAwesomeIcon icon={faChevronLeft} className='mr-2 h-4 w-4' />
                  <span> {t('Common.Previous page')}</span>
                </Button>
                <Button
                  type='button'
                  variant='white'
                  className='ml-3 flex items-center'
                  disabled={isNextPageButtonDisabled()}
                  onClick={() => goToNextPage()}
                >
                  <span>{t('Common.Next page')}</span>
                  <FontAwesomeIcon icon={faChevronRight} className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </nav>
          )} */}
        </div>
      )}
    </div>
  )
}

LinesView.displayName = 'LinesView'
