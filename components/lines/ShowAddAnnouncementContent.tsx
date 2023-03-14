// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import { InlineNotification, SideDrawerCloseIcon, IconSwitch } from '../common'

import { useSSR, useTranslation } from 'react-i18next'
import {
  faPhone,
  faToggleLargeOff,
  faToggleLargeOn,
  faBullhorn,
  faVoicemail,
  faArrowTurnDownRight,
  faFloppyDisk,
  faChevronRight,
  faChevronDown,
  faCalendar,
  faCircleXmark,
} from '@nethesis/nethesis-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { callPhoneNumber, closeSideDrawer } from '../../lib/utils'
import { TextInput, Button } from '../common'
import { cloneDeep, isEmpty } from 'lodash'

export interface ShowAddAnnouncementContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowAddAnnouncementDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowAddAnnouncementContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')
  const [isAnnouncementUploaded, setAnnounceUploaded] = useState(false)
  const [textFilter, setTextFilter] = useState('')
  const [selectedType, setSelectedType] = useState('private')
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const dateRuleInformations = [
    { id: 'public', value: t('Lines.Public') },
    { id: 'private', value: t('Lines.Private') },
  ]

  function saveEditTelephoneLines() {
    // TO DO POST API
  }

  function changeTextFilter(event: any) {
    const newTextFilter = event.target.value
    setTextFilter(newTextFilter)
  }

  const clearTextFilter = () => {
    setTextFilter('')
    textFilterRef.current.focus()
  }

  function changeTypeSelected(event: any) {
    const radioButtonTypeSelected = event.target.id
    setSelectedType(radioButtonTypeSelected)
  }

  //Get value from date input
  const dateBeginRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const dateEndRef = useRef() as React.MutableRefObject<HTMLInputElement>

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Line details')}
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
            placeholder={t('Lines.Filter announcement') || ''}
            className='max-w-sm'
            value={textFilter}
            onChange={changeTextFilter}
            ref={textFilterRef}
            icon={textFilter.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilter()}
            trailingIcon={true}
          />
        </div>
        <div className='flex items-center justify-between mt-8'>
          <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Privacy')}
          </h4>
        </div>
        <fieldset className='mt-2'>
          <legend className='sr-only'>Announcement type</legend>
          <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
            {dateRuleInformations.map((dateRuleInformation) => (
              <>
                <div
                  key={dateRuleInformation.id}
                  className='flex items-center justify-between mt-1'
                >
                  <div className='flex items-center'>
                    <input
                      id={dateRuleInformation.id}
                      name='date-select'
                      type='radio'
                      defaultChecked={dateRuleInformation.id === 'private'}
                      className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                      onChange={changeTypeSelected}
                    />
                    <label
                      htmlFor={dateRuleInformation.id}
                      className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                    >
                      {dateRuleInformation.value}
                    </label>
                  </div>
                </div>
              </>
            ))}
          </div>
        </fieldset>

        {/* skeleton */}
        {/* {!isLoaded && !errorMessage && (
          <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
            {Array.from(Array(3)).map((e, index) => (
              <li key={index} className='py-4 px-5'>
                <div className='animate-pulse h-5 rounded mb-6 bg-gray-300 dark:bg-gray-600'></div>
                <div className='animate-pulse h-5 max-w-[75%] rounded bg-gray-300 dark:bg-gray-600'></div>
              </li>
            ))}
          </ul>
        )} */}
        <div className='flex mt-4 fixed bottom-0'>
          <Button
            variant={isAnnouncementUploaded ? 'primary' : 'disabled'}
            type='submit'
            onClick={saveEditTelephoneLines}
            className='mb-4'
          >
            <FontAwesomeIcon icon={faFloppyDisk} className='mr-2 h-4 w-4' />
            {t('Common.Save')}
          </Button>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='ml-4 mb-4'>
            {t('Common.Cancel')}
          </Button>
        </div>
      </div>
    </>
  )
})

ShowAddAnnouncementDrawerContent.displayName = 'ShowAddAnnouncementDrawerContent'
