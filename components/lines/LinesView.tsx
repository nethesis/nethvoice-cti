// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineNotification, Badge } from '../common'
import { isEmpty, debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { openShowTelephoneLinesDrawer, retrieveLines, PAGE_SIZE } from '../../lib/lines'
import {
  faChevronRight,
  faChevronLeft,
  faPhone,
  faVoicemail,
  faArrowTurnDownRight,
} from '@nethesis/nethesis-solid-svg-icons'
import classNames from 'classnames'
import { LinesFilter } from './LinesFilter'

export interface LinesViewProps extends ComponentProps<'div'> {}

// const table = [
//   {
//     description: 'Mario Rossi',
//     calledIdNum: '1',
//     personalized: 'audiomsg',
//     audiomsg: {
//       description: 'Natale 2020',
//     },
//   },
//   {
//     description: 'Anna Bianchi',
//     calledIdNum: '2',
//     personalized: 'audiomsg_voicemail',
//     audiomsg: {
//       description: 'Natale 2021',
//     },
//   },]

export const LinesView: FC<LinesViewProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [lines, setLines]: any = useState({})
  const [isLinesLoaded, setLinesLoaded]: any = useState(false)
  const [linesError, setLinesError] = useState('')
  const [pageNum, setPageNum]: any = useState(1)
  const [firstRender, setFirstRender]: any = useState(true)
  const [intervalId, setIntervalId]: any = useState(0)

  const [textFilter, setTextFilter]: any = useState('')
  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
    setLinesLoaded(false)
    setPageNum(1)
  }

  const debouncedUpdateTextFilter = useMemo(() => debounce(updateTextFilter, 400), [])

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilter.cancel()
    }
  }, [debouncedUpdateTextFilter])

  const [dataPagination, setDataPagination]: any = useState({})
  //Get Lines information
  useEffect(() => {
    async function fetchLines() {
      if (!isLinesLoaded) {
        try {
          setLinesError('')
          const res = await retrieveLines(textFilter.trim(), pageNum)

          setLines(res.rows)
          setDataPagination(res)
        } catch (e) {
          console.error(e)
          setLinesError(t('Lines.Cannot retrieve lines') || '')
        }
        setLinesLoaded(true)
      }
    }
    fetchLines()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLinesLoaded, pageNum])

  function goToPreviousPage() {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
      setLinesLoaded(false)
    }
  }

  function goToNextPage() {
    if (pageNum < dataPagination.totalPages) {
      setPageNum(pageNum + 1)
      setLinesLoaded(false)
    }
  }

  function isPreviousPageButtonDisabled() {
    return !isLinesLoaded || pageNum <= 1
  }

  function isNextPageButtonDisabled() {
    return !isLinesLoaded || pageNum >= dataPagination.totalPages
  }

  const [sortBy, setSortBy]: any = useState('description')

  const updateSortFilter = (newSortBy: string) => {
    setSortBy(newSortBy)
  }

  // Copy of the table to order
  // const tableRows = [...props.lines.rows];

  // Sorting of the table according to the selected value
  // if (sortBy === 'description') {
  //   table.sort((a, b) => a.description.localeCompare(b.description))
  // } else if (sortBy === 'calledIdNum') {
  //   table.sort((a, b) => a.calledIdNum.localeCompare(b.calledIdNum))
  // }

  // Check which configuration will be shown
  function getConfiguration(configurationType: any) {
    if (
      configurationType.offhour &&
      configurationType.offhour.action &&
      configurationType.offhour.enabled !== 'never'
    ) {
      switch (configurationType.offhour.action) {
        case 'audiomsg':
          return (
            <>
              <div className='flex items-center'>
                <span>{t(`Lines.Announcement`)}</span>
              </div>
            </>
          )
        case 'audiomsg_voicemail':
          return (
            <>
              <div className='flex items-center'>
                <FontAwesomeIcon icon={faVoicemail} className='h-4 w-4 mr-2' aria-hidden='true' />
                <span>{t(`Lines.Announcement + voicemail`)}</span>
              </div>
            </>
          )
        case 'redirect':
          return (
            <>
              <div className='flex items-center'>
                <FontAwesomeIcon
                  icon={faArrowTurnDownRight}
                  className='h-4 w-4 mr-2'
                  aria-hidden='true'
                />
                <span>{t(`Lines.Forward`)}</span>
              </div>
            </>
          )
        default:
          return (
            <>
              <div className='flex items-center'>
                <span>-</span>
              </div>
            </>
          )
      }
    } else {
      return (
        <>
          <div className='flex items-center'>
            <span>-</span>
          </div>
        </>
      )
    }
  }

  function checkObjectDrawer(lines: any) {
    let objConfig = {
      datebegin: null,
      dateend: null,
      enabled: null,
      name: null,
      number: null,
      callerNumber: null,
      action: null,
      redirect_to: null,
      announcement_id: null,
      voicemail_id: null,
      dateType: '',
    }
    if (lines) {
      objConfig.name = lines.description
      objConfig.number = lines.calledIdNum
      objConfig.callerNumber = lines.callerIdNum

      if (lines.offhour) {
        objConfig.enabled = lines.offhour.enabled
        objConfig.action = lines.offhour.action
        if (lines.offhour.enabled === 'period') {
          objConfig.dateType = 'specifyDay'
        } else if (lines.offhour.enabled === 'always') {
          objConfig.dateType = 'always'
        }
        if (
          lines.offhour.action === 'redirect' &&
          lines.offhour.redirect &&
          lines.offhour.redirect.redirect_to
        ) {
          objConfig.redirect_to = lines.offhour.redirect.redirect_to
        }
        if (lines.offhour.action === 'audiomsg' && lines.offhour.audiomsg) {
          objConfig.announcement_id = lines.offhour.audiomsg.announcement_id
        }
        if (
          lines.offhour.action === 'audiomsg_voicemail' &&
          lines.offhour.audiomsg &&
          lines.offhour.voicemail
        ) {
          objConfig.announcement_id = lines.offhour.audiomsg.announcement_id
          objConfig.voicemail_id = lines.offhour.voicemail.voicemail_id
        }
        if (lines.offhour.period) {
          if (lines.offhour.period.datebegin) {
            objConfig.datebegin = lines.offhour.period.datebegin
            objConfig.dateend = lines.offhour.period.dateend
          }
        }
      }
    }
    openShowTelephoneLinesDrawer(objConfig)
  }

  function getConfigurationStatus(lines: any) {
    if (lines.offhour && lines.offhour.enabled !== 'never') {
      return 'online'
    } else {
      return 'offline'
    }
  }

  return (
    <div className={classNames(className)}>
      <div className='flex flex-col flex-wrap xl:flex-row justify-between gap-x-4 xl:items-end'>
        <LinesFilter
          updateTextFilter={debouncedUpdateTextFilter}
          updateSortFilter={updateSortFilter}
        />
      </div>
      {linesError && <InlineNotification type='error' title={linesError}></InlineNotification>}
      {!linesError && (
        <div className='mx-auto'>
          <div className='flex flex-col overflow-hidden'>
            <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 md:rounded-lg ring-opacity-5 dark:ring-opacity-5 ring-gray-900 dark:ring-gray-100'>
                  {/* empty state */}
                  {isLinesLoaded && isEmpty(lines) && (
                    <EmptyState
                      title={t('Lines.No lines available')}
                      description={t('Lines.There are no lines with the current filter') || ''}
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
                  {(!isLinesLoaded || !isEmpty(lines)) && (
                    <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                      <thead className='bg-white dark:bg-gray-900'>
                        <tr>
                          <th
                            scope='col'
                            className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 text-gray-700 dark:text-gray-200'
                          >
                            {t('Lines.Name')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                          >
                            {t('Common.Phone number')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                          >
                            {t('Lines.Caller number')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                          >
                            {t('Lines.Custom configuration')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                          >
                            {t('Lines.Rule')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                          >
                            {t('Lines.Configuration status')}
                          </th>
                          <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                            <span className='sr-only'>{t('Lines.Details')}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className=' text-sm divide-y divide-gray-200 bg-white text-gray-700 dark:divide-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        {/* skeleton */}
                        {!isLinesLoaded &&
                          Array.from(Array(10)).map((e, i) => (
                            <tr key={i}>
                              {Array.from(Array(7)).map((e, j) => (
                                <td key={j}>
                                  <div className='px-4 py-6'>
                                    <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}

                        {/* lines */}
                        {isLinesLoaded &&
                          Object.keys(lines).map((key) => (
                            <tr key={key}>
                              {/* Name */}
                              <td className='py-4 pl-4 pr-3 sm:pl-6'>
                                <div className='flex flex-col'>
                                  <div>
                                    {lines[key].description ? lines[key].description : '-'}{' '}
                                  </div>
                                </div>
                              </td>
                              {/* Number */}
                              <td className='px-3 py-4'>
                                <div>{lines[key].calledIdNum ? lines[key].calledIdNum : '-'}</div>
                              </td>
                              {/* Caller number */}
                              <td className='px-3 py-4'>
                                <div>{lines[key].callerIdNum ? lines[key].callerIdNum : '-'}</div>
                              </td>
                              {/* Costum configuration */}
                              <td className='whitespace-nowrap px-3 py-4'>
                                {getConfiguration(lines[key])}
                              </td>
                              {/* Rule */}
                              <td className='whitespace-nowrap px-3 py-4'>
                                <div className='flex items-center'>
                                  <span>
                                    {lines[key].offhour && lines[key].offhour.audiomsg
                                      ? lines[key].offhour.audiomsg.description
                                      : '-'}
                                  </span>
                                </div>
                              </td>
                              {/* Configuration status */}
                              <td className='whitespace-nowrap px-3 py-4'>
                                <Badge variant={getConfigurationStatus(lines[key])} rounded='full'>
                                  {' '}
                                  {lines[key].offhour && lines[key].offhour.enabled !== 'never'
                                    ? t('Lines.Active')
                                    : t('Lines.Not active')}
                                </Badge>
                              </td>
                              {/* Show details */}
                              <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  className='h-3 w-3 p-2 cursor-pointer text-gray-500 dark:text-gray-500'
                                  aria-hidden='true'
                                  onClick={() => {
                                    checkObjectDrawer(lines[key])
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* pagination */}
          {!linesError && !!lines?.length && (
            <nav
              className='flex items-center justify-between border-t px-0 py-4 mb-8 border-gray-100 dark:border-gray-800'
              aria-label='Pagination'
            >
              <div className='hidden sm:block'>
                <p className='text-sm text-gray-700 dark:text-gray-200'>
                  {t('Common.Showing')}{' '}
                  <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> -&nbsp;
                  <span className='font-medium'>
                    {PAGE_SIZE * (pageNum - 1) + PAGE_SIZE < dataPagination?.count
                      ? PAGE_SIZE * (pageNum - 1) + PAGE_SIZE
                      : dataPagination?.count}
                  </span>{' '}
                  {t('Common.of')} <span className='font-medium'>{dataPagination?.count}</span>{' '}
                  {t('Lines.Lines')}
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
          )}
        </div>
      )}
    </div>
  )
}

LinesView.displayName = 'LinesView'
