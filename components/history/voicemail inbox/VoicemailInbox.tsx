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
  faArrowRight,
  faPen,
  faChevronDown,
  faCircle,
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

  // Add this computed value to get current page items
  const currentPageVoicemails = voicemails.slice((pageNum - 1) * pageSize, pageNum * pageSize)

  //Calculate the total pages of the history
  useEffect(() => {
    setTotalPages(Math.ceil(voicemails?.length / pageSize))
  }, [voicemails, pageSize])

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

          const operator: any = Object.values(operatorsStore.operators).find((operator: any) =>
            operator.endpoints?.mainextension?.some((vm: { id: string }) => vm.id === callerId),
          )

          if (!operator) {
            voicemail.caller_number = formatPhoneNumber(callerId)
          } else {
            voicemail.caller_number = callerId
          }
          voicemail.caller_operator = operator
        })

        if (inboxVoicemails) {
          // Sort voicemails: first by type ('inbox' first, then 'old'), then by date (newest first)
          const sortedVoicemails = inboxVoicemails.sort((a, b) => {
            // Sort by type first (inbox before old)
            if (a.type !== b.type) {
              return a.type === 'inbox' ? -1 : 1
            }
            // Then sort by date (newest first)
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

  const updateSortFilter = (sort: string) => {
    console.log(sort)
  }

  const updateCallTypeFilter = (callType: string) => {
    console.log(callType)
  }

  const updateCallDirectionFilter = (callDirection: string) => {
    console.log(callDirection)
  }

  const debouncedUpdateFilterText = (text: string) => {
    console.log(text)
  }

  const updateDateBeginFilter = (dateBegin: string) => {
    console.log(dateBegin)
  }

  const updateDateEndFilter = (dateEnd: string) => {
    console.log(dateEnd)
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
    if (operator) {
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

  // The dropdown items for every speed dial element
  const getActionsMenu = () => (
    <>
      <Dropdown.Item icon={faPen}>{t('Common.Edit')}</Dropdown.Item>
      <Dropdown.Item icon={faTrash}>{t('Common.Delete')}</Dropdown.Item>
    </>
  )

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
    setFirstRender(true)
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
          <div className='flex items-center justify-between mb-8'>
            <Filter
              updateFilterText={debouncedUpdateFilterText}
              updateCallTypeFilter={updateCallTypeFilter}
              updateSortFilter={updateSortFilter}
              updateCallDirectionFilter={updateCallDirectionFilter}
              updateDateBeginFilter={updateDateBeginFilter}
              updateDateEndFilter={updateDateEndFilter}
            />
            <div className='flex gap-4'>
              <Button
                variant='ghost'
                className='gap-2'
                onClick={() => setShowDeleteAllModal(true)}
                disabled={!voicemails || voicemails.length === 0}
              >
                <FontAwesomeIcon icon={faTrash} className='h-4 w-4' />
                {t('History.Delete all messages')}
              </Button>
              <Link href={{ pathname: '/settings', query: { section: 'Voicemail' } }}>
                <Button variant='white' className='gap-2'>
                  <FontAwesomeIcon icon={faArrowRight} className='h-4 w-4' />
                  {t('History.Go to Settings')}
                </Button>
              </Link>
            </div>
          </div>
          {voicemailError && (
            <InlineNotification type='error' title={voicemailError}></InlineNotification>
          )}
          {!voicemailError && (
            <div className='mx-auto'>
              <div className='flex flex-col'>
                <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                  <div className='inline-block min-w-full py-2 align-middle px-2 md:px-6 lg:px-8'>
                    <div className='overflow-hidden shadow ring-1 md:rounded-lg ring-opacity-5 dark:ring-opacity-5 ring-gray-900 dark:ring-gray-100 border-[1px] border-solid rounded-xl dark:border-gray-600'>
                      {/* empty state */}
                      {isVoicemailLoaded && voicemails?.length === 0 && (
                        <EmptyState
                          title={t('History.No calls')}
                          description={t('History.There are no calls in your history') || ''}
                          icon={
                            <FontAwesomeIcon
                              icon={faPhone}
                              className='mx-auto h-12 w-12'
                              aria-hidden='true'
                            />
                          }
                        ></EmptyState>
                      )}
                      {/* history table */}
                      {isVoicemailLoaded && voicemails?.length !== 0 && (
                        <div className='flex flex-col'>
                          <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                            <table className='min-w-full'>
                              <thead className='bg-gray-100 sticky top-0 z-10'>
                                <tr>
                                  <th
                                    scope='col'
                                    className='w-0 px-6 py-3 gap-2 text-left text-sm font-medium font-poppins text-gray-900 dark:text-gray-200'
                                  >
                                    {t('History.Caller')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='w-0 px-6 py-3 gap-2 text-left text-sm font-medium font-poppins text-gray-900 dark:text-gray-200'
                                  >
                                    {t('History.Date')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='w-0 px-6 py-3 gap-2 text-left text-sm font-medium font-poppins text-gray-900 dark:text-gray-200'
                                  >
                                    {t('History.Duration')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='w-full px-6 py-3 gap-2 text-left text-sm font-medium font-poppins text-gray-900 dark:text-gray-200'
                                  >
                                    {t('History.Summary')}
                                  </th>
                                  <th
                                    scope='col'
                                    className='w-0 px-6 py-3 gap-2 text-right text-sm font-medium font-poppins text-gray-900 dark:text-gray-200'
                                  ></th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Not empty state  */}
                                {isVoicemailLoaded &&
                                  currentPageVoicemails.map((voicemail) => (
                                    <tr key={voicemail?.id}>
                                      {/* Caller */}
                                      <td
                                        className={`w-0 whitespace-nowrap ${
                                          voicemail?.id === 0
                                            ? ''
                                            : 'border-t border-gray-300 dark:border-gray-600'
                                        }`}
                                      >
                                        <div className='flex px-6 py-4 items-center'>
                                          <div className='h-2 w-2 flex'>
                                            {voicemail.type === 'inbox' ? (
                                              <FontAwesomeIcon
                                                icon={faCircle}
                                                className='h-2 w-2 text-rose-700'
                                              />
                                            ) : (
                                              <span className='h-2 w-2'></span>
                                            )}
                                          </div>
                                          <Avatar
                                            src={voicemail?.caller_operator?.avatarBase64}
                                            placeholderType='operator'
                                            size='large'
                                            bordered
                                            onClick={() =>
                                              openDrawerOperator(voicemail?.caller_operator)
                                            }
                                            className='mx-auto cursor-pointer mr-2 ml-0.5'
                                            status={voicemail?.caller_operator?.mainPresence}
                                          />
                                          <div className='flex flex-col gap-1.5 w-full'>
                                            <span className='font-poppins text-sm leading-4 font-medium text-gray-700 dark:text-gray-50'>
                                              {voicemail?.caller_operator?.name
                                                ? voicemail.caller_operator.name
                                                : t('VoiceMail.Unknown')}
                                            </span>
                                            <span
                                              className='cursor-pointer hover:underline font-poppins text-sm font-normal text-primary dark:text-primaryDark'
                                              onClick={() => quickCall(voicemail)}
                                            >
                                              {voicemail?.caller_number}
                                            </span>
                                          </div>
                                        </div>
                                      </td>

                                      {/* Date */}
                                      <td
                                        className={`${
                                          voicemail?.id === 0
                                            ? ''
                                            : 'border-t border-gray-300 dark:border-gray-600'
                                        }`}
                                      >
                                        <div className='px-6 py-4 gap-6'>
                                          <span className='font-poppins text-xs font-normal text-gray-600 dark:text-gray-300 whitespace-nowrap'>
                                            {formatTimestamp(voicemail?.origtime)}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Duration */}
                                      <td
                                        className={`${
                                          voicemail?.id === 0
                                            ? ''
                                            : 'border-t border-gray-300 dark:border-gray-600'
                                        }`}
                                      >
                                        <div className='px-6 py-4 gap-6'>
                                          <span className='font-poppins text-xs font-normal text-gray-600 dark:text-gray-300'>
                                            {formatDuration(voicemail?.duration)}
                                          </span>
                                        </div>
                                      </td>

                                      {/* Summary */}
                                      <td
                                        className={`${
                                          voicemail?.id === 0
                                            ? ''
                                            : 'border-t border-gray-300 dark:border-gray-600'
                                        }`}
                                      ></td>

                                      {/* Buttons */}
                                      <td
                                        className={`w-0 whitespace-nowrap text-right ${
                                          voicemail?.id === 0
                                            ? ''
                                            : 'border-t border-gray-300 dark:border-gray-600'
                                        }`}
                                      >
                                        <div className='flex items-center justify-end px-6 py-4 space-x-1'>
                                          <Button
                                            variant='ghost'
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
                                            position='left'
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
                          {totalPages > 0 && (
                            <div className='border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950'>
                              <nav
                                className='flex items-center justify-between px-6 py-3'
                                aria-label='Pagination'
                              >
                                <div className='hidden sm:flex items-center gap-4'>
                                  <p className='text-sm text-gray-900 dark:text-gray-200'>
                                    <span className='font-medium'>
                                      {voicemails.length === 0 ? 0 : pageSize * (pageNum - 1) + 1}
                                    </span>{' '}
                                    -&nbsp;
                                    <span className='font-medium'>
                                      {Math.min(pageSize * pageNum, voicemails.length)}
                                    </span>{' '}
                                    {t('Common.of')}{' '}
                                    <span className='font-medium'>{voicemails.length}</span>
                                  </p>

                                  <div className='relative inline-block z-20'>
                                    <Dropdown
                                      position='top'
                                      className='z-30'
                                      items={
                                        <>
                                          {[5, 10, 25, 50, 100].map((size) => (
                                            <Dropdown.Item
                                              key={`page-size-${size}`}
                                              onClick={() => handlePageSizeChange(size)}
                                            >
                                              {size}
                                            </Dropdown.Item>
                                          ))}
                                        </>
                                      }
                                    >
                                      <Button
                                        variant='white'
                                        className='text-sm flex items-center gap-2'
                                      >
                                        {pageSize}
                                        <FontAwesomeIcon icon={faChevronDown} className='h-3 w-3' />
                                      </Button>
                                    </Dropdown>
                                  </div>
                                </div>
                                <div className='flex flex-1 justify-between sm:justify-end'>
                                  <Button
                                    type='button'
                                    variant='white'
                                    disabled={isPreviousPageButtonDisabled()}
                                    onClick={() => goToPreviousPage()}
                                    className='flex items-center'
                                  >
                                    <FontAwesomeIcon
                                      icon={faChevronLeft}
                                      className='mr-2 h-4 w-4'
                                    />
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
                                    <FontAwesomeIcon
                                      icon={faChevronRight}
                                      className='ml-2 h-4 w-4'
                                    />
                                  </Button>
                                </div>
                              </nav>
                            </div>
                          )}
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
        </div>
      ) : (
        <MissingPermission />
      )}
    </>
  )
}

VoicemailInbox.displayName = 'Voicemail Inbox'
