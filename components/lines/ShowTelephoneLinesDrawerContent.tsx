// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import { InlineNotification, SideDrawerCloseIcon, IconSwitch } from '../common'

import { useTranslation } from 'react-i18next'
import {
  faPhone,
  faToggleLargeOff,
  faToggleLargeOn,
  faBullhorn,
  faVoicemail,
  faArrowTurnDownRight,
  faFloppyDisk,
  faChevronDown,
  faChevronUp,
  faCalendar,
} from '@nethesis/nethesis-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { callPhoneNumber, closeSideDrawer } from '../../lib/utils'
import { TextInput, Button } from '../common'
import { cloneDeep, isEmpty } from 'lodash'

export interface ShowTelephoneLinesDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowTelephoneLinesDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowTelephoneLinesDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')
  const [isConfigurationActive, setConfigurationActive] = useState(false)
  const [isAnnouncementVoicemailActive, setAnnouncementVoicemailActive] = useState(false)
  const [isForwardActive, setForwardActive] = useState(false)
  const [changeConfigurationRadio, setChangeConfigurationRadio] = useState('customize')
  const [isManageAnnouncementActive, setManageAnnouncementActive] = useState(true)
  const [announcementSelected, setAnnouncementSelected] = useState('')
  const [dateBeginValue, setDateBeginValue] = useState('')
  const [dateEndValue, setDateEndValue] = useState('')
  const [selectedRulesInfo, setSelectedRulesInfo] = useState('ferie')
  const [selectedType, setSelectedType] = useState('specifyDay')

  const [openPanel, setOpenPanel] = useState('')

  const togglePanel = (id: string) => {
    setOpenPanel(openPanel === id ? '' : id)
  }

  const configurationType = [
    { id: 'customize', value: t('Lines.Customize') },
    { id: 'rule', value: t('Lines.Choose rule') },
  ]

  const announcementLists = [
    { id: 'firstAnnouncement', value: 'firstAnnouncement' },
    { id: 'secondAnnouncement', value: 'secondAnnouncement' },
    { id: 'thirdAnnouncement', value: 'thirdAnnouncement' },
  ]

  const dateSelectionInputs = [
    { id: 'specifyDay', value: t('Lines.Specify start date and end date') },
    { id: 'onlyOneDay', value: t('Lines.Only active for one day') },
    { id: 'everyDay', value: t('Lines.Active every day') },
  ]

  const dateRuleInformations = [
    { id: 'febbraio', value: 'Febbraio 2023' },
    { id: 'ferie', value: 'Ferie' },
    { id: 'natale', value: 'Natale' },
  ]

  function changeDateSelected(event: any) {
    const radioButtonDateSelected = event.target.id
    setSelectedRulesInfo(radioButtonDateSelected)
  }

  const toggleConfigurationActive = () => {
    setConfigurationActive(!isConfigurationActive)
  }

  const toggleManageAnnouncement = () => {
    setManageAnnouncementActive(!isManageAnnouncementActive)
  }

  const toggleAnnouncementVoicemail = () => {
    setAnnouncementVoicemailActive(!isAnnouncementVoicemailActive)
  }

  const toggleForward = () => {
    setForwardActive(!isForwardActive)
  }

  const changeDateBegin = () => {
    //Get the date from the input
    const dateBegin = dateBeginRef.current.value
    setDateBeginValue(dateBegin)
  }

  const changeDateEnd = () => {
    //Get the date from the input
    const dateEnd = dateEndRef.current.value
    setDateEndValue(dateEnd)
  }

  function changeAnnouncementSelect(event: any) {
    const listAnnouncementValue = event.target.id
    setAnnouncementSelected(listAnnouncementValue)
  }

  function changeConfiguration(event: any) {
    const radioButtonConfigurationValue = event.target.id
    setChangeConfigurationRadio(radioButtonConfigurationValue)
  }

  function changeTypeSelected(event: any) {
    const radioButtonTypeSelected = event.target.id
    setSelectedType(radioButtonTypeSelected)
  }

  function saveEditTelephoneLines() {
    // TO DO POST API
  }

  function customTypeSelected() {
    return (
      <>
        {isConfigurationActive && (
          <>
            {/* Activate Announcement switch  */}
            <div className='flex items-center justify-between mt-6'>
              <div className='flex items-center'>
                <FontAwesomeIcon
                  icon={faBullhorn}
                  className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                  aria-hidden='true'
                />
                <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
                  {t('Lines.Activate announcement')}
                </h4>
              </div>
              <IconSwitch
                on={isManageAnnouncementActive}
                size='double_extra_large'
                onIcon={<FontAwesomeIcon icon={faToggleLargeOn} />}
                offIcon={<FontAwesomeIcon icon={faToggleLargeOff} />}
                changed={() => toggleManageAnnouncement()}
              ></IconSwitch>
            </div>
            {/* Divider */}
            <div className='mt-1 mb-5 border-t border-gray-200 dark:border-gray-700'></div>

            {isManageAnnouncementActive && changeConfigurationRadio == 'customize' && (
              <>
                <div className='mb-4'>
                  <label htmlFor='types' className='sr-only'>
                    {t('Lines.Select a type')}
                  </label>
                  <select
                    id='types'
                    name='types'
                    className='block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primary dark:focus:ring-primary'
                    defaultValue={announcementSelected}
                    onChange={changeAnnouncementSelect}
                  >
                    {announcementLists.map((announcementList) => (
                      <option key={announcementList.id}>{announcementList.value}</option>
                    ))}
                  </select>
                </div>
                <span className='font-medium'>{t('Lines.Select period')}</span>
                {/* Date input  */}
                {/* TO DO MANAGE IN CASE OF MOBILE DEVICE */}
                {/* TO DO CHECK RADIO BUTTON VALUE TO SET DATE  */}
                <div className='mt-4'>
                  {/* Date input select */}
                  <fieldset>
                    <legend className='sr-only'>Date range select</legend>
                    <div className='space-y-4'>
                      {dateSelectionInputs.map((dateSelectionInput) => (
                        <div key={dateSelectionInput.id} className='flex items-center'>
                          <input
                            id={dateSelectionInput.id}
                            name='date-select'
                            type='radio'
                            defaultChecked={dateSelectionInput.id === 'specifyDay'}
                            className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                            onChange={changeTypeSelected}
                          />
                          <label
                            htmlFor={dateSelectionInput.id}
                            className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                          >
                            {dateSelectionInput.value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                  <div className='flex mt-3 items-center justify-between'>
                    <span>{t('Lines.Begin')}</span>
                    <span className='ml-auto mr-auto'>{t('Lines.End')}</span>
                  </div>
                  <div className='flex mt-3 items-center justify-between'>
                    <TextInput
                      type='datetime-local'
                      placeholder='Select date start'
                      className='max-w-sm mr-4'
                      id='meeting-time'
                      name='meeting-time'
                      ref={dateBeginRef}
                      onChange={changeDateBegin}
                      defaultValue={dateBeginValue}
                      disabled={selectedType != 'specifyDay'}
                    />
                    <TextInput
                      type='datetime-local'
                      placeholder='Select date end'
                      className='max-w-sm'
                      id='meeting-time'
                      name='meeting-time'
                      ref={dateEndRef}
                      onChange={changeDateEnd}
                      defaultValue={dateEndValue}
                      disabled={selectedType != 'specifyDay'}
                    />
                  </div>
                </div>

                {/* Announcement and voicemail switch */}
                <div className='flex items-center justify-between mt-6'>
                  <div className='flex items-center'>
                    <FontAwesomeIcon
                      icon={faVoicemail}
                      className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
                      {t('Lines.Activate announcement + voicemail')}
                    </h4>
                  </div>
                  <IconSwitch
                    on={isAnnouncementVoicemailActive}
                    size='double_extra_large'
                    onIcon={<FontAwesomeIcon icon={faToggleLargeOn} />}
                    offIcon={<FontAwesomeIcon icon={faToggleLargeOff} />}
                    changed={() => toggleAnnouncementVoicemail()}
                  ></IconSwitch>
                </div>

                {/* Divider */}
                <div className='mt-1 border-t border-gray-200 dark:border-gray-700'></div>

                {/* Activate forward */}
                <div className='flex items-center justify-between mt-6'>
                  <div className='flex items-center'>
                    <FontAwesomeIcon
                      icon={faArrowTurnDownRight}
                      className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
                      {t('Lines.Activate forward')}
                    </h4>
                  </div>
                  <IconSwitch
                    on={isForwardActive}
                    size='double_extra_large'
                    onIcon={<FontAwesomeIcon icon={faToggleLargeOn} />}
                    offIcon={<FontAwesomeIcon icon={faToggleLargeOff} />}
                    changed={() => toggleForward()}
                  ></IconSwitch>
                </div>

                {/* Divider */}
                <div className='mt-1 border-t border-gray-200 dark:border-gray-700'></div>

                {isForwardActive && (
                  <TextInput
                    placeholder={t('Lines.Insert number') || ''}
                    className='mt-4'
                  ></TextInput>
                )}
              </>
            )}
          </>
        )}
      </>
    )
  }

  function ruleTypeSelected() {
    return (
      <>
        {/* Activate Announcement switch  */}
        <div className='flex items-center justify-between mt-8'>
          <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Select rule')}
          </h4>
        </div>
        {/* Divider */}
        <div className='mt-3 mb-5 border-t border-gray-200 dark:border-gray-700'></div>
        <fieldset className='mt-4'>
          <legend className='sr-only'>Notification method</legend>
          <div className='space-y-4'>
            {dateRuleInformations.map((dateRuleInformation) => (
              <div key={dateRuleInformation.id}>
                <div className='flex items-center justify-between mt-1'>
                  <div className='flex items-center'>
                    <input
                      id={dateRuleInformation.id}
                      name='date-select'
                      type='radio'
                      defaultChecked={dateRuleInformation.id === 'ferie'}
                      className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                      onChange={changeDateSelected}
                    />
                    <label
                      htmlFor={dateRuleInformation.id}
                      className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                    >
                      {dateRuleInformation.value}
                    </label>
                  </div>
                  <button
                    className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                    onClick={() => togglePanel(dateRuleInformation.id)}
                  >
                    <FontAwesomeIcon
                      icon={openPanel === dateRuleInformation.id ? faChevronUp : faChevronDown}
                    />
                  </button>
                </div>
                {openPanel === dateRuleInformation.id && (
                  <div className='bg-gray-100 p-2'>
                    <div className='flex flex-col'>
                      <h1 className='flex text-md font-medium text-gray-700 dark:text-gray-200'>
                        {t('Lines.Rule details')}
                      </h1>
                      {/* TO DO GET DATA FROM API */}
                      <div className='flex mt-2'>
                        <FontAwesomeIcon
                          icon={faVoicemail}
                          className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                          aria-hidden='true'
                        />
                        <h4 className='text-md text-gray-700 dark:text-gray-200'>
                          {t('Lines.Activate announcement + voicemail')}
                        </h4>
                      </div>
                      <div className='flex mt-1'>
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                          aria-hidden='true'
                        />
                        <h4 className='text-md text-gray-700 dark:text-gray-200'>
                          {t('Lines.Begin')}
                        </h4>
                      </div>
                      <div className='flex mt-1'>
                        <FontAwesomeIcon
                          icon={faCalendar}
                          className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                          aria-hidden='true'
                        />
                        <h4 className='text-md text-gray-700 dark:text-gray-200'>
                          {t('Lines.End')}
                        </h4>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </fieldset>
      </>
    )
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
        <dl>
          {/* name */}
          {config.name && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                {t('Lines.Name')}
              </dt>
              <dd className='mt-1 text-sm sm:col-span-2 sm:mt-0 text-gray-900 dark:text-gray-100'>
                <div className='flex items-center text-sm'>
                  <span>{config.name}</span>
                </div>
              </dd>
            </div>
          )}
          {/* number */}
          {config.number && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                {t('Common.Phone number')}
              </dt>
              <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm text-primary dark:text-primary'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                  />
                  <span
                    className='truncate cursor-pointer hover:underline'
                    onClick={() => callPhoneNumber(config.cid)}
                  >
                    {config.number}
                  </span>
                </div>
              </dd>
            </div>
          )}
        </dl>
        {/* Lines configuration management */}
        <div className='flex items-center justify-between mt-1'>
          <h4 className=' text-md font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Activate configuration')}
          </h4>

          <IconSwitch
            on={isConfigurationActive}
            size='double_extra_large'
            onIcon={<FontAwesomeIcon icon={faToggleLargeOn} />}
            offIcon={<FontAwesomeIcon icon={faToggleLargeOff} />}
            changed={() => toggleConfigurationActive()}
          ></IconSwitch>
        </div>
        {/* Divider */}
        <div className='mt-1 border-t border-gray-200 dark:border-gray-700'></div>
        {isConfigurationActive && (
          <>
            <fieldset className='mt-4'>
              <legend className='sr-only'>Configuration type</legend>
              <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
                {configurationType.map((configuration) => (
                  <div key={configuration.id} className='flex items-center'>
                    <input
                      id={configuration.id}
                      name='configuration-type'
                      type='radio'
                      defaultChecked={configuration.id === 'customize'}
                      className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                      onChange={changeConfiguration}
                    />
                    <label
                      htmlFor={configuration.id}
                      className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                    >
                      {configuration.value}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            {changeConfigurationRadio === 'customize' ? customTypeSelected() : ruleTypeSelected()}
          </>
        )}

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
        {/* fixed bottom-0 */}
        <div className='flex mt-6'>
          <Button
            variant='primary'
            type='submit'
            onClick={saveEditTelephoneLines}
            className='mb-4'
            disabled={!isConfigurationActive ? true : false}
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

ShowTelephoneLinesDrawerContent.displayName = 'ShowTelephoneLinesDrawerContent'
