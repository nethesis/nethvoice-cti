// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { MdEmail, MdPhone, MdPhoneAndroid, MdOutlineWork, MdPeople } from 'react-icons/md'
import { Filter } from '../components/phonebook/Filter'
import { Avatar } from '../components/common'
import { useState, useEffect } from 'react'
import { getPhonebook } from '../lib/phonebook'

//// remove unused imports

const Phonebook: NextPage = () => {
  const [isPhonebookLoaded, setPhonebookLoaded] = useState(false)
  const [phonebook, setPhonebook]: any = useState({})
  useEffect(() => {
    console.log('useEffect called') ////

    async function fetchPhonebook() {
      if (!isPhonebookLoaded) {
        const res = await getPhonebook()
        setPhonebook(mapPhonebook(res))
        setPhonebookLoaded(true)
      }
    }
    fetchPhonebook()
  }, [isPhonebookLoaded, phonebook])

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
    return phonebookResponse
  }

  return (
    <>
      <div className='p-6 bg-gray-100'>
        <h1 className='text-2xl font-bold text-gray-900 mb-6'>Phonebook</h1>
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
                        {/* physical number */}
                        {/* {contact.physicalNumber && (
                        <div className='mt-4 md:mt-0'>
                          <div>
                            <div className='text-sm text-gray-900'>Physical number</div>
                            <div className='mt-1 flex items-center text-sm text-sky-600'>
                              <MdPhone
                                className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                                aria-hidden='true'
                              />
                              <span className='truncate cursor-pointer'>
                                {contact.physicalNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      )} */}
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
                        {/* show contact */}
                        {/* <div className='mt-4 md:mt-0'>
                        <div>
                          <div className='text-sm text-sky-600 cursor-pointer'>
                            Show contact
                          </div>
                        </div>
                      </div> */}
                      </div>
                    </div>
                    <div>
                      {/* <MdChevronRight className='h-5 w-5 text-gray-400' aria-hidden='true' /> */}
                      <div className='text-sm text-sky-600 cursor-pointer text-right'>
                        Show contact
                      </div>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  )
}

export default Phonebook
