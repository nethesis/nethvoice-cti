// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState, useRef, useEffect } from 'react'
import classNames from 'classnames'
import { Button, TextInput, Avatar, EmptyState } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUserPlus,
  faCircleXmark,
  faChevronRight,
  faPhone,
  faAddressBook,
  faPlus,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import { getPhonebook, openCreateContactDrawerWithPhone } from '../../lib/phonebook'

export interface AddToPhonebookDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const AddToPhonebookDrawerContent = forwardRef<
  HTMLButtonElement,
  AddToPhonebookDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const [textFilter, setFilterText] = useState('')
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [isPhonebookLoaded, setPhonebookLoaded] = useState(false)
  const [phonebook, setPhonebook]: any = useState({})
  const [phonebookError, setPhonebookError] = useState('')

  // text filter
  function changeFilterText(event: any) {
    const newFilterText = event.target.value
    setFilterText(newFilterText)
    setPhonebookLoaded(false)
  }

  // clear text filter
  const clearTextFilter = () => {
    setFilterText('')
    textFilterRef.current.focus()
    setPhonebookLoaded(false)
  }

  // retrieve phonebook
  useEffect(() => {
    async function fetchPhonebook() {
      //contactType is set to user by default
      let contactType = 'all'
      //sortBy is set to name by default
      let sortBy = 'name'
      //pageNum is set to 1 by default
      let pageNum = 1
      if (!isPhonebookLoaded) {
        try {
          const res = await getPhonebook(pageNum, textFilter, contactType, sortBy)
          setPhonebook(res)
        } catch (e) {
          console.error(e)
          setPhonebookError('Cannot retrieve phonebook')
        }
        setPhonebookLoaded(true)
      }
    }
    fetchPhonebook()
  }, [isPhonebookLoaded, phonebook, textFilter])

  return (
    <>
      {/* drawer content */}
      <div className={classNames('p-5', className)} {...props}>
        <div className='flex flex-col justify-center'>
          <h1 className='text-lg font-semibold'>Add to phonebook</h1>
          <span className='text-sm mt-1 text-gray-500 dark:text-gray-500'>
            Phone number: {config}
          </span>
        </div>
        <Button variant='white' className='mr-2 mt-7'>
          <FontAwesomeIcon
            icon={faUserPlus}
            className='h-4 w-4 xl:mr-2 text-gray-500 dark:text-gray-400'
          />
          <span
            className='hidden xl:inline-block'
            onClick={() => openCreateContactDrawerWithPhone(config)}
          >
            Create new contact
          </span>
          <span className='sr-only'>Create new contact</span>
        </Button>
        <span className='flex text-sm font-medium mt-7'>Add to existing contact</span>
        <div className='mt-4'>
          <TextInput
            placeholder='Search contact'
            className='max-w-lg'
            value={textFilter}
            onChange={changeFilterText}
            ref={textFilterRef}
            icon={textFilter.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilter()}
            trailingIcon={true}
          />
        </div>
        <div className='overflow-hidden shadow sm:rounded-md bg-white dark:bg-gray-900'>
          <ul role='list' className='divide-y divide-gray-200 dark:divide-gray-700'>
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
            {/* no search results */}
            {isPhonebookLoaded &&
              phonebook?.rows &&
              !phonebook.rows.length &&
              !!textFilter.length && (
                <EmptyState
                  title='No contacts'
                  description='Try changing your search query'
                  icon={
                    <FontAwesomeIcon
                      icon={faUser}
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
                  <div className='flex items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-4 py-4 sm:px-6 mt-3'>
                    <div className='flex min-w-0 flex-1 items-center'>
                      <div className='flex-shrink-0'>
                        {contact.name !== null ? (
                          <Avatar className='cursor-pointer' placeholderType='person' />
                        ) : (
                          <Avatar className='cursor-pointer' placeholderType='company' />
                        )}
                      </div>
                      <div className='min-w-0 flex-1 px-4 md:grid md:grid-cols-2 gap-4 lg:grid-cols-2 xl:grid-cols-2'>
                        <div className='flex flex-col justify-center'>
                          {/* display name */}
                          {contact.name !== null && (
                            <div className='truncate text-sm font-medium'>
                              <span className=''>{contact.name}</span>
                              <span className='flex text-sm text-gray-500 dark:text-gray-500'>
                                {contact.company
                                  ? contact.company
                                  : contact.workphone
                                  ? contact.workphone
                                  : contact.cellphone}
                              </span>
                            </div>
                          )}
                          {/* display company name  */}
                          {contact.name === null && (
                            <div className='truncate text-sm font-medium'>
                              <span className=''>{contact.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className='h-3 w-3 text-gray-400 dark:text-gray-500 cursor-pointer'
                        aria-hidden='true'
                      />
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  )
})

AddToPhonebookDrawerContent.displayName = 'AddToPhonebookDrawerContent'
