// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import React from 'react'
import classNames from 'classnames'
import { TextInput } from '../../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { Fragment, useState, useEffect, useRef } from 'react'
import { Popover, PopoverButton, PopoverGroup, PopoverPanel, Transition } from '@headlessui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { savePreference } from '../../../lib/storage'
import { useTranslation } from 'react-i18next'

// Set DEFAULT_SORT_BY constant
const DEFAULT_SORT_BY = 'desc'

// Filter for the sort
const sortFilter = {
  id: 'sort',
  name: 'Sort by',
  options: [
    { value: 'desc', label: 'Newest' },
    { value: 'asc', label: 'Oldest' },
  ],
}

export interface FilterProps extends ComponentPropsWithRef<'div'> {
  updateFilterText: Function
  updateSortFilter: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  ({ updateFilterText, updateSortFilter, className, ...props }) => {
    const auth = useSelector((state: RootState) => state.authentication)

    const [filterText, setFilterText] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

    // Sorting filter
    const [sortBy, setSortBy]: any = useState(DEFAULT_SORT_BY)
    function changeSortBy(event: any) {
      const newSortBy = event.target.id
      setSortBy(newSortBy)
      // update history (notify parent component)
      updateSortFilter(newSortBy)
      savePreference('voicemailSortTypePreference', newSortBy, auth.username)
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

    // Get the selected filter from the local storage
    useEffect(() => {
      // Try to get saved sort preference
      const savedSort = localStorage.getItem(`voicemailSortTypePreference_${auth.username}`)
      if (savedSort) {
        setSortBy(savedSort)
        updateSortFilter(savedSort)
      } else {
        setSortBy(DEFAULT_SORT_BY)
        updateSortFilter(DEFAULT_SORT_BY)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const { t } = useTranslation()

    return (
      <div className={classNames('bg-body dark:bg-bodyDark', className)} {...props}>
        <div className='mx-auto text-center'>
          <section aria-labelledby='filter-heading'>
            <h2 id='filter-heading' className='sr-only'>
              {t('History.Voicemail filters')}
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
                  showSearchIcon={true}
                />
              </div>
              <div>
                <PopoverGroup className='hidden sm:flex sm:items-baseline sm:space-x-4'>
                  {/* Sort filter */}
                  <Popover
                    as='div'
                    key={sortFilter?.name}
                    id={`desktop-menu-${sortFilter?.id}`}
                    className='relative inline-block text-left'
                  >
                    <div>
                      <PopoverButton className='h-[38px] px-3 py-2 text-sm leading-4 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
                        <span> {t(`History.${sortFilter?.name}`)}</span>
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
                      <PopoverPanel className='absolute right-0 z-50 mt-2 origin-top-right rounded-md flex flex-col space-y-4 bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 dark:ring-gray-700 '>
                        <form className='space-y-4'>
                          {sortFilter?.options.map((option) => (
                            <div key={option?.value} className='flex items-center'>
                              <input
                                id={option?.value}
                                name={`filter-${sortFilter?.id}`}
                                type='radio'
                                checked={option?.value === sortBy}
                                onChange={changeSortBy}
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
                      </PopoverPanel>
                    </Transition>
                  </Popover>
                </PopoverGroup>
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  },
)

Filter.displayName = 'Filter'
