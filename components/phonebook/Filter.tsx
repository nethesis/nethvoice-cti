// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { TextInput } from '../common'
import { MdExpandMore, MdClose } from 'react-icons/md'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'

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
  updateFilterText: Function
  updateContactTypeFilter: Function
  updateSortFilter: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  ({ updateFilterText, updateContactTypeFilter, updateSortFilter, className, ...props }, ref) => {
    const [open, setOpen] = useState(false)

    const [filterText, setFilterText] = useState('')
    function changeFilterText(event: any) {
      const newFilterText = event.target.value
      setFilterText(newFilterText)

      // update phonebook (notify parent component)
      updateFilterText(newFilterText)
    }

    const [contactType, setContactType] = useState('all')
    function changeContactType(event: any) {
      const newContactType = event.target.id
      setContactType(newContactType)

      // update phonebook (notify parent component)
      updateContactTypeFilter(newContactType)
    }

    const [sortBy, setSortBy]: any = useState('name')
    function changeSortBy(event: any) {
      const newSortBy = event.target.id
      setSortBy(newSortBy)

      // update phonebook (notify parent component)
      updateSortFilter(newSortBy)
    }

    const [contactTypeLabel, setContactTypeLabel] = useState('')

    useEffect(() => {
      const contactTypeFound = contactTypeFilter.options.find(
        (option) => option.value === contactType,
      )

      if (contactTypeFound) {
        setContactTypeLabel(contactTypeFound.label)
      }
    }, [contactType])

    return (
      <div className={classNames(className)} {...props}>
        <div className=''>
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
                <div className='fixed inset-0 bg-black bg-opacity-25' />
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
                  <Dialog.Panel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl'>
                    <div className='flex items-center justify-between px-4'>
                      <h2 className='text-lg font-medium text-gray-900'>Filters</h2>
                      <button
                        type='button'
                        className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        onClick={() => setOpen(false)}
                      >
                        <span className='sr-only'>Close menu</span>
                        <MdClose className='h-6 w-6' aria-hidden='true' />
                      </button>
                    </div>

                    {/* Filters (mobile) */}
                    <form className='mt-4'>
                      {/* sort by filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={sortFilter.name}
                        className='border-t border-gray-200 px-4 py-6'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400'>
                                <span className='font-medium text-gray-900'>{sortFilter.name}</span>
                                <span className='ml-6 flex items-center'>
                                  <MdExpandMore
                                    className={classNames(
                                      open ? '-rotate-180' : 'rotate-0',
                                      'h-5 w-5 transform',
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
                                        className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700'
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </fieldset>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                      {/* contact type filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={contactTypeFilter.name}
                        className='border-t border-gray-200 px-4 py-6'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400'>
                                <span className='font-medium text-gray-900'>
                                  {contactTypeFilter.name}
                                </span>
                                <span className='ml-6 flex items-center'>
                                  <MdExpandMore
                                    className={classNames(
                                      open ? '-rotate-180' : 'rotate-0',
                                      'h-5 w-5 transform',
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
                                        className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                      />
                                      <label
                                        htmlFor={option.value}
                                        className='ml-3 block text-sm font-medium text-gray-700'
                                      >
                                        {option.label}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </fieldset>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>

          <div className='mx-auto text-center'>
            <section aria-labelledby='filter-heading' className='pb-4'>
              <h2 id='filter-heading' className='sr-only'>
                Product filters
              </h2>

              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <TextInput
                    placeholder='Filter contacts'
                    className='max-w-sm'
                    value={filterText}
                    onChange={changeFilterText}
                  />
                </div>

                <div className='flex'>
                  {/* sort by filter */}
                  <Popover.Group className='hidden sm:flex sm:items-baseline sm:space-x-8'>
                    <Popover
                      as='div'
                      key={sortFilter.name}
                      id={`desktop-menu-${sortFilter.id}`}
                      className='relative inline-block text-left'
                    >
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
                          <span>{sortFilter.name}</span>
                          <MdExpandMore
                            className='-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500'
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none'>
                          <form className='space-y-4'>
                            {sortFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${sortFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === sortBy}
                                  onChange={changeSortBy}
                                  className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700'
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>

                    {/* contact type filter */}
                    <Popover
                      as='div'
                      key={contactTypeFilter.name}
                      id={`desktop-menu-${contactTypeFilter.id}`}
                      className='relative inline-block text-left'
                    >
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900'>
                          <span>{contactTypeFilter.name}</span>
                          <MdExpandMore
                            className='-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500'
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none'>
                          <form className='space-y-4'>
                            {contactTypeFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${contactTypeFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === contactType}
                                  onChange={changeContactType}
                                  className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700'
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
                    className='inline-block text-sm font-medium text-gray-700 hover:text-gray-900 sm:hidden ml-4'
                    onClick={() => setOpen(true)}
                  >
                    Filters
                  </button>
                </div>
              </div>

              {/* Active filters */}
              <div className='bg-gray-100'>
                <div className='mx-auto pt-3 sm:flex sm:items-center'>
                  <h3 className='text-sm font-medium text-gray-500'>Active filters</h3>
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px bg-gray-300 sm:ml-4 sm:block'
                  />
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border border-gray-200 bg-white py-1.5 pl-3 pr-2 text-sm font-medium text-gray-700'>
                        <span>Contact type: {contactTypeLabel}</span>
                      </span>
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
