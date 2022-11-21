// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import React from 'react'
import classNames from 'classnames'
import { TextInput } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'

const sortFilter = {
  id: 'sort',
  name: 'Sort by',
  options: [
    { value: 'time%20asc', label: 'Oldest' },
    { value: 'time%20desc', label: 'Newest' },
  ],
}

const date = {
  id: 'date',
  name: 'Date',
}

//First filter: personal e all
const contactTypeFilter = {
  id: 'kind',
  name: 'Call type',
  options: [
    { value: 'user', label: 'Personal' },
    { value: 'switchboard', label: 'Switchboard' },
  ],
}

//Filter for the direction: All/ Personal/ Incoming/ Outgoing/ Lost
const contactDirectionFilter = {
  id: 'direction',
  name: 'contact direction',
  options: [
    { value: 'all', label: 'All' },
    { value: 'in', label: 'Incoming' },
    { value: 'out', label: 'Outcoming' },
    { value: 'lost', label: 'Missed' },
    { value: 'internal', label: 'Internal' },
  ],
}

const contactDirectionFilterNoInternal = {
  id: 'direction',
  name: 'contact direction',
  options: [
    { value: 'all', label: 'All' },
    { value: 'in', label: 'Incoming' },
    { value: 'out', label: 'Outcoming' },
    { value: 'lost', label: 'Missed' },
  ],
}

export interface FilterProps extends ComponentPropsWithRef<'div'> {
  updateFilterText: Function
  updateContactTypeFilter: Function
  updateContactDirectionFilter: Function
  updateDataBeginFilter: Function
  updateDataEndFilter: Function
  updateSortFilter: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  (
    {
      updateFilterText,
      updateContactTypeFilter,
      updateContactDirectionFilter,
      updateDataBeginFilter,
      updateDataEndFilter,
      updateSortFilter,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalUsed, setInternalUsed] = useState(false)

    const [dateBeginValue, setdateBeginValue] = useState('')
    const [dateEndValue, setdateEndValue] = useState('')

    const [open, setOpen] = useState(false)
    const [filterText, setFilterText] = useState('')

    const [contactDirectionLabel, setContactDirectionLabel] = useState('')

    const [contactTypeLabel, setContactTypeLabel] = useState('')

    const [contactDirection, setContactDirection] = useState('all')

    const [isHistoryLoaded, setHistoryLoaded] = useState(false)
    const [history, setHistory]: any = useState({})
    const [historyError, setHistoryError] = useState('')

    const [contactType, setContactType] = useState('user')

    const [dataBeginNohour, setDataBeginNohour] = useState('')
    const [dataEndNohour, setDataEndNohour] = useState('')

    const [dateBeginShowed, setDateBeginShowed] = useState('')
    const [dateEndShowed, setDateEndShowed] = useState('')

    //Sorting filter
    const [sortBy, setSortBy]: any = useState('time%20asc')
    function changeSortBy(event: any) {
      const newSortBy = event.target.id
      setSortBy(newSortBy)
      // update history (notify parent component)
      updateSortFilter(newSortBy)
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

    //Get actual date
    const current = new Date()
    const actualDate = `${current.getDate()}/${
      current.getMonth() + 1
    }/${current.getFullYear()}/${current.getHours()}:${current.getMinutes()}`
    // Delete the slash beetwen the date and the hour
    const actualDateFormatted = actualDate.replace(
      /^(\d{1,2}\/\d{1,2}\/\d{4})\/(\d{1,2}:\d{2})$/,
      '$1 $2',
    )

    //Get one week before date
    const oneWeekBeforeDate = `${current.getDate() - 7}/${
      current.getMonth() + 1
    }/${current.getFullYear()}/${current.getHours()}:${current.getMinutes()}`
    // Delete the slash beetwen the date and the hour
    const oneWeekBeforeDateFormatted = oneWeekBeforeDate.replace(
      /^(\d{1,2}\/\d{1,2}\/\d{4})\/(\d{1,2}:\d{2})$/,
      '$1 $2',
    )

    //Set the date of begin search
    const changeDateBegin = () => {
      const dateBegin = dateBeginRef.current.value
      let noHour = dateBegin.split('T')[0]
      setDataBeginNohour(noHour)
      // update history (notify parent component)
      updateDataBeginFilter(noHour)
      setdateBeginValue(dateBegin)
      // update the begin date that will be showed in the filter
      setDateBeginShowed(dateBegin.replace(/T/g, ' ').replace(/-/g, '/'))
    }

    //Set the date of end search
    const changeDateEnd = () => {
      const dateEnd = dateEndRef.current.value
      let noEndHour = dateEnd.split('T')[0]
      setDataEndNohour(noEndHour)
      // update history (notify parent component)
      updateDataEndFilter(noEndHour)
      setdateEndValue(dateEnd)
      // update the begin date that will be showed in the filter
      setDateEndShowed(dateEnd.replace(/T/g, ' ').replace(/-/g, '/'))
    }

    //Get value from data input
    const dateBeginRef = useRef() as React.MutableRefObject<HTMLInputElement>
    const dateEndRef = useRef() as React.MutableRefObject<HTMLInputElement>

    function changeFilterText(event: any) {
      const newFilterText = event.target.value
      setFilterText(newFilterText)
      // update history (notify parent component)
      updateFilterText(newFilterText)
    }

    //Check the item selected for the contact type
    function changeContactType(event: any) {
      const newContactType = event.target.id
      setContactType(newContactType)
      //Call the function to check if personal call is selected
      checkSelected(newContactType)
      updateContactTypeFilter(newContactType)
    }

    //Check the call direction selected for the contact type
    function changeContactDirection(event: any) {
      const newContactDirection = event.target.id
      setContactDirection(newContactDirection)
      updateContactDirectionFilter(newContactDirection)
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
      if (contactTypeFound && contactTypeFound.label === 'Personal' && contactDirection === 'internal') {
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

    return (
      <div>
        <div className=''>
          {/* filter mobile */}
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
                <div className='fixed inset-0 bg-black bg-opacity-25' />
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
                  <Dialog.Panel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl'>
                    <div className='flex items-center justify-between px-4'>
                      <h2 className='text-lg font-medium text-gray-900'>Filters</h2>
                      <button
                        type='button'
                        className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
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
                        className='border-t border-gray-200 px-4 py-6'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400'>
                                <span className='font-medium text-gray-900'>
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
                                      className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                    />
                                    <label
                                      htmlFor={option.value}
                                      className='ml-3 block text-sm font-medium text-gray-700'
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <div className='relative'>
                                <div
                                  className='absolute inset-0 flex items-center'
                                  aria-hidden='true'
                                >
                                  <div className='w-full border-t border-gray-300' />
                                </div>
                              </div>
                              <fieldset>
                                <legend className='sr-only'>{contactDirectionFilter.name}</legend>
                              </fieldset>
                              {internalUsed && (
                                <div className='space-y-4'>
                                  {contactDirectionFilter.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={option.value}
                                        name={`filter-${contactDirectionFilter.id}`}
                                        type='radio'
                                        defaultChecked={
                                          contactType === 'user'
                                            ? option.value === 'all'
                                            : option.value === contactDirection
                                        }
                                        onChange={changeContactDirection}
                                        className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700'
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
                                          contactType === 'user'
                                            ? option.value === 'all'
                                            : option.value === contactDirection
                                        }
                                        onChange={changeContactDirection}
                                        className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700'
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
                        className='border-t border-gray-200 px-4 py-6'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400'>
                                <span className='font-medium text-gray-900'>{date.name}</span>
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
                                    className='max-w-sm text-red-500'
                                    id='meeting-time'
                                    name='meeting-time'
                                    ref={dateBeginRef}
                                    onChange={changeDateBegin}
                                    defaultValue={dateBeginValue}
                                  />
                                </div>
                                <span className='mx-4 text-gray-500 space-y-4'>to</span>
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
                        className='border-t border-gray-200 px-4 py-6'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400'>
                                <span className='font-medium text-gray-900'>{sortFilter.name}</span>
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
                                      className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                    />
                                    <label
                                      htmlFor={option.value}
                                      className='ml-3 block text-sm font-medium text-gray-700'
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
                    placeholder='Filter contacts'
                    className='max-w-sm'
                    value={filterText}
                    onChange={changeFilterText}
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
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
                          <span>{contactTypeFilter.name}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500'
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none flex flex-col space-y-4'>
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
                                  className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700'
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </form>

                          {/* Divider */}
                          <div className='relative'>
                            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                              <div className='w-full border-t border-gray-300' />
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
                                      contactType === 'user'
                                        ? option.value === 'all'
                                        : option.value === contactDirection
                                    }
                                    onChange={changeContactDirection}
                                    className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                  />
                                  <label
                                    htmlFor={option.value}
                                    className='ml-3 block text-sm font-medium text-gray-700'
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
                                      contactType === 'user'
                                        ? option.value === 'all'
                                        : option.value === contactDirection
                                    }
                                    onChange={changeContactDirection}
                                    className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                  />
                                  <label
                                    htmlFor={option.value}
                                    className='ml-3 block text-sm font-medium text-gray-700'
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
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
                          <span>{date.name}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500'
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5'>
                          <div className='flex items-center'>
                            <div className='relative '>
                              <TextInput
                                type='datetime-local'
                                placeholder='Select date start'
                                className='max-w-sm text-red-500'
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
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
                          <span>{sortFilter.name}</span>
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500'
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none'>
                          <form className='space-y-4'>
                            {sortFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${sortFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === sortBy}
                                  onChange={changeSortBy}
                                  className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700'
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
              <div className='bg-gray-100'>
                <div className='mx-auto pt-3 sm:flex sm:items-center'>
                  <h3 className='text-sm font-medium text-gray-500'>Active filters</h3>
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px bg-gray-300 sm:ml-4 sm:block'
                  />
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-700'>
                        <span className='text-gray-500'>Call type:&nbsp;</span>
                        {contactTypeLabel}
                      </span>
                    </div>
                  </div>
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-700'>
                        <span className='text-gray-500'>Call direction:&nbsp;</span>
                        {contactDirectionLabel}
                      </span>
                    </div>
                  </div>
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-700'>
                        <span className='text-gray-500'>From:&nbsp;</span>
                        {!dateBeginValue ? oneWeekBeforeDateFormatted : dateBeginShowed}
                      </span>
                    </div>
                  </div>
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-700'>
                        <span className='text-gray-500'>To:&nbsp;</span>
                        {!dateEndValue ? actualDateFormatted : dateEndShowed}
                      </span>
                    </div>
                  </div>
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px bg-gray-300 sm:ml-4 sm:block'
                  />
                  <div className='pl-6'>
                    <button type='button' className='text-gray-500'>
                      Clear all
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
