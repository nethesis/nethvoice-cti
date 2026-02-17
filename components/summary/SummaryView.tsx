// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useState, useCallback, useEffect } from 'react'
import { TextArea, Button, Label, InlineNotification } from '../common'
import { Skeleton } from '../common/Skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { isEmpty } from 'lodash'
import { Divider } from '../common/Divider'
import { DrawerFooter } from '../common/DrawerFooter'
import { getSummaryCall, getTranscription, updateSummary } from '../../services/user'
import { closeSideDrawer } from '../../lib/utils'

interface SummaryViewProps {
  uniqueid: string
}

export const SummaryView: FC<SummaryViewProps> = ({ uniqueid }) => {
  const [summary, setSummary] = useState('')
  const [originalSummary, setOriginalSummary] = useState('')
  const [transcription, setTranscription] = useState('')
  const [showTranscription, setShowTranscription] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [transcriptionLoaded, setTranscriptionLoaded] = useState(false)

  // Reset transcription state when uniqueid changes
  useEffect(() => {
    setTranscriptionLoaded(false)
    setTranscription('')
    setShowTranscription(false)
  }, [uniqueid])

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getSummaryCall(uniqueid)
      console.log('Summary data:', response)
      if (!response || !response.data) {
        setError('Summary not found')
        return
      }
      const data = response.data
      const summaryText = data.Summary || ''
      setSummary(summaryText)
      setOriginalSummary(summaryText)
    } catch (err: any) {
      console.error('Error loading summary:', err)
      setError('Failed to load summary')
    } finally {
      setIsLoading(false)
    }
  }, [uniqueid])

  useEffect(() => {
    if (uniqueid) {
      loadSummary()
    }
  }, [uniqueid, loadSummary])

  const loadTranscription = async () => {
    if (transcriptionLoaded || isLoadingTranscription) {
      return
    }

    setIsLoadingTranscription(true)
    try {
      const response = await getTranscription(uniqueid)
      if (response && response.data) {
        setTranscription(response.data.transcription || '')
        setTranscriptionLoaded(true)
      } else {
        setTranscription('Transcription not available')
        setTranscriptionLoaded(true)
      }
    } catch (err: any) {
      setTranscription('Failed to load transcription')
      setTranscriptionLoaded(true)
    } finally {
      setIsLoadingTranscription(false)
    }
  }

  const handleToggleTranscription = () => {
    const newShowState = !showTranscription
    setShowTranscription(newShowState)

    // Load transcription when expanding for the first time
    if (newShowState && !transcriptionLoaded) {
      loadTranscription()
    }
  }

  const handleSave = async () => {
    if (isEmpty(summary) || summary === originalSummary || isSaving) {
      return
    }

    setIsSaving(true)
    setError('')
    try {
      await updateSummary(uniqueid, summary)
      console.log('Summary updated successfully')
      setOriginalSummary(summary)
      closeSideDrawer()
    } catch (err: any) {
      console.error('Error updating summary:', err)
      setError('Failed to update summary')
    } finally {
      setIsSaving(false)
    }
  }

  const isSummaryModified = summary !== originalSummary && !isEmpty(summary)

  return (
    <>
      <Divider />
      {error ? (
        <div className='mb-6 flex flex-col mt-8'>
          <p className='text-sm text-red-500'>{error}</p>
        </div>
      ) : (
        <div className='flex flex-col'>
          {/* AI Content Disclaimer */}
          <InlineNotification
            className='mt-6 border-none'
            type='info'
            title={t('Summary.AI content disclaimer title')}
          >
            <p className=''>{t('Summary.AI content disclaimer')}</p>
          </InlineNotification>
          {/* Summary */}
          <Label className='mt-8'>{t('Summary.Summary')}</Label>
          {isLoading ? (
            <Skeleton height='120px' />
          ) : (
            <TextArea
              placeholder={t('Summary.Summary') || ''}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={10}
            />
          )}

          <Button
            variant='ghost'
            className='mt-8 flex items-center gap-2 w-fit'
            onClick={handleToggleTranscription}
            disabled={isLoading}
          >
            <FontAwesomeIcon
              icon={showTranscription ? faAngleUp : faAngleDown}
              className='h-4 w-4'
            />
            <span>{t('Summary.View full transcription')}</span>
          </Button>
          {showTranscription && (
            <>
              <Label className='mt-8'>{t('Summary.Call transcription')}</Label>
              {isLoadingTranscription ? (
                <Skeleton height='120px' />
              ) : (
                <TextArea
                  placeholder={t('Summary.Call transcription') || ''}
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  rows={10}
                  readOnly
                />
              )}
            </>
          )}
        </div>
      )}
      <Divider paddingY='pb-10 pt-6' />
      <DrawerFooter
        cancelLabel={t('Common.Cancel') || ''}
        confirmLabel={isSaving ? t('Common.Loading') : t('Common.Save') || 'Save'}
        onConfirm={handleSave}
        confirmDisabled={!isSummaryModified || isSaving || isLoading}
      />
    </>
  )
}
