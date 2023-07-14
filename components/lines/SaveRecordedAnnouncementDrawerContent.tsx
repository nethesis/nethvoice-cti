// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import { SideDrawerCloseIcon } from '../common'

import { useTranslation } from 'react-i18next'
import { faFloppyDisk, faCircleXmark } from '@nethesis/nethesis-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { closeSideDrawer } from '../../lib/utils'
import { TextInput, Button, Modal } from '../common'
import { enableMsg } from '../../lib/lines'
import { InlineNotification } from '../common'

export interface SaveRecordedAnnouncementDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const SaveRecordedAnnouncementDrawerContent = forwardRef<
  HTMLButtonElement,
  SaveRecordedAnnouncementDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()
  const [textFilter, setTextFilter] = useState('')
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [announcementSaveSuccess, setAnnouncementSaveSuccess] = useState<boolean>(false)
  const [announcementSaveError, setAnnouncementSaveError] = useState<boolean>(false)

  const dateRuleInformations = [
    { id: 'public', value: t('Lines.Public') },
    { id: 'private', value: t('Lines.Private') },
  ]

  const clearTextFilter = () => {
    setTextFilter('')
    textFilterRef.current.focus()
  }

  const [modalAnnouncementType, setModalAnnouncementType] = useState('private')

  function changeAnnouncementModalTypeSelected(event: any) {
    const radioButtonTypeSelected = event.target.id
    setModalAnnouncementType(radioButtonTypeSelected)
  }

  const enableAnnouncement = async () => {
    let objectEnableAnnouncement = {
      description: textFilterRef.current.value,
      privacy: modalAnnouncementType,
      tempFilename: config.recordedFilename,
    }
    try {
      await enableMsg(objectEnableAnnouncement)
      setAnnouncementSaveSuccess(true)
      setTimeout(() => {
        config.announcementSavedCallback()
      }, 500)
    } catch (error) {
      setAnnouncementSaveError(true)
      return
    }
  }

  useEffect(() => {
    return () => {
      setAnnouncementSaveSuccess(false)
      setAnnouncementSaveError(false)
    }
  }, [])

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium text-gray-700 dark:text-gray-200'>
            {config.isEdit ? t('Lines.Save recording') : 'Salva registrazione'}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'p-5')} {...props}>
        {/* announcement name */}
        <div className='flex flex-col'>
          <h4 className='text-md font-medium text-gray-700 dark:text-gray-200 mb-3'>
            {t('Lines.Announcement name')}
          </h4>
          <TextInput
            placeholder={t('Lines.Insert announcement name') || ''}
            defaultValue={textFilter}
            ref={textFilterRef}
            icon={textFilter.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilter()}
            trailingIcon={true}
          />
        </div>
        {/* Privacy name section */}
        <div className='flex items-center justify-between mt-8'>
          <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Privacy')}
          </h4>
        </div>
        {/* Radio button for privacy selection */}
        <fieldset className='mt-2'>
          <legend className='sr-only'>Announcement type</legend>
          <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
            {dateRuleInformations.map((dateRuleInformation) => (
              <div key={dateRuleInformation.id} className='flex items-center justify-between mt-1'>
                <div className='flex items-center'>
                  <input
                    id={dateRuleInformation.id}
                    name='date-select'
                    type='radio'
                    defaultChecked={dateRuleInformation.id === 'private'}
                    className={`h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:focus:ring-primaryDark ${
                      modalAnnouncementType === dateRuleInformation.id
                        ? 'dark:bg-primaryLight dark:text-primary dark:border-gray-600'
                        : 'dark:bg-gray-700 dark:text-white dark:border-gray-600'
                    }`}
                    onChange={changeAnnouncementModalTypeSelected}
                  />
                  <label
                    htmlFor={dateRuleInformation.id}
                    className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                  >
                    {dateRuleInformation.value}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <div className='flex mt-7'>
          <>
            <Button variant='primary' type='submit' onClick={enableAnnouncement} className='mb-4'>
              <FontAwesomeIcon icon={faFloppyDisk} className='mr-2 h-4 w-4' />
              {t('Common.Save')}
            </Button>
            <Button variant='white' type='submit' onClick={closeSideDrawer} className='ml-4 mb-4'>
              {t('Common.Cancel')}
            </Button>
          </>
        </div>

        {announcementSaveSuccess && (
          <InlineNotification
            type='success'
            title={`${t('Lines.Announcement successfully saved')}!`}
          ></InlineNotification>
        )}
        {announcementSaveError && (
          <InlineNotification
            type='error'
            title={`${t('Lines.Error saving the announcement')}!`}
          ></InlineNotification>
        )}
      </div>
    </>
  )
})

SaveRecordedAnnouncementDrawerContent.displayName = 'SaveRecordedAnnouncementDrawerContent'
