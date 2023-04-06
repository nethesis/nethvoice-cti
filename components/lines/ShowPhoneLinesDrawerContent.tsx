// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useEffect, useState, useRef } from 'react'
import classNames from 'classnames'
import { SideDrawerCloseIcon, Switch, InlineNotification } from '../common'

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
import { formatDateLoc, formatInTimeZoneLoc } from '../../lib/dateTime'
import { setOffHour, getAnnouncements, reloadPhoneLines, playAnnouncement } from '../../lib/lines'
import { format, parse } from 'date-fns'
import { useEventListener } from '../../lib/hooks/useEventListener'

export interface ShowPhoneLinesDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowPhoneLinesDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowPhoneLinesDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()
  const [isConfigurationActive, setConfigurationActive] = useState(false)
  // HIDDEN AT THE MOMENT
  // const [changeConfigurationRadio, setChangeConfigurationRadio] = useState('customize')
  const [announcementSelected, setAnnouncementSelected] = useState<any>(null)
  // const [selectedRulesInfo, setSelectedRulesInfo] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedConfigurationTypology, setSelectedConfigurationTypology] = useState('')
  const [selectedAnnouncementInfo, setSelectedAnnouncementInfo] = useState<any>(null)
  const [firstRender, setFirstRender]: any = useState(true)

  const [openPanel, setOpenPanel] = useState('')

  //date function section
  const [dateBeginToShow, setDateBeginToShow] = useState('')
  const [dateBeginToShowNoHour, setDateBeginToShowNoHour] = useState('')
  const [dateEndToShow, setDateEndToShow] = useState('')

  //set actual date without hours
  const actualDateToShow: any = formatDateLoc(new Date(), 'yyyy-MM-dd')
  //set actual date with hours
  const actualDateToShowWithHour: any = formatDateLoc(new Date(), "yyyy-MM-dd'T'HH:mm")
  const formattedActualDateEndToShowWithHour = format(
    new Date().setHours(23, 59),
    "yyyy-MM-dd'T'HH:mm",
  )

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

  useEffect(() => {
    //check if the configuration is active
    setConfigurationActive(config.enabled)
    //set the dateType. It could be 'always' or 'period'
    setSelectedType(config.dateType)
    //set the configuration typology. It could be 'audiomsg', 'audiomsg_voicemail' or 'redirect'
    setSelectedConfigurationTypology(config.action)
    setAnnouncementSelected(config.announcement_id)

    //If datebegin exist convert the dateType in yyyy-MM-dd'T'HH:mm in case of "specify a day"
    //'yyyy-MM-dd' in case of 'only one day'
    if (config.datebegin) {
      const dateBeginObj = new Date(config.datebegin)
      const formattedBeginDate = format(dateBeginObj, "yyyy-MM-dd'T'HH:mm")
      const formattedBeginDateNoHour = format(dateBeginObj, 'yyyy-MM-dd')

      setDateBeginToShow(formattedBeginDate)
      setDateBeginToShowNoHour(formattedBeginDateNoHour)
    } else {
      //if datebegin doesn't exist set both the date to the actual date
      setDateBeginToShow(actualDateToShowWithHour)
      setDateBeginToShowNoHour(actualDateToShow)
    }
    if (config.dateend) {
      const dateEndObj = new Date(config.dateend)
      const formattedEndDate = format(dateEndObj, "yyyy-MM-dd'T'HH:mm")
      setDateEndToShow(formattedEndDate)
    } else {
      setDateEndToShow(formattedActualDateEndToShowWithHour)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dateBeginRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const dateEndRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const changeDateBegin = () => {
    //Get the date from the input

    const dateBegin = dateBeginRef.current.value
    if (dateBegin) {
      setDateBeginToShow(dateBegin)
    }
  }

  const changeDateBeginNoHours = () => {
    //Get the date from the input and remove hours and minute
    const dateBegin = dateBeginRef.current.value
    if (dateBegin) {
      const dateBeginNoHour = new Date(dateBegin)
      const formattedBeginDateNoHour = format(dateBeginNoHour, 'yyyy-MM-dd')
      setDateBeginToShowNoHour(formattedBeginDateNoHour)
    }
  }

  const changeDateEnd = () => {
    //Get the date from the input
    const dateEnd = dateEndRef.current.value
    if (dateEnd) {
      setDateEndToShow(dateEnd)
    }
  }

  const [changeTypeDate, setChangeTypeDate] = useState('')

  function dateInputFunction() {
    return (
      <>
        <div className='flex-wrap sm:flex mt-5 space-y-2 sm:space-y-0 items-center justify-between'>
          <div>
            <span className=''>
              {selectedType === 'specifyDay' ? t('Lines.Begin') : t('Lines.Date')}
            </span>
            {selectedType === 'specifyDay' ? (
              <TextInput
                type={'datetime-local'}
                placeholder='Select date start'
                className='mr-4 mt-2'
                id='meeting-time'
                name='meeting-time'
                ref={dateBeginRef}
                onChange={changeDateBegin}
                value={dateBeginToShow}
              />
            ) : (
              <TextInput
                type={'date'}
                placeholder='Select date start'
                className=' mr-4 mt-2'
                id='meeting-time'
                name='meeting-time'
                ref={dateBeginRef}
                onChange={changeDateBeginNoHours}
                value={dateBeginToShowNoHour}
              />
            )}
          </div>

          <div>
            {selectedType === 'specifyDay' && <span className=''>{t('Lines.End')}</span>}
            {selectedType === 'specifyDay' ? (
              <TextInput
                type='datetime-local'
                placeholder='Select date end'
                className=' mt-2'
                id='meeting-time'
                name='meeting-time'
                ref={dateEndRef}
                onChange={changeDateEnd}
                value={dateEndToShow}
              />
            ) : (
              <TextInput className=' invisible' />
            )}
          </div>
        </div>
      </>
    )
  }
  //end of all the date function operations

  // const togglePanel = (id: string) => {
  //   setOpenPanel(openPanel === id ? '' : id)
  // }

  const configurationType = [
    { id: 'customize', value: t('Lines.Customize') },
    // { id: 'rule', value: t('Lines.Choose rule') },
  ]

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
      { value: 'audiomsg_voicemail', label: t('Lines.Announcement and voicemail') },
      { value: 'redirect', label: t('Lines.Forward') },
    ],
  }

  const [textFilterVoiceMail, setTextFilterVoiceMail] = useState(
    config.voicemail_id ? config.voicemail_id : '',
  )
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

  // HIDDEN AT THE MOMENT
  // function changeConfiguration(event: any) {
  //   const radioButtonConfigurationValue = event.target.id
  //   setChangeConfigurationRadio(radioButtonConfigurationValue)
  // }

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

  function convertDateSpecifyFormat() {
    const dateBeginConversion = parse(dateBeginToShow, "yyyy-MM-dd'T'HH:mm", new Date())
    const dateBeginConversionIso = dateBeginConversion.toISOString()
    const dateEndConversion = parse(dateEndToShow, "yyyy-MM-dd'T'HH:mm", new Date())
    const dateEndConversionIso = dateEndConversion.toISOString()

    return {
      dateBeginToSendApi: dateBeginConversionIso,
      dateEndToSendApi: dateEndConversionIso,
    }
  }

  function convertDateOnlyDayFormat() {
    const dateEndConversionNoHour = `${dateBeginToShowNoHour}T23:55:59.000Z`

    const dateBeginConversion = formatInTimeZoneLoc(
      new Date(dateBeginToShowNoHour),
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
      'UTC',
    )

    const dateEndConversion = formatInTimeZoneLoc(
      new Date(dateEndConversionNoHour),
      "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
      'UTC',
    )

    return {
      dateBegin: dateBeginConversion,
      dateEnd: dateEndConversion,
    }
  }

  const [missingAudiomessageAnnouncement, setMissingAudiomessageAnnouncement] = useState(false)
  function saveEditPhoneLines() {
    if (isConfigurationActive) {
      let objectToSendApi = {
        action: selectedConfigurationTypology,
        announcement_id: selectedConfigurationTypology !== 'redirect' ? '' : null,
        calledIdNum: config.number.toString(),
        callerIdNum: config.callerNumber.toString(),
        enabled: '',
        end_date: changeTypeDate === 'period' ? '' : null,
        start_date: changeTypeDate === 'period' ? '' : null,
        voicemail_id: selectedConfigurationTypology === 'audiomsg_voicemail' ? '' : null,
        redirect_to: selectedConfigurationTypology === 'redirect' ? '' : null,
      }
      switch (selectedConfigurationTypology) {
        case 'audiomsg':
          if (announcementSelected) {
            objectToSendApi.announcement_id = announcementSelected.toString()
            setMissingAudiomessageAnnouncement(false)
          } else {
            setMissingAudiomessageAnnouncement(true)
            return
          }

          if (changeTypeDate === 'period') {
            objectToSendApi.enabled = 'period'
            if (selectedType === 'onlyOneDay') {
              const { dateBegin, dateEnd } = convertDateOnlyDayFormat()
              objectToSendApi.end_date = dateBegin
              objectToSendApi.start_date = dateEnd
            } else {
              const { dateBeginToSendApi, dateEndToSendApi } = convertDateSpecifyFormat()
              objectToSendApi.end_date = dateBeginToSendApi
              objectToSendApi.start_date = dateEndToSendApi
            }
          } else {
            objectToSendApi.enabled = 'always'
          }
          if (announcementSelected) {
            setOffHourObject(objectToSendApi)
          }
          break

        case 'audiomsg_voicemail':
          if (textFilterVoiceMail) {
            objectToSendApi.voicemail_id = textFilterVoiceMail
            setMissingAudiomessageAnnouncement(false)
          } else {
            setMissingAudiomessageAnnouncement(true)
            return
          }
          if (announcementSelected) {
            objectToSendApi.announcement_id = announcementSelected.toString()
            setMissingAudiomessageAnnouncement(false)
          } else {
            setMissingAudiomessageAnnouncement(true)
            return
          }
          if (changeTypeDate === 'period') {
            objectToSendApi.enabled = 'period'
            if (selectedType === 'onlyOneDay') {
              const { dateBegin, dateEnd } = convertDateOnlyDayFormat()
              objectToSendApi.end_date = dateBegin
              objectToSendApi.start_date = dateEnd
            } else {
              const { dateBeginToSendApi, dateEndToSendApi } = convertDateSpecifyFormat()
              objectToSendApi.end_date = dateBeginToSendApi
              objectToSendApi.start_date = dateEndToSendApi
            }
          } else {
            objectToSendApi.enabled = 'always'
          }
          if (objectToSendApi && objectToSendApi.voicemail_id && announcementSelected !== null) {
            setOffHourObject(objectToSendApi)
          }

          break

        case 'redirect':
          if (textFilterRedirect) {
            objectToSendApi.redirect_to = textFilterRedirect
            setMissingAudiomessageAnnouncement(false)
          } else {
            setMissingAudiomessageAnnouncement(true)
            return
          }
          if (changeTypeDate === 'period') {
            objectToSendApi.enabled = 'period'
            if (selectedType === 'onlyOneDay') {
              const { dateBegin, dateEnd } = convertDateOnlyDayFormat()
              objectToSendApi.end_date = dateBegin
              objectToSendApi.start_date = dateEnd
            } else {
              const { dateBeginToSendApi, dateEndToSendApi } = convertDateSpecifyFormat()
              objectToSendApi.end_date = dateBeginToSendApi
              objectToSendApi.start_date = dateEndToSendApi
            }
          } else {
            objectToSendApi.enabled = 'always'
          }
          if (objectToSendApi && objectToSendApi.redirect_to) {
            setOffHourObject(objectToSendApi)
          }

          break

        default:
          // default action if none of the cases match
          break
      }
    } else {
      let turnOffPhoneLinesObj = {
        calledIdNum: config.number.toString(),
        callerIdNum: config.callerNumber.toString(),
        enabled: 'never',
      }
      if (turnOffPhoneLinesObj) {
        setOffHourObject(turnOffPhoneLinesObj)
      }
    }
    reloadPhoneLines()
    closeSideDrawer()
  }

  const [isAnnouncementLoaded, setAnnouncementLoaded]: any = useState(false)
  const [announcement, setAnnouncement]: any = useState({})
  const [announcementListError, setAnnouncementList] = useState('')

  //Get announcement information
  useEffect(() => {
    async function fetchLines() {
      if (firstRender) {
        setFirstRender(false)
        return
      }
      if (!isAnnouncementLoaded) {
        try {
          setAnnouncementList('')
          const res = await getAnnouncements()
          setAnnouncement(res)
        } catch (e) {
          console.error(e)
          setAnnouncementList(t('Lines.Cannot retrieve announcement') || '')
        }
        setAnnouncementLoaded(true)
      }
    }
    fetchLines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnnouncementLoaded, firstRender])

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

  const [isListeningAnnouncements, setIsListeningAnnouncements] = useState(false)

  async function playSelectedAnnouncement(announcementId: any) {
    if (announcementId) {
      playAnnouncement(announcementId)
      // disactivate play button
      setIsListeningAnnouncements(true)
    }
  }

  //Reactivate play button
  useEventListener('phone-island-audio-player-closed', () => {
    setIsListeningAnnouncements(false)
  })

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
                    className={`h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight ${
                      selectedType === dateSelectionInput.value
                        ? 'dark:text-primary dark:bg-primaryLight'
                        : 'dark:text-primary dark:bg-gray-700'
                    } dark:border-gray-600 dark:focus:ring-primaryDark`}
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
          {selectedType && selectedType !== 'always' && <>{dateInputFunction()}</>}
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
              {t('Lines.Announcement')}
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
              className='block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primary dark:focus:ring-primary dark:bg-gray-900'
              value={announcementSelected || ''}
              onChange={changeAnnouncementSelect}
            >
              {!announcementSelected && <option value=''>{t('Lines.Announcement select')}</option>}
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
                disabled={!announcementSelected && isListeningAnnouncements}
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
                {t('Lines.Announcement and voicemail')}
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
                className='block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primary dark:focus:ring-primary dark:bg-gray-900'
                value={announcementSelected || ''}
                onChange={changeAnnouncementSelect}
              >
                {!announcementSelected && (
                  <option value=''>{t('Lines.Announcement select')}</option>
                )}
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
                  disabled={!announcementSelected && isListeningAnnouncements}
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
            placeholder={t('Lines.Insert voicemail phone number') || ''}
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
                {t('Lines.Forward')}
              </h4>
            </div>
          </div>

          {/* Divider */}
          <div className='mt-2 border-t border-gray-200 dark:border-gray-700'></div>

          <TextInput
            placeholder={t('Lines.Insert forward phone number') || ''}
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
                    className={`h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight ${
                      selectedConfigurationTypology === typology.value
                        ? 'dark:text-primary dark:bg-primaryLight'
                        : 'dark:text-primary dark:bg-gray-700'
                    } dark:border-gray-600 dark:focus:ring-primaryDark`}
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
  //                         {t('Lines.Activate announcement and voicemail')}
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
          {/* Description */}
          {config.name && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                {t('Lines.Description')}
              </dt>
              <dd className='mt-1 text-sm sm:col-span-2 sm:mt-0 text-gray-900 dark:text-gray-100'>
                <div className='flex items-center text-sm'>
                  <span>{config.name}</span>
                </div>
              </dd>
            </div>
          )}
          {/* Line number */}
          {config.number && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                {t('Lines.Line number')}
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
                    {config.callerNumber}
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
            {/* HIDDEN AT THE MOMENT */}
            {/* <fieldset className='mt-4 px-5'>
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
            </fieldset> */}

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
            {/* Upload error */}
            {missingAudiomessageAnnouncement && (
              <div className='px-5 pt-3'>
                <InlineNotification
                  title={t('Lines.Fill in all the fields to be able to continue')}
                  type='error'
                  className='mt-2'
                ></InlineNotification>
              </div>
            )}
          </>
        )}
        {/* fixed bottom-0 */}
        <div className='flex mt-6 px-5 pt-2'>
          <Button
            variant='primary'
            type='submit'
            onClick={saveEditPhoneLines}
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

ShowPhoneLinesDrawerContent.displayName = 'ShowPhoneLinesDrawerContent'
