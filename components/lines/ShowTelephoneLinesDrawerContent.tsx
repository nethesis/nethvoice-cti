// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import { SideDrawerCloseIcon, Switch } from '../common'

import { useTranslation } from 'react-i18next'
import {
  faPhone,
  faBullhorn,
  faVoicemail,
  faArrowTurnDownRight,
  faFloppyDisk,
  faChevronDown,
  faChevronUp,
  faCalendar,
  faPlay,
  faCircleXmark,
} from '@nethesis/nethesis-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { callPhoneNumber, closeSideDrawer } from '../../lib/utils'
import { TextInput, Button } from '../common'
import { formatDateLoc } from '../../lib/dateTime'
import { setOffHour, getAnnouncements } from '../../lib/lines'

export interface ShowTelephoneLinesDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowTelephoneLinesDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowTelephoneLinesDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()
  const [isConfigurationActive, setConfigurationActive] = useState(
    config.enabled !== 'never' ? true : false,
  )
  const [changeConfigurationRadio, setChangeConfigurationRadio] = useState('customize')
  const [announcementSelected, setAnnouncementSelected] = useState<any>(null)
  const [dateBeginValue, setDateBeginValue] = useState('')
  const [dateEndValue, setDateEndValue] = useState('')
  // const [selectedRulesInfo, setSelectedRulesInfo] = useState('ferie')
  const [selectedType, setSelectedType] = useState('')
  const [selectedConfigurationTypology, setSelectedConfigurationTypology] = useState('')
  const [selectedAnnouncementInfo, setSelectedAnnouncementInfo] = useState<any>(null)

  const [openPanel, setOpenPanel] = useState('')

  useEffect(() => {
    setConfigurationActive(config.enabled !== 'never' ? true : false)
    setSelectedType(config.dateType)
    setSelectedConfigurationTypology(config.action)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const togglePanel = (id: string) => {
  //   setOpenPanel(openPanel === id ? '' : id)
  // }

  const configurationType = [
    { id: 'customize', value: t('Lines.Customize') },
    // { id: 'rule', value: t('Lines.Choose rule') },
  ]

  const actualDateWithoutHour: any = formatDateLoc(new Date(), 'yyyy-MM-dd')

  const contactTypeFilter = {
    id: 'contactTypeFilter',
    name: 'Contact type',
    options: [
      { value: 'specifyDay', label: t('Lines.Specify start date and end date') },
      { value: 'onlyOneDay', label: t('Lines.Only active for one day') },
      { value: 'always', label: t('Lines.Active every day') },
    ],
  }

  const announcementTypologyConfiguration = {
    id: 'msgType',
    name: 'announcementType',
    options: [
      { value: 'audiomsg', label: t('Lines.Announcement') },
      { value: 'audiomsg_voicemail', label: t('Lines.Announcement + voicemail') },
      { value: 'redirect', label: t('Lines.Forward') },
    ],
  }

  const [changeTypeDate, setChangeTypeDate] = useState('period')
  const actualEndDate = new Date().toISOString().slice(0, 11) + '22:00'
  const [textFilterVoiceMail, setTextFilterVoiceMail] = useState('')
  const [textFilterRedirect, setTextFilterRedirect] = useState(
    config.redirect_to ? config.redirect_to : '',
  )

  const textFilterVoiceMailRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const textFilterRedirectRef = useRef() as React.MutableRefObject<HTMLInputElement>

  // const dateRuleInformations = [
  //   { id: 'febbraio', value: 'Febbraio 2023' },
  //   { id: 'ferie', value: 'Ferie' },
  //   { id: 'natale', value: 'Natale' },
  // ]

  // function changeDateSelected(event: any) {
  //   const radioButtonDateSelected = event.target.id
  //   setSelectedRulesInfo(radioButtonDateSelected)
  // }

  const toggleConfigurationActive = () => {
    setConfigurationActive(!isConfigurationActive)
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

  function changeConfiguration(event: any) {
    const radioButtonConfigurationValue = event.target.id
    setChangeConfigurationRadio(radioButtonConfigurationValue)
  }

  function changeTypeSelected(event: any) {
    const radioButtonTypeSelected = event.target.id
    setSelectedType(radioButtonTypeSelected)
    if (radioButtonTypeSelected === 'always') {
      setChangeTypeDate('always')
    } else {
      setChangeTypeDate('period')
    }
  }

  function changeAnnouncementTypologySelected(event: any) {
    const radioButtonTypeSelected = event.target.id
    setSelectedConfigurationTypology(radioButtonTypeSelected)
  }

  const [uploadOffHourError, setuploadOffHourError] = useState('')

  async function setOffHourObject(obj: any) {
    try {
      await setOffHour(obj)
    } catch (error) {
      setuploadOffHourError('Cannot upload announcement')
      return
    }
  }
  let editPhoneLinesObj = {}
  function saveEditTelephoneLines() {
    console.log("enabled", config.enabled)
    editPhoneLinesObj = {
      calledIdNum: config.number.toString(),
      callerIdNum: config.callerNumber.toString(),
      enabled: config.enabled
    }
    if (isConfigurationActive) {
      switch (true) {
        case selectedConfigurationTypology === 'audiomsg':
          editPhoneLinesObj = {
            action: selectedConfigurationTypology,
            announcement_id: announcementSelected.toString(),

            enabled: changeTypeDate,
            end_date: '',
            start_date: '',
          }
          if (changeTypeDate === 'period') {
          }
          if (editPhoneLinesObj) {
            setOffHourObject(editPhoneLinesObj)
          }

          break

        case selectedConfigurationTypology === 'audiomsg + voicemail':
          editPhoneLinesObj = {
            action: selectedConfigurationTypology,
            announcement_id: announcementSelected.toString(),
            calledIdNum: config.number.toString(),
            callerIdNum: config.callerNumber.toString(),
            enabled: changeTypeDate,
          }

          break

        case selectedConfigurationTypology === 'redirect':
          editPhoneLinesObj = {
            action: selectedConfigurationTypology,
            announcement_id: announcementSelected.toString(),
            calledIdNum: config.number.toString(),
            callerIdNum: config.callerNumber.toString(),
            enabled: changeTypeDate,
          }

          break

        default:
          // default action if none of the cases match
          break
      }
    } else {
      console.log('Deactivate')
    }

    closeSideDrawer()
  }

  const [isAnnouncementLoaded, setAnnouncementLoaded]: any = useState(false)
  const [announcement, setAnnouncement]: any = useState({})
  const [linesError, setLinesError] = useState('')

  //Get Lines information
  useEffect(() => {
    async function fetchLines() {
      if (!isAnnouncementLoaded) {
        try {
          setLinesError('')
          const res = await getAnnouncements()
          setAnnouncement(res)
        } catch (e) {
          console.error(e)
          setLinesError(t('Lines.Cannot retrieve lines') || '')
        }
        setAnnouncementLoaded(true)
      }
    }
    fetchLines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnnouncementLoaded])

  function changeAnnouncementSelect(event: any) {
    const listAnnouncementValue = event.target.value

    const selectedAnnouncement = announcement.find(
      (announcementItem: any) => announcementItem.id === parseInt(listAnnouncementValue),
    )
    if (selectedAnnouncement) {
      setSelectedAnnouncementInfo(selectedAnnouncement)
      setAnnouncementSelected(listAnnouncementValue)
    }
  }

  function changeTextFilterVoiceMail(event: any) {
    const newTextFilter = event.target.value
    setTextFilterVoiceMail(newTextFilter)
  }

  function changeTextFilterRedirect(event: any) {
    const newTextFilter = event.target.value
    setTextFilterRedirect(newTextFilter)
  }

  const clearTextFilterVoiceMail = () => {
    setTextFilterVoiceMail('')
    textFilterVoiceMailRef.current.focus()
  }

  const clearTextFilterRedirect = () => {
    setTextFilterRedirect('')
    textFilterRedirectRef.current.focus()
  }

  async function playSelectedAnnouncement(announcementId: any) {
    if (announcementId) {
      // try {
      //   await listenMsg(announcementId)
      // } catch (error) {
      //   setPlayAudioMessageError('Cannot play announcement')
      //   return
      // }
    }
    console.log('you want to play this announcement', announcementId)
  }

  const [dateBegin, setDateBegin] = useState(new Date())
  const [dateEnd, setDateEnd] = useState(new Date())

  function periodSelect() {
    return (
      <>
        <div className='px-5 pt-8 pb-2'>
          <div className='flex items-center justify-between mt-1'>
            <h4 className=' text-md font-medium text-gray-700 dark:text-gray-200'>
              {t('Lines.Select period')}
            </h4>
          </div>
          {/* Divider */}
          <div className='mt-2 border-t border-gray-200 dark:border-gray-700'></div>
        </div>
        {/* Date input  */}
        {/* TO DO MANAGE IN CASE OF MOBILE DEVICE */}
        {/* TO DO CHECK RADIO BUTTON VALUE TO SET DATE  */}
        <div className='mt-4 px-5'>
          {/* Date input select */}
          <fieldset>
            <legend className='sr-only'>Date range select</legend>
            <div className='space-y-4'>
              {contactTypeFilter.options.map((dateSelectionInput) => (
                <div key={dateSelectionInput.value} className='flex items-center'>
                  <input
                    id={dateSelectionInput.value}
                    name={`filter-${contactTypeFilter.id}`}
                    type='radio'
                    checked={dateSelectionInput.value === selectedType}
                    className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                    onChange={changeTypeSelected}
                  />
                  <label
                    htmlFor={dateSelectionInput.value}
                    className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                  >
                    {dateSelectionInput.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          {selectedType && selectedType !== 'always' && (
            <>
              <div className='flex mt-5 items-center justify-between'>
                <span>{selectedType === 'specifyDay' ? t('Lines.Begin') : t('Lines.Date')}</span>

                {selectedType === 'specifyDay' && (
                  <span className='ml-auto mr-auto'>{t('Lines.End')}</span>
                )}
              </div>

              <div className='flex mt-3 items-center justify-between'>
                <TextInput
                  type={selectedType === 'specifyDay' ? 'datetime-local' : 'date'}
                  placeholder='Select date start'
                  className='max-w-sm mr-4'
                  id='meeting-time'
                  name='meeting-time'
                  ref={dateBeginRef}
                  onChange={changeDateBegin}
                  value={dateBegin.toISOString().slice(0, selectedType === 'specifyDay' ? -8 : 10)}
                />

                {selectedType === 'specifyDay' ? (
                  <TextInput
                    type='datetime-local'
                    placeholder='Select date end'
                    className='max-w-sm'
                    id='meeting-time'
                    name='meeting-time'
                    ref={dateEndRef}
                    onChange={changeDateEnd}
                    value={dateEnd.toISOString().slice(0, -8)}
                  />
                ) : (
                  <TextInput
                    type='datetime-local'
                    placeholder=''
                    className='max-w-sm invisible'
                    id='meeting-time'
                    name='meeting-time'
                    ref={dateEndRef}
                    onChange={changeDateEnd}
                    value={dateEnd.toISOString().slice(0, -8)}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </>
    )
  }

  function announcementSelect() {
    return (
      <>
        {/* Select announcement */}
        <div className='px-5 pt-9'>
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
          {/* Divider */}
          <div className='mt-2 border-t border-gray-200 dark:border-gray-700'></div>
        </div>
        <div className='pt-4 px-5'>
          <div className='flex'>
            <select
              id='types'
              name='types'
              className='block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primary dark:focus:ring-primary'
              defaultValue={'-'}
              onChange={changeAnnouncementSelect}
            >
              {Object.keys(announcement).map((key) => (
                <option key={key} value={announcement[key].id}>
                  {announcement[key].description}
                </option>
              ))}
            </select>
            <div className='ml-4 flex-shrink-0'>
              <Button
                variant='white'
                onClick={() => playSelectedAnnouncement(selectedAnnouncementInfo.id)}
                disabled={!announcementSelected}
              >
                <FontAwesomeIcon
                  icon={faPlay}
                  className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-500'
                  aria-hidden='true'
                />{' '}
                {t('Lines.Play')}
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  function selectAnnouncementVoicemail() {
    return (
      <>
        {/* Announcement and voicemail switch */}
        <div className='px-5 pt-3'>
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
          </div>

          {/* Divider */}
          <div className='mt-2 border-t border-gray-200 dark:border-gray-700'></div>

          <div className='pt-4 pb-2'>
            <div className='flex'>
              <select
                id='types'
                name='types'
                className='block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primary dark:focus:ring-primary'
                defaultValue='-'
                onChange={changeAnnouncementSelect}
              >
                {Object.keys(announcement).map((key) => (
                  <option key={key} value={announcement[key].id}>
                    {announcement[key].description}
                  </option>
                ))}
              </select>
              <div className='ml-4 flex-shrink-0'>
                <Button
                  variant='white'
                  onClick={() => playSelectedAnnouncement(selectedAnnouncementInfo.id)}
                  disabled={!announcementSelected}
                >
                  <FontAwesomeIcon
                    icon={faPlay}
                    className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-500'
                    aria-hidden='true'
                  />{' '}
                  {t('Lines.Play')}
                </Button>
              </div>
            </div>
          </div>
          <TextInput
            placeholder={t('Lines.Insert voicemail') || ''}
            className='mt-4'
            value={textFilterVoiceMail}
            onChange={changeTextFilterVoiceMail}
            ref={textFilterVoiceMailRef}
            icon={textFilterVoiceMail.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilterVoiceMail()}
            trailingIcon={true}
          />
        </div>
      </>
    )
  }

  function selectForward() {
    return (
      <>
        {/* Activate forward */}
        <div className='px-5 pt-3'>
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
          </div>

          {/* Divider */}
          <div className='mt-2 border-t border-gray-200 dark:border-gray-700'></div>

          <TextInput
            placeholder={t('Lines.Insert number') || ''}
            className='mt-4'
            value={textFilterRedirect}
            onChange={changeTextFilterRedirect}
            ref={textFilterRedirectRef}
            icon={textFilterRedirect.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilterRedirect()}
            trailingIcon={true}
          />
        </div>
      </>
    )
  }

  function typologyConfiguration() {
    return (
      <>
        <div className='px-5 pt-8 pb-2'>
          <div className='flex items-center justify-between mt-1'>
            <h4 className=' text-md font-medium text-gray-700 dark:text-gray-200'>
              {t('Lines.Typology configuration')}
            </h4>
          </div>
          {/* Divider */}
          <div className='mt-2 border-t border-gray-200 dark:border-gray-700'></div>
        </div>
        <div className='mt-4 px-5'>
          {/* Date input select */}
          <fieldset>
            <legend className='sr-only'>Typology Configuration </legend>
            <div className='space-y-4'>
              {announcementTypologyConfiguration.options.map((typology) => (
                <div key={typology.value} className='flex items-center'>
                  <input
                    id={typology.value}
                    name={`filter-${announcementTypologyConfiguration.id}`}
                    type='radio'
                    checked={typology.value === selectedConfigurationTypology}
                    className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                    onChange={changeAnnouncementTypologySelected}
                  />
                  <label
                    htmlFor={typology.value}
                    className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                  >
                    {typology.label}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </>
    )
  }

  // function ruleTypeSelected() {
  //   return (
  //     <>
  //       {/* Activate Announcement switch  */}
  //       <div className='px-5'>
  //         {/* Title */}
  //         <div className='flex items-center justify-between mt-8'>
  //           <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
  //             {t('Lines.Select rule')}
  //           </h4>
  //         </div>
  //         {/* Divider */}
  //         <div className='mt-3 mb-5 border-t border-gray-200 dark:border-gray-700'></div>
  //       </div>

  //       <fieldset className='mt-4'>
  //         <legend className='sr-only'>Rule information</legend>
  //         <div className='space-y-4'>
  //           {dateRuleInformations.map((dateRuleInformation) => (
  //             <div key={dateRuleInformation.id}>
  //               <div
  //                 className={`flex items-center justify-between mt-1 ${
  //                   openPanel === dateRuleInformation.id ? 'bg-gray-100' : ''
  //                 } `}
  //               >
  //                 <div className='flex items-center px-5 pt-3'>
  //                   <input
  //                     id={dateRuleInformation.id}
  //                     name='date-select'
  //                     type='radio'
  //                     defaultChecked={dateRuleInformation.id === 'ferie'}
  //                     className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
  //                     onChange={changeDateSelected}
  //                   />
  //                   <label
  //                     htmlFor={dateRuleInformation.id}
  //                     className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
  //                   >
  //                     {dateRuleInformation.value}
  //                   </label>
  //                 </div>
  //                 <button
  //                   className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
  //                   aria-hidden='true'
  //                   onClick={() => togglePanel(dateRuleInformation.id)}
  //                 >
  //                   <FontAwesomeIcon
  //                     icon={openPanel === dateRuleInformation.id ? faChevronUp : faChevronDown}
  //                   />
  //                 </button>
  //               </div>
  //               {openPanel === dateRuleInformation.id && (
  //                 <div className='bg-gray-100 px-5 py-3'>
  //                   <div className='flex flex-col'>
  //                     <h1 className='flex text-md font-medium text-gray-700 dark:text-gray-200'>
  //                       {t('Lines.Rule details')}
  //                     </h1>
  //                     {/* TO DO GET DATA FROM API */}
  //                     <div className='flex items-center mt-2'>
  //                       <FontAwesomeIcon
  //                         icon={faVoicemail}
  //                         className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
  //                         aria-hidden='true'
  //                       />
  //                       <h4 className='text-md text-gray-700 dark:text-gray-200'>
  //                         {t('Lines.Activate announcement + voicemail')}
  //                       </h4>
  //                     </div>
  //                     <div className='flex items-center mt-1'>
  //                       <FontAwesomeIcon
  //                         icon={faCalendar}
  //                         className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
  //                         aria-hidden='true'
  //                       />
  //                       <h4 className='text-md text-gray-700 dark:text-gray-200'>
  //                         {t('Lines.Begin')}
  //                       </h4>
  //                     </div>
  //                     <div className='flex items-center mt-1'>
  //                       <FontAwesomeIcon
  //                         icon={faCalendar}
  //                         className='mr-4 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
  //                         aria-hidden='true'
  //                       />
  //                       <h4 className='text-md text-gray-700 dark:text-gray-200'>
  //                         {t('Lines.End')}
  //                       </h4>
  //                     </div>
  //                   </div>
  //                 </div>
  //               )}
  //             </div>
  //           ))}
  //         </div>
  //       </fieldset>
  //     </>
  //   )
  // }

  //Get value from date input

  const dateBeginRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const dateEndRef = useRef() as React.MutableRefObject<HTMLInputElement>

  return (
    <>
      {/* Drawer title */}
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
      <div className={classNames(className)} {...props}>
        {/* Contact details */}
        <dl className='px-5 pt-5'>
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
                    onClick={() => callPhoneNumber(config.number)}
                  >
                    {config.number}
                  </span>
                </div>
              </dd>
            </div>
          )}
          {/* Caller number */}
          {config.callerNumber && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                {t('Lines.Caller number')}
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
                    onClick={() => callPhoneNumber(config.callerNumber)}
                  >
                    {config.number}
                  </span>
                </div>
              </dd>
            </div>
          )}
        </dl>

        {/* Activate configuration */}
        <div className='px-5 pt-8'>
          <div className='flex items-center justify-between mt-1'>
            <h4 className=' text-md font-medium text-gray-700 dark:text-gray-200'>
              {t('Lines.Activate configuration')}
            </h4>
            <Switch on={isConfigurationActive} changed={() => toggleConfigurationActive()}></Switch>
          </div>
          {/* Divider */}
          <div className='mt-2 border-t border-gray-200 dark:border-gray-700'></div>
        </div>

        {/* configuration type select */}
        {isConfigurationActive && (
          <>
            <fieldset className='mt-4 px-5'>
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

            {/* Period select */}
            {periodSelect()}

            {/* Activate announcement field */}

            {typologyConfiguration()}
            {/* {changeConfigurationRadio === 'customize' ? customTypeSelected() : ruleTypeSelected()} */}

            {selectedConfigurationTypology === 'audiomsg' && <>{announcementSelect()}</>}
            {selectedConfigurationTypology === 'audiomsg_voicemail' && (
              <>{selectAnnouncementVoicemail()}</>
            )}
            {selectedConfigurationTypology === 'redirect' && <>{selectForward()}</>}
          </>
        )}
        {/* fixed bottom-0 */}
        <div className='flex mt-6 px-5 pt-2'>
          <Button
            variant='primary'
            type='submit'
            onClick={saveEditTelephoneLines}
            className='mb-4'
            // disabled={!isConfigurationActive ? true : false}
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
