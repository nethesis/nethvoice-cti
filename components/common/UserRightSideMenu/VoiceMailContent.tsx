// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { getAllVoicemails } from '../../../services/voicemail'
import {
  faEllipsisVertical,
  faVoicemail,
  faSortAmountAsc,
  faArrowRightLong,
  faCheck,
  faPhone,
  faPlay,
  faDownload,
  faTrash,
  faCircleArrowDown,
} from '@fortawesome/free-solid-svg-icons'
import { Avatar, Button, Dropdown, EmptyState, InlineNotification } from '..'
import { callPhoneNumber, transferCallToExtension } from '../../../lib/utils'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { VoiceMailType } from '../../../services/types'
import { forEach, set } from 'lodash'
import { openShowOperatorDrawer } from '../../../lib/operators'

export const VoiceMailContent = () => {
  const username = useSelector((state: RootState) => state.user.username)
  const operatorsStore = useSelector((state: RootState) => state.operators)

  const [isVoiceMailLoaded, setVoiceMailLoaded] = useState(false)
  const [getVoiceMailError, setGetVoiceMailError] = useState('')
  const [voicemails, setVoicemails] = useState<any[]>([])
  const [sortType, setSortType] = useState<SortTypes>('newest')

  useEffect(() => {
    const fetchVoicemails = async () => {
      try {
        const response: any[] | undefined = await getAllVoicemails()

        forEach(response, (voicemail) => {
          const callerIdMatch = (voicemail as VoiceMailType).callerid?.match(/<([^>]+)>/)
          const callerId = callerIdMatch ? callerIdMatch[1] : ''

          const operator: any = Object.values(operatorsStore.operators).find((operator: any) =>
            operator.endpoints?.mainextension?.some((vm: { id: string }) => vm.id === callerId),
          )

          voicemail.caller_operator = operator
        })
        if (response) {
          setVoicemails(response)
        }
        setVoiceMailLoaded(true)
      } catch (error) {
        console.error(error)
        setGetVoiceMailError('Error fetching voicemails')
      }
    }
    fetchVoicemails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, operatorsStore])

  const getVoiceMailOptionsTemplate = (voicemail: VoiceMailType) => (
    <>
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <Dropdown.Item icon={faPhone}>
          <span>{t('VoiceMail.Call back')}</span>
        </Dropdown.Item>
        <Dropdown.Item
          icon={faCircleArrowDown}
          onClick={() => quickCall(voicemail?.caller_operator)}
        >
          <span>{t('VoiceMail.Download')}</span>
        </Dropdown.Item>
      </div>
      <Dropdown.Item icon={faTrash} isRed>
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

  const quickCall = (operator: any) => {
    if (operator?.mainPresence && operator?.mainPresence === 'busy') {
      transferCallToExtension(operator?.endpoints?.mainextension[0]?.id)
    } else {
      callPhoneNumber(operator?.endpoints?.mainextension[0]?.id)
    }
  }

  const openDrawerOperator = (operator: any) => {
    if (operator) {
      openShowOperatorDrawer(operator)
    }
  }

  return (
    <>
      <div className='flex h-full flex-col bg-sidebar dark:bg-sidebarDark'>
        <div className='py-4 px-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium text-textLight dark:text-textDark'>
              {t('VoiceMail.Voicemail inbox')}
            </h2>
            <div className='flex gap-2 items-center'>
              <Dropdown items={getVoiceMailSortTemplate()} position='left'>
                <Button
                  variant='ghost'
                  className='border border-gray-300 dark:border-gray-500 py-2 px-2 gap-3 h-9 w-9'
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
          {voicemails?.map((voicemail) => (
            <li key={voicemail?.id}>
              <div className='gap-4 py-4 px-0'>
                <div className='flex justify-between gap-3'>
                  <div className='flex shrink-0 gap-1 h-min items-center'>
                    <Avatar
                      src={voicemail?.caller_operator?.avatarBase64}
                      placeholderType='operator'
                      size='large'
                      bordered
                      onClick={() => openDrawerOperator(voicemail?.caller_operator)}
                      className='mx-auto cursor-pointer'
                      status={voicemail?.caller_operator?.mainPresence}
                    />
                  </div>
                  <div className='flex flex-col gap-1.5 w-full'>
                    <span className='font-poppins text-sm leading-4 font-medium text-gray-900 dark:text-gray-50'>
                      {voicemail?.caller_operator?.name}
                    </span>
                    <div className='flex items-center truncate text-sm text-primary dark:text-primaryDark'>
                      <FontAwesomeIcon
                        icon={faPhone}
                        className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                        aria-hidden='true'
                      />
                      <span
                        className='cursor-pointer hover:underline font-poppins text-sm leading-4 font-normal'
                        onClick={() => quickCall(voicemail?.caller_operator)}
                      >
                        {voicemail?.caller_operator?.endpoints?.mainextension[0]?.id}
                      </span>
                    </div>
                    <span className='font-poppins text-xs leading-4 font-normal text-gray-600 dark:text-gray-300'>
                      {formatTimestamp(voicemail?.origtime)}
                    </span>
                    <div className='flex'>
                      <FontAwesomeIcon
                        icon={faVoicemail}
                        className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                        aria-hidden='true'
                      />
                      {voicemail?.duration && (
                        <span className='font-poppins text-xs leading-4 font-normal text-gray-600 dark:text-gray-300'>
                          {formatDuration(voicemail?.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='flex gap-2 items-start'>
                    <Button
                      variant='ghost'
                      className='border border-gray-300 dark:border-gray-500 py-2 !px-2 h-9 w-9 gap-3'
                    >
                      <FontAwesomeIcon icon={faPlay} className='h-4 w-4' />
                      <span className='sr-only'>{t('VoiceMail.Open voicemail menu')}</span>
                    </Button>
                    <Dropdown items={getVoiceMailOptionsTemplate(voicemail)} position='left'>
                      <Button variant='ghost' className='py-2 !px-2 h-9 w-9'>
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
                <div className='flex items-center px-4 py-4 sm:px-6'>
                  {/* avatar skeleton */}
                  <div className='animate-pulse rounded-full h-12 w-12 bg-gray-300 dark:bg-gray-600'></div>
                  <div className='min-w-0 flex-1 px-4'>
                    <div className='flex flex-col justify-center'>
                      {/* line skeleton */}
                      <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
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
