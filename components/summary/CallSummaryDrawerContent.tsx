// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect } from 'react'
import classNames from 'classnames'
import { TextInput, TextArea, Button } from '../common'
import { useState, useRef } from 'react'
import { closeSideDrawer } from '../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
  faCircleInfo,
  faAngleDown,
  faAngleUp,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { isEmpty } from 'lodash'
import { DrawerHeader } from '../common/DrawerHeader'
import { Divider } from '../common/Divider'
import { DrawerFooter } from '../common/DrawerFooter'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { getSummaryCall } from '../../services/user'
import { format, parseISO } from 'date-fns'

export interface CallSummaryDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const CallSummaryDrawerContent = forwardRef<
  HTMLButtonElement,
  CallSummaryDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const [caller, setCaller] = useState('')
  const [date, setDate] = useState('')
  const [summary, setSummary] = useState('')
  const [transcription, setTranscription] = useState('')
  const [showTranscription, setShowTranscription] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isSummary = config?.isSummary || false

  useEffect(() => {
    if (isSummary && config?.uniqueid) {
      loadSummary()
    }
  }, [config?.uniqueid, isSummary])

  const loadSummary = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getSummaryCall(config?.uniqueid)
      console.log('Summary data:', response)
      if (!response || !response.data) {
        setError('Summary not found')
        return
      }
      const data = response.data
      setSummary(data.Summary || '')
      setTranscription(data.Transcription || '')

      // Format date as "24 Jul 2025 17:20"
      if (data.CreatedAt) {
        const parsedDate = parseISO(data.CreatedAt)
        const formattedDate = format(parsedDate, 'dd MMM yyyy HH:mm')
        setDate(formattedDate)
      } else {
        setDate('')
      }

      setCaller('')
    } catch (err: any) {
      console.error('Error loading summary:', err)
      setError('Failed to load summary')
    } finally {
      setIsLoading(false)
    }
  }

  const prepareEditContact = async () => {
    closeSideDrawer()
  }

  const drawerTitle = isSummary
    ? t('Summary.Call summary') || 'Call summary'
    : t('Summary.Call transcription') || 'Call transcription'

  return (
    <>
      <DrawerHeader title={drawerTitle} onClose={closeSideDrawer} />
      <div className={classNames(className, 'px-5')} {...props}>
        <Divider />
        {isLoading ? (
          <div className='mb-6 flex flex-col'>
            <p className='text-sm text-gray-500 dark:text-gray-400'>{t('Common.Loading')}</p>
          </div>
        ) : error ? (
          <div className='mb-6 flex flex-col'>
            <p className='text-sm text-red-500'>{error}</p>
          </div>
        ) : (
          <div className='mb-6 flex flex-col'>
            {/* Date */}
            <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200 mt-8'>
              {t('History.Date')}
            </label>
            <TextInput
              placeholder={t('History.Date') || ''}
              className='max-w-lg'
              value={date}
              onChange={(e) => setDate(e.target.value)}
              icon={faCalendar}
              readOnly
            />

            {/* Summary */}
            <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200 mt-8 flex items-center gap-2'>
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
            <TextArea
              placeholder={t('Summary.Summary') || ''}
              className='max-w-lg'
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={5}
            />

            <Button
              variant='ghost'
              className='mt-8 flex items-center gap-2 w-fit'
              onClick={() => setShowTranscription(!showTranscription)}
            >
              <FontAwesomeIcon
                icon={showTranscription ? faAngleUp : faAngleDown}
                className='h-4 w-4'
              />
              <span>{t('Summary.View full transcription')}</span>
            </Button>
            {showTranscription && (
              <>
                {/* Transcription */}
                <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200 mt-8 flex items-center gap-2'>
                  {t('Summary.Call')}
                </label>
                <TextArea
                  placeholder={t('Summary.Call') || ''}
                  className='max-w-lg'
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  rows={5}
                  readOnly
                />
              </>
            )}
          </div>
        )}
        {/* Divider */}
        <Divider paddingY='pb-10 pt-6' />
        <DrawerFooter
          cancelLabel={t('Common.Cancel') || ''}
          confirmLabel={t('Common.Save') || 'Save'}
          onConfirm={prepareEditContact}
          confirmDisabled={isEmpty(summary)}
        />
      </div>
    </>
  )
})

CallSummaryDrawerContent.displayName = 'CallSummaryDrawerContent'
