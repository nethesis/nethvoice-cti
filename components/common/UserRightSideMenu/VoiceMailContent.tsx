// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect, MutableRefObject, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { deleteVoicemail, downloadVoicemail, getAllVoicemails } from '../../../services/voicemail'
import {
  faEllipsisVertical,
  faVoicemail,
  faSortAmountAsc,
  faCheck,
  faPhone,
  faPlay,
  faTrash,
  faCircleArrowDown,
  faTriangleExclamation,
  faCircle,
  faGear,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import { Avatar, Button, Dropdown, EmptyState, InlineNotification, Modal } from '..'
import {
  callPhoneNumber,
  closeSideDrawer,
  formatPhoneNumber,
  playFileAudio,
  transferCallToExtension,
} from '../../../lib/utils'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { VoiceMailType } from '../../../services/types'
import { forEach, isEmpty, set } from 'lodash'
import { openShowOperatorDrawer } from '../../../lib/operators'
import Link from 'next/link'
import { useEventListener } from '../../../lib/hooks/useEventListener'

export const VoiceMailContent = () => {
  const operatorsStore = useSelector((state: RootState) => state.operators)
  const authStore = useSelector((state: RootState) => state.authentication)

  const [isVoiceMailLoaded, setVoiceMailLoaded] = useState(false)
  const [getVoiceMailError, setGetVoiceMailError] = useState('')
  const [voicemails, setVoicemails] = useState<any[]>([])
  const [sortType, setSortType] = useState<SortTypes>('newest')
  const [firstRender, setFirstRender]: any = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [voicemailToDelete, setVoicemailToDelete] = useState<any>(null)
  const cancelDeleteButtonRef = useRef() as MutableRefObject<HTMLButtonElement>

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

        forEach(response, (voicemail) => {
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

        setVoiceMailLoaded(true)
      } catch (error) {
        console.error(error)
        setGetVoiceMailError('Error fetching voicemails')
      }
    }

    fetchVoicemails()
  }, [operatorsStore, firstRender])

  useEffect(() => {
    // Apply sorting to voicemails
    if (voicemails && voicemails.length) {
      const sortedVoicemails = [...voicemails].sort((a, b) => {
        // Sort by date
        return sortType === 'oldest' ? a.origtime - b.origtime : b.origtime - a.origtime
      })
      setVoicemails(sortedVoicemails)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortType])

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

  const getVoiceMailSortTemplate = () => (
    <>
      <div className='cursor-default'>
        <Dropdown.Header>
          <span className='font-poppins font-light'>{t('VoiceMail.Sort by')}</span>
        </Dropdown.Header>
        <Dropdown.Item onClick={() => setSortType('newest')}>
          <span className='font-poppins font-light'>{t('VoiceMail.Newest')}</span>
          {sortType === 'newest' && (
            <FontAwesomeIcon icon={faCheck} className='ml-auto text-emerald-700' />
          )}
        </Dropdown.Item>
        <Dropdown.Item onClick={() => setSortType('oldest')}>
          <span className='font-poppins font-light'>{t('VoiceMail.Oldest')}</span>
          {sortType === 'oldest' && (
            <FontAwesomeIcon icon={faCheck} className='ml-auto text-emerald-700' />
          )}
        </Dropdown.Item>
      </div>
    </>
  )

  const getVoiceMailMenuTemplate = () => (
    <>
      <Link
        href={{ pathname: '/history', query: { section: 'Voicemail inbox' } }}
        className='w-full'
      >
        <Dropdown.Item icon={faClockRotateLeft}>{t('VoiceMail.Go to history')}</Dropdown.Item>
      </Link>
      <Link href={{ pathname: '/settings', query: { section: 'Voicemail' } }} className='w-full'>
        <Dropdown.Item icon={faGear}>{t('VoiceMail.Go to settings')}</Dropdown.Item>
      </Link>
    </>
  )

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

  async function playSelectedVoicemail(voicemail: any) {
    if (voicemail) {
      playFileAudio(voicemail.id, 'voicemail')
    }
  }

  return (
    <>
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
              {t('VoiceMail.Delete voicemail')}
            </h3>
            <div className='mt-3'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('VoiceMail.voicemailDeletionMessage', {
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
      <div className='flex h-full flex-col bg-sidebar dark:bg-sidebarDark'>
        <div className='py-4 px-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium text-textLight dark:text-textDark'>
              {t('VoiceMail.Voicemail inbox')}
            </h2>
            <div className='flex gap-2 items-center'>
              <Dropdown items={getVoiceMailSortTemplate()} position='left'>
                <Button
                  variant='white'
                  className='py-2 px-2 gap-3 h-9 w-9'
                >
                  <FontAwesomeIcon icon={faSortAmountAsc} className='h-4 w-4' />
                  <span className='sr-only'>{t('VoiceMail.Open voicemail menu')}</span>
                </Button>
              </Dropdown>
              <Dropdown items={getVoiceMailMenuTemplate()} position='left'>
                <Button variant='ghost' className='py-2 px-2 h-9 w-9'>
                  <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                  <span className='sr-only'>{t('VoiceMail.Open voicemail menu')}</span>
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
        <span className='border-b border-gray-200 dark:border-gray-700'></span>
        <ul
          role='list'
          className='px-6 flex-1 divide-y overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 divide-gray-200 dark:divide-gray-700'
        >
          {/* get voicemails error */}
          {getVoiceMailError && (
            <InlineNotification type='error' title={getVoiceMailError} className='my-6' />
          )}
          {/* render voicemails */}
          {isVoiceMailLoaded &&
            voicemails?.map((voicemail, index) => (
              <li key={voicemail?.id}>
                <div className='gap-4 py-4 px-0'>
                  <div className='flex justify-between gap-3'>
                    <div className='flex shrink-0 h-min items-center min-w-[48px]'>
                      <div className='h-2 w-2 flex'>
                        {voicemail.type === 'inbox' ? (
                          <FontAwesomeIcon icon={faCircle} className='h-2 w-2 text-rose-700' />
                        ) : (
                          <span className='h-2 w-2'></span>
                        )}
                      </div>
                      <Avatar
                        src={voicemail?.caller_operator?.avatarBase64}
                        placeholderType='operator'
                        size='large'
                        bordered
                        onClick={
                          voicemail?.caller_operator?.name !== t('VoiceMail.Unknown') && voicemail?.caller_operator
                            ? () => openDrawerOperator(voicemail?.caller_operator)
                            : undefined
                        }
                        className={`mx-auto ${
                          voicemail?.caller_operator?.name !== t('VoiceMail.Unknown') && voicemail?.caller_operator
                            ? 'cursor-pointer'
                            : 'cursor-default'
                        } ml-0.5`}
                        status={voicemail?.caller_operator?.mainPresence}
                      />
                    </div>
                    <div className='flex flex-col gap-1.5 min-w-0 flex-1'>
                      <span
                        className='font-poppins text-sm leading-4 font-medium text-gray-900 dark:text-gray-50 truncate'
                        title={voicemail?.caller_operator?.name || t('VoiceMail.Unknown')}
                      >
                        {voicemail?.caller_operator?.name
                          ? voicemail.caller_operator.name
                          : t('VoiceMail.Unknown')}
                      </span>
                      <div className='flex items-center truncate text-sm text-primary dark:text-primaryDark'>
                        <FontAwesomeIcon
                          icon={faPhone}
                          className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300 pb-2'
                          aria-hidden='true'
                        />
                        <span
                          className='cursor-pointer hover:underline font-poppins text-sm leading-4 font-normal truncate'
                          onClick={() => quickCall(voicemail)}
                          title={voicemail?.caller_number}
                        >
                          {voicemail?.caller_number}
                        </span>
                      </div>
                      <span
                        className='font-poppins text-sm leading-4 font-normal text-gray-600 dark:text-gray-300 truncate'
                        title={formatTimestamp(voicemail?.origtime)}
                      >
                        {formatTimestamp(voicemail?.origtime)}
                      </span>
                      <div className='flex'>
                        <FontAwesomeIcon
                          icon={faVoicemail}
                          className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                          aria-hidden='true'
                        />
                        {voicemail?.duration && (
                          <span className='font-poppins text-sm leading-4 font-normal text-gray-600 dark:text-gray-300'>
                            {formatDuration(voicemail?.duration)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex gap-2 items-start shrink-0 min-w-0'>
                      <Button
                        variant='white'
                        className='border border-gray-300 dark:border-gray-500 py-2 !px-2 h-9 w-9 gap-3'
                        onClick={() => playSelectedVoicemail(voicemail)}
                      >
                        <FontAwesomeIcon icon={faPlay} className='h-4 w-4' />
                        <span className='sr-only'>{t('VoiceMail.Play voicemail')}</span>
                      </Button>
                      <Dropdown items={getVoiceMailOptionsTemplate(voicemail)} position={index === 0 ? 'bottomVoicemail' : 'topVoicemail'}>
                        <Button variant='ghost' className='py-2 px-2 h-9 w-9'>
                          <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                          <span className='sr-only'>{t('VoiceMail.Open voicemail menu')}</span>
                        </Button>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          {/* skeleton */}
          {!isVoiceMailLoaded &&
            !getVoiceMailError &&
            Array.from(Array(4)).map((e, index) => (
              <li key={index}>
                <div className='gap-4 py-4 px-0'>
                  <div className='flex justify-between gap-3'>
                    <div className='flex shrink-0 h-min items-center min-w-[48px]'>
                      <div className='h-2 w-2 flex'>
                        <span className='h-2 w-2'></span>
                      </div>
                      <div className='animate-pulse rounded-full h-12 w-12 bg-gray-300 dark:bg-gray-600 ml-0.5'></div>
                    </div>
                    <div className='flex flex-col gap-1.5 min-w-0 flex-1'>
                      <div className='animate-pulse h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600'></div>
                      <div className='animate-pulse h-4 w-1/2 rounded bg-gray-300 dark:bg-gray-600'></div>
                      <div className='animate-pulse h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-600'></div>
                      <div className='animate-pulse h-4 w-1/4 rounded bg-gray-300 dark:bg-gray-600'></div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          {/* empty state */}
          {isVoiceMailLoaded && !getVoiceMailError && voicemails?.length == 0 && (
            <div className='py-4'>
              <EmptyState
                title={t('VoiceMail.Voicemail empty')}
                description={t('VoiceMail.Voicemail empty description') || ''}
                icon={
                  <FontAwesomeIcon
                    icon={faVoicemail}
                    className='mx-auto h-12 w-12'
                    aria-hidden='true'
                  />
                }
              />
            </div>
          )}
        </ul>
      </div>
    </>
  )
}

export type SortTypes = 'newest' | 'oldest' | string
