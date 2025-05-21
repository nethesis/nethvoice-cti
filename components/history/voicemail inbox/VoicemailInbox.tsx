// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, MutableRefObject, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { MissingPermission } from '../../common/MissingPermissionsPage'
import { Filter } from './Filter'
import {
  faPhone,
  faEllipsisVertical,
  faPlay,
  faCircleArrowDown,
  faTrash,
  faTriangleExclamation,
  faVoicemail,
  faArrowRightLong,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { t } from 'i18next'
import { InlineNotification, EmptyState, Button, Avatar, Dropdown, Modal } from '../../common'
import { Pagination } from '../../common/Pagination'
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
import { Table } from '../../common/Table'

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
    const totalItemsOnPage = currentPageVoicemails?.length

    if (totalItemsOnPage === 1) {
      return 'oneVoicemail'
    } else if (totalItemsOnPage > 1 && totalItemsOnPage - index <= 1) {
      return 'leftUpVoicemail'
    } else {
      return 'leftDownVoicemail'
    }
  }

  const columns = [
    {
      header: t('History.Caller'),
      cell: (voicemail: any) => (
        <div className='flex items-center'>
          <div className='h-2 w-2 flex'>
            {voicemail?.type === 'inbox' ? (
              <FontAwesomeIcon icon={faCircle} className='h-2 w-2 text-rose-700' />
            ) : (
              <span className='h-2 w-2' />
            )}
          </div>
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
            } ml-0.5`}
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
              onClick={(e) => {
                e.stopPropagation()
                quickCall(voicemail)
              }}
            >
              {voicemail?.caller_number}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t('History.Date'),
      cell: (voicemail: any) => (
        <div className='text-sm text-gray-600 dark:text-gray-300'>
          {formatTimestamp(voicemail?.origtime)}
        </div>
      ),
    },
    {
      header: t('History.Duration'),
      cell: (voicemail: any) => (
        <div className='text-sm text-gray-600 dark:text-gray-300'>
          {formatDuration(voicemail?.duration)}
        </div>
      ),
    },
    {
      header: '',
      cell: (voicemail: any, index: number) => (
        <div className='flex justify-end space-x-2'>
          <Button variant='white' onClick={() => playSelectedVoicemail(voicemail?.id)}>
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
              <span className='sr-only'>{t('History.Open recording action modal')}</span>
            </Button>
          </Dropdown>
        </div>
      ),
      className: 'text-right',
    },
  ]

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

          <div className='mx-auto'>
            <div className='flex flex-col'>
              <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                  <Table
                    columns={columns}
                    data={currentPageVoicemails}
                    isLoading={!isVoicemailLoaded}
                    loadingRows={8}
                    emptyState={{
                      title: searchTerm
                        ? t('History.No matching voicemails')
                        : t('History.No voicemails'),
                      description: searchTerm
                        ? t('History.No voicemails match your search criteria') || ''
                        : t('History.There are no voicemails in your history') || '',
                      icon: (
                        <FontAwesomeIcon
                          icon={faVoicemail}
                          className='mx-auto h-12 w-12'
                          aria-hidden='true'
                        />
                      ),
                    }}
                    rowKey='id'
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
              totalItems={filteredVoicemails?.length || 0}
              pageSize={pageSize}
              onPreviousPage={goToPreviousPage}
              onNextPage={goToNextPage}
              isLoading={!isVoicemailLoaded}
              itemsName={t('History.voicemails') || ''}
            />
          )}
        </div>
      ) : (
        <MissingPermission />
      )}
    </>
  )
}

VoicemailInbox.displayName = 'Voicemail Inbox'
