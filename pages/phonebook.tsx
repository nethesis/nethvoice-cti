// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { Filter } from '../components/phonebook/Filter'
import { Avatar, Button, InlineNotification, EmptyState } from '../components/common'
import { useState, useEffect, useMemo } from 'react'
import {
  getPhonebook,
  mapContact,
  openShowContactDrawer,
  PAGE_SIZE,
  openCreateContactDrawer,
  mapPhonebookResponse,
} from '../lib/phonebook'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import { debounce } from 'lodash'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faSuitcase,
  faUserGroup,
  faChevronRight,
  faPlus,
  faUserPlus,
  faAddressBook,
  faMobileScreenButton,
  faFilter,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import { callPhoneNumber } from '../lib/utils'
import { useTranslation } from 'react-i18next'

const Phonebook: NextPage = () => {
  const [isPhonebookLoaded, setPhonebookLoaded] = useState(false)
  const [phonebook, setPhonebook]: any = useState({})
  const [pageNum, setPageNum]: any = useState(1)
  const { t } = useTranslation()

  const [textFilter, setTextFilter]: any = useState('')

  const updateTextFilter = (newTextFilter: string) => {
    setPageNum(1)
    setTextFilter(newTextFilter)
    setPhonebookLoaded(false)
  }

  const debouncedUpdateTextFilter = useMemo(() => debounce(updateTextFilter, 400), [])

  // Stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilter.cancel()
    }
  }, [debouncedUpdateTextFilter])

  const [contactType, setContactType]: any = useState('')
  const updateContactTypeFilter = (newContactType: string) => {
    setPageNum(1)
    setContactType(newContactType)
    setPhonebookLoaded(false)
  }

  const [sortBy, setSortBy]: any = useState('')
  const updateSort = (newSortBy: string) => {
    setSortBy(newSortBy)
    setPhonebookLoaded(false)
  }

  // retrieve phonebook
  useEffect(() => {
    async function fetchPhonebook() {
      if (!isPhonebookLoaded && contactType && sortBy) {
        try {
          setPhonebookError('')
          const res = await getPhonebook(pageNum, textFilter, contactType, sortBy)
          setPhonebook(mapPhonebookResponse(res))
        } catch (e) {
          console.error(e)
          setPhonebookError('Cannot retrieve phonebook')
        }
        setPhonebookLoaded(true)
      }
    }
    fetchPhonebook()
  }, [isPhonebookLoaded, phonebook, pageNum, textFilter, contactType, sortBy])

  const phonebookStore = useSelector((state: RootState) => state.phonebook)

  useEffect(() => {
    // reload phonebook
    setPhonebookLoaded(false)
  }, [phonebookStore])

  function goToPreviousPage() {
    if (pageNum > 1) {
      setPhonebookLoaded(false)
      setPageNum(pageNum - 1)
    }
  }

  function goToNextPage() {
    if (pageNum < phonebook.totalPages) {
      setPhonebookLoaded(false)
      setPageNum(pageNum + 1)
    }
  }

  function isPreviousPageButtonDisabled() {
    return !isPhonebookLoaded || pageNum <= 1
  }

  function isNextPageButtonDisabled() {
    return !isPhonebookLoaded || pageNum >= phonebook?.totalPages
  }

  const [phonebookError, setPhonebookError] = useState('')

  return (
    <>
      <div>
        <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>
          {t('Phonebook.Phonebook')}
        </h1>
        <Button variant='primary' onClick={() => openCreateContactDrawer()} className='mb-6'>
          <FontAwesomeIcon icon={faUserPlus} className='mr-2 h-4 w-4' />
          <span>{t('Phonebook.Create contact')}</span>
        </Button>
        <Filter
          updateTextFilter={debouncedUpdateTextFilter}
          updateContactTypeFilter={updateContactTypeFilter}
          updateSort={updateSort}
        />
        <div className='overflow-hidden shadow sm:rounded-md bg-white dark:bg-gray-900'>
          <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
            {/* phonebook error */}
            {phonebookError && (
              <InlineNotification type='error' title={phonebookError}></InlineNotification>
            )}
            {/* phonebook skeleton */}
            {!isPhonebookLoaded &&
              Array.from(Array(9)).map((e, index) => (
                <li key={index}>
                  <div className='flex items-center px-4 py-4 sm:px-6'>
                    {/* avatar skeleton */}
                    <div className='animate-pulse rounded-full h-12 w-12 bg-gray-300 dark:bg-gray-600'></div>
                    <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-3'>
                      <div className='flex flex-col justify-center'>
                        {/* line skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div>
                        {/* line skeleton */}
                        <div className='animate-pulse h-3 rounded mb-6 md:mb-0 bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                      <div>
                        {/* line skeleton */}
                        <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            {/* empty state */}
            {isPhonebookLoaded &&
              phonebook?.rows &&
              !phonebook.rows.length &&
              !textFilter.length && (
                <EmptyState
                  title='No contacts'
                  description='There is no contact in your phonebook'
                  icon={
                    <FontAwesomeIcon
                      icon={faAddressBook}
                      className='mx-auto h-12 w-12'
                      aria-hidden='true'
                    />
                  }
                >
                  <Button variant='primary' onClick={() => openCreateContactDrawer()}>
                    <FontAwesomeIcon icon={faPlus} className='mr-2 h-4 w-4' />
                    <span>{t('Phonebook.Create contact')}</span>
                  </Button>
                </EmptyState>
              )}
            {/* no search results */}
            {isPhonebookLoaded &&
              phonebook?.rows &&
              !phonebook.rows.length &&
              !!textFilter.length && (
                <EmptyState
                  title='No contacts'
                  description='Try changing your search filters'
                  icon={
                    <FontAwesomeIcon
                      icon={faFilter}
                      className='mx-auto h-12 w-12'
                      aria-hidden='true'
                    />
                  }
                />
              )}
            {isPhonebookLoaded &&
              phonebook?.rows &&
              phonebook.rows.map((contact: any, index: number) => (
                <li key={index}>
                  <div className='flex items-center px-4 py-4 sm:px-6'>
                    <div className='flex min-w-0 flex-1 items-center'>
                      <div className='flex-shrink-0' onClick={() => openShowContactDrawer(contact)}>
                        {contact.kind == 'person' ? (
                          <Avatar className='cursor-pointer' placeholderType='person' />
                        ) : (
                          <Avatar className='cursor-pointer' placeholderType='company' />
                        )}
                      </div>
                      <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
                        {/* display name and company/contacts */}
                        <div className='flex flex-col justify-center'>
                          <div className='truncate text-sm font-medium'>
                            <span
                              className='cursor-pointer hover:underline'
                              onClick={() => openShowContactDrawer(contact)}
                            >
                              {contact.displayName}
                            </span>
                          </div>
                          {/* extension */}
                          {contact.extension && (
                            <div className='mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                              <FontAwesomeIcon
                                icon={faPhone}
                                className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                aria-hidden='true'
                              />
                              <span
                                className='truncate text-primary dark:text-primary cursor-pointer'
                                onClick={() => callPhoneNumber(contact.extension)}
                              >
                                {contact.extension}
                              </span>
                            </div>
                          )}
                          {/* company name */}
                          {contact.kind == 'person' && contact.company && !contact.extension && (
                            <div className='mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                              <FontAwesomeIcon
                                icon={faSuitcase}
                                className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                aria-hidden='true'
                              />
                              <span className='truncate'>{contact.company}</span>
                            </div>
                          )}
                          {/* company contacts */}
                          {contact.contacts && contact.contacts.length ? (
                            <div className='mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                              <FontAwesomeIcon
                                icon={faUserGroup}
                                className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                aria-hidden='true'
                              />
                              <span>{contact.contacts.length} contacts</span>
                            </div>
                          ) : null}
                        </div>
                        {/* work phone */}
                        {contact.workphone && (
                          <div className='mt-4 md:mt-0'>
                            <div>
                              <div className='text-sm text-gray-900 dark:text-gray-100'>Work</div>
                              <div className='mt-1 flex items-center text-sm text-primary dark:text-primary'>
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                  aria-hidden='true'
                                />
                                <span
                                  className='truncate cursor-pointer hover:underline'
                                  onClick={() => callPhoneNumber(contact.workphone)}
                                >
                                  {contact.workphone}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* mobile phone */}
                        {contact.cellphone && (
                          <div className='mt-4 md:mt-0'>
                            <div>
                              <div className='text-sm text-gray-900 dark:text-gray-100'>Mobile</div>
                              <div className='mt-1 flex items-center text-sm text-primary dark:text-primary'>
                                <FontAwesomeIcon
                                  icon={faMobileScreenButton}
                                  className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                  aria-hidden='true'
                                />
                                <span
                                  className='truncate cursor-pointer hover:underline'
                                  onClick={() => callPhoneNumber(contact.cellphone)}
                                >
                                  {contact.cellphone}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className='h-3 w-3 text-gray-400 dark:text-gray-500 cursor-pointer'
                        aria-hidden='true'
                        onClick={() => openShowContactDrawer(contact)}
                      />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        {/* pagination */}
        {!phonebookError && !!phonebook?.rows?.length && (
          <nav
            className='flex items-center justify-between border-t px-0 py-4 mb-8 border-gray-100 dark:border-gray-800'
            aria-label='Pagination'
          >
            <div className='hidden sm:block'>
              <p className='text-sm text-gray-700 dark:text-gray-200'>
                {t('Common.Showing')}{' '}
                <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> -&nbsp;
                <span className='font-medium'>
                  {PAGE_SIZE * (pageNum - 1) + PAGE_SIZE < phonebook?.count
                    ? PAGE_SIZE * (pageNum - 1) + PAGE_SIZE
                    : phonebook?.count}
                </span>{' '}
                {t('Common.of')} <span className='font-medium'>{phonebook?.count}</span>{' '}
                {t('Phonebook.contacts')}
              </p>
            </div>
            <div className='flex flex-1 justify-between sm:justify-end'>
              <Button
                type='button'
                variant='white'
                disabled={isPreviousPageButtonDisabled()}
                onClick={() => goToPreviousPage()}
                className='flex items-center'
              >
                <FontAwesomeIcon icon={faChevronLeft} className='mr-2 h-4 w-4' />
                <span> {t('Common.Previous page')}</span>
              </Button>
              <Button
                type='button'
                variant='white'
                className='ml-3 flex items-center'
                disabled={isNextPageButtonDisabled()}
                onClick={() => goToNextPage()}
              >
                <span>{t('Common.Next page')}</span>
                <FontAwesomeIcon icon={faChevronRight} className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </nav>
        )}
      </div>
    </>
  )
}

export default Phonebook
