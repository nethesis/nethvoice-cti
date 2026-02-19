// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useState, useCallback, useEffect } from 'react'
import { TextArea, Button, Label, InlineNotification } from '../common'
import { Skeleton } from '../common/Skeleton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown, faAngleUp, faPhone, faCalendar } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Divider } from '../common/Divider'
import { DrawerFooter } from '../common/DrawerFooter'
import { getSummaryCall, getTranscription, updateSummary } from '../../services/user'
import { closeSideDrawer } from '../../lib/utils'
import { formatDateLoc } from '../../lib/dateTime'
import { parse } from 'date-fns'

interface CallParty {
  name?: string
  company?: string
  number?: string
}

interface SummaryViewProps {
  uniqueid: string
  source?: CallParty
  destination?: CallParty
  date?: string
}

export const SummaryView: FC<SummaryViewProps> = ({
  uniqueid,
  source,
  destination,
  date,
}) => {
  const [summary, setSummary] = useState('')
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
    setIsSaving(true)
    setError('')
    try {
      await updateSummary(uniqueid, summary)
      closeSideDrawer()
    } catch (err: any) {
      setError('Failed to update summary')
    } finally {
      setIsSaving(false)
    }
  }

  // Format the date if available
  const formatCallDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      // Parse the date string (format: yyyyMMdd-HHmmss)
      const parsedDate = parse(dateString, 'yyyyMMdd-HHmmss', new Date())
      return formatDateLoc(parsedDate, 'dd MMM yyyy HH:mm')
    } catch (e) {
      return dateString
    }
  }

  // Get display text for source
  const getSourceDisplayName = () => {
    if (!source) return ''
    return source.name || source.company || source.number || ''
  }

  // Get display text for destination
  const getDestinationDisplayName = () => {
    if (!destination) return ''
    return destination.name || destination.company || destination.number || ''
  }

  return (
    <>
      <Divider />
      {error ? (
        <div className='mb-6 flex flex-col mt-8'>
          <p className='text-sm text-red-500'>{error}</p>
        </div>
      ) : (
        <div className='flex flex-col'>
          {/* Call Information Section */}
          {(source || destination || date) && (
            <div className='mt-6 flex flex-col gap-4'>
              {/* Source */}
              {source && (
                <div className='flex items-start gap-8 w-full'>
                  <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
                    {t('History.Source')}
                  </div>
                  <div className='flex items-start gap-2 shrink-0'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='h-4 w-4 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                    />
                    <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      <div>{getSourceDisplayName()}</div>
                      {source.number && (source.name || source.company) && (
                        <div className='text-emerald-700 dark:text-emerald-500'>
                          {source.number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Destination */}
              {destination && (
                <div className='flex items-start gap-8 w-full'>
                  <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
                    {t('History.Destination')}
                  </div>
                  <div className='flex items-start gap-2 shrink-0'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='h-4 w-4 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                    />
                    <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      <div>{getDestinationDisplayName()}</div>
                      {destination.number && (destination.name || destination.company) && (
                        <div className='text-emerald-700 dark:text-emerald-500'>
                          {destination.number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Date */}
              {date && (
                <div className='flex items-start gap-8 w-full'>
                  <div className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark w-[90px] shrink-0'>
                    {t('History.Date')}
                  </div>
                  <div className='flex items-start gap-2 shrink-0'>
                    <FontAwesomeIcon
                      icon={faCalendar}
                      className='h-4 w-4 text-tertiaryNeutral dark:text-tertiaryNeutralDark'
                    />
                    <div className='text-sm text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      {formatCallDate(date)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Content Disclaimer */}
          <InlineNotification
            className='mt-8 border-none'
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
      />
    </>
  )
}
