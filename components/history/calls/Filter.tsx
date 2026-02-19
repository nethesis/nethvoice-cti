// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import React from 'react'
import classNames from 'classnames'
import { TextInput } from '../../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faCircleXmark,
  faXmark,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import { Fragment, useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { savePreference } from '../../../lib/storage'
import {
  DEFAULT_CALL_TYPE_FILTER,
  DEFAULT_CALL_DIRECTION_FILTER,
  DEFAULT_SORT_BY,
  getFilterValues,
} from '../../../lib/history'
import { formatDateLoc } from '../../../lib/dateTime'
import { parse, subDays, startOfDay } from 'date-fns'
import { useTranslation } from 'react-i18next'
import Datepicker from 'react-tailwindcss-datepicker'
import { useTheme } from '../../../theme/Context'
import LanguageDetector from 'i18next-browser-languagedetector'
import i18next from 'i18next'

//Filter for the sort
const sortFilter = {
  id: 'sort',
  name: 'Sort by',
  options: [
    { value: 'time%20desc', label: 'Newest' },
    { value: 'time%20asc', label: 'Oldest' },
  ],
}

//Filter for the date
const date = {
  id: 'date',
  name: 'Date',
}

//Call type filter: Personal/ Switchboard
const callTypeFilter = {
  id: 'kind',
  name: 'Call type',
  options: [
    { value: 'user', label: 'Personal' },
    { value: 'switchboard', label: 'Switchboard' },
    { value: 'group', label: 'Groups' },
  ],
}

//Filter for the direction: All/ Incoming/ Outgoing/ Missed/ Internal
const callDirectionFilter = {
  id: 'direction',
  name: 'call direction',
  options: [
    { value: 'all', label: 'All' },
    { value: 'in', label: 'Incoming' },
    { value: 'out', label: 'Outgoing' },
    { value: 'lost', label: 'Missed' },
    { value: 'internal', label: 'Internal' },
  ],
}

//Filter for the direction: All/ Incoming/ Outgoing/ Missed
const callDirectionFilterNoInternal = {
  id: 'direction',
  name: 'call direction',
  options: [
    { value: 'all', label: 'All' },
    { value: 'in', label: 'Incoming' },
    { value: 'out', label: 'Outgoing' },
    { value: 'lost', label: 'Missed' },
  ],
}

export interface FilterProps extends ComponentPropsWithRef<'div'> {
  updateFilterText: Function
  updateCallTypeFilter: Function
  updateCallDirectionFilter: Function
  updateDateBeginFilter: Function
  updateDateEndFilter: Function
  updateSortFilter: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  (
    {
      updateFilterText,
      updateCallTypeFilter,
      updateCallDirectionFilter,
      updateDateBeginFilter,
      updateDateEndFilter,
      updateSortFilter,
      className,
      ...props
    },
    ref,
  ) => {
    const auth = useSelector((state: RootState) => state.authentication)
    const { profile } = useSelector((state: RootState) => state.user)
    const [internalUsed, setInternalUsed] = useState(false)

    const [open, setOpen] = useState(false)

    const [filterText, setFilterText] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

    const [callDirectionLabel, setCallDirectionLabel] = useState('')

    const [callTypeLabel, setCallTypeLabel] = useState('')

    const [callDirection, setCallDirection] = useState('all')

    const [callType, setCallType] = useState('user')

    const [dateBeginShowed, setDateBeginShowed] = useState('')
    const [dateEndShowed, setDateEndShowed] = useState('')

    const { timePicker: timePickerTheme, datePicker: datePickerTheme } = useTheme().theme

    //Sorting filter
    const [sortBy, setSortBy]: any = useState('time%20desc')
    function changeSortBy(event: any) {
      const newSortBy = event.target.id
      setSortBy(newSortBy)
      // update history (notify parent component)
      updateSortFilter(newSortBy)
      savePreference('historySortTypePreference', newSortBy, auth.username)
    }

    //Check if personal call filter is selected
    function checkSelected(selectedType: any) {
      callDirectionFilter.options
      if (selectedType === 'user') {
        setInternalUsed(false)
      } else {
        setInternalUsed(true)
      }
    }

    const [labelForDateFrom, setLabelForDateFrom] = useState('')
    const [labelForDateTo, setLabelForDateTo] = useState('')

    //Date to be visualized in the active filters section
    //Get actual date with hour and minute
    const dateToWithHour: any = formatDateLoc(new Date(), 'PPp')

    //Get actual date without hour and minute for the reset
    const actualDateForReset: any = formatDateLoc(new Date(), 'yyyy-MM-dd')

    //Get one week before date
    const oneWeekBeforeActualDate = startOfDay(subDays(new Date(), 7))

    //Format the date to the format for the visualizations
    const dateFromWithHour: any = formatDateLoc(oneWeekBeforeActualDate, 'PPp')

    const actualDateLabelTo: any = formatDateLoc(new Date(), "yyyy-MM-dd'T'HH:mm")
    const actualDateLabelFrom: any = formatDateLoc(oneWeekBeforeActualDate, "yyyy-MM-dd'T'HH:mm")

    //Get one week before date without hour and minute for the reset
    const dateFromForReset: any = formatDateLoc(oneWeekBeforeActualDate, 'yyyy-MM-dd')

    //Set the date to be showed in to the label for the date filter
    if (labelForDateTo === '') {
      setLabelForDateTo(dateToWithHour)
    }

    if (labelForDateFrom === '') {
      setLabelForDateFrom(dateFromWithHour)
    }

    function changeHourBegin() {
      //Get the date from the input
      const hourBegin = hourBeginRef.current.value
      setHourBeginValue(hourBegin)
    }

    function changeHourEnd() {
      //Get the date from the input
      const hourEnd = hourEndRef.current.value
      setHourEndValue(hourEnd)
    }

    const [dateValue, setdateValue]: any = useState({
      startDate: null,
      endDate: null,
    })
    const [hourBeginValue, setHourBeginValue]: any = useState('')
    const [hourEndValue, setHourEndValue]: any = useState('')

    //Set the date when the date filter is changed
    const changeDateBegin = (date: any) => {
      if (date != null && date.startDate !== null && date.endDate !== null) {
        // Start date
        let startDateWithHour
        if (hourBeginValue != null && hourBeginValue !== '') {
          startDateWithHour = date.startDate + 'T' + hourBeginValue
        } else {
          startDateWithHour = date.startDate + 'T00:00'
        }

        // Convert the date to the format for the visualizations
        let convertDateBegin = parse(startDateWithHour, "yyyy-MM-dd'T'HH:mm", new Date())
        let dateBeginWithHour: any = formatDateLoc(convertDateBegin, 'PPp')
        let noHour: any = formatDateLoc(convertDateBegin, 'yyyy-MM-dd')
        updateDateBeginFilter(noHour)

        // End date
        let endDateWithHour
        if (hourEndValue != null && hourEndValue !== '') {
          endDateWithHour = date.endDate + 'T' + hourEndValue
        } else {
          endDateWithHour = date.endDate + 'T23:59'
        }
        let convertDateEnd = parse(endDateWithHour, "yyyy-MM-dd'T'HH:mm", new Date())
        let dateEndWithHour: any = formatDateLoc(convertDateEnd, 'PPp')
        let noEndHour: any = formatDateLoc(convertDateEnd, 'yyyy-MM-dd')
        updateDateEndFilter(noEndHour)

        setDateEndShowed(dateEndWithHour)
        setDateBeginShowed(dateBeginWithHour)
        setdateValue(date)
        setClearSelected(false)
      }
    }

    //Get value from date input
    const hourBeginRef = useRef() as React.MutableRefObject<HTMLInputElement>
    const hourEndRef = useRef() as React.MutableRefObject<HTMLInputElement>

    function changeFilterText(event: any) {
      const newFilterText = event.target.value
      setFilterText(newFilterText)
      // update history (notify parent component)
      updateFilterText(newFilterText)
    }

    const clearTextFilter = () => {
      setFilterText('')
      updateFilterText('')
      textFilterRef.current.focus()
    }

    function changeCallType(event: any) {
      const newCallType = event.target.id
      setCallType(newCallType)
      //Call the function to check if personal call is selected
      checkSelected(newCallType)
      updateCallTypeFilter(newCallType)
      savePreference('historyCallTypeFilter', newCallType, auth.username)
    }

    function changeCallDirection(event: any) {
      const newCallDirection = event.target.id
      setCallDirection(newCallDirection)
      updateCallDirectionFilter(newCallDirection)
      savePreference('historyCallTypeDirection', newCallDirection, auth.username)
    }

    //Set the label for the selected call type
    useEffect(() => {
      const callTypeFound = callTypeFilter?.options?.find((option) => option?.value === callType)
      if (callTypeFound) {
        setCallTypeLabel(callTypeFound?.label)
      }
    }, [callType])

    useEffect(() => {
      if (callType === 'user' && callDirection === 'internal') {
        setCallDirectionLabel('All')
        setCallDirection('all')
        updateCallDirectionFilter('all')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callType, callDirection])

    //Set the label for the selected call direction
    useEffect(() => {
      const callDirectionFound = callDirectionFilter.options.find(
        (option) => option.value === callDirection,
      )
      if (callDirectionFound) {
        setCallDirectionLabel(callDirectionFound?.label)
      }
    }, [callDirection])

    const [selectedLanguage, setSelectedLanguage] = useState('')

    useEffect(() => {
      if (i18next?.languages[0] !== '') {
        setSelectedLanguage(i18next?.languages[0])
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [i18next?.languages[0]])

    //Get the selected filter from the local storage
    useEffect(() => {
      const filterValues = getFilterValues(auth.username)
      setCallType(filterValues.callType)
      setCallDirection(filterValues.callDirection)
      setSortBy(filterValues.sortBy)
      checkSelected(filterValues.callType)

      // notify parent component
      updateCallTypeFilter(filterValues.callType)
      updateCallDirectionFilter(filterValues.callDirection)
      updateSortFilter(filterValues.sortBy)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [clearSelected, setClearSelected] = useState(false)

    function clearDate() {
      setClearSelected(true)
      setLabelForDateTo(dateToWithHour)
    }

    //Clear the filter
    function clearFilters() {
      clearDate()
      setFilterText('')
      setCallType(DEFAULT_CALL_TYPE_FILTER)
      setCallDirection(DEFAULT_CALL_DIRECTION_FILTER)
      // Update the dateValue state
      setdateValue((prevState: any) => {
        return {
          ...prevState,
          startDate: actualDateLabelFrom,
          endDate: actualDateLabelTo,
        }
      })
      setSortBy(DEFAULT_SORT_BY)
      savePreference('historyCallTypeFilter', DEFAULT_CALL_TYPE_FILTER, auth.username)
      savePreference('historyCallTypeDirection', DEFAULT_CALL_DIRECTION_FILTER, auth.username)
      savePreference('historySortTypePreference', DEFAULT_SORT_BY, auth.username)

      // notify parent component
      updateFilterText('')
      updateCallTypeFilter(DEFAULT_CALL_TYPE_FILTER)
      updateCallDirectionFilter(DEFAULT_CALL_DIRECTION_FILTER)
      updateDateBeginFilter(dateFromForReset)
      updateDateEndFilter(actualDateForReset)
      updateSortFilter(DEFAULT_SORT_BY)
      checkSelected(DEFAULT_CALL_TYPE_FILTER)
    }

    const { t } = useTranslation()

    return (
      <div className={classNames('bg-body dark:bg-bodyDark', className)} {...props}>
        <div className=''>
          {/* Drawer filter mobile */}
          <Transition show={open} as={Fragment}>
            <Dialog as='div' className='relative z-40 sm:hidden' onClose={setOpen}>
              <TransitionChild
                as={Fragment}
                enter='transition-opacity ease-linear duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='transition-opacity ease-linear duration-300'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <div className='fixed inset-0 bg-black bg-opacity-25 dark:bg-black dark:bg-opacity-25' />
              </TransitionChild>

              <div className='fixed inset-0 z-40 flex'>
                <TransitionChild
                  as={Fragment}
                  enter='transition ease-in-out duration-300 transform'
                  enterFrom='translate-x-full'
                  enterTo='translate-x-0'
                  leave='transition ease-in-out duration-300 transform'
                  leaveFrom='translate-x-0'
                  leaveTo='translate-x-full'
                >
                  <DialogPanel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto py-4 pb-6 shadow-xl bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                    <div className='flex items-center justify-between px-4'>
                      <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                        {t('History.Filters')}
                      </h2>
                      <button
                        type='button'
                        className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md focus:outline-none focus:ring-2 p-2 bg-white text-gray-400 hover:bg-gray-50 focus:ring-primaryLight dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-primaryDark'
                        onClick={() => setOpen(false)}
                      >
                        <span className='sr-only'>{t('Common.Close menu')}</span>
                        <FontAwesomeIcon icon={faXmark} className='h-5 w-5' aria-hidden='true' />
                      </button>
                    </div>

                    {/* Filters (mobile) */}
                    <form className='mt-4'>
                      {/* call type filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={callTypeFilter?.name}
                        className='border-t border-gray-200 px-4 py-6 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <DisclosureButton className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {t(`History.${callTypeFilter?.name}`)}
                                </span>
                                <span className='ml-6 flex items-center'>
                                  <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={classNames(
                                      open ? '-rotate-180' : 'rotate-0',
                                      'h-3 w-3 transform',
                                    )}
                                    aria-hidden='true'
                                  />
                                </span>
                              </DisclosureButton>
                            </h3>
                            <DisclosurePanel className='pt-6 flex flex-col space-y-2'>
                              <fieldset>
                                <legend className='sr-only'>{callTypeFilter?.name}</legend>
                              </fieldset>
                              {/* show call type filter only if user has cdr permissions */}
                              {profile?.macro_permissions?.cdr?.permissions?.ad_cdr?.value && (
                                <>
                                  <div className='space-y-4'>
                                    {callTypeFilter?.options?.map((option) => (
                                      <div key={option?.value} className='flex items-center'>
                                        <input
                                          id={option?.value}
                                          name={`filter-${callTypeFilter?.id}`}
                                          type='radio'
                                          defaultChecked={option?.value === callType}
                                          onChange={changeCallType}
                                          className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                        />
                                        <label
                                          htmlFor={option?.value}
                                          className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                        >
                                          {t(`History.${option?.label}`)}
                                        </label>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Divider  */}
                                  <div className='relative'>
                                    <div
                                      className='absolute inset-0 flex items-center'
                                      aria-hidden='true'
                                    >
                                      <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
                                    </div>
                                  </div>
                                </>
                              )}

                              <fieldset>
                                <legend className='sr-only'>{callDirectionFilter?.name}</legend>
                              </fieldset>

                              {/* Call direction filter (mobile) */}
                              {internalUsed && (
                                <div className='space-y-4'>
                                  {callDirectionFilter.options.map((option) => (
                                    <div key={option?.value} className='flex items-center'>
                                      <input
                                        id={option.value}
                                        name={`filter-${callDirectionFilter.id}`}
                                        type='radio'
                                        defaultChecked={
                                          callType === 'user' && callDirection === 'internal'
                                            ? option.value === 'all'
                                            : option.value === callDirection
                                        }
                                        onChange={changeCallDirection}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                      >
                                        {t(`History.${option.label}`)}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!internalUsed && (
                                <div className='space-y-4'>
                                  {callDirectionFilterNoInternal.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={option.value}
                                        name={`filter-${callDirectionFilter.id}`}
                                        type='radio'
                                        defaultChecked={
                                          callType === 'user' && callDirection === 'internal'
                                            ? option.value === 'all'
                                            : option.value === callDirection
                                        }
                                        onChange={changeCallDirection}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                      >
                                        {t(`History.${option.label}`)}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </DisclosurePanel>
                          </>
                        )}
                      </Disclosure>
                    </form>

                    {/* Date input mobile */}
                    <form className='mt-4'>
                      <Disclosure
                        as='div'
                        key={date.name}
                        className='border-t border-gray-200 px-4 py-6 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <DisclosureButton className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {t(`History.${date.name}`)}
                                </span>
                                <span className='ml-6 flex items-center'>
                                  <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={classNames(
                                      open ? '-rotate-180' : 'rotate-0',
                                      'h-3 w-3 transform',
                                    )}
                                    aria-hidden='true'
                                  />
                                </span>
                              </DisclosureButton>
                            </h3>
                            <DisclosurePanel className='pt-6 flex flex-col'>
                              <fieldset>
                                <legend className='sr-only'>{date.name}</legend>
                              </fieldset>
                              <div className='flex pb-4'>
                                <div className='relative flex-1'>
                                  <label
                                    htmlFor='startTime'
                                    className='text-gray-700 dark:text-gray-300 mt-2'
                                  >
                                    {t('History.Start time')}:
                                  </label>
                                  <input
                                    id='startTime'
                                    type='time'
                                    ref={hourBeginRef}
                                    onChange={changeHourBegin}
                                    defaultValue={hourBeginValue}
                                    className={classNames(timePickerTheme.base)}
                                  />
                                </div>
                                <div className='mx-4'></div>
                                <div className='relative flex-1'>
                                  <label
                                    htmlFor='endTime'
                                    className='text-gray-700 dark:text-gray-300 mb-2'
                                  >
                                    {t('History.End time')}:
                                  </label>
                                  <input
                                    id='endTime'
                                    type='time'
                                    ref={hourEndRef}
                                    onChange={changeHourEnd}
                                    defaultValue={hourEndValue}
                                    className={classNames(timePickerTheme.base)}
                                  />
                                </div>
                              </div>

                              <Datepicker
                                i18n={selectedLanguage?.toString()}
                                value={dateValue}
                                onChange={changeDateBegin}
                                primaryColor={'emerald'}
                                showShortcuts={false}
                                separator={t('History.to') || ''}
                                placeholder={t('History.Choose a date range') || ''}
                                inputClassName={classNames(datePickerTheme.base)}
                              />
                            </DisclosurePanel>
                          </>
                        )}
                      </Disclosure>
                    </form>

                    {/* Sort input mobile */}
                    <form className='mt-4'>
                      <Disclosure
                        as='div'
                        key={sortFilter.name}
                        className='border-t border-gray-200 px-4 py-6 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <DisclosureButton className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {t(`History.${sortFilter.name}`)}
                                </span>
                                <span className='ml-6 flex items-center'>
                                  <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className={classNames(
                                      open ? '-rotate-180' : 'rotate-0',
                                      'h-3 w-3 transform',
                                    )}
                                    aria-hidden='true'
                                  />
                                </span>
                              </DisclosureButton>
                            </h3>
                            <DisclosurePanel className='pt-6 flex flex-col'>
                              <fieldset>
                                <legend className='sr-only'>
                                  {t(`History.${sortFilter.name}`)}
                                </legend>
                              </fieldset>
                              <div className='space-y-4'>
                                {sortFilter.options.map((option) => (
                                  <div key={option.value} className='flex items-center'>
                                    <input
                                      id={option.value}
                                      name={`filter-${sortFilter.id}`}
                                      type='radio'
                                      defaultChecked={option.value === sortBy}
                                      onChange={changeSortBy}
                                      className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                    />
                                    <label
                                      htmlFor={option.value}
                                      className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200 space-y-4'
                                    >
                                      {t(`History.${option.label}`)}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </DisclosurePanel>
                          </>
                        )}
                      </Disclosure>
                    </form>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </Dialog>
          </Transition>

          {/* Filter pc */}
          <div className='mx-auto text-center'>
            <section aria-labelledby='filter-heading' className='pb-8'>
              <h2 id='filter-heading' className='sr-only'>
                {t('History.History filters')}
              </h2>

              <div className='flex items-center space-x-8'>
                <div className='flex items-center'>
                  <TextInput
                    placeholder={t('History.Filter by name or number') || ''}
                    className='max-w-lg'
                    value={filterText}
                    onChange={changeFilterText}
                    ref={textFilterRef}
                    leadingIcon={faMagnifyingGlass}
                    icon={filterText.length ? faCircleXmark : undefined}
                    onIconClick={() => clearTextFilter()}
                    trailingIcon={true}
                  />
                </div>
                <div className='flex'>
                  <PopoverGroup className='hidden sm:flex sm:items-baseline sm:space-x-4'>
                    {/* call type filter */}
                    <Popover
                      as='div'
                      key={callTypeFilter?.name}
                      id={`desktop-menu-${callTypeFilter?.id}`}
                      className='relative inline-block text-left'
                    >
                      <div>
                        <PopoverButton className='px-3 py-2 text-sm leading-4 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
                          <span> {t(`History.${callTypeFilter?.name}`)}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                            aria-hidden='true'
                          />
                        </PopoverButton>
                      </div>
                      <Transition
                        as={Fragment}
                        enter='transition ease-out duration-100'
                        enterFrom='transform opacity-0 scale-95'
                        enterTo='transform opacity-100 scale-100'
                        leave='transition ease-in duration-75'
                        leaveFrom='transform opacity-100 scale-100'
                        leaveTo='transform opacity-0 scale-95'
                      >
                        <PopoverPanel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md flex flex-col space-y-4 bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 dark:ring-gray-700 '>
                          {/* Call type */}
                          <>
                            <form className='space-y-4'>
                              {callTypeFilter?.options
                                ?.filter((option) => {
                                  // check user permissions for switchboard and groups type
                                  if (option.value === 'switchboard') {
                                    return profile?.macro_permissions?.cdr?.permissions?.ad_cdr
                                      ?.value
                                  } else if (option.value === 'group') {
                                    return profile?.macro_permissions?.cdr?.permissions?.group_cdr
                                      ?.value
                                  } else {
                                    return true
                                  }
                                })
                                .map((option) => (
                                  <div key={option?.value} className='flex items-center'>
                                    <input
                                      id={option?.value}
                                      name={`filter-${callTypeFilter?.id}`}
                                      type='radio'
                                      defaultChecked={option?.value === callType}
                                      onChange={changeCallType}
                                      className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                    />
                                    <label
                                      htmlFor={option?.value}
                                      className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                    >
                                      {t(`History.${option?.label}`)}
                                    </label>
                                  </div>
                                ))}
                            </form>

                            {/* Divider */}
                            <div className='relative '>
                              <div
                                className='absolute inset-0 flex items-center'
                                aria-hidden='true'
                              >
                                <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                              </div>
                            </div>
                          </>

                          {/* Call direction */}
                          {internalUsed && (
                            <form className='space-y-4'>
                              {callDirectionFilter.options.map((option) => (
                                <div key={option.value} className='flex items-center'>
                                  <input
                                    id={option.value}
                                    name={`filter-${callDirectionFilter.id}`}
                                    type='radio'
                                    defaultChecked={
                                      callType === 'user' && callDirection === 'internal'
                                        ? option.value === 'all'
                                        : option.value === callDirection
                                    }
                                    onChange={changeCallDirection}
                                    className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                  />
                                  <label
                                    htmlFor={option.value}
                                    className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                  >
                                    {t(`History.${option.label}`)}
                                  </label>
                                </div>
                              ))}
                            </form>
                          )}
                          {!internalUsed && (
                            <form className='space-y-4'>
                              {callDirectionFilterNoInternal.options.map((option) => (
                                <div key={option.value} className='flex items-center'>
                                  <input
                                    id={option.value}
                                    name={`filter-${callDirectionFilter.id}`}
                                    type='radio'
                                    defaultChecked={
                                      callType === 'user' && callDirection === 'internal'
                                        ? option.value === 'all'
                                        : option.value === callDirection
                                    }
                                    onChange={changeCallDirection}
                                    className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                  />
                                  <label
                                    htmlFor={option.value}
                                    className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                  >
                                    {t(`History.${option.label}`)}
                                  </label>
                                </div>
                              ))}
                            </form>
                          )}
                        </PopoverPanel>
                      </Transition>
                    </Popover>

                    {/* Date filter */}
                    <Popover className='relative inline-block text-left'>
                      <div>
                        <PopoverButton className='px-3 py-2 text-sm leading-4 rounded border p-2  shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
                          <span> {t(`History.${date.name}`)}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                            aria-hidden='true'
                          />
                        </PopoverButton>
                      </div>
                      <Transition
                        as={Fragment}
                        enter='transition ease-out duration-100'
                        enterFrom='transform opacity-0 scale-95'
                        enterTo='transform opacity-100 scale-100'
                        leave='transition ease-in duration-75'
                        leaveFrom='transform opacity-100 scale-100'
                        leaveTo='transform opacity-0 scale-95'
                      >
                        <PopoverPanel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white ring-black dark:bg-gray-900 dark:ring-gray-600  p-4 shadow-2xl ring-1 ring-opacity-5'>
                          <div className='flex pb-4'>
                            <div className='relative flex-1'>
                              <label
                                htmlFor='startTime'
                                className='text-gray-700 dark:text-gray-300 mt-2'
                              >
                                {t('History.Start time')}:
                              </label>
                              <input
                                id='startTime'
                                type='time'
                                ref={hourBeginRef}
                                onChange={changeHourBegin}
                                defaultValue={hourBeginValue}
                                className={classNames(timePickerTheme.base)}
                              />
                            </div>
                            <div className='mx-4'></div>
                            <div className='relative flex-1'>
                              <label
                                htmlFor='endTime'
                                className='text-gray-700 dark:text-gray-300 mb-2'
                              >
                                {t('History.End time')}:
                              </label>
                              <input
                                id='endTime'
                                type='time'
                                ref={hourEndRef}
                                onChange={changeHourEnd}
                                defaultValue={hourEndValue}
                                className={classNames(timePickerTheme.base)}
                              />
                            </div>
                          </div>

                          <Datepicker
                            i18n={selectedLanguage?.toString()}
                            value={dateValue}
                            onChange={changeDateBegin}
                            primaryColor={'emerald'}
                            showShortcuts={false}
                            separator={t('History.to') || ''}
                            placeholder={t('History.Choose a date range') || ''}
                            displayFormat={'DD/MM/YYYY'}
                            inputClassName={classNames(datePickerTheme.base)}
                          />
                        </PopoverPanel>
                      </Transition>
                    </Popover>

                    {/* Sort filter */}
                    <Popover
                      as='div'
                      key={sortFilter.name}
                      id={`desktop-menu-${sortFilter.id}`}
                      className='relative inline-block text-left'
                    >
                      <div>
                        <PopoverButton className='px-3 py-2 text-sm leading-4 p-2 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
                          <span>{t(`History.${sortFilter.name}`)}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                            aria-hidden='true'
                          />
                        </PopoverButton>
                      </div>

                      <Transition
                        as={Fragment}
                        enter='transition ease-out duration-100'
                        enterFrom='transform opacity-0 scale-95'
                        enterTo='transform opacity-100 scale-100'
                        leave='transition ease-in duration-75'
                        leaveFrom='transform opacity-100 scale-100'
                        leaveTo='transform opacity-0 scale-95'
                      >
                        <PopoverPanel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md p-4 shadow-2xl ring-1 ring-opacity-5 focus:outline-none bg-white ring-black dark:bg-gray-900 dark:ring-gray-600'>
                          <form className='space-y-4'>
                            {sortFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${sortFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === sortBy}
                                  onChange={changeSortBy}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                >
                                  {t(`History.${option.label}`)}
                                </label>
                              </div>
                            ))}
                          </form>
                        </PopoverPanel>
                      </Transition>
                    </Popover>
                  </PopoverGroup>
                  <button
                    type='button'
                    className='inline-block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900  dark:hover:text-gray-100 sm:hidden ml-4'
                    onClick={() => setOpen(true)}
                  >
                    {t('History.Filters')}
                  </button>
                </div>
              </div>

              {/* Active filters */}
              <div>
                <div className='mx-auto pt-3 flex flex-wrap items-center gap-y-2 gap-x-4'>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 text-left sm:text-center'>
                    {t('Common.Active filters')}
                  </h3>
                  {/* separator */}
                  <div aria-hidden='true' className='h-5 w-px block bg-gray-300 dark:bg-gray-600' />
                  {/* show selected call type only if user has cdr permissions */}
                  {profile.macro_permissions?.cdr?.permissions?.ad_cdr?.value && (
                    <div className='mt-0'>
                      <div className='-m-1 flex flex-wrap items-center'>
                        <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                          <span className='text-gray-600 dark:text-gray-300'>
                            {t('History.Call type')}:&nbsp;
                          </span>
                          {callTypeLabel && t(`History.${callTypeLabel}`)}
                        </span>
                      </div>
                    </div>
                  )}
                  {/* Call direction */}
                  <div className='mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {t('History.Call direction')}:&nbsp;
                        </span>
                        {callDirectionLabel && t(`History.${callDirectionLabel}`)}
                      </span>
                    </div>
                  </div>
                  {/* filter date from */}
                  <div className='mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {t('History.From')}:&nbsp;
                        </span>
                        {!dateValue.startDate || clearSelected ? labelForDateFrom : dateBeginShowed}
                      </span>
                    </div>
                  </div>
                  {/* Filter date to  */}
                  <div className='mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {t('History.To')}:&nbsp;
                        </span>
                        {!dateValue.endDate || clearSelected ? labelForDateTo : dateEndShowed}
                      </span>
                    </div>
                  </div>
                  {/* separator */}
                  <div
                    aria-hidden='true'
                    className='h-5 w-px sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  <div>
                    {/* reset filters */}
                    <div className='mt-0 text-center'>
                      <button
                        type='button'
                        className='text-sm hover:underline text-primary dark:text-primaryDark'
                        onClick={clearFilters}
                      >
                        {t('Common.Reset filters')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  },
)

Filter.displayName = 'Filter'
