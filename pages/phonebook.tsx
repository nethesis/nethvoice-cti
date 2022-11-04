// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import {
  MdPhone,
  MdPhoneAndroid,
  MdOutlineWork,
  MdPeople,
  MdChevronRight,
  MdAdd,
} from 'react-icons/md'
import { Filter } from '../components/phonebook/Filter'
import { Avatar, Button, InlineNotification } from '../components/common'
import { useState, useEffect } from 'react'
import { getPhonebook, mapContact, showContact, PAGE_SIZE } from '../lib/phonebook'
import Skeleton from 'react-loading-skeleton'
import { store } from '../store'

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

  const createContact = () => {
    store.dispatch.sideDrawer.update({
      isShown: true,
      contentType: 'createContact',
      config: null,
    })
  }

  const [phonebookError, setPhonebookError] = useState('')

  return (
    <>
      <div className='p-8 bg-gray-100'>
        <Button variant='primary' onClick={() => createContact()} className='mb-6'>
          <MdAdd className='-ml-1 mr-2 h-5 w-5' />
          <span>Create contact</span>
        </Button>
        <Filter
          updateFilterText={updateFilterText}
          updateContactTypeFilter={updateContactTypeFilter}
          updateSortFilter={updateSortFilter}
        />
        <div className='overflow-hidden bg-white shadow sm:rounded-md'>
          <ul role='list' className='divide-y divide-gray-200'>
            {/* phonebook error */}
            {phonebookError && (
              <InlineNotification type='error'>
                <div>{phonebookError}</div>
              </InlineNotification>
            )}
            {/* phonebook skeleton */}
            {!isPhonebookLoaded &&
              Array.from(Array(10)).map((e, index) => (
                <li key={index}>
                  <div className='flex items-center px-4 py-4 sm:px-6'>
                    <Skeleton circle height='100%' containerClassName='w-12 h-12 leading-none' />
                    <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4'>
                      <div className='flex flex-col justify-center'>
                        <Skeleton />
                      </div>
                      <div>
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
            {isPhonebookLoaded &&
              phonebook?.rows &&
              phonebook.rows.map((contact: any, index: number) => (
                <li key={index}>
                  <div className='flex items-center px-4 py-4 sm:px-6'>
                    <div className='flex min-w-0 flex-1 items-center'>
                      <div className='flex-shrink-0' onClick={() => showContact(contact)}>
                        {contact.kind == 'person' ? (
                          <Avatar className='cursor-pointer' placeholderType='person' />
                        ) : (
                          <Avatar className='cursor-pointer' placeholderType='company' />
                        )}
                      </div>
                      <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
                        {/* display name and company/contacts */}
                        <div className='flex flex-col justify-center'>
                          <div className='truncate text-sm font-medium text-sky-600'>
                            <span className='cursor-pointer' onClick={() => showContact(contact)}>
                              {contact.displayName}
                            </span>
                          </div>
                          {/* company name */}
                          {contact.kind == 'person' && contact.company && (
                            <div className='mt-1 flex items-center text-sm text-gray-500'>
                              <MdOutlineWork
                                className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                                aria-hidden='true'
                              />
                              <span className='truncate text-sky-600 cursor-pointer'>
                                {contact.company}
                              </span>
                            </div>
                          )}
                          {/* company contacts */}
                          {contact.contacts && contact.contacts.length ? (
                            <div className='mt-1 flex items-center text-sm text-gray-500'>
                              <MdPeople
                                className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
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
                              <div className='text-sm text-gray-900'>Work phone</div>
                              <div className='mt-1 flex items-center text-sm text-sky-600'>
                                <MdPhone
                                  className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
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
                              <div className='text-sm text-gray-900'>Mobile phone</div>
                              <div className='mt-1 flex items-center text-sm text-sky-600'>
                                <MdPhoneAndroid
                                  className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
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
                      <MdChevronRight
                        className='h-5 w-5 text-gray-400 cursor-pointer'
                        aria-hidden='true'
                        onClick={() => showContact(contact)}
                      />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        {/* pagination */}
        {!phonebookError && (
          <nav
            className='flex items-center justify-between border-t border-gray-100 bg-gray-100 px-0 py-4'
            aria-label='Pagination'
          >
            <div className='hidden sm:block'>
              <p className='text-sm text-gray-700'>
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
