// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import { SideDrawerCloseIcon } from '../common'

import { useTranslation } from 'react-i18next'
import { faCircleXmark, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { closeSideDrawer } from '../../lib/utils'
import { TextInput, Button, Modal } from '../common'
import { enableMsg } from '../../lib/lines'
import { InlineNotification } from '../common'
import { store } from '../../store'

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
      description: textFilter,
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
    store.dispatch.sideDrawer.setAvoidClose(false)
  }

  useEffect(() => {
    return () => {
      setAnnouncementSaveSuccess(false)
      setAnnouncementSaveError(false)
    }
  }, [])

  const closeSideDrawerAnnouncement = () => {
    store.dispatch.sideDrawer.setAvoidClose(false)

    closeSideDrawer()
  }

  return (
    <>
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Save recording')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'px-5')} {...props}>
        {/* Divider */}
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        {/* announcement name */}
        <div className='flex flex-col'>
          <h4 className='text-base font-medium text-gray-700 dark:text-gray-200 mb-3'>
            {t('Lines.Announcement name')}
          </h4>
          <TextInput
            placeholder={t('Lines.Insert announcement name') || ''}
            defaultValue={textFilter}
            ref={textFilterRef}
            icon={textFilter.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilter()}
            trailingIcon={true}
            onChange={(e) => setTextFilter(e.currentTarget.value)}
          />
        </div>
        {/* Privacy name section */}
        <div className='flex items-center justify-between mt-8'>
          <h4 className='text-base font-medium text-gray-700 dark:text-gray-200'>
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
                    className={`h-4 w-4 border-gray-300 text-primary dark:text-primaryDark focus:ring-primaryLight dark:focus:ring-primaryDark ${
                      modalAnnouncementType === dateRuleInformation.id
                        ? 'dark:bg-primaryLight dark:text-primaryDark dark:border-gray-600'
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

        {/* Divider */}
        <div className='relative pb-10 pt-6'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        {/* Footer section */}
        <div className='flex justify-end'>
          <>
            <Button
              variant='white'
              type='submit'
              onClick={() => closeSideDrawerAnnouncement()}
              className='mb-4'
            >
              {t('Common.Cancel')}
            </Button>
            <Button
              variant='primary'
              type='submit'
              onClick={enableAnnouncement}
              className='ml-4 mb-4'
              disabled={textFilter ? false : true}
            >
              <FontAwesomeIcon icon={faFloppyDisk} className='mr-2 h-4 w-4' />
              {t('Common.Save')}
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
