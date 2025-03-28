// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import React from 'react'
import classNames from 'classnames'
import { TextInput } from '../../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleXmark, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, DialogPanel, Disclosure, DisclosureButton, DisclosurePanel, Popover, PopoverButton, PopoverGroup, PopoverPanel, Transition, TransitionChild } from '@headlessui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { savePreference } from '../../../lib/storage'
import {
  DEFAULT_SORT_BY,
  getFilterValues,
} from '../../../lib/history'
import { useTranslation } from 'react-i18next'

//Filter for the sort
const sortFilter = {
  id: 'sort',
  name: 'Sort by',
  options: [
    { value: 'time%20desc', label: 'Newest' },
    { value: 'time%20asc', label: 'Oldest' },
  ],
}

export interface FilterProps extends ComponentPropsWithRef<'div'> {
  updateFilterText: Function
  updateSortFilter: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  (
    {
      updateFilterText,
      updateSortFilter,
      className,
      ...props
    }
  ) => {
    const auth = useSelector((state: RootState) => state.authentication)
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

    const [open, setOpen] = useState(false)
    const [filterText, setFilterText] = useState('')

    //Sorting filter
    const [sortBy, setSortBy]: any = useState('time%20desc')
    function changeSortBy(event: any) {
      const newSortBy = event.target.id
      setSortBy(newSortBy)
      // update history (notify parent component)
      updateSortFilter(newSortBy)
      savePreference('historySortTypePreference', newSortBy, auth.username)
    }

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

    //Get the selected filter from the local storage
    useEffect(() => {
      const filterValues = getFilterValues(auth.username)
      updateSortFilter(filterValues.sortBy)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    //Clear the filter
    function clearFilters() {
      setFilterText('')
      setSortBy(DEFAULT_SORT_BY)
      savePreference('historySortTypePreference', DEFAULT_SORT_BY, auth.username)

      // notify parent component
      updateFilterText('')
      updateSortFilter(DEFAULT_SORT_BY)
    }

    const { t } = useTranslation()

    return (
      <div className={classNames('bg-body dark:bg-bodyDark', className)} {...props}>
        <div>
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
                    placeholder={t('History.Filter messages') || ''}
                    className='max-w-lg'
                    value={filterText}
                    onChange={changeFilterText}
                    ref={textFilterRef}
                    icon={filterText.length ? faCircleXmark : undefined}
                    onIconClick={() => clearTextFilter()}
                    trailingIcon={true}
                  />
                </div>
                <div className='flex'>
                  <PopoverGroup className='hidden sm:flex sm:items-baseline sm:space-x-4'>
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
                  <div
                    aria-hidden='true'
                    className='h-5 w-px block bg-gray-300 dark:bg-gray-600'
                  />
                  {/* Sort by filter */}
                  <div className='mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                        <span className='text-gray-600 dark:text-gray-300'>
                          {t('History.Sort by')}:&nbsp;
                        </span>
                        {t(`History.${sortFilter.options.find((o) => o.value === sortBy)?.label}`)}
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
