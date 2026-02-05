// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useState, useCallback, useEffect } from 'react'
import { TextInput, TextArea, Button } from '../common'
import { Skeleton } from '../common/Skeleton'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Divider } from '../common/Divider'
import { getTranscription } from '../../services/user'
import { format, parseISO } from 'date-fns'
import { closeSideDrawer } from '../../lib/utils'

interface TranscriptionViewProps {
  uniqueid: string
}

export const TranscriptionView: FC<TranscriptionViewProps> = ({ uniqueid }) => {
  const [date, setDate] = useState('')
  const [transcription, setTranscription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadTranscription = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getTranscription(uniqueid)
      console.log('Transcription data:', response)
      if (response && response.data) {
        setTranscription(response.data.transcription || '')

        // Get date from response
        if (response.data.created_at) {
          const parsedDate = parseISO(response.data.created_at)
          const formattedDate = format(parsedDate, 'dd MMM yyyy HH:mm')
          setDate(formattedDate)
        }
      } else {
        setError('Transcription not found')
      }
    } catch (err: any) {
      console.error('Error loading transcription:', err)
      setError('Failed to load transcription')
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
      {error ? (
        <div className='mb-6 flex flex-col mt-8'>
          <p className='text-sm text-red-500'>{error}</p>
        </div>
      ) : (
        <div className='mb-6 flex flex-col'>
          {/* Date */}
          <label className='text-sm mb-2 font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark mt-8'>
            {t('History.Date')}
          </label>
          {isLoading ? (
            <Skeleton height='40px' className='max-w-lg' />
          ) : (
            <TextInput
              placeholder={t('History.Date') || ''}
              className='max-w-lg'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              icon={faCalendar}
              readOnly
            />
          )}

          {/* Transcription */}
          <label className='text-sm mb-2 font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark mt-8'>
            {t('Summary.Call transcription')}
          </label>
          {isLoading ? (
            <Skeleton height='400px' className='max-w-lg' />
          ) : (
            <TextArea
              placeholder={t('Summary.Call transcription') || ''}
              className='max-w-lg'
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              rows={11}
              readOnly
            />
          )}
        </div>
      )}
      <Divider paddingY='pb-10 pt-6' />
      <div className='flex justify-end'>
        <Button variant='primary' onClick={closeSideDrawer}>
          {t('Common.Close')}
        </Button>
      </div>
    </>
  )
}
