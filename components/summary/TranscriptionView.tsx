// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useState, useCallback, useEffect } from 'react'
import { TextArea, Button, Label, InlineNotification } from '../common'
import { Skeleton } from '../common/Skeleton'
import { t } from 'i18next'
import { Divider } from '../common/Divider'
import { getTranscription } from '../../services/user'
import { closeSideDrawer } from '../../lib/utils'

interface TranscriptionViewProps {
  uniqueid: string
}

export const TranscriptionView: FC<TranscriptionViewProps> = ({ uniqueid }) => {
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
