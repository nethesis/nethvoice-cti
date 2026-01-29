// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { TextInput, TextArea, Button } from '../common'
import { useState, useRef } from 'react'
import { closeSideDrawer } from '../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faCircleInfo, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import { MD5 } from 'crypto-js'
import { RootState } from '../../store'
import { DrawerHeader } from '../common/DrawerHeader'
import { Divider } from '../common/Divider'
import { DrawerFooter } from '../common/DrawerFooter'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'

export interface CallSummaryDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const CallSummaryDrawerContent = forwardRef<
  HTMLButtonElement,
  CallSummaryDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const [textFilter, setTextFilter] = useState('')
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [avatarBase64, setAvatarBase64]: any = useState({})
  const [errorEmptyFile, setErrorEmptyFile] = useState(false)
  const [errorUpload, setErrorUpload] = useState(false)

  // clear text filter
  const clearTextFilter = () => {
    setTextFilter('')
    textFilterRef.current.focus()
  }
  // text filter
  function changeTextFilter(event: any) {
    const newTextFilter = event.target.value
    setTextFilter(newTextFilter)
  }

  const authenticationStore = useSelector((state: RootState) => state.authentication)

  const [previewImage, setPreviewImage]: any = useState(null)

  const getGravatarImageUrl = (email: string) => {
    const hash = MD5(email.toLowerCase().trim())
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

    return gravatarUrl
  }

  const convertGravatarToBase64 = async () => {
    const email = textFilter

    try {
      const response = await fetch(getGravatarImageUrl(email))
      const blob = await response.blob()
      const reader = new FileReader()

      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        const gravatarBase64 = reader.result as string
        setAvatarBase64({ avatar: gravatarBase64 })
        setPreviewImage(gravatarBase64)
      }
    } catch (error) {
      console.error('Error', error)
      setErrorUpload(true)
    }
  }

  const prepareEditContact = async () => {
    closeSideDrawer()
  }

  return (
    <>
      <DrawerHeader title={t('Summary.Review call summary')} onClose={closeSideDrawer} />
      <div className={classNames(className, 'px-5')} {...props}>
        <Divider />
        <div className='mb-6 flex flex-col'>
          {/* Caller */}
          <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200'>
            {t('History.Caller')}
          </label>
          <TextInput
            placeholder={t('Settings.Type to insert email address') || ''}
            className='max-w-lg'
            value={textFilter}
            onChange={changeTextFilter}
            ref={textFilterRef}
            icon={textFilter.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilter()}
            trailingIcon={true}
          />

          {/* Date */}
          <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200 mt-8'>
            {t('History.Date')}
          </label>
          <TextInput
            placeholder={t('Settings.Type to insert email address') || ''}
            className='max-w-lg'
            value={textFilter}
            onChange={changeTextFilter}
            ref={textFilterRef}
            icon={textFilter.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilter()}
            trailingIcon={true}
          />

          {/* Summary */}
          <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200 mt-8 flex items-center gap-2'>
            {t('Summary.Summary')}
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-5 w-5 text-blue-700 dark:text-blue-200 cursor-auto'
              aria-hidden='true'
              data-tooltip-id='tooltip-summary-info'
              data-tooltip-content={t('Summary.Summary tooltip') || ''}
            />
            <CustomThemedTooltip id='tooltip-summary-info' place='top' />
          </label>
          <TextArea
            placeholder={t('Settings.Type to insert email address') || ''}
            className='max-w-lg'
            value={textFilter}
            onChange={changeTextFilter}
            rows={5}
          />

          <Button variant='ghost' className='mt-8 inline-flex items-center gap-2'>
            <FontAwesomeIcon icon={faAngleDown} className='h-4 w-4' />
            <span>{t('Summary.View full transcription')}</span>
          </Button>
          {/* Summary */}
          <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200 mt-8 flex items-center gap-2'>
            {t('Summary.Call')}
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-5 w-5 text-blue-700 dark:text-blue-200 cursor-auto'
              aria-hidden='true'
              data-tooltip-id='tooltip-summary-info'
              data-tooltip-content={t('Summary.Summary tooltip') || ''}
            />
            <CustomThemedTooltip id='tooltip-summary-info' place='top' />
          </label>
          <TextArea
            placeholder={t('Settings.Type to insert email address') || ''}
            className='max-w-lg'
            value={textFilter}
            onChange={changeTextFilter}
            rows={5}
          />
        </div>
        {/* Divider */}
        <Divider paddingY='pb-10 pt-6' />
        <DrawerFooter
          cancelLabel={t('Common.Cancel') || ''}
          confirmLabel={t('Settings.Save avatar')}
          onConfirm={prepareEditContact}
          confirmDisabled={isEmpty(avatarBase64)}
        />
      </div>
    </>
  )
})

CallSummaryDrawerContent.displayName = 'CallSummaryDrawerContent'
