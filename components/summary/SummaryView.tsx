// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useState, useCallback, useEffect } from 'react'
import { TextInput, TextArea, Button } from '../common'
import { Skeleton } from '../common/Skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faAngleDown, faAngleUp, faCalendar } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { isEmpty } from 'lodash'
import { Divider } from '../common/Divider'
import { DrawerFooter } from '../common/DrawerFooter'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { getSummaryCall, getTranscription, updateSummary } from '../../services/user'
import { format, parseISO } from 'date-fns'
import { closeSideDrawer } from '../../lib/utils'

interface SummaryViewProps {
  uniqueid: string
}

export const SummaryView: FC<SummaryViewProps> = ({ uniqueid }) => {
  const [date, setDate] = useState('')
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

      if (data.CreatedAt) {
        const parsedDate = parseISO(data.CreatedAt)
        const formattedDate = format(parsedDate, 'dd MMM yyyy HH:mm')
        setDate(formattedDate)
      } else {
        setDate('')
      }
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

          {/* Summary */}
          <label className='text-sm mb-2 font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark mt-8 flex items-center gap-2'>
            {t('Summary.Summary')}
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-4 w-4 text-iconInfo dark:text-iconInfoDark cursor-auto'
              aria-hidden='true'
              data-tooltip-id='tooltip-summary-info'
              data-tooltip-content={t('Summary.Summary tooltip') || ''}
            />
            <CustomThemedTooltip id='tooltip-summary-info' place='top' />
          </label>
          {isLoading ? (
            <Skeleton height='120px' className='max-w-lg' />
          ) : (
            <TextArea
              placeholder={t('Summary.Summary') || ''}
              className='max-w-lg'
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={8}
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
              <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200 mt-8 flex items-center gap-2'>
                {t('Summary.Call')}
              </label>
              {isLoadingTranscription ? (
                <Skeleton height='120px' className='max-w-lg' />
              ) : (
                <TextArea
                  placeholder={t('Summary.Call') || ''}
                  className='max-w-lg'
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  rows={8}
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
