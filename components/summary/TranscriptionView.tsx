// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useState, useCallback, useEffect } from 'react'
import { TextArea, Button, Label, InlineNotification } from '../common'
import { Skeleton } from '../common/Skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faCalendar } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Divider } from '../common/Divider'
import { getTranscription } from '../../services/user'
import { closeSideDrawer } from '../../lib/utils'
import { formatDateLoc } from '../../lib/dateTime'

interface TranscriptionViewProps {
  uniqueid: string
}

export const TranscriptionView: FC<TranscriptionViewProps> = ({ uniqueid }) => {
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [callInfo, setCallInfo] = useState<{
    src?: string
    dst?: string
    cnam?: string
    dst_cnam?: string
    call_timestamp?: string
  }>({})

  const loadTranscription = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getTranscription(uniqueid)
      if (response && response.data) {
        const data = response.data?.data || response.data
        const transcriptionText = data?.transcription || data?.Transcription || ''

        setCallInfo({
          src: data?.src,
          dst: data?.dst,
          cnam: data?.cnam,
          dst_cnam: data?.dst_cnam,
          call_timestamp: data?.call_timestamp,
        })

        if (!transcriptionText) {
          setTranscription('')
          setError(t('Summary.Transcription unavailable') || '')
          return
        }

        setTranscription(transcriptionText)
      } else {
        setTranscription('')
        setError(t('Summary.Transcription unavailable') || '')
      }
    } catch (err: any) {
      setTranscription('')
      setError(t('Summary.Transcription load failed') || '')
    } finally {
      setIsLoading(false)
    }
  }, [uniqueid])

  useEffect(() => {
    if (uniqueid) {
      loadTranscription()
    }
  }, [uniqueid, loadTranscription])

  return (
    <>
      <Divider />
      <div className='mb-6 flex flex-col'>
        {/* Call Information Section */}
        <div className='mt-6 flex flex-col gap-4'>
          {/* Source */}
          <div className='flex items-start gap-8 w-full'>
            <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
              {t('History.Source')}
            </div>
            {isLoading ? (
              <div className='flex items-start gap-2 flex-1'>
                <Skeleton
                  variant='rectangular'
                  width={16}
                  height={16}
                  className='mt-0.5 shrink-0'
                />
                <div className='flex flex-col gap-1 flex-1'>
                  <Skeleton width={128} />
                  <Skeleton width={80} />
                </div>
              </div>
            ) : callInfo.src ? (
              <div className='flex items-start gap-2 shrink-0'>
                <FontAwesomeIcon
                  icon={faPhone}
                  className='mt-0.5 h-4 w-4 shrink-0 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                />
                <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                  <div>{callInfo.cnam || callInfo.src}</div>
                  {callInfo.cnam && (
                    <div className='text-primaryActive dark:text-primaryActiveDark'>
                      {callInfo.src}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>-</div>
            )}
          </div>

          {/* Destination */}
          <div className='flex items-start gap-8 w-full'>
            <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
              {t('History.Destination')}
            </div>
            {isLoading ? (
              <div className='flex items-start gap-2 flex-1'>
                <Skeleton
                  variant='rectangular'
                  width={16}
                  height={16}
                  className='mt-0.5 shrink-0'
                />
                <div className='flex flex-col gap-1 flex-1'>
                  <Skeleton width={128} />
                  <Skeleton width={80} />
                </div>
              </div>
            ) : callInfo.dst ? (
              <div className='flex items-start gap-2 shrink-0'>
                <FontAwesomeIcon
                  icon={faPhone}
                  className='mt-0.5 h-4 w-4 shrink-0 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                />
                <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                  <div>{callInfo.dst_cnam || callInfo.dst}</div>
                  {callInfo.dst_cnam && (
                    <div className='text-primaryActive dark:text-primaryActiveDark'>
                      {callInfo.dst}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>-</div>
            )}
          </div>

          {/* Date */}
          <div className='flex items-start gap-8 w-full'>
            <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
              {t('History.Date')}
            </div>
            {isLoading ? (
              <div className='flex items-start gap-2 flex-1'>
                <Skeleton
                  variant='rectangular'
                  width={16}
                  height={16}
                  className='mt-0.5 shrink-0'
                />
                <Skeleton width={160} />
              </div>
            ) : callInfo.call_timestamp ? (
              <div className='flex items-start gap-2 shrink-0'>
                <FontAwesomeIcon
                  icon={faCalendar}
                  className='mt-0.5 h-4 w-4 shrink-0 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                />
                <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                  {formatDateLoc(new Date(callInfo.call_timestamp!), 'dd MMM yyyy HH:mm')}
                </div>
              </div>
            ) : (
              <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>-</div>
            )}
          </div>
        </div>

        {/* Transcription Disclaimer */}
        <InlineNotification
          className='mt-6 border-none'
          type='info'
          title={t('Summary.Transcription disclaimer title')}
        >
          <p className=''>{t('Summary.Transcription disclaimer')}</p>
        </InlineNotification>

        {/* Transcription */}
        <Label className='mt-8'>{t('Summary.Call transcription')}</Label>
        {isLoading ? (
          <Skeleton height='400px' />
        ) : error ? (
          <TextArea
            placeholder={t('Summary.Transcription unavailable') || ''}
            value=''
            onChange={() => undefined}
            rows={8}
            readOnly
          />
        ) : (
          <TextArea
            placeholder={t('Summary.Call transcription') || ''}
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            rows={8}
            readOnly
          />
        )}
      </div>
      <Divider paddingY='pb-10 pt-6' />
      <div className='flex justify-end'>
        <Button variant='primary' onClick={closeSideDrawer}>
          {t('Common.Close')}
        </Button>
      </div>
    </>
  )
}
