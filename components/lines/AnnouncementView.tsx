// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, InlineNotification, Avatar } from '../common'
import { isEmpty, debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getAnnouncementsFiltered, downloadMsg, PAGE_SIZE } from '../../lib/lines'
import {
  faPlay,
  faDownload,
  faTrashCan,
  faLock,
  faLockOpen,
  faChevronLeft,
  faChevronRight,
  faFilter,
} from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { AnnouncementFilter } from './AnnouncementFilter'
import { useDispatch, useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { capitalize } from 'lodash'
import {
  getApiEndpoint,
  getApiScheme,
  sortByProperty,
  playFileAudio,
  sortByDateAsc,
  sortByDateDesc,
} from '../../lib/utils'
import { openShowOperatorDrawer } from '../../lib/operators'
import { openEditAnnouncementDrawer } from '../../lib/lines'
import { useEventListener } from '../../lib/hooks/useEventListener'
import { CallsDate } from '../history/CallsDate'

export interface AnnouncementViewProps extends ComponentProps<'div'> {}

export const AnnouncementView: FC<AnnouncementViewProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [lines, setLines]: any = useState({})
  const [isLinesLoaded, setLinesLoaded]: any = useState(false)
  const [linesError, setLinesError] = useState('')
  const [pageNum, setPageNum]: any = useState(1)
  const [firstRender, setFirstRender]: any = useState(true)
  const [textFilter, setTextFilter]: any = useState('')
  const [donwloadAudioMessageError, setDownloadAudioMessageError] = useState('')
  const reloadValue = useSelector((state: RootState) => state.announcement.reloadValue)

  const apiEnpoint = getApiEndpoint()
  const apiScheme = getApiScheme()
  const downloadUrl = apiScheme + apiEnpoint + '/webrest/static/'

  //Get operators information from store
  const operators: any = useSelector((state: RootState) => state.operators)

  const dispatch = useDispatch<Dispatch>()

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

  async function announcementSavedCallback() {
    dispatch.sideDrawer.setShown(false)
    try {
      const res = await getAnnouncementsFiltered(textFilter.trim(), pageNum)
      setLines(res.rows)
      setDataPagination(res)
    } catch (e) {
      console.error(e)
      setLinesError(t('Lines.Cannot retrieve lines') || '')
    }
  }

  // Show modal announcement
  useEventListener('phone-island-recording-saved', (modalAnnouncementObjInformation) => {
    if (modalAnnouncementObjInformation?.tempFileName) {
      dispatch.sideDrawer.update({
        isShown: true,
        contentType: 'showSaveRecordedAnnouncement',
        config: {
          isEdit: false,
          recordedFilename: modalAnnouncementObjInformation.tempFileName,
          announcementSavedCallback: announcementSavedCallback,
        },
      })
    }
  })

  const [dataPagination, setDataPagination]: any = useState({})

  const [startPage, setStartPage]: any = useState(0)
  const [endPage, setEndPage]: any = useState(0)
  const [cleanLines, setCleanLines]: any = useState([])

  //Get Lines information
  useEffect(() => {
    async function fetchLines() {
      if (firstRender) {
        setFirstRender(false)
        return
      }
      if (!isLinesLoaded) {
        try {
          setLinesError('')
          const res = await getAnnouncementsFiltered(textFilter.trim(), pageNum)
          setLines(res?.rows)
          //use another state to keep the original lines (not paginated for sorting)
          setCleanLines(res?.rows)
          setStartPage(res?.start)
          setEndPage(res?.end)

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
  }, [isLinesLoaded, firstRender, reloadValue])

  const announcement = useSelector((state: RootState) => state.announcement)

  useEffect(() => {
    // reload phonebook
    setLinesLoaded(false)
  }, [announcement])

  function goToPreviousPage() {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
      setLinesLoaded(false)
    }
  }

  function goToNextPage() {
    if (pageNum < dataPagination?.totalPages) {
      setPageNum(pageNum + 1)
      setLinesLoaded(false)
    }
  }

  function isPreviousPageButtonDisabled() {
    return !isLinesLoaded || pageNum <= 1
  }

  function isNextPageButtonDisabled() {
    return !isLinesLoaded || pageNum >= dataPagination?.totalPages
  }

  async function donwloadSelectedAnnouncement(announcementId: any) {
    if (announcementId) {
      try {
        const res = await downloadMsg(announcementId)
        var link = document.createElement('a')
        link.download = res
        link.href = downloadUrl + res
        link.setAttribute('type', 'hidden')
        document.body.appendChild(link)
        link.click()
      } catch (error) {
        setDownloadAudioMessageError('Cannot download announcement')
        return
      }
    }
  }

  const [isListeningAnnouncements, setIsListeningAnnouncements] = useState(false)
  const [idAnnouncementInPlay, setIdAnnouncementInPlay] = useState('')

  async function playSelectedAnnouncement(announcementId: any) {
    if (announcementId) {
      playFileAudio(announcementId, 'announcement')
      setIdAnnouncementInPlay(announcementId)
      // deactivate play button
      setIsListeningAnnouncements(true)
    }
  }

  //Reactivate play button
  useEventListener('phone-island-audio-player-closed', () => {
    setIsListeningAnnouncements(false)
  })

  const [sortBy, setSortBy]: any = useState('name')
  const auth = useSelector((state: RootState) => state.authentication)

  const updateSortFilter = (newSortBy: string) => {
    setSortBy(newSortBy)
  }

  const paginateTable = (filteredLines: any) => {
    let newLinesPaginate = filteredLines?.slice(startPage, endPage)
    return newLinesPaginate
  }

  useEffect(() => {
    if (isLinesLoaded) {
      let newLines = null
      let filteredLinesPaginate = null
      switch (sortBy) {
        case 'username':
          newLines = Array.from(cleanLines).sort(sortByProperty('username'))
          filteredLinesPaginate = paginateTable(newLines)

          break
        case 'description':
          newLines = Array.from(cleanLines).sort(sortByProperty('description'))
          filteredLinesPaginate = paginateTable(newLines)
          break
        case 'desc':
          newLines = Array.from(cleanLines).sort(sortByDateDesc)
          filteredLinesPaginate = paginateTable(newLines)
          break
        case 'asc':
          newLines = Array.from(cleanLines).sort(sortByDateAsc)
          filteredLinesPaginate = paginateTable(newLines)

          break
        default:
          newLines = Array.from(cleanLines)
          filteredLinesPaginate = paginateTable(newLines)

          break
      }

      setLines(filteredLinesPaginate)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, isLinesLoaded])

  return (
    <div className={classNames(className)}>
      <div className='flex-col flex-wrap xl:flex-row justify-between gap-x-4 xl:items-end'>
        <AnnouncementFilter
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
                      title={t('Lines.No announcement')}
                      description={t('Lines.There are no announcement with current filter') || ''}
                      icon={
                        <FontAwesomeIcon
                          icon={faFilter}
                          className='mx-auto h-12 w-12'
                          aria-hidden='true'
                        />
                      }
                      className='bg-white dark:bg-gray-950'
                    ></EmptyState>
                  )}
                  {(!isLinesLoaded || !isEmpty(lines)) && (
                    <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                      <div className='max-h-[32rem]'>
                        <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
                          <thead className='sticky top-0 bg-white dark:bg-gray-950 z-[1]'>
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
                            </tr>
                          </thead>
                          <tbody className=' text-sm divide-y divide-gray-200 bg-white dark:bg-gray-950 text-gray-700 dark:divide-gray-700 dark:text-gray-200'>
                            {/* skeleton */}
                            {!isLinesLoaded &&
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
                              ))}

                            {/* Announcement */}
                            {isLinesLoaded &&
                              Object.keys(lines).map((key) => (
                                <tr key={key}>
                                  {/* Name */}
                                  <td className='py-4 pl-4 pr-3 sm:pl-6'>
                                    <div className='flex flex-col'>
                                      <div
                                        className={` ${
                                          auth?.username === lines[key]?.username
                                            ? 'cursor-pointer hover:underline'
                                            : ''
                                        } `}
                                        onClick={() => {
                                          auth?.username === lines[key]?.username
                                            ? openEditAnnouncementDrawer(
                                                lines[key]?.description,
                                                lines[key]?.id,
                                                lines[key]?.privacy,
                                              )
                                            : ''
                                        }}
                                      >
                                        {lines[key]?.description}{' '}
                                      </div>
                                    </div>
                                  </td>
                                  {/* Author */}
                                  <td className='px-3 py-4'>
                                    <div className='flex items-center'>
                                      <Avatar
                                        src={operators?.avatars[lines[key]?.username]}
                                        placeholderType='operator'
                                        size='base'
                                        className='mr-3 cursor-pointer'
                                        onClick={() =>
                                          openShowOperatorDrawer(
                                            operators?.operators[lines[key]?.username],
                                          )
                                        }
                                        status={
                                          operators?.operators[lines[key]?.username]?.mainPresence
                                        }
                                      />
                                      <div>{operators?.operators[lines[key]?.username]?.name}</div>
                                    </div>
                                  </td>
                                  {/* Date */}
                                  <td className='px-3 py-4'>
                                    <div className='flex flex-col'>
                                      <CallsDate call={lines[key]} isInAnnouncement={true} />
                                    </div>
                                  </td>

                                  {/* Privacy */}
                                  <td className='px-3 py-4'>
                                    <div className='flex items-center'>
                                      {/* The ternary operator is required because the open lock icon takes up
                            more right margin */}
                                      <FontAwesomeIcon
                                        icon={
                                          lines[key].privacy === 'private' ? faLock : faLockOpen
                                        }
                                        className={`h-4 text-gray-500 dark:text-gray-500 ${
                                          lines[key].privacy === 'private' ? 'mr-3' : 'mr-2'
                                        }`}
                                        aria-hidden='true'
                                      />
                                      <span>{t(`Lines.${capitalize(lines[key].privacy)}`)} </span>
                                    </div>
                                  </td>
                                  {/* Action button */}
                                  <td className='px-3 py-4 flex gap-2 justify-end'>
                                    <div>
                                      {' '}
                                      {/* Play button */}
                                      <Button
                                        variant='white'
                                        onClick={() => playSelectedAnnouncement(lines[key].id)}
                                      >
                                        <FontAwesomeIcon
                                          icon={faPlay}
                                          className='h-4 w-4 mr-2'
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
                                        onClick={() => donwloadSelectedAnnouncement(lines[key].id)}
                                      >
                                        <FontAwesomeIcon
                                          icon={faDownload}
                                          className='h-4 w-4 mr-2'
                                          aria-hidden='true'
                                        />{' '}
                                        {t('Lines.Download')}
                                      </Button>
                                    </div>

                                    {/* Disabled at the moment */}
                                    {/* lines[key].privacy === 'public' ||
                                profile?.macro_permissions?.off_hour?.permissions?.ad_off_hour
                                  ?.value || */}
                                    {/* Edit announcement */}
                                    {auth.username === lines[key].username ? (
                                      <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className='h-3 w-3 ml-4 mr-1 p-2 cursor-pointer text-gray-500 dark:text-gray-500'
                                        aria-hidden='true'
                                        onClick={() => {
                                          openEditAnnouncementDrawer(
                                            lines[key].description,
                                            lines[key].id,
                                            lines[key].privacy,
                                          )
                                        }}
                                      />
                                    ) : (
                                      <FontAwesomeIcon
                                        icon={faTrashCan}
                                        className='h-4 w-4 ml-4 p-2 invisible'
                                      />
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
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

AnnouncementView.displayName = 'AnnouncementView'
