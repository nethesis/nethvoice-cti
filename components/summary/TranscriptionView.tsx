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
import { parse } from 'date-fns'

interface CallParty {
  name?: string
  company?: string
  number?: string
}

interface TranscriptionViewProps {
  uniqueid: string
  source?: CallParty
  destination?: CallParty
  date?: string
}

export const TranscriptionView: FC<TranscriptionViewProps> = ({
  uniqueid,
  source,
  destination,
  date,
}) => {
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadTranscription = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getTranscription(uniqueid)
      if (response && response.data) {
        const data = response.data?.data || response.data
        const transcriptionText = data?.transcription || data?.Transcription || ''

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

  const formatCallDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const numericDate = Number(dateString)

      if (!Number.isNaN(numericDate)) {
        const timestamp = `${dateString}`.length <= 10 ? numericDate * 1000 : numericDate
        return formatDateLoc(new Date(timestamp), 'dd MMM yyyy HH:mm')
      }

      const parsedDate = parse(dateString, 'yyyyMMdd-HHmmss', new Date())
      return formatDateLoc(parsedDate, 'dd MMM yyyy HH:mm')
    } catch (e) {
      return dateString
    }
  }

  const getSourceDisplayName = () => {
    if (!source) return ''
    return source.name || source.company || source.number || ''
  }

  const getDestinationDisplayName = () => {
    if (!destination) return ''
    return destination.name || destination.company || destination.number || ''
  }

  return (
    <>
      <Divider />
      <div className='mb-6 flex flex-col'>
          {(source || destination || date) && (
            <div className='mt-6 flex flex-col gap-4'>
              {source && (
                <div className='flex items-start gap-8 w-full'>
                  <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
                    {t('History.Source')}
                  </div>
                  <div className='flex items-start gap-2 shrink-0'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mt-0.5 h-4 w-4 shrink-0 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                    />
                    <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      <div>{getSourceDisplayName()}</div>
                      {source.number && (source.name || source.company) && (
                        <div className='text-primaryActive dark:text-primaryActiveDark'>
                          {source.number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {destination && (
                <div className='flex items-start gap-8 w-full'>
                  <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
                    {t('History.Destination')}
                  </div>
                  <div className='flex items-start gap-2 shrink-0'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mt-0.5 h-4 w-4 shrink-0 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                    />
                    <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      <div>{getDestinationDisplayName()}</div>
                      {destination.number && (destination.name || destination.company) && (
                        <div className='text-primaryActive dark:text-primaryActiveDark'>
                          {destination.number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {date && (
                <div className='flex items-start gap-8 w-full'>
                  <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
                    {t('History.Date')}
                  </div>
                  <div className='flex items-start gap-2 shrink-0'>
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className='mt-0.5 h-4 w-4 shrink-0 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                    />
                    <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      {formatCallDate(date)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
