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
} from '../lib/phonebook'
import Skeleton from 'react-loading-skeleton'
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
  faAddressBook,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'

const Phonebook: NextPage = () => {
  const [isPhonebookLoaded, setPhonebookLoaded] = useState(false)
  const [phonebook, setPhonebook]: any = useState({})
  const [pageNum, setPageNum]: any = useState(1)

  const [filterText, setFilterText]: any = useState('')

  const updateFilterText = (newFilterText: string) => {
    setPageNum(1)
    setFilterText(newFilterText)
    setPhonebookLoaded(false)
  }

  const debouncedUpdateFilterText = useMemo(() => debounce(updateFilterText, 400), [])

  // Stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateFilterText.cancel()
    }
  }, [debouncedUpdateFilterText])

  const [contactType, setContactType]: any = useState('all')
  const updateContactTypeFilter = (newContactType: string) => {
    setPageNum(1)
    setContactType(newContactType)
    setPhonebookLoaded(false)
  }

  const [sortBy, setSortBy]: any = useState('name')
  const updateSortFilter = (newSortBy: string) => {
    setSortBy(newSortBy)
    setPhonebookLoaded(false)
  }

  useEffect(() => {
    async function fetchPhonebook() {
      if (!isPhonebookLoaded) {
        try {
          const res = await getPhonebook(pageNum, filterText, contactType, sortBy)
          setPhonebook(mapPhonebook(res))
        } catch (e) {
          setPhonebookError('Cannot retrieve phonebook')
        }
        setPhonebookLoaded(true)
      }
    }
    fetchPhonebook()
  }, [isPhonebookLoaded, phonebook, pageNum, filterText, contactType, sortBy])

  const phonebookStore = useSelector((state: RootState) => state.phonebook)

  useEffect(() => {
    // reload phonebook
    setPhonebookLoaded(false)
  }, [phonebookStore])

  function mapPhonebook(phonebookResponse: any) {
    if (!phonebookResponse) {
      return null
    }

    phonebookResponse.rows.map((contact: any) => {
      return mapContact(contact)
    })

    // total pages
    phonebookResponse.totalPages = Math.ceil(phonebookResponse.count / PAGE_SIZE)
    return phonebookResponse
  }

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
        <Button variant='white' onClick={() => openCreateContactDrawer()} className='mb-6'>
          <FontAwesomeIcon icon={faPlus} className='mr-2 h-4 w-4' />
          <span>Create contact</span>
        </Button>
        <Filter
          updateFilterText={debouncedUpdateFilterText}
          updateContactTypeFilter={updateContactTypeFilter}
          updateSortFilter={updateSortFilter}
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
                    <Skeleton circle height='100%' containerClassName='w-12 h-12 leading-none' />
                    <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-3'>
                      <div className='flex flex-col justify-center'>
                        <Skeleton />
                      </div>
                      <div>
                        <Skeleton />
                      </div>
                      <div>
                        <Skeleton />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            {/* empty state */}
            {isPhonebookLoaded && phonebook?.rows && !phonebook.rows.length && !filterText.length && (
              <EmptyState
                title='No contact'
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
                  <span>Create contact</span>
                </Button>
              </EmptyState>
            )}
            {/* no search results */}
            {isPhonebookLoaded &&
              phonebook?.rows &&
              !phonebook.rows.length &&
              !!filterText.length && (
                <EmptyState
                  title='No contact found'
                  description='Try changing your search filters'
                  icon={
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
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
                          <div className='truncate text-sm font-medium text-primary dark:text-primary'>
                            <span
                              className='cursor-pointer'
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
                              <span className='truncate text-primary dark:text-primary cursor-pointer'>
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
                              <div className='text-sm text-gray-900 dark:text-gray-100'>
                                Work phone
                              </div>
                              <div className='mt-1 flex items-center text-sm text-primary dark:text-primary'>
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                  aria-hidden='true'
                                />
                                <span className='truncate cursor-pointer'>{contact.workphone}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* mobile phone */}
                        {contact.cellphone && (
                          <div className='mt-4 md:mt-0'>
                            <div>
                              <div className='text-sm text-gray-900 dark:text-gray-100'>
                                Mobile phone
                              </div>
                              <div className='mt-1 flex items-center text-sm text-primary dark:text-primary'>
                                <FontAwesomeIcon
                                  icon={faPhone}
                                  className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                  aria-hidden='true'
                                />
                                <span className='truncate cursor-pointer'>{contact.cellphone}</span>
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
            className='flex items-center justify-between border-t px-0 py-4 border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800'
            aria-label='Pagination'
          >
            <div className='hidden sm:block'>
              <p className='text-sm text-gray-700 dark:text-gray-200'>
                Showing <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> to{' '}
                <span className='font-medium'>
                  {PAGE_SIZE * (pageNum - 1) + PAGE_SIZE < phonebook?.count
                    ? PAGE_SIZE * (pageNum - 1) + PAGE_SIZE
                    : phonebook?.count}
                </span>{' '}
                of <span className='font-medium'>{phonebook?.count}</span> contacts
              </p>
            </div>
            <div className='flex flex-1 justify-between sm:justify-end'>
              <Button
                type='button'
                variant='white'
                disabled={isPreviousPageButtonDisabled()}
                onClick={() => goToPreviousPage()}
              >
                Previous page
              </Button>
              <Button
                type='button'
                variant='white'
                className='ml-3'
                disabled={isNextPageButtonDisabled()}
                onClick={() => goToNextPage()}
              >
                Next page
              </Button>
            </div>
          </nav>
        )}
      </div>
    </>
  )
}

export default Phonebook
