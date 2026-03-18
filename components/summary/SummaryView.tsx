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
import { FormattedConversationTextArea } from './FormattedConversationTextArea'

const normalizeSummaryText = (value: string) =>
  value
    .split('\n')
    .map((line) => line.replace(/^\s*-\s+/, ''))
    .join('\n')

const addSpacingBetweenSpeakers = (value: string) =>
  value
    .split('\n')
    .reduce<string[]>((lines, line, index, array) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) {
        return lines
      }

      lines.push(trimmedLine)

      const nextLine = array[index + 1]?.trim()
      if (nextLine && /^([^:\n]{1,120}:)/.test(nextLine)) {
        lines.push('')
      }

      return lines
    }, [])
    .join('\n')

const formatTranscriptText = (value: string) =>
  value
    .split('\n')
    .reduce<string[]>((lines, line) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        return lines
      }

      const match = trimmedLine.match(/^([^:\n]{1,120}:)\s*(.*)$/)

      if (!match) {
        lines.push(trimmedLine)
        return lines
      }

      lines.push(match[1])
      if (match[2]) {
        lines.push(match[2])
      }
      lines.push('')

      return lines
    }, [])
    .join('\n')
    .replace(/\n+$/, '')

interface SummaryViewProps {
  uniqueid: string
}

const summaryTextareaClassName =
  'rounded-lg border-gray-200 px-4 py-3 text-[15px] leading-7 text-gray-900 shadow-none placeholder:text-gray-400 focus:ring-1 dark:border-gray-600 dark:placeholder:text-gray-500'

const compactTextareaClassName =
  'rounded-lg border-gray-200 px-4 py-3 text-[15px] leading-7 text-gray-900 shadow-none placeholder:text-gray-400 focus:ring-1 dark:border-gray-600 dark:placeholder:text-gray-500'

export const SummaryView: FC<SummaryViewProps> = ({ uniqueid }) => {
  const [summary, setSummary] = useState('')
  const [transcription, setTranscription] = useState('')
  const [showTranscription, setShowTranscription] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [transcriptionError, setTranscriptionError] = useState('')
  const [transcriptionLoaded, setTranscriptionLoaded] = useState(false)
  const [callInfo, setCallInfo] = useState<{
    src?: string
    dst?: string
    cnam?: string
    dst_cnam?: string
    call_timestamp?: string
  }>({})

  // Reset transcription state when uniqueid changes
  useEffect(() => {
    setTranscriptionLoaded(false)
    setTranscription('')
    setLoadError('')
    setSaveError('')
    setTranscriptionError('')
    setShowTranscription(false)
  }, [uniqueid])

  const applySummaryData = useCallback((data: any) => {
    const summaryText = data?.Summary || data?.summary || ''

    setCallInfo({
      src: data?.src,
      dst: data?.dst,
      cnam: data?.cnam,
      dst_cnam: data?.dst_cnam,
      call_timestamp: data?.call_timestamp,
    })

    if (!summaryText) {
      setSummary('')
      setLoadError(t('Summary.Summary unavailable') || '')
      return false
    }

    setSummary(addSpacingBetweenSpeakers(normalizeSummaryText(summaryText)))
    return true
  }, [])

  const applyTranscriptionData = useCallback((data: any) => {
    const transcriptionText = data?.transcription || data?.Transcription || ''

    if (!transcriptionText) {
      setTranscription('')
      setTranscriptionError(t('Summary.Transcription unavailable') || '')
      setTranscriptionLoaded(true)
      return false
    }

    setTranscription(formatTranscriptText(transcriptionText))
    setTranscriptionLoaded(true)
    return true
  }, [])

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const response = await getSummaryCall(uniqueid)
      if (!response || !response.data) {
        setSummary('')
        setLoadError(t('Summary.Summary unavailable') || '')
        return
      }

      const data = response.data?.data || response.data

      if (!applySummaryData(data)) {
        return
      }
    } catch (err: any) {
      setSummary('')
      setLoadError(t('Summary.Summary load failed') || '')
    } finally {
      setIsLoading(false)
    }
  }, [applySummaryData, uniqueid])

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
    setTranscriptionError('')
    try {
      const response = await getTranscription(uniqueid)
      if (response && response?.data) {
        const data = response.data?.data || response.data

        if (!applyTranscriptionData(data)) {
          return
        }
      } else {
        setTranscription('')
        setTranscriptionError(t('Summary.Transcription unavailable') || '')
        setTranscriptionLoaded(true)
      }
    } catch (err: any) {
      setTranscription('')
      setTranscriptionError(t('Summary.Transcription load failed') || '')
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
    setSaveError('')
    try {
      await updateSummary(uniqueid, summary)
      closeSideDrawer()
    } catch (err: any) {
      setSaveError(t('Summary.Summary update failed') || '')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Divider />
      <div className='flex flex-col'>
        {saveError && (
          <InlineNotification className='mt-6 border-none' type='error' title={t('Common.Error')}>
            <p>{saveError}</p>
          </InlineNotification>
        )}

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

        {/* AI Content Disclaimer */}
        <InlineNotification
          className='mt-8'
          type='info'
          title={t('Summary.AI content disclaimer title')}
        >
          <p className=''>{t('Summary.AI content disclaimer')}</p>
        </InlineNotification>

        {/* Summary */}
        <Label className='mt-8'>{t('Summary.Summary')}</Label>
        {isLoading ? (
          <Skeleton height='120px' />
        ) : loadError ? (
          <TextArea
            placeholder={t('Summary.Summary unavailable') || ''}
            value=''
            onChange={() => undefined}
            rows={4}
            readOnly
            textareaClassName={compactTextareaClassName}
          />
        ) : (
          <FormattedConversationTextArea
            placeholder={t('Summary.Summary') || ''}
            content={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={8}
            contentType='summary'
            readOnly={false}
            textareaClassName={summaryTextareaClassName}
          />
        )}

        <Button
          variant='ghost'
          className='mt-8 flex items-center gap-3 w-fit'
          onClick={handleToggleTranscription}
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={showTranscription ? faAngleUp : faAngleDown} className='h-4 w-4' />
          <span>{t('Summary.View full transcription')}</span>
        </Button>
        {showTranscription && (
          <>
            <Label className='mt-8'>{t('Summary.Call transcription')}</Label>
            {isLoadingTranscription ? (
              <Skeleton height='120px' />
            ) : transcriptionError ? (
              <>
                <TextArea
                  placeholder={t('Summary.Transcription unavailable') || ''}
                  value=''
                  onChange={() => undefined}
                  rows={8}
                  readOnly
                  textareaClassName={summaryTextareaClassName}
                />
              </>
            ) : (
              <FormattedConversationTextArea content={transcription} rows={10} />
            )}
          </>
        )}
      </div>
      <Divider paddingY='pb-10 pt-6' />
      <DrawerFooter
        cancelLabel={t('Common.Cancel') || ''}
        confirmLabel={isSaving ? t('Common.Loading') : t('Common.Save') || 'Save'}
        onConfirm={handleSave}
        confirmDisabled={Boolean(loadError) || isLoading || isSaving}
      />
    </>
  )
}
