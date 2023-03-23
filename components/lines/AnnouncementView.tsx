// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineNotification, Avatar } from '../common'
import { isEmpty, debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { retrieveLines } from '../../lib/lines'
import {
  faPhone,
  faPlay,
  faDownload,
  faTrash,
  faLock,
  faLockOpen,
} from '@nethesis/nethesis-solid-svg-icons'
import classNames from 'classnames'
import { AnnouncementFilter } from './AnnouncementFilter'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { loadCache } from '../../lib/storage'
import { formatDateLoc, getCallTimeToDisplay } from '../../lib/dateTime'
import { capitalize } from 'lodash'

export interface AnnouncementViewProps extends ComponentProps<'div'> {}

const table = [
  {
    description: 'La notte degli unicorni',
    username: 'antonio',
    date_creation: '27/12/2017',
    privacy: 'private',
    time_creation: '08:12:30',
    id: 1,
  },
  {
    description: 'Il segreto del tempio',
    username: 'vittorio',
    date_creation: '19/10/2018',
    privacy: 'public',
    time_creation: '08:12:30',
    id: 2,
  },
  {
    description: 'Ombre sul lago',
    username: 'edoardo',
    date_creation: '21/12/2018',
    privacy: 'public',
    time_creation: '08:12:30',
    id: 3,
  },
  {
    description: 'Cuori in fuga',
    username: 'andrea',
    date_creation: '25/03/2020',
    privacy: 'private',
    time_creation: '08:12:30',
  },
  {
    description: "L'isola misteriosa",
    username: 'nicola',
    date_creation: '21/12/2018',
    privacy: 'public',
    time_creation: '08:12:30',
    id: 4,
  },
]

export const AnnouncementView: FC<AnnouncementViewProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [lines, setLines]: any = useState({})
  const [isLinesLoaded, setLinesLoaded]: any = useState(false)
  const [linesError, setLinesError] = useState('')
  const [pageNum, setPageNum]: any = useState(1)
  const [firstRender, setFirstRender]: any = useState(true)
  const [intervalId, setIntervalId]: any = useState(0)
  const queuesStore = useSelector((state: RootState) => state.queues)
  const authStore = useSelector((state: RootState) => state.authentication)

  const [textFilter, setTextFilter]: any = useState('')
  const updateTextFilter = (newTextFilter: string) => {
    setTextFilter(newTextFilter)
    // setPageNum(1)
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

  const filterLinesTable = (lines: any) => {
    let limit = 10
    const filteredLinesTables = lines.filter((telephoneLines: any) => {
      return telephoneLines.description.toLowerCase().includes(textFilter)
    })
    return filteredLinesTables.slice(0, limit)
  }

  const filteredTable = filterLinesTable(table)

  const deleteAnnouncement = (index: any) => {
    console.log("you've just deleted this index", index)
  }

  const [sortBy, setSortBy]: any = useState('name')

  const updateSortFilter = (newSortBy: string) => {
    setSortBy(newSortBy)
  }

  const [avatarData, setAvatarData] = useState<any>()

  useEffect(() => {
    if (!avatarData) {
      setAvatarData(loadCache('operatorsAvatars', authStore.username))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function dateCreationShowed(dateCreation: any) {
    if (typeof dateCreation === 'string') {
      const dateObject = new Date(dateCreation.split('/').reverse().join('-'))
      const formattedDate = formatDateLoc(dateObject, 'PP')
      return formattedDate
    } else {
      return ''
    }
  }

  function hourCreationShowed(hourCreation: any) {
    const formattedTime = getCallTimeToDisplay(`1970-01-01T${hourCreation}Z`)
    return formattedTime
  }

  function getAvatarData(announcement: any) {
    let announcementPath = ''
    if (announcement.username && avatarData) {
      for (const username in avatarData) {
        if (username === announcement.username) {
          announcementPath = avatarData[username]
          break
        }
      }
    }
    return announcementPath
  }

  // Sorting of the table according to the selected value
  if (sortBy === 'username') {
    table.sort((a, b) => a.username.localeCompare(b.username))
  } else if (sortBy === 'description') {
    table.sort((a, b) => a.description.localeCompare(b.description))
  } else if (sortBy === 'privacy') {
    table.sort((a, b) => a.privacy.localeCompare(b.privacy))
  }

  function playSelectedAnnouncement(announcementId: any) {
    console.log('you want to play this announcement', announcementId)
  }

  function donwloadSelectedAnnouncement(announcementId: any) {
    console.log('you want to download this announcement', announcementId)
  }

  return (
    <div className={classNames(className)}>
      {/* TO DO CHECK ON MOBILE DEVICE  */}
      <div className='flex-col flex-wrap xl:flex-row justify-between gap-x-4 xl:items-end'>
        <AnnouncementFilter
          updateTextFilter={debouncedUpdateTextFilter}
          updateSortFilter={updateSortFilter}
        />
      </div>
      {linesError && <InlineNotification type='error' title={linesError}></InlineNotification>}
      {/* {!linesError && ( */}
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
                {/* {(!isLinesLoaded || !isEmpty(lines.rows)) && ( */}
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
                        {t('Lines.Author')}
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                      >
                        {t('Lines.Creation date')}
                      </th>
                      <th
                        scope='col'
                        className='px-3 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200'
                      >
                        {t('Lines.Privacy')}
                      </th>
                      <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                        <span className='sr-only'>{t('Lines.Details')}</span>
                      </th>
                      <th scope='col' className='relative py-3.5 pl-3 pr-4 sm:pr-6'>
                        <span className='sr-only'>{t('Lines.Delete')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className=' text-sm divide-y divide-gray-200 bg-white text-gray-700 dark:divide-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                    {/* skeleton */}
                    {/* {!isLinesLoaded &&
                          Array.from(Array(5)).map((e, i) => (
                            <tr key={i}>
                              {Array.from(Array(5)).map((e, j) => (
                                <td key={j}>
                                  <div className='px-4 py-6'>
                                    <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))} */}
                    {/* lines */}
                    {/* {isLinesLoaded &&
                          lines?.rows?.map((call: any, index: number) => ( */}

                    {filteredTable.map((announcement: any, index: number) => (
                      <tr key={index}>
                        {/* Name */}
                        <td className='py-4 pl-4 pr-3 sm:pl-6'>
                          <div className='flex flex-col'>
                            <div>{announcement.description} </div>
                          </div>
                        </td>
                        {/* Author */}
                        <td className='px-3 py-4'>
                          <div className='flex items-center'>
                            <Avatar
                              src={getAvatarData(announcement)}
                              placeholderType='operator'
                              size='small'
                              bordered
                              className='mr-2'
                            />
                            <div>{announcement.username}</div>
                          </div>
                        </td>
                        {/* Date */}
                        <td className='px-3 py-4'>
                          <div className='flex flex-col'>
                            <div className='text-sm text-gray-900 dark:text-gray-100'>
                              {dateCreationShowed(announcement.date_creation)}
                            </div>
                            <div className='text-gray-500 dark:text-gray-500'>
                              {hourCreationShowed(announcement.time_creation)}
                            </div>
                          </div>
                        </td>

                        {/* Privacy */}
                        <td className='px-3 py-4'>
                          <div className='flex items-center'>
                            {/* The ternary operator is required because the open lock icon takes up
                            more right margin */}
                            <FontAwesomeIcon
                              icon={announcement.privacy === 'private' ? faLock : faLockOpen}
                              className={`h-4 text-gray-500 dark:text-gray-500 ${
                                announcement.privacy === 'private' ? 'mr-3' : 'mr-2'
                              }`}
                              aria-hidden='true'
                            />
                            <span>{t(`Lines.${capitalize(announcement.privacy)}`)} </span>
                          </div>
                        </td>
                        {/* Action button */}
                        <td className='px-3 py-4 flex gap-2 justify-end'>
                          <div>
                            {' '}
                            {/* Play button */}
                            <Button
                              variant='white'
                              onClick={() => playSelectedAnnouncement(announcement.id)}
                            >
                              <FontAwesomeIcon
                                icon={faPlay}
                                className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-500'
                                aria-hidden='true'
                              />{' '}
                              {t('Lines.Play')}
                            </Button>
                          </div>
                          <div>
                            {' '}
                            {/* Download button */}
                            <Button
                              variant='white'
                              onClick={() => donwloadSelectedAnnouncement(announcement.id)}
                            >
                              {/* <a href='link_al_file' download> */}
                              <FontAwesomeIcon
                                icon={faDownload}
                                className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-500'
                                aria-hidden='true'
                              />{' '}
                              {t('Lines.Download')}
                              {/* </a> */}
                            </Button>
                          </div>
                        </td>
                        {/* Delete announcement */}
                        <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                          <FontAwesomeIcon
                            icon={faTrash}
                            className='h-4 w-4 p-2 cursor-pointer text-gray-500 dark:text-gray-500'
                            aria-hidden='true'
                            onClick={() => deleteAnnouncement(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* )} */}
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
      {/* )} */}
    </div>
  )
}

AnnouncementView.displayName = 'AnnouncementView'
