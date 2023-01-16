// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import React from 'react'
import classNames from 'classnames'
import { TextInput } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleXmark, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { savePreference } from '../../lib/storage'
import {
  DEFAULT_CONTACT_TYPE_FILTER,
  DEFAULT_CONTACT_DIRECTION_FILTER,
  DEFAULT_SORT_BY,
  getFilterValues,
} from '../../lib/history'
import { formatDateLoc } from '../../lib/dateTime'
import { parse, subDays, startOfDay } from 'date-fns'

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

//Contact type filter: Personal/ Switchboard
const contactTypeFilter = {
  id: 'kind',
  name: 'Call type',
  options: [
    { value: 'user', label: 'Personal' },
    { value: 'switchboard', label: 'Switchboard' },
  ],
}

//Filter for the direction: All/ Incoming/ Outgoing/ Missed/ Internal
const contactDirectionFilter = {
  id: 'direction',
  name: 'contact direction',
  options: [
    { value: 'all', label: 'All' },
    { value: 'in', label: 'Incoming' },
    { value: 'out', label: 'Outgoing' },
    { value: 'lost', label: 'Missed' },
    { value: 'internal', label: 'Internal' },
  ],
}

//Filter for the direction: All/ Incoming/ Outgoing/ Missed
const contactDirectionFilterNoInternal = {
  id: 'direction',
  name: 'contact direction',
  options: [
    { value: 'all', label: 'All' },
    { value: 'in', label: 'Incoming' },
    { value: 'out', label: 'Outgoing' },
    { value: 'lost', label: 'Missed' },
  ],
}

export interface FilterProps extends ComponentPropsWithRef<'div'> {
  updateFilterText: Function
  updateContactTypeFilter: Function
  updateContactDirectionFilter: Function
  updateDateBeginFilter: Function
  updateDateEndFilter: Function
  updateSortFilter: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  (
    {
      updateFilterText,
      updateContactTypeFilter,
      updateContactDirectionFilter,
      updateDateBeginFilter,
      updateDateEndFilter,
      updateSortFilter,
      className,
      ...props
    },
    ref,
  ) => {
    const auth = useSelector((state: RootState) => state.authentication)
    const [internalUsed, setInternalUsed] = useState(false)

    const [dateBeginValue, setdateBeginValue] = useState('')
    const [dateEndValue, setdateEndValue] = useState('')

    const [open, setOpen] = useState(false)

    const [filterText, setFilterText] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

    const [contactDirectionLabel, setContactDirectionLabel] = useState('')

    const [contactTypeLabel, setContactTypeLabel] = useState('')

    const [contactDirection, setContactDirection] = useState('all')

    const [contactType, setContactType] = useState('user')

    const [dateBeginShowed, setDateBeginShowed] = useState('')
    const [dateEndShowed, setDateEndShowed] = useState('')

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
      contactDirectionFilter.options
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

    //Set the date when the date filter is changed
    const changeDateBegin = () => {
      //Get the date from the input
      const dateBegin = dateBeginRef.current.value
      //Convert the date to the format for the visualizations
      let convertDateBegin = parse(dateBegin, "yyyy-MM-dd'T'HH:mm", new Date())
      //Convert from object to string and format the date
      let dateBeginWithHour: any = formatDateLoc(convertDateBegin, 'PPp')
      //Convert the the date get from the input to the format without hours
      let noHour: any = formatDateLoc(convertDateBegin, 'yyyy-MM-dd')
      // update history (notify parent component) with the date without hours for the api calls
      updateDateBeginFilter(noHour)
      // update the begin date that will be showed in the calendar filter
      setdateBeginValue(dateBegin)
      // update the begin date that will be showed in the filter
      setDateBeginShowed(dateBeginWithHour)
      setClearSelected(false)
    }

    //Set the date of end search
    const changeDateEnd = () => {
      const dateEnd = dateEndRef.current.value
      //Convert the date to the format for the visualizations
      let convertDateBegin = parse(dateEnd, "yyyy-MM-dd'T'HH:mm", new Date())
      //Convert from object to string and format the date
      let dateEndWithHour: any = formatDateLoc(convertDateBegin, 'PPp')
      //Convert the the date get from the input to the format without hours
      let noEndHour: any = formatDateLoc(convertDateBegin, 'yyyy-MM-dd')
      // update history (notify parent component) with the date without hours for the api calls
      updateDateEndFilter(noEndHour)
      // update the begin date that will be showed in the calendar filter
      setdateEndValue(dateEnd)
      // update the begin date that will be showed in the filter
      setDateEndShowed(dateEndWithHour)
      setClearSelected(false)
    }

    //Get value from date input
    const dateBeginRef = useRef() as React.MutableRefObject<HTMLInputElement>
    const dateEndRef = useRef() as React.MutableRefObject<HTMLInputElement>

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

    //Check the item selected for the contact type
    function changeContactType(event: any) {
      const newContactType = event.target.id
      setContactType(newContactType)
      //Call the function to check if personal call is selected
      checkSelected(newContactType)
      updateContactTypeFilter(newContactType)
      savePreference('historyContactTypeFilter', newContactType, auth.username)
    }

    //Check the call direction selected for the contact type
    function changeContactDirection(event: any) {
      const newContactDirection = event.target.id
      setContactDirection(newContactDirection)
      updateContactDirectionFilter(newContactDirection)
      savePreference('historyContactTypeDirection', newContactDirection, auth.username)
    }

    //Set the label for the selected contact type
    //Also check if the selected contact is user
    //In positive case set the contact direction filter to All
    useEffect(() => {
      const contactTypeFound = contactTypeFilter.options.find(
        (option) => option.value === contactType,
      )
      if (contactTypeFound) {
        setContactTypeLabel(contactTypeFound.label)
      }
    }, [contactType])

    useEffect(() => {
      if (contactType === 'user' && contactDirection === 'internal') {
        setContactDirectionLabel('All')
        setContactDirection('all')
        updateContactDirectionFilter('all')
      }
    }, [contactType, contactDirection])

    //Set the label for the selected contact type
    useEffect(() => {
      const contactDirectionFound = contactDirectionFilter.options.find(
        (option) => option.value === contactDirection,
      )
      if (contactDirectionFound) {
        setContactDirectionLabel(contactDirectionFound.label)
      }
    }, [contactDirection])

    //Get the selected filter from the local storage
    useEffect(() => {
      const filterValues = getFilterValues(auth.username)
      setContactType(filterValues.contactType)
      setContactDirection(filterValues.contactDirection)
      setSortBy(filterValues.sortBy)
      checkSelected(filterValues.contactType)

      // notify parent component
      updateContactTypeFilter(filterValues.contactType)
      updateContactDirectionFilter(filterValues.contactDirection)
      updateSortFilter(filterValues.sortBy)
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
      setContactType(DEFAULT_CONTACT_TYPE_FILTER)
      setContactDirection(DEFAULT_CONTACT_DIRECTION_FILTER)
      setdateBeginValue(actualDateLabelFrom)
      setdateEndValue(actualDateLabelTo)
      setSortBy(DEFAULT_SORT_BY)
      savePreference('historyContactTypeFilter', DEFAULT_CONTACT_TYPE_FILTER, auth.username)
      savePreference('historyContactTypeDirection', DEFAULT_CONTACT_DIRECTION_FILTER, auth.username)
      savePreference('historySortTypePreference', DEFAULT_SORT_BY, auth.username)

      // notify parent component
      updateFilterText('')
      updateContactTypeFilter(DEFAULT_CONTACT_TYPE_FILTER)
      updateContactDirectionFilter(DEFAULT_CONTACT_DIRECTION_FILTER)
      updateDateBeginFilter(dateFromForReset)
      updateDateEndFilter(actualDateForReset)
      updateSortFilter(DEFAULT_SORT_BY)
      checkSelected(DEFAULT_CONTACT_TYPE_FILTER)
    }

    return (
      <div className={classNames('bg-gray-100 dark:bg-gray-800', className)} {...props}>
        <div className=''>
          {/* Drawer filter mobile */}
          <Transition.Root show={open} as={Fragment}>
            <Dialog as='div' className='relative z-40 sm:hidden' onClose={setOpen}>
              <Transition.Child
                as={Fragment}
                enter='transition-opacity ease-linear duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='transition-opacity ease-linear duration-300'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <div className='fixed inset-0 bg-black bg-opacity-25 dark:bg-black dark:bg-opacity-25' />
              </Transition.Child>

              <div className='fixed inset-0 z-40 flex'>
                <Transition.Child
                  as={Fragment}
                  enter='transition ease-in-out duration-300 transform'
                  enterFrom='translate-x-full'
                  enterTo='translate-x-0'
                  leave='transition ease-in-out duration-300 transform'
                  leaveFrom='translate-x-0'
                  leaveTo='translate-x-full'
                >
                  <Dialog.Panel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto py-4 pb-6 shadow-xl bg-white dark:bg-gray-900'>
                    <div className='flex items-center justify-between px-4'>
                      <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                        Filters
                      </h2>
                      <button
                        type='button'
                        className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md focus:outline-none focus:ring-2 p-2 bg-white text-gray-400 hover:bg-gray-50 focus:ring-primaryLight dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-primaryDark'
                        onClick={() => setOpen(false)}
                      >
                        <span className='sr-only'>Close menu</span>
                        <FontAwesomeIcon icon={faXmark} className='h-5 w-5' aria-hidden='true' />
                      </button>
                    </div>

                    {/* Filters (mobile) */}
                    <form className='mt-4'>
                      {/* contact type filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={contactTypeFilter.name}
                        className='border-t border-gray-200 px-4 py-6 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {contactTypeFilter.name}
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
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className='pt-6 flex flex-col space-y-2'>
                              <fieldset>
                                <legend className='sr-only'>{contactTypeFilter.name}</legend>
                              </fieldset>
                              <div className='space-y-4'>
                                {contactTypeFilter.options.map((option) => (
                                  <div key={option.value} className='flex items-center'>
                                    <input
                                      id={option.value}
                                      name={`filter-${contactTypeFilter.id}`}
                                      type='radio'
                                      defaultChecked={option.value === contactType}
                                      onChange={changeContactType}
                                      className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                    />
                                    <label
                                      htmlFor={option.value}
                                      className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                    >
                                      {option.label}
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

                              <fieldset>
                                <legend className='sr-only'>{contactDirectionFilter.name}</legend>
                              </fieldset>

                              {/* Contact direction filter (mobile) */}
                              {internalUsed && (
                                <div className='space-y-4'>
                                  {contactDirectionFilter.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={option.value}
                                        name={`filter-${contactDirectionFilter.id}`}
                                        type='radio'
                                        defaultChecked={
                                          contactType === 'user' && contactDirection === 'internal'
                                            ? option.value === 'all'
                                            : option.value === contactDirection
                                        }
                                        onChange={changeContactDirection}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!internalUsed && (
                                <div className='space-y-4'>
                                  {contactDirectionFilterNoInternal.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={option.value}
                                        name={`filter-${contactDirectionFilter.id}`}
                                        type='radio'
                                        defaultChecked={
                                          contactType === 'user' && contactDirection === 'internal'
                                            ? option.value === 'all'
                                            : option.value === contactDirection
                                        }
                                        onChange={changeContactDirection}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </Disclosure.Panel>
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
                              <Disclosure.Button className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {date.name}
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
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className='pt-6 flex flex-col'>
                              <fieldset>
                                <legend className='sr-only'>{date.name}</legend>
                              </fieldset>
                              <div className='flex flex-col'>
                                <div className='space-y-4'>
                                  <TextInput
                                    type='datetime-local'
                                    placeholder='Select date start'
                                    className='max-w-sm'
                                    id='meeting-time'
                                    name='meeting-time'
                                    ref={dateBeginRef}
                                    onChange={changeDateBegin}
                                    defaultValue={dateBeginValue}
                                  />
                                </div>
                                <span className='mx-32 py-2 font-medium text-gray-700 dark:text-gray-200 space-y-4'>
                                  To
                                </span>
                                <div className='space-y-4'>
                                  <TextInput
                                    type='datetime-local'
                                    placeholder='Select date end'
                                    className='max-w-sm'
                                    id='meeting-time'
                                    name='meeting-time'
                                    ref={dateEndRef}
                                    onChange={changeDateEnd}
                                    defaultValue={dateEndValue}
                                  />
                                </div>
                              </div>
                            </Disclosure.Panel>
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
                              <Disclosure.Button className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {sortFilter.name}
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
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className='pt-6 flex flex-col'>
                              <fieldset>
                                <legend className='sr-only'>{sortFilter.name}</legend>
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
                                      className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                    />
                                    <label
                                      htmlFor={option.value}
                                      className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200 space-y-4'
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>

          {/* Filter pc */}
          <div className='mx-auto text-center'>
            <section aria-labelledby='filter-heading' className='pb-4'>
              <h2 id='filter-heading' className='sr-only'>
                History filters
              </h2>

              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <TextInput
                    placeholder='Filter by name or number'
                    className='max-w-lg'
                    value={filterText}
                    onChange={changeFilterText}
                    ref={textFilterRef}
                    icon={faCircleXmark}
                    onIconClick={() => clearTextFilter()}
                    trailingIcon={true}
                  />
                </div>
                <div className='flex'>
                  <Popover.Group className='hidden sm:flex sm:items-baseline sm:space-x-8'>
                    {/* contact type filter */}
                    <Popover
                      as='div'
                      key={contactTypeFilter.name}
                      id={`desktop-menu-${contactTypeFilter.id}`}
                      className='relative inline-block text-left'
                    >
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'>
                          <span>{contactTypeFilter.name}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                            aria-hidden='true'
                          />
                        </Popover.Button>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md flex flex-col space-y-4 bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 dark:ring-gray-700 '>
                          {/* Call type */}
                          <form className='space-y-4'>
                            {contactTypeFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${contactTypeFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === contactType}
                                  onChange={changeContactType}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </form>

                          {/* Divider */}
                          <div className='relative '>
                            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                              <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                            </div>
                          </div>

                          {/* Call direction */}
                          {internalUsed && (
                            <form className='space-y-4'>
                              {contactDirectionFilter.options.map((option) => (
                                <div key={option.value} className='flex items-center'>
                                  <input
                                    id={option.value}
                                    name={`filter-${contactDirectionFilter.id}`}
                                    type='radio'
                                    defaultChecked={
                                      contactType === 'user' && contactDirection === 'internal'
                                        ? option.value === 'all'
                                        : option.value === contactDirection
                                    }
                                    onChange={changeContactDirection}
                                    className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                  />
                                  <label
                                    htmlFor={option.value}
                                    className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </form>
                          )}
                          {!internalUsed && (
                            <form className='space-y-4'>
                              {contactDirectionFilterNoInternal.options.map((option) => (
                                <div key={option.value} className='flex items-center'>
                                  <input
                                    id={option.value}
                                    name={`filter-${contactDirectionFilter.id}`}
                                    type='radio'
                                    defaultChecked={
                                      contactType === 'user' && contactDirection === 'internal'
                                        ? option.value === 'all'
                                        : option.value === contactDirection
                                    }
                                    onChange={changeContactDirection}
                                    className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                  />
                                  <label
                                    htmlFor={option.value}
                                    className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </form>
                          )}
                        </Popover.Panel>
                      </Transition>
                    </Popover>

                    {/* Date filter */}
                    <Popover className='relative inline-block text-left'>
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'>
                          <span>{date.name}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                            aria-hidden='true'
                          />
                        </Popover.Button>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white ring-black dark:bg-gray-900 dark:ring-gray-600  p-4 shadow-2xl ring-1 ring-opacity-5'>
                          <div className='flex items-center'>
                            <div className='relative '>
                              <TextInput
                                type='datetime-local'
                                placeholder='Select date start'
                                className='max-w-sm'
                                id='meeting-time'
                                name='meeting-time'
                                ref={dateBeginRef}
                                onChange={changeDateBegin}
                                defaultValue={dateBeginValue}
                              />
                            </div>
                            <span className='mx-4 text-gray-500'>to</span>
                            <div className='relative'>
                              <TextInput
                                type='datetime-local'
                                placeholder='Select date end'
                                className='max-w-sm'
                                id='meeting-time'
                                name='meeting-time'
                                ref={dateEndRef}
                                onChange={changeDateEnd}
                                defaultValue={dateEndValue}
                              />
                            </div>
                          </div>
                        </Popover.Panel>
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
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'>
                          <span>{sortFilter.name}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                            aria-hidden='true'
                          />
                        </Popover.Button>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md p-4 shadow-2xl ring-1 ring-opacity-5 focus:outline-none bg-white ring-black dark:bg-gray-900 dark:ring-gray-600'>
                          <form className='space-y-4'>
                            {sortFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${sortFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === sortBy}
                                  onChange={changeSortBy}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>
                  </Popover.Group>
                  <button
                    type='button'
                    className='inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden ml-4'
                    onClick={() => setOpen(true)}
                  >
                    Filters
                  </button>
                </div>
              </div>

              {/* Active filters */}
              <div>
                <div className='mx-auto pt-3 flex flex-wrap items-center'>
                  <h3 className='text-sm font-medium my-1 text-gray-500 dark:text-gray-400'>
                    Active filters
                  </h3>
                  <div
                    aria-hidden='true'
                    className='h-5 w-px mx-4 my-1 sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  <div className='mr-4 my-1'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 pl-3 pr-2 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span className='text-gray-500 dark:text-gray-400'>Call type:&nbsp;</span>
                        {contactTypeLabel}
                      </span>
                    </div>
                  </div>
                  <div className='mr-4 my-1'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 pl-3 pr-2 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span className='text-gray-500 dark:text-gray-400'>
                          Call direction:&nbsp;
                        </span>
                        {contactDirectionLabel}
                      </span>
                    </div>
                  </div>
                  <div className='mr-4 my-1'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 pl-3 pr-2 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span className='text-gray-500 dark:text-gray-400'>From:&nbsp;</span>
                        {!dateBeginValue || clearSelected ? labelForDateFrom : dateBeginShowed}
                      </span>
                    </div>
                  </div>
                  <div className='mr-4 my-1'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 pl-3 pr-2 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span className='text-gray-500 dark:text-gray-400'>To:&nbsp;</span>
                        {!dateEndValue || clearSelected ? labelForDateTo : dateEndShowed}
                      </span>
                    </div>
                  </div>
                  <div
                    aria-hidden='true'
                    className='h-5 w-px mr-4 my-1 sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  <div>
                    <button
                      type='button'
                      className='my-1 text-sm hover:underline text-gray-700 dark:text-gray-200'
                      onClick={clearFilters}
                    >
                      Reset filters
                    </button>
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
