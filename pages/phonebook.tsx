// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import {
  MdEmail,
  MdPhone,
  MdPhoneAndroid,
  MdOutlineWork,
  MdPeople,
  MdChevronRight,
} from 'react-icons/md'
import { Filter } from '../components/phonebook/Filter'
import { Avatar, Button } from '../components/common'
import { useState, useEffect } from 'react'
import { getPhonebook, PAGE_SIZE } from '../lib/phonebook'

//// remove unused imports

const Phonebook: NextPage = () => {
  const [isPhonebookLoaded, setPhonebookLoaded] = useState(false)
  const [phonebook, setPhonebook]: any = useState({})
  const [pageNum, setPageNum]: any = useState(1)
  useEffect(() => {
    console.log('useEffect called') ////

    async function fetchPhonebook() {
      if (!isPhonebookLoaded) {
        const res = await getPhonebook(pageNum)
        setPhonebook(mapPhonebook(res))
        setPhonebookLoaded(true)
      }
    }
    fetchPhonebook()
  }, [isPhonebookLoaded, phonebook, pageNum])

  function mapPhonebook(phonebookResponse: any) {
    if (!phonebookResponse) {
      return null
    }

    phonebookResponse.rows.map((contact: any) => {
      // kind & display name
      if (contact.name) {
        contact.kind = 'person'
        contact.displayName = contact.name
      } else {
        contact.kind = 'company'
        contact.displayName = contact.company
      }

      // company contacts
      if (contact.contacts) {
        contact.contacts = JSON.parse(contact.contacts)
      }
      return contact
    })

    // total pages
    phonebookResponse.totalPages = Math.ceil(phonebookResponse.count / PAGE_SIZE)

    console.log('totalPages', phonebookResponse.totalPages) ////

    return phonebookResponse
  }

  function goToPreviousPage() {
    console.log('goToPreviousPage, current', pageNum) ////

    if (pageNum > 1) {
      setPhonebookLoaded(false)
      setPageNum(pageNum - 1)
    }
  }

  function goToNextPage() {
    console.log('goToPreviousPage, current', pageNum) ////

    if (pageNum < phonebook.totalPages) {
      setPhonebookLoaded(false)
      setPageNum(pageNum + 1)
    }
  }

  function isPreviousPageButtonDisabled() {
    console.log('isPreviousPageButtonDisabled, pageNum', pageNum) ////

    return pageNum <= 1
  }

  function isNextPageButtonDisabled() {
    console.log('isNextPageButtonDisabled') ////

    return pageNum >= phonebook?.totalPages
  }

  return (
    <>
      <div className='p-8 bg-gray-100'>
        <Filter />
        <div className='overflow-hidden bg-white shadow sm:rounded-md'>
          <ul role='list' className='divide-y divide-gray-200'>
            {phonebook?.rows &&
              phonebook.rows.map((contact: any) => (
                <li key={contact.id}>
                  <div className='flex items-center px-4 py-4 sm:px-6'>
                    <div className='flex min-w-0 flex-1 items-center'>
                      <div className='flex-shrink-0'>
                        <Avatar className='h-12 w-12 rounded-full cursor-pointer' initials='AZ' />
                      </div>
                      <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4'>
                        {/* display name and company/contacts */}
                        <div className='flex flex-col justify-center'>
                          <div className='truncate text-sm font-medium text-sky-600'>
                            <span className='cursor-pointer'>{contact.displayName}</span>
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
                          {contact.contacts && contact.contacts.length && (
                            <div className='mt-1 flex items-center text-sm text-gray-500'>
                              <MdPeople
                                className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                                aria-hidden='true'
                              />
                              <span className='text-sky-600 cursor-pointer'>
                                {contact.contacts.length} contacts
                              </span>
                            </div>
                          )}
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
                        {/* work email */}
                        {contact.workemail && (
                          <div className='mt-4 md:mt-0'>
                            <div>
                              <div className='text-sm text-gray-900'>Work email</div>
                              <div className='mt-1 flex items-center text-sm text-sky-600'>
                                <MdEmail
                                  className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                                  aria-hidden='true'
                                />
                                <a
                                  target='_blank'
                                  rel='noreferrer'
                                  href={`mailto: ${contact.workemail}`}
                                  className='truncate'
                                >
                                  {contact.workemail}
                                </a>
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
                      />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        {/* pagination */}
        <nav
          className='flex items-center justify-between border-t border-gray-100 bg-gray-100 px-0 py-4'
          aria-label='Pagination'
        >
          <div className='hidden sm:block'>
            <p className='text-sm text-gray-700'>
              Showing <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + 1}</span> to{' '}
              <span className='font-medium'>{PAGE_SIZE * (pageNum - 1) + PAGE_SIZE}</span> of{' '}
              <span className='font-medium'>{phonebook?.count}</span> contacts
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
      </div>
    </>
  )
}

export default Phonebook
