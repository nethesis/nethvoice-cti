// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useRef } from 'react'
import classNames from 'classnames'
import { TextInput } from '../common'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleXmark, faXmark } from '@fortawesome/free-solid-svg-icons'
import { DEFAULT_CONTACT_TYPE_FILTER, DEFAULT_SORT_BY, getFilterValues } from '../../lib/phonebook'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { savePreference } from '../../lib/storage'
import { useTranslation } from 'react-i18next'

const sortFilter = {
  id: 'sort',
  name: 'Sort by',
  options: [
    { value: 'name', label: 'Name' },
    { value: 'company', label: 'Company' },
  ],
}

const contactTypeFilter = {
  id: 'kind',
  name: 'Contact type',
  options: [
    { value: 'all', label: 'All' },
    { value: 'person', label: 'Person' },
    { value: 'company', label: 'Company' },
  ],
}

export interface FilterProps extends ComponentPropsWithRef<'div'> {
  updateTextFilter: Function
  updateContactTypeFilter: Function
  updateSort: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  ({ updateTextFilter, updateContactTypeFilter, updateSort, className, ...props }, ref) => {
    const { t } = useTranslation()
    const auth = useSelector((state: RootState) => state.authentication)
    const [open, setOpen] = useState(false)

    const [textFilter, setTextFilter] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
    function changeTextFilter(event: any) {
      const newTextFilter = event.target.value
      setTextFilter(newTextFilter)

      // update phonebook (notify parent component)
      updateTextFilter(newTextFilter)
    }

    const clearTextFilter = () => {
      setTextFilter('')
      updateTextFilter('')
      textFilterRef.current.focus()
    }

    const [contactType, setContactType] = useState('all')
    function changeContactType(event: any) {
      const newContactType = event.target.id
      setContactType(newContactType)
      savePreference('phonebookContactTypeFilter', newContactType, auth.username)

      // update phonebook (notify parent component)
      updateContactTypeFilter(newContactType)
    }

    const [sortBy, setSortBy]: any = useState('name')
    function changeSortBy(event: any) {
      const newSortBy = event.target.id
      setSortBy(newSortBy)
      savePreference('phonebookSortBy', newSortBy, auth.username)

      // update phonebook (notify parent component)
      updateSort(newSortBy)
    }

    // contact type label

    const [contactTypeLabel, setContactTypeLabel] = useState('')
    useEffect(() => {
      const found = contactTypeFilter.options.find((option) => option.value === contactType)

      if (found) {
        setContactTypeLabel(found.label)
      }
    }, [contactType])
    // sort by label

    const [sortByLabel, setSortByLabel] = useState('')
    useEffect(() => {
      const found = sortFilter.options.find((option) => option.value === sortBy)

      if (found) {
        setSortByLabel(found.label)
      }
    }, [sortBy])

    // retrieve filter values from local storage

    useEffect(() => {
      const filterValues = getFilterValues(auth.username)
      setContactType(filterValues.contactType)
      setSortBy(filterValues.sortBy)

      updateContactTypeFilter(filterValues.contactType)
      updateSort(filterValues.sortBy)
    }, [])

    const resetFilters = () => {
      setTextFilter('')
      setContactType(DEFAULT_CONTACT_TYPE_FILTER)
      setSortBy(DEFAULT_SORT_BY)
      savePreference('phonebookContactTypeFilter', DEFAULT_CONTACT_TYPE_FILTER, auth.username)
      savePreference('phonebookSortBy', DEFAULT_SORT_BY, auth.username)

      // notify parent component
      updateTextFilter('')
      updateContactTypeFilter(DEFAULT_CONTACT_TYPE_FILTER)
      updateSort(DEFAULT_SORT_BY)
    }

    return (
      <div className={classNames(className)} {...props}>
        <div>
          {/* Mobile filter dialog */}
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
                  <Dialog.Panel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 py-4 pb-6 shadow-xl bg-white dark:bg-gray-900'>
                    <div className='flex items-center justify-between px-4'>
                      <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                        {t('Common.Filters')}
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
                      {/* contact type filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={contactTypeFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {t(`Phonebook.${contactTypeFilter.name}`)}
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
                            <Disclosure.Panel className='pt-6'>
                              <fieldset>
                                <legend className='sr-only'>{contactTypeFilter.name}</legend>
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
                                        {t(`Phonebook.${option.label}`)}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </fieldset>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                      {/* sort by filter (mobile) */}
                      {/* //// sort by company is currently not implemented on CTI server */}
                      {/* <Disclosure
                        as='div'
                        key={sortFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {t(`Phonebook.${sortFilter.name}`)}
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
                            <Disclosure.Panel className='pt-6'>
                              <fieldset>
                                <legend className='sr-only'>{sortFilter.name}</legend>
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
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                      >
                                        {t(`Phonebook.${option.label}`)}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </fieldset>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure> */}
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>

          <div className='mx-auto text-center'>
            <section aria-labelledby='filter-heading' className='pb-6'>
              <h2 id='filter-heading' className='sr-only'>
                {t('Phonebook.Phonebook filters')}
              </h2>

              <div className='flex items-center space-x-8'>
                <div className='flex items-center'>
                  <TextInput
                    placeholder={t('Phonebook.Filter contacts') || ''}
                    className='max-w-sm'
                    value={textFilter}
                    onChange={changeTextFilter}
                    ref={textFilterRef}
                    icon={textFilter.length ? faCircleXmark : undefined}
                    onIconClick={() => clearTextFilter()}
                    trailingIcon={true}
                  />
                </div>

                <div className='flex ml-4'>
                  <Popover.Group className='hidden sm:flex sm:items-baseline sm:space-x-4'>
                    {/* contact type filter */}
                    <Popover
                      as='div'
                      key={contactTypeFilter.name}
                      id={`desktop-menu-${contactTypeFilter.id}`}
                      className='relative inline-block text-left shrink-0'
                    >
                      <div>
                        <Popover.Button className='px-3 py-2 text-sm leading-4 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
                          <span>{t(`Phonebook.${contactTypeFilter.name}`)}</span>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md p-4 shadow-2xl ring-1 ring-opacity-5 focus:outline-none bg-white ring-black dark:bg-gray-900 dark:ring-gray-700'>
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
                                  {t(`Phonebook.${option.label}`)}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>

                    {/* sort by filter */}
                    {/* //// sort by company is currently not implemented on CTI server */}
                    {/* <Popover
                      as='div'
                      key={sortFilter.name}
                      id={`desktop-menu-${sortFilter.id}`}
                      className='relative inline-block text-left shrink-0'
                    >
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'>
                          <span>{t(`Phonebook.${sortFilter.name}`)}</span>
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
                                  {t(`Phonebook.${option.label}`)}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover> */}
                  </Popover.Group>

                  <button
                    type='button'
                    className='inline-block text-sm font-medium sm:hidden text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                    onClick={() => setOpen(true)}
                  >
                    {t('Common.Filters')}
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
                  {/* contact type */}
                  <div className='mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                        <span>
                          <span className='text-gray-600 dark:text-gray-300'>
                            {t('Phonebook.Contact type')}:
                          </span>{' '}
                          {contactTypeLabel && t(`Phonebook.${contactTypeLabel}`)}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* sort by */}
                  {/* //// sort by company is currently not implemented on CTI server */}
                  {/* <div className='mt-2 sm:mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span>
                          <span className='text-gray-600 dark:text-gray-300'>
                            {t('Phonebook.Sort by')}:
                          </span>{' '}
                          {sortByLabel && t(`Phonebook.${sortByLabel}`)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px sm:block bg-gray-300 dark:bg-gray-600'
                  /> */}
                  {/* separator */}
                  <div
                    aria-hidden='true'
                    className='h-5 w-px sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  {/* reset filters */}
                  <div className='mt-0 text-center'>
                    <button
                      type='button'
                      onClick={() => resetFilters()}
                      className='text-sm hover:underline text-primary dark:text-primaryDark'
                    >
                      {t('Common.Reset filters')}
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
