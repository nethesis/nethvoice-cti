// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  faArrowUpRightFromSquare,
  faPhone,
  faArrowRight,
  faDownload,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { t } from 'i18next'
import { FC, ComponentProps, useState, useMemo, useEffect } from 'react'
import { deleteRec, downloadCallRec, openDrawerHistory, search } from '../../../lib/history'
import { PAGE_SIZE } from '../../../lib/queuesLib'
import { subDays, startOfDay } from 'date-fns'
import { InlineNotification, Dropdown, Button } from '../../common'
import { MissingPermission } from '../../common/MissingPermissionsPage'
import { CallsDate } from '../CallsDate'
import { Filter } from './Filter'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../../store'
import { Tooltip } from 'react-tooltip'
import { faAiSpark } from '@nethesis/nethesis-solid-svg-icons'
import { CustomThemedTooltip } from '../../common/CustomThemedTooltip'
import { AiSparkIcon } from '../../common/AiSparkIcon'
import {
  getApiVoiceEndpoint,
  getApiScheme,
  getApiEndpoint,
  playFileAudio,
} from '../../../lib/utils'
import { debounce } from 'lodash'
import { formatDateLoc } from '../../../lib/dateTime'
import Link from 'next/link'
import { CallStatus } from './CallStatus'
import { CallSource } from './CallSource'
import { CallDestination } from './CallDestination'
import { CallDuration } from './CallDuration'
import { CallRecording } from './CallRecording'
import { Pagination } from '../../common/Pagination'
import { Table } from '../../common/Table'

export interface CallsProps extends ComponentProps<'div'> {}

export const Calls: FC<CallsProps> = ({ className }): JSX.Element => {
  const dispatch = useDispatch<Dispatch>()
  const { operators } = useSelector((state: RootState) => state.operators)
  const { profile } = useSelector((state: RootState) => state.user)
  const { name, mainextension, feature_codes } = useSelector((state: RootState) => state.user)
  const authenticationStore = useSelector((state: RootState) => state.authentication)
  const { username } = authenticationStore

  const [historyError, setHistoryError] = useState('')
  const [isHistoryLoaded, setHistoryLoaded] = useState(false)
  const [isLoadingPagination, setIsLoadingPagination] = useState(false)
  const [history, setHistory]: any = useState({})
  const [pageNum, setPageNum]: any = useState(1)
  const [filterText, setFilterText]: any = useState('')
  const [callType, setCallType]: any = useState('user')
  const [sortBy, setSortBy]: any = useState('time%20desc')
  const [dateEnd, setDateEnd]: any = useState('')
  const [dateBegin, setDateBegin]: any = useState('')
  const [callDirection, setCallDirection]: any = useState('all')
  const [totalPages, setTotalPages] = useState(0)
  // TODO: Replace with real transcription data
  const [hasTranscription, setHasTranscription] = useState(true)
  const [currentHoveredCall, setCurrentHoveredCall] = useState<any>(null)

  const apiVoiceEnpoint = getApiVoiceEndpoint()
  const apiScheme = getApiScheme()
  const apiEndpoint = getApiEndpoint()

  //report page link
  const pbxReportUrl = apiScheme + apiVoiceEnpoint + '/pbx-report/'
  // URL for the recording file
  const recordingUrlPath = apiScheme + apiEndpoint + '/api/static/'

  const DateFromNotConverted = startOfDay(subDays(new Date(), 7))
  const dateFrom: any = formatDateLoc(DateFromNotConverted, 'yyyy-MM-dd')
  const dateTo: any = formatDateLoc(new Date(), 'yyyy-MM-dd')
  const checkDateType = new RegExp(/-/, 'g')


  useEffect(() => {
    if (!dateBegin) {
      return setDateBegin(dateFrom.replace(/-/g, ''))
    } else {
      setDateBegin(dateBegin.replace(/-/g, ''))
    }
  }, [dateBegin, dateFrom])

  useEffect(() => {
    if (!dateEnd) {
      return setDateEnd(dateTo.replace(/-/g, ''))
    } else {
      setDateEnd(dateEnd.replace(/-/g, ''))
    }
  }, [dateTo, dateEnd])

  //Get the history of the user
  useEffect(() => {
    async function fetchHistory() {
      if (
        dateBegin &&
        !checkDateType.test(dateBegin) &&
        dateEnd &&
        !checkDateType.test(dateEnd) &&
        !(callType === 'user' && callDirection === 'internal')
      ) {
        try {
          setHistoryError('')
          setIsLoadingPagination(true)
          const res = await search(
            callType,
            username,
            dateBegin,
            dateEnd,
            filterText,
            sortBy,
            callDirection,
            pageNum,
          )
          setHistory(res)
          setHistoryLoaded(true)
        } catch (e) {
          setHistoryError('Cannot retrieve history')
          setHistoryLoaded(true)
        } finally {
          setIsLoadingPagination(false)
        }
      }
    }

    // Reset loading state when dependencies change
    if (!isLoadingPagination) {
      setHistoryLoaded(false)
      fetchHistory()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callType, username, dateBegin, dateEnd, filterText, pageNum, sortBy, callDirection])

  //Calculate the total pages of the history
  useEffect(() => {
    if (history?.count) {
      setTotalPages(Math.ceil(history.count / PAGE_SIZE))
    }
  }, [history?.count])

  async function playSelectedAudioFile(callId: any) {
    if (callId) {
      playFileAudio(callId, 'call_recording')
    }
  }

  function openTranscriptionDrawer(call: any) {
    dispatch.sideDrawer.update({
      isShown: true,
      contentType: 'callSummary',
      config: call,
    })
  }

  const downloadRecordingFileAudio = async (callIdInformation: any) => {
    if (callIdInformation !== '') {
      try {
        let fileName = await downloadCallRec(callIdInformation)

        // Get the file URL
        const fileUrl = `${recordingUrlPath + fileName}`

        const link = document.createElement('a')
        link.href = fileUrl
        link.download = fileName
        link.click()
      } catch (err) {
        console.log(err)
      }
    }
  }

  const deleteRecordingAudioFile = async (callIdInformation: string) => {
    if (callIdInformation !== '') {
      try {
        await deleteRec(callIdInformation)
        // reload the history by resetting the loading state
        setHistoryLoaded(false)
      } catch (err) {
        console.log(err)
      }
    }
  }

  // Dropdown actions for the recording file
  const getRecordingActions = (callId: string) => (
    <>
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <Dropdown.Item icon={faDownload} onClick={() => downloadRecordingFileAudio(callId)}>
          <span className='text-dropdownText dark:text-dropdownTextDark'>
            {t('Common.Download')}
          </span>
        </Dropdown.Item>
      </div>
      <Dropdown.Item icon={faTrash} isRed onClick={() => deleteRecordingAudioFile(callId)}>
        <span>{t('Common.Delete')}</span>
      </Dropdown.Item>
    </>
  )

  const updateFilterText = (newFilterText: string) => {
    setPageNum(1)
    setFilterText(newFilterText)
  }

  const updateCallTypeFilter = (newCallType: string) => {
    setPageNum(1)
    setCallType(newCallType)
  }

  const updateCallDirectionFilter = (newCallDirection: string) => {
    setPageNum(1)
    setCallDirection(newCallDirection)
  }

  const updateDateBeginFilter = (newDateBegin: string) => {
    setDateBegin(newDateBegin)
  }

  const updateDateEndFilter = (newDateEnd: string) => {
    setDateEnd(newDateEnd)
  }

  const updateSortFilter = (newSortBy: string) => {
    setSortBy(newSortBy)
  }

  function goToPreviousPage() {
    if (pageNum > 1 && !isLoadingPagination) {
      setPageNum(pageNum - 1)
    }
  }

  function goToNextPage() {
    if (pageNum < totalPages && !isLoadingPagination) {
      setPageNum(pageNum + 1)
    }
  }

  const debouncedUpdateFilterText = useMemo(() => debounce(updateFilterText, 400), [])

  // Stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateFilterText.cancel()
    }
  }, [debouncedUpdateFilterText])

  // Filter out calls to/from audio_test feature code (similar to UserLastCallsContent)
  const filteredHistory = useMemo(() => {
    if (!history?.rows) return []

    const audioTestCode = feature_codes?.audio_test || '*41'

    return history.rows.filter((call: any) => {
      const numberToCheck = call.direction === 'in' ? call.src : call.dst
      return !numberToCheck?.includes(audioTestCode)
    })
  }, [history?.rows, feature_codes?.audio_test])

  // Definition of the columns of the table
  const columns = [
    {
      header: t('History.Date'),
      cell: (call: any) => <CallsDate call={call} />,
      width: '15%',
    },
    {
      header: t('History.Source'),
      cell: (call: any) => (
        <CallSource
          call={call}
          callType={callType}
          operators={operators}
          mainextension={mainextension}
          name={name}
          openDrawerHistory={openDrawerHistory}
        />
      ),
      width: '15%',
      className: 'px-6 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100 w-0',
    },
    {
      header: '',
      cell: () => (
        <FontAwesomeIcon
          icon={faArrowRight}
          className='ml-0 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-600'
          aria-hidden='true'
        />
      ),
      width: '5%',
      className: 'px-6 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100 w-0',
    },
    {
      header: t('History.Destination'),
      cell: (call: any) => (
        <CallDestination
          call={call}
          callType={callType}
          operators={operators}
          mainextension={mainextension}
          name={name}
          openDrawerHistory={openDrawerHistory}
        />
      ),
      width: '15%',
    },
    {
      header: t('History.Duration'),
      cell: (call: any) => <CallDuration duration={call.duration} />,
      width: '15%',
    },
    {
      header: t('History.Outcome'),
      cell: (call: any) => <CallStatus call={call} callType={callType} />,
      width: '15%',
    },
    {
      header: '',
      cell: (call: any) =>
        hasTranscription ? (
          <div className='flex justify-center'>
            <div
              data-tooltip-id='ai-transcription-tooltip'
              data-tooltip-content={t('Common.Call transcription available')}
              onMouseEnter={() => setCurrentHoveredCall(call)}
            >
              <AiSparkIcon/>
            </div>
          </div>
        ) : (
          <div className='flex' />
        ),
      width: '5%',
      className: 'px-6 py-3.5 text-center w-0',
    },
    {
      header: '',
      cell: (call: any) => (
        <CallRecording
          call={call}
          playSelectedAudioFile={playSelectedAudioFile}
          getRecordingActions={getRecordingActions}
        />
      ),
      width: '20%',
      className: 'px-6 py-3.5 w-0',
    },
  ]

  // Generate a unique key for each call with more stability
  const generateUniqueKey = (call: any, index: number) => {
    return `call-${call.uniqueid}-${call.time}-${index}`
  }

  return (
    <>
      <div>
        {profile?.macro_permissions?.cdr?.value ? (
          <div>
            <div className='flex justify-between'>
              <Filter
                updateFilterText={debouncedUpdateFilterText}
                updateCallTypeFilter={updateCallTypeFilter}
                updateSortFilter={updateSortFilter}
                updateCallDirectionFilter={updateCallDirectionFilter}
                updateDateBeginFilter={updateDateBeginFilter}
                updateDateEndFilter={updateDateEndFilter}
              />
              <div className='text-gray-900 dark:text-gray-100 flex items-start lg:whitespace-nowrap ml-4'>
                <Link
                  href={pbxReportUrl}
                  target='_blank'
                  rel='noreferrer'
                  data-tooltip-id={`tooltip-button-pbx-report`}
                  data-tooltip-content={t('Applications.Open PBX Report')}
                >
                  <Button variant='white' className='gap-2'>
                    <Tooltip
                      id={`tooltip-button-pbx-report`}
                      place='top'
                      className='block lg:hidden'
                    />
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='w-4 h-4' />
                    <p className='hidden lg:block'>{t('Applications.Open PBX Report')}</p>
                  </Button>
                </Link>
              </div>
            </div>

            {historyError && (
              <InlineNotification type='error' title={historyError}></InlineNotification>
            )}

            <div className='mx-auto'>
              <div className='flex flex-col'>
                <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                  <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                    <Table
                      columns={columns}
                      data={!historyError && isHistoryLoaded ? filteredHistory : []}
                      isLoading={!isHistoryLoaded || isLoadingPagination}
                      emptyState={{
                        title: t('History.No calls'),
                        description: t('History.There are no calls in your history') || '',
                        icon: (
                          <FontAwesomeIcon
                            icon={faPhone}
                            className='mx-auto h-12 w-12'
                            aria-hidden='true'
                          />
                        ),
                      }}
                      rowKey={(record, index) => generateUniqueKey(record, index)}
                      trClassName='h-[84px]'
                      scrollable={true}
                      maxHeight='calc(100vh - 480px)'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={pageNum}
                totalPages={totalPages}
                totalItems={history?.count || 0}
                pageSize={PAGE_SIZE}
                onPreviousPage={goToPreviousPage}
                onNextPage={goToNextPage}
                isLoading={!isHistoryLoaded || isLoadingPagination}
                itemsName={t('History.calls') || ''}
              />
            )}
          </div>
        ) : (
          <MissingPermission />
        )}
      </div>
      <CustomThemedTooltip
        id='ai-transcription-tooltip'
        place='top'
        clickableText={t('Common.View call transcription') || ''}
        onClickableClick={() => currentHoveredCall && openTranscriptionDrawer(currentHoveredCall)}
      />
    </>
  )
}

Calls.displayName = 'Calls'
