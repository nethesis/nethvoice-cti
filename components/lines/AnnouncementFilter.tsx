// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useRef } from 'react'
import classNames from 'classnames'
import { TextInput, Button } from '../common'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faXmark, faPlus, faChevronDown } from '@nethesis/nethesis-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useTranslation } from 'react-i18next'
import { openShowTelephoneAnnouncementDrawer } from '../../lib/lines'
import { savePreference } from '../../lib/storage'
import { DEFAULT_SORT_BY_ANNOUNCEMENT, getFilterAnnouncementValues } from '../../lib/lines'

export interface AnnouncementFilterProps extends ComponentPropsWithRef<'div'> {
  updateTextFilter: Function
  updateSortFilter: Function
}

export const AnnouncementFilter = forwardRef<HTMLButtonElement, AnnouncementFilterProps>(
  ({ updateTextFilter, updateSortFilter, className, ...props }, ref) => {
    const { t } = useTranslation()
    const auth = useSelector((state: RootState) => state.authentication)
    const [textFilter, setTextFilter] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
    const [open, setOpen] = useState(false)

    const sortFilter = {
      id: 'sort',
      name: t('Lines.Sort by'),
      options: [
        { value: 'username', label: t('Lines.Author') },
        { value: 'description', label: t('Lines.Name') },
        { value: 'privacy', label: t('Lines.Privacy') },
      ],
    }

    //Sorting filter
    const [sortBy, setSortBy]: any = useState('description')

    function changeSortBy(event: any) {
      const newSortBy = event.target.id
      setSortBy(newSortBy)
      savePreference('telephoneAnnouncementSortBy', newSortBy, auth.username)

      // update history (notify parent component)
      updateSortFilter(newSortBy)
    }

    const [sortByLabel, setSortByLabel] = useState('')
    useEffect(() => {
      const found = sortFilter.options.find((option) => option.value === sortBy)

      if (found) {
        setSortByLabel(found.label)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy])

    function changeTextFilter(event: any) {
      const newTextFilter = event.target.value
      setTextFilter(newTextFilter)

      // notify parent component
      updateTextFilter(newTextFilter)
    }

    const resetFilters = () => {
      setTextFilter('')
      setSortBy(DEFAULT_SORT_BY_ANNOUNCEMENT)
      savePreference('telephoneAnnouncementSortBy', DEFAULT_SORT_BY_ANNOUNCEMENT, auth.username)
      // notify parent component
      updateTextFilter('')
      updateSortFilter(DEFAULT_SORT_BY_ANNOUNCEMENT)
    }

    const clearTextFilter = () => {
      setTextFilter('')
      updateTextFilter('')
      textFilterRef.current.focus()
    }

    //Get the selected sortby filter from the local storage
    useEffect(() => {
      const filterValues = getFilterAnnouncementValues(auth.username)
      setSortBy(filterValues.sortBy)

      // notify parent component
      updateSortFilter(filterValues.sortBy)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
      <div className={classNames(className)} {...props}>
        <div className=''>
          {/* TO DO CHECK ON MOBILE DEVICE  */}
          <div className='mx-auto text-center'>
            <section aria-labelledby='filter-heading' className='pb-6'>
              <h2 id='filter-heading' className='sr-only'>
                {t('Lines.Lines filters')}
              </h2>
              <div className='flex justify-between items-center'>
                <div className='flex items-center'>
                  <div className='items-center'>
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
                  <div className='flex ml-8'>
                    <Popover.Group className='hidden sm:flex sm:items-baseline sm:space-x-8'>
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
                      className='inline-block text-sm font-medium sm:hidden text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'
                      onClick={() => setOpen(true)}
                    >
                      {t('Common.Filters')}
                    </button>
                  </div>
                </div>

                <Button
                  variant='primary'
                  className=''
                  onClick={openShowTelephoneAnnouncementDrawer}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    className='h-4 w-4 mr-2 text-white dark:text-white'
                  />
                  <span>{t('Lines.Add announcement')}</span>
                </Button>
              </div>

              {/* Active filters */}
              <div>
                <div className='mx-auto pt-3 sm:flex sm:items-center'>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    {t('Common.Active filters')}
                  </h3>
                  {/* separator */}
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px sm:ml-4 sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  {/* sort by */}
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span>
                          <span className='text-gray-500 dark:text-gray-400'>
                            {t('Lines.Sort by')}:
                          </span>{' '}
                          {sortByLabel}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* separator */}
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px sm:ml-4 sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  {/* reset filters */}
                  <div className='mt-4 sm:mt-0 text-left sm:text-center ml-1 sm:ml-4'>
                    <button
                      type='button'
                      onClick={() => resetFilters()}
                      className='text-sm hover:underline text-gray-900 dark:text-gray-100'
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

AnnouncementFilter.displayName = 'AnnouncementFilter'
