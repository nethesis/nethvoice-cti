// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, MutableRefObject, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { MissingPermission } from '../../common/MissingPermissionsPage'
import { Filter } from './Filter'
import {
  faPhone,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faPlay,
  faCircleArrowDown,
  faTrash,
  faTriangleExclamation,
  faVoicemail,
  faArrowRightLong,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { t } from 'i18next'
import { InlineNotification, EmptyState, Button, Avatar, Dropdown, Modal } from '../../common'
import { forEach, isEmpty } from 'lodash'
import {
  callPhoneNumber,
  closeSideDrawer,
  formatPhoneNumber,
  playFileAudio,
  transferCallToExtension,
} from '../../../lib/utils'
import { VoiceMailType } from '../../../services/types'
import { deleteVoicemail, downloadVoicemail, getAllVoicemails } from '../../../services/voicemail'
import { PAGE_SIZE as DEFAULT_PAGE_SIZE } from '../../../lib/history'
import { openShowOperatorDrawer } from '../../../lib/operators'
import Link from 'next/link'
import { useEventListener } from '../../../lib/hooks/useEventListener'

export interface VoicemailInboxProps extends ComponentProps<'div'> {}

export const VoicemailInbox: FC<VoicemailInboxProps> = ({ className }): JSX.Element => {
  const operatorsStore = useSelector((state: RootState) => state.operators)
  const authStore = useSelector((state: RootState) => state.authentication)
  const cancelDeleteButtonRef = useRef() as MutableRefObject<HTMLButtonElement>

  const { profile } = useSelector((state: RootState) => state.user)

  const [firstRender, setFirstRender]: any = useState(true)
  const [voicemailError, setVoicemailError] = useState('')
  const [isVoicemailLoaded, setVoicemailLoaded] = useState(false)
  const [voicemails, setVoicemails] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [pageNum, setPageNum]: any = useState(1)
  const [voicemailToDelete, setVoicemailToDelete] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false)
  const [isDeletingAll, setIsDeletingAll] = useState<boolean>(false)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Add search filter state
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filteredVoicemails, setFilteredVoicemails] = useState<any[]>([])

  // Add this computed value to get current page items from filtered voicemails instead
  const currentPageVoicemails = filteredVoicemails.slice(
    (pageNum - 1) * pageSize,
    pageNum * pageSize,
  )

  // Listen for audio player closed event
  useEventListener('phone-island-audio-player-closed', () => {
    setFirstRender(true)
  })

  useEffect(() => {
    if (!isEmpty(operatorsStore) && !operatorsStore.isOperatorsLoaded) {
      return
    }

    if (firstRender) {
      setFirstRender(false)
    } else {
      return
    }

    const fetchVoicemails = async () => {
      try {
        const response: any[] | undefined = await getAllVoicemails()

        // Filter voicemails by type = inbox or old
        const inboxVoicemails = response?.filter(
          (voicemail) => voicemail.type === 'inbox' || voicemail.type === 'old',
        )

        forEach(inboxVoicemails, (voicemail) => {
          const callerIdMatch = (voicemail as VoiceMailType).callerid?.match(/<([^>]+)>/)
          const callerId = callerIdMatch ? callerIdMatch[1] : ''

          let operator: any = Object.values(operatorsStore.operators).find((operator: any) =>
            operator.endpoints?.mainextension?.some((vm: { id: string }) => vm.id === callerId),
          )

          if (!operator) {
            voicemail.caller_number = formatPhoneNumber(callerId)
          } else {
            voicemail.caller_number = callerId
          }

          if (operator == undefined) {
            operator = { name: t('VoiceMail.Unknown') }
          }

          voicemail.caller_operator = operator
        })

        if (inboxVoicemails) {
          // Sort voicemails by date (newest first) as default
          const sortedVoicemails = inboxVoicemails.sort((a, b) => {
            // Default sort: newest first (descending)
            return b.origtime - a.origtime
          })

          setVoicemails(sortedVoicemails)
        }
        setVoicemailLoaded(true)
      } catch (error) {
        console.error(error)
        setVoicemailError('Error fetching voicemails')
      }
    }

    fetchVoicemails()
  }, [firstRender, operatorsStore])

  // Filter voicemails based on search term
  useEffect(() => {
    if (!voicemails || !voicemails?.length) {
      setFilteredVoicemails([])
      return
    }

    if (!searchTerm) {
      setFilteredVoicemails(voicemails)
      return
    }

    const searchTermLower = searchTerm.toLowerCase()

    const filtered = voicemails.filter((voicemail) => {
      // Search in caller number
      const numberMatch =
        voicemail.caller_number && voicemail.caller_number.toLowerCase().includes(searchTermLower)

      // Search in caller name (if operator exists)
      const nameMatch =
        voicemail.caller_operator &&
        voicemail.caller_operator.name &&
        voicemail.caller_operator.name.toLowerCase().includes(searchTermLower)

      return numberMatch || nameMatch
    })

    setFilteredVoicemails(filtered)
    // Reset to first page when filtering
    setPageNum(1)
  }, [searchTerm, voicemails])

  // Calculate the total pages of the history based on filtered voicemails
  useEffect(() => {
    setTotalPages(Math.ceil(filteredVoicemails?.length / pageSize))
  }, [filteredVoicemails, pageSize])

  const updateSortFilter = (sort: string) => {
    // Apply sorting to voicemails
    if (voicemails && voicemails.length) {
      const sortedVoicemails = [...voicemails].sort((a, b) => {
        // Sort by date
        return sort === 'time%20asc' ? a.origtime - b.origtime : b.origtime - a.origtime
      })
      setVoicemails(sortedVoicemails)
    }
  }

  // Update the search filter handler
  const debouncedUpdateFilterText = (text: string) => {
    setSearchTerm(text)
  }

  function goToPreviousPage() {
    if (pageNum > 1) {
      setPageNum(pageNum - 1)
    }
  }

  function goToNextPage() {
    if (pageNum < totalPages) {
      setPageNum(pageNum + 1)
    }
  }

  function isPreviousPageButtonDisabled() {
    return !isVoicemailLoaded || pageNum <= 1
  }

  function isNextPageButtonDisabled() {
    return !isVoicemailLoaded || pageNum >= totalPages
  }

  const quickCall = (voicemail: any) => {
    if (
      operatorsStore?.operators[authStore?.username]?.mainPresence &&
      operatorsStore?.operators[authStore?.username]?.mainPresence === 'busy'
    ) {
      transferCallToExtension(voicemail?.caller_number)
    } else if (
      operatorsStore?.operators[authStore?.username]?.endpoints?.mainextension[0]?.id !==
      voicemail?.caller_number
    ) {
      callPhoneNumber(voicemail?.caller_number)
    }
  }

  const openDrawerOperator = (operator: any) => {
    if (operator && operator.name !== t('VoiceMail.Unknown')) {
      openShowOperatorDrawer(operator)
    }
  }

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp * 1000)
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }
    const formattedDate = date.toLocaleDateString('en-GB', dateOptions)
    const formattedTime = date.toLocaleTimeString('en-GB', timeOptions)
    return `${formattedDate}, ${formattedTime}`
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getVoiceMailOptionsTemplate = (voicemail: VoiceMailType) => (
    <>
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <Dropdown.Item icon={faPhone} onClick={() => quickCall(voicemail)}>
          <span>{t('VoiceMail.Call back')}</span>
        </Dropdown.Item>
        <Dropdown.Item icon={faCircleArrowDown} onClick={() => downloadVoicemail(voicemail?.id)}>
          <span>{t('VoiceMail.Download')}</span>
        </Dropdown.Item>
      </div>
      <Dropdown.Item icon={faTrash} isRed onClick={() => showDeleteVoicemailModal(voicemail)}>
        <span>{t('VoiceMail.Delete message')}</span>
      </Dropdown.Item>
    </>
  )

  const showDeleteVoicemailModal = (voicemail: any) => {
    setVoicemailToDelete(voicemail)
    setShowDeleteModal(true)
  }

  const prepareDeleteContact = async () => {
    if (voicemailToDelete?.id) {
      await deleteVoicemail(voicemailToDelete?.id)
      setShowDeleteModal(false)
      setVoicemailToDelete(null)
      closeSideDrawer()
      // Reload voicemails after deletion
      setFirstRender(true)
    }
  }

  const deleteAllVoicemails = async () => {
    setIsDeletingAll(true)
    try {
      // Delete voicemails one by one
      for (const voicemail of voicemails) {
        await deleteVoicemail(voicemail?.id)
      }
      setShowDeleteAllModal(false)
      // Reload voicemails after deletion
      setFirstRender(true)
    } catch (error) {
      console.error('Error deleting all voicemails:', error)
    } finally {
      setIsDeletingAll(false)
    }
  }

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    // Reset to first page when changing page size
    setPageNum(1)
  }

  async function playSelectedVoicemail(voicemail_id: any) {
    if (voicemail_id) {
      playFileAudio(voicemail_id, 'voicemail')
    }
  }

  const getDropdownPosition = (index: number) => {
    // Get total count of items on current page
    const totalItemsOnPage = currentPageVoicemails.length;
    
    if (totalItemsOnPage === 1) {
      return 'oneVoicemail';
    } else if (totalItemsOnPage > 1 && totalItemsOnPage - index <= 1) {
      return 'leftUpVoicemail';
    } else {
      return 'leftDownVoicemail';
    }
  }

  return (
    <>
      {/* Delete all voicemails modal */}
      <Modal
        show={showDeleteAllModal}
        focus={cancelDeleteButtonRef}
        onClose={() => setShowDeleteAllModal(false)}
      >
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 bg-red-100 dark:bg-red-900'>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className='h-6 w-6 text-red-600 dark:text-red-200'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
              {t('History.Delete all messages')}
            </h3>
            <div className='mt-3'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('History.voicemailDeletionAllMessage')}
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={deleteAllVoicemails} disabled={isDeletingAll}>
            {isDeletingAll ? t('Common.Deleting...') : t('Common.Delete all')}
          </Button>
          <Button
            variant='ghost'
            onClick={() => setShowDeleteAllModal(false)}
            ref={cancelDeleteButtonRef}
            disabled={isDeletingAll}
          >
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>

      {/* delete voicemail modal */}
      <Modal
        show={showDeleteModal}
        focus={cancelDeleteButtonRef}
        onClose={() => setShowDeleteModal(false)}
        afterLeave={() => setVoicemailToDelete(null)}
      >
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 bg-red-100 dark:bg-red-900'>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className='h-6 w-6 text-red-600 dark:text-red-200'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
              {t('History.Delete voicemail')}
            </h3>
            <div className='mt-3'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('History.voicemailDeletionMessage', {
                  name: voicemailToDelete?.displayName || '-',
                })}
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={() => prepareDeleteContact()}>
            {t('Common.Delete')}
          </Button>
          <Button
            variant='ghost'
            onClick={() => setShowDeleteModal(false)}
            ref={cancelDeleteButtonRef}
          >
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
      {profile?.macro_permissions?.cdr?.value ? (
        <div>
          <div className='flex justify-between'>
            <Filter
              updateFilterText={debouncedUpdateFilterText}
              updateSortFilter={updateSortFilter}
            />
            <div className='flex gap-4 items-start'>
              <Button
                variant='ghost'
                className='gap-2'
                onClick={() => setShowDeleteAllModal(true)}
                disabled={!filteredVoicemails || filteredVoicemails.length === 0}
              >
                <FontAwesomeIcon icon={faTrash} className='h-4 w-4' />
                {t('History.Delete all messages')}
              </Button>
              <Link href={{ pathname: '/settings', query: { section: 'Voicemail' } }}>
                <Button variant='white' className='gap-2'>
                  <FontAwesomeIcon icon={faArrowRightLong} className='h-4 w-4' />
                  {t('History.Go to Settings')}
                </Button>
              </Link>
            </div>
          </div>
          {voicemailError && (
            <InlineNotification type='error' title={voicemailError}></InlineNotification>
          )}
          {!voicemailError && isVoicemailLoaded && (
            <div className='mx-auto'>
              <div className='flex flex-col'>
                <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                  <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                    <div className='overflow-hidden shadow ring-1 md:rounded-lg ring-opacity-5 dark:ring-opacity-5 ring-gray-900 dark:ring-gray-100 border-[1px] border-solid rounded-xl dark:border-gray-600'>
                      {/* empty state */}
                      {filteredVoicemails?.length === 0 && (
                        <EmptyState
                          title={
                            searchTerm ? t('History.No matching voicemails') : t('History.No voicemails')
                          }
                          description={
                            searchTerm
                              ? t('History.No voicemails match your search criteria') || ''
                              : t('History.There are no voicemails in your history') || ''
                          }
                          icon={
                            <FontAwesomeIcon
                              icon={faVoicemail}
                              className='mx-auto h-12 w-12'
                              aria-hidden='true'
                            />
                          }
                        ></EmptyState>
                      )}
                      {/* voicemail table */}
                      {filteredVoicemails?.length !== 0 && (
                        <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                          <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-700'>
                            <thead className='sticky top-0 bg-gray-100 dark:bg-gray-800 z-[1]'>
                              <tr>
                                <th
                                  scope='col'
                                  className='px-6 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                >
                                  {t('History.Caller')}
                                </th>
                                <th
                                  scope='col'
                                  className='px-6 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                >
                                  {t('History.Date')}
                                </th>
                                <th
                                  scope='col'
                                  className='px-6 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                >
                                  {t('History.Duration')}
                                </th>
                                <th
                                  scope='col'
                                  className='px-6 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-100'
                                >
                                  {/* Empty header for actions column */}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='bg-white dark:bg-gray-950 text-gray-700 text-sm'>
                              {currentPageVoicemails.map((voicemail, index) => (
                                <tr
                                  key={voicemail?.id}
                                  className={`${
                                    index === 0 ? '' : 'border-t border-gray-300 dark:border-gray-600'
                                  } h-[84px]`}
                                >
                                  {/* Caller */}
                                  <td className='whitespace-nowrap px-6 py-4 sm:pl-6'>
                                    <div className='flex items-center'>
                                      <Avatar
                                        src={voicemail?.caller_operator?.avatarBase64}
                                        placeholderType='operator'
                                        size='large'
                                        bordered
                                        onClick={() =>
                                          voicemail?.caller_operator?.name !== t('VoiceMail.Unknown') &&
                                          openDrawerOperator(voicemail?.caller_operator)
                                        }
                                        className={`mr-2 ${
                                          voicemail?.caller_operator?.name !== t('VoiceMail.Unknown')
                                            ? 'cursor-pointer'
                                            : 'cursor-default'
                                        }`}
                                        status={voicemail?.caller_operator?.mainPresence}
                                      />
                                      <div>
                                        <div className='font-medium text-gray-900 dark:text-gray-100'>
                                          {voicemail?.caller_operator?.name !== 'unknown'
                                            ? voicemail.caller_operator.name
                                            : t('VoiceMail.Unknown')}
                                        </div>
                                        <div
                                          className='text-sm text-primary dark:text-primaryDark cursor-pointer hover:underline'
                                          onClick={() => quickCall(voicemail)}
                                        >
                                          {voicemail?.caller_number}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  {/* Date */}
                                  <td className='whitespace-nowrap px-6 py-4'>
                                    <div className='text-sm text-gray-600 dark:text-gray-300'>
                                      {formatTimestamp(voicemail?.origtime)}
                                    </div>
                                  </td>
                                  {/* Duration */}
                                  <td className='whitespace-nowrap px-6 py-4'>
                                    <div className='text-sm text-gray-600 dark:text-gray-300'>
                                      {formatDuration(voicemail?.duration)}
                                    </div>
                                  </td>
                                  {/* Actions */}
                                  <td className='whitespace-nowrap px-6 py-4 text-right'>
                                    <div className='flex justify-end space-x-2'>
                                      <Button
                                        variant='white'
                                        onClick={() => playSelectedVoicemail(voicemail?.id)}
                                      >
                                        <FontAwesomeIcon
                                          icon={faPlay}
                                          className='h-4 w-4 mr-2 text-primary dark:text-gray-100'
                                          aria-hidden='true'
                                        />
                                        {t('History.Play')}
                                      </Button>
                                      <Dropdown
                                        items={getVoiceMailOptionsTemplate(voicemail)}
                                        position={getDropdownPosition(index)}
                                      >
                                        <Button variant='ghost'>
                                          <FontAwesomeIcon
                                            icon={faEllipsisVertical}
                                            className='h-4 w-4 text-primary dark:text-gray-100'
                                          />
                                          <span className='sr-only'>
                                            {t('History.Open recording action modal')}
                                          </span>
                                        </Button>
                                      </Dropdown>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* skeleton  */}
          {!isVoicemailLoaded && (
            <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-700 bg-white dark:bg-gray-950 overflow-hidden rounded-lg'>
              <thead>
                <tr>
                  {Array.from(Array(6)).map((_, index) => (
                    <th key={`th-${index}`}>
                      <div className='px-6 py-3.5'>
                        <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from(Array(8)).map((_, secondIndex) => (
                  <tr key={`tr-${secondIndex}`}>
                    {Array.from(Array(6)).map((_, thirdIndex) => (
                      <td key={`td-${secondIndex}-${thirdIndex}`}>
                        <div className='px-6 py-6'>
                          <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <nav
              className='flex items-center justify-between px-0 py-4 bg-body dark:bg-bodyDark'
              aria-label='Pagination'
            >
              <div className='hidden sm:block'>
                <p className='text-sm text-gray-700 dark:text-gray-200'>
                  {t('Common.Showing')}{' '}
                  <span className='font-medium'>{pageSize * (pageNum - 1) + 1}</span> -&nbsp;
                  <span className='font-medium'>
                    {pageSize * (pageNum - 1) + pageSize < filteredVoicemails?.length
                      ? pageSize * (pageNum - 1) + pageSize
                      : filteredVoicemails?.length}
                  </span>{' '}
                  {t('Common.of')} <span className='font-medium'>{filteredVoicemails?.length}</span>{' '}
                  {t('History.voicemails')}
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
                  <span>{t('Common.Previous page')}</span>
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
      ) : (
        <MissingPermission />
      )}
    </>
  )
}

VoicemailInbox.displayName = 'Voicemail Inbox'
