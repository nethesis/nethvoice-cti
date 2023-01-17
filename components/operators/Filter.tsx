// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useRef } from 'react'
import classNames from 'classnames'
import { TextInput } from '../common'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleXmark, faXmark } from '@fortawesome/free-solid-svg-icons'
import { RadioButtonType } from '../../services/types'
import {
  DEFAULT_GROUP_FILTER,
  DEFAULT_SORT_BY,
  DEFAULT_STATUS_FILTER,
  getFilterValues,
} from '../../lib/operators'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { savePreference } from '../../lib/storage'

const sortFilter = {
  id: 'sort',
  name: 'Sort by',
  options: [
    { value: 'favorites', label: 'Favorites' },
    { value: 'status', label: 'Status' },
    { value: 'name', label: 'Name' },
  ],
}

const statusFilter = {
  id: 'status',
  name: 'Status',
  options: [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'unavailable', label: 'Unavailable' },
    { value: 'offline', label: 'Offline' },
    { value: 'allExceptOffline', label: 'All except offline' },
  ],
}

const layoutFilter = {
  id: 'layout',
  name: 'Layout',
  options: [
    { value: 'standard', label: 'Standard' },
    { value: 'compact', label: 'Compact' },
  ],
}

export interface FilterProps extends ComponentPropsWithRef<'div'> {
  groups: Object
  updateTextFilter: Function
  updateGroupFilter: Function
  updateStatusFilter: Function
  updateSort: Function
  updateLayout: Function
}

export const Filter = forwardRef<HTMLButtonElement, FilterProps>(
  (
    {
      groups,
      className,
      updateTextFilter,
      updateGroupFilter,
      updateStatusFilter,
      updateSort,
      updateLayout,
      ...props
    },
    ref,
  ) => {
    const auth = useSelector((state: RootState) => state.authentication)

    const [groupFilter, setGroupFilter] = useState({
      id: 'group',
      name: 'Group',
      options: [] as RadioButtonType[],
    })

    // group options

    useEffect(() => {
      groupFilter.options = [
        { value: 'all', label: 'All' },
        { value: 'favorites', label: 'Favorites' },
        { value: 'divider1', label: '-' },
      ]

      Object.keys(groups).forEach((group) => {
        groupFilter.options.push({
          value: group,
          label: group,
        })
      })

      setGroupFilter(groupFilter)
    }, [groupFilter, groups])

    const [open, setOpen] = useState(false)

    const [textFilter, setTextFilter] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
    function changeTextFilter(event: any) {
      const newTextFilter = event.target.value
      setTextFilter(newTextFilter)

      // update operators (notify parent component)
      updateTextFilter(newTextFilter)
    }

    const [group, setGroup] = useState('')
    function changeGroup(event: any) {
      const newGroup = event.target.id.split('group-')[1]
      setGroup(newGroup)
      savePreference('operatorsGroupFilter', newGroup, auth.username)

      // update operators (notify parent component)
      updateGroupFilter(newGroup)
    }

    // text filter for groups

    const [groupTextFilter, setGroupTextFilter] = useState('')
    const groupTextFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
    function changeGroupTextFilter(event: any) {
      const newGroupTextFilter = event.target.value
      setGroupTextFilter(newGroupTextFilter)
    }

    const [filteredGroups, setFilteredGroups] = useState([] as RadioButtonType[])

    useEffect(() => {
      const regex = /[^a-zA-Z0-9]/g
      const queryText = groupTextFilter.replace(regex, '')

      // filter group filter options that match
      const filtered = groupFilter.options.filter((g) =>
        new RegExp(queryText, 'i').test(g.label.replace(regex, '')),
      )
      setFilteredGroups(filtered)
    }, [groupTextFilter, groupFilter.options])

    const [status, setStatus] = useState('')
    function changeStatus(event: any) {
      const newStatus = event.target.id.split('status-')[1]
      setStatus(newStatus)
      savePreference('operatorsStatusFilter', newStatus, auth.username)

      // update operators (notify parent component)
      updateStatusFilter(newStatus)
    }

    const [sortBy, setSortBy]: any = useState('')
    function changeSortBy(event: any) {
      const newSortBy = event.target.id.split('sort-')[1]
      setSortBy(newSortBy)
      savePreference('operatorsSortBy', newSortBy, auth.username)

      // update operators (notify parent component)
      updateSort(newSortBy)
    }

    const [layout, setLayout]: any = useState('')
    function changeLayout(event: any) {
      const newLayout = event.target.id.split('layout-')[1]
      setLayout(newLayout)
      savePreference('operatorsLayout', newLayout, auth.username)

      // update operators layout (notify parent component)
      updateLayout(newLayout)
    }

    // retrieve filter values from local storage

    useEffect(() => {
      const filterValues = getFilterValues(auth.username)
      setGroup(filterValues.group)
      setStatus(filterValues.status)
      setSortBy(filterValues.sortBy)
      setLayout(filterValues.layout)

      updateGroupFilter(filterValues.group)
      updateStatusFilter(filterValues.status)
      updateSort(filterValues.sortBy)
      updateLayout(filterValues.layout)
    }, [])

    // group label

    const [groupLabel, setGroupLabel] = useState('')
    useEffect(() => {
      const found = groupFilter.options.find((option) => option.value === group)

      if (found) {
        setGroupLabel(found.label)
      }
    }, [group, groupFilter.options])

    // status label

    const [statusLabel, setStatusLabel] = useState('')
    useEffect(() => {
      const found = statusFilter.options.find((option) => option.value === status)

      if (found) {
        setStatusLabel(found.label)
      }
    }, [status])

    // sort by label

    const [sortByLabel, setSortByLabel] = useState('')
    useEffect(() => {
      const found = sortFilter.options.find((option) => option.value === sortBy)

      if (found) {
        setSortByLabel(found.label)
      }
    }, [sortBy])

    const resetFilters = () => {
      setTextFilter('')
      setGroup(DEFAULT_GROUP_FILTER)
      setStatus(DEFAULT_STATUS_FILTER)
      setSortBy(DEFAULT_SORT_BY)
      savePreference('operatorsGroupFilter', DEFAULT_GROUP_FILTER, auth.username)
      savePreference('operatorsStatusFilter', DEFAULT_STATUS_FILTER, auth.username)
      savePreference('operatorsSortBy', DEFAULT_SORT_BY, auth.username)

      // notify parent component
      updateTextFilter('')
      updateGroupFilter(DEFAULT_GROUP_FILTER)
      updateStatusFilter(DEFAULT_STATUS_FILTER)
      updateSort(DEFAULT_SORT_BY)
    }

    const clearTextFilter = () => {
      setTextFilter('')
      updateTextFilter('')
      textFilterRef.current.focus()
    }

    const clearGroupTextFilter = () => {
      setGroupTextFilter('')
      groupTextFilterRef.current.focus()
    }

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
                <div className='fixed inset-0 bg-black bg-opacity-25 dark:bg-black dark:bg-opacity-25' />
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
                  <Dialog.Panel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto py-4 pb-6 shadow-xl bg-white dark:bg-gray-900'>
                    <div className='flex items-center justify-between px-4'>
                      <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                        Filters
                      </h2>
                      <button
                        type='button'
                        className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md focus:outline-none focus:ring-2 p-2 bg-white text-gray-400 hover:bg-gray-50 focus:ring-primaryLight dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-primaryDark'
                        onClick={() => setOpen(false)}
                      >
                        <span className='sr-only'>Close menu</span>
                        <FontAwesomeIcon icon={faXmark} className='h-5 w-5' aria-hidden='true' />
                      </button>
                    </div>

                    {/* Filters (mobile) */}
                    <form className='mt-4'>
                      {/* group filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={groupFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {groupFilter.name}
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
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className='pt-6'>
                              <fieldset>
                                <legend className='sr-only'>{groupFilter.name}</legend>
                                <div className='space-y-4'>
                                  <TextInput
                                    placeholder='Filter groups'
                                    value={groupTextFilter}
                                    onChange={changeGroupTextFilter}
                                    autoFocus
                                    ref={groupTextFilterRef}
                                    icon={groupTextFilter.length ? faCircleXmark : undefined}
                                    onIconClick={() => clearGroupTextFilter()}
                                    trailingIcon={true}
                                    className='min-w-[8rem]'
                                  />
                                  {!filteredGroups.length && (
                                    <div className='text-sm text-gray-500 dark:text-gray-400'>
                                      <span>No groups</span>
                                    </div>
                                  )}
                                  {filteredGroups.map((option) => (
                                    <div key={option.value}>
                                      {option.value.startsWith('divider') ? (
                                        <div className='relative'>
                                          <div
                                            className='absolute inset-0 flex items-center'
                                            aria-hidden='true'
                                          >
                                            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                                          </div>
                                          <div className='relative flex justify-center'></div>
                                        </div>
                                      ) : (
                                        <div className='flex items-center'>
                                          <input
                                            id={`group-${option.value}`}
                                            name={`filter-${groupFilter.id}`}
                                            type='radio'
                                            defaultChecked={option.value === group}
                                            onChange={changeGroup}
                                            className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                          />
                                          <label
                                            htmlFor={`group-${option.value}`}
                                            className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                          >
                                            {option.label}
                                          </label>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </fieldset>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                      {/* status filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={statusFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {statusFilter.name}
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
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className='pt-6'>
                              <fieldset>
                                <legend className='sr-only'>{statusFilter.name}</legend>
                                <div className='space-y-4'>
                                  {statusFilter.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={`status-${option.value}`}
                                        name={`filter-${statusFilter.id}`}
                                        type='radio'
                                        defaultChecked={option.value === status}
                                        onChange={changeStatus}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={`status-${option.value}`}
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
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
                      {/* sort by filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={sortFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {sortFilter.name}
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
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className='pt-6'>
                              <fieldset>
                                <legend className='sr-only'>{sortFilter.name}</legend>
                                <div className='space-y-4'>
                                  {sortFilter.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={`sort-${option.value}`}
                                        name={`filter-${sortFilter.id}`}
                                        type='radio'
                                        defaultChecked={option.value === sortBy}
                                        onChange={changeSortBy}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={`sort-${option.value}`}
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
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
                      {/* layout (mobile) */}
                      <Disclosure
                        as='div'
                        key={layoutFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {layoutFilter.name}
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
                              </Disclosure.Button>
                            </h3>
                            <Disclosure.Panel className='pt-6'>
                              <fieldset>
                                <legend className='sr-only'>{layoutFilter.name}</legend>
                                <div className='space-y-4'>
                                  {layoutFilter.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={`layout-${option.value}`}
                                        name={`filter-${layoutFilter.id}`}
                                        type='radio'
                                        defaultChecked={option.value === layout}
                                        onChange={changeLayout}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={`layout-${option.value}`}
                                        className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
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
            <section aria-labelledby='filter-heading' className='pb-6'>
              <h2 id='filter-heading' className='sr-only'>
                Operators filters
              </h2>

              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <TextInput
                    placeholder='Filter operators'
                    className='max-w-sm'
                    value={textFilter}
                    onChange={changeTextFilter}
                    ref={textFilterRef}
                    icon={textFilter.length ? faCircleXmark : undefined}
                    onIconClick={() => clearTextFilter()}
                    trailingIcon={true}
                  />
                </div>

                <div className='flex ml-4'>
                  <Popover.Group className='hidden sm:flex sm:items-baseline sm:space-x-8'>
                    {/* group filter */}
                    <Popover
                      as='div'
                      key={groupFilter.name}
                      id={`desktop-menu-${groupFilter.id}`}
                      className='relative inline-block text-left shrink-0'
                    >
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'>
                          <span>{groupFilter.name}</span>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md p-4 shadow-2xl ring-1 ring-opacity-5 focus:outline-none bg-white ring-black dark:bg-gray-900 dark:ring-gray-700'>
                          <form className='space-y-4'>
                            <TextInput
                              placeholder='Filter groups'
                              value={groupTextFilter}
                              onChange={changeGroupTextFilter}
                              autoFocus
                              ref={groupTextFilterRef}
                              icon={groupTextFilter.length ? faCircleXmark : undefined}
                              onIconClick={() => clearGroupTextFilter()}
                              trailingIcon={true}
                              className='min-w-[10rem]'
                            />
                            {!filteredGroups.length && (
                              <div className='text-sm text-gray-500 dark:text-gray-400'>
                                <span>No groups</span>
                              </div>
                            )}
                            {filteredGroups.map((option) => (
                              <div key={option.value}>
                                {option.value.startsWith('divider') ? (
                                  <div className='relative'>
                                    <div
                                      className='absolute inset-0 flex items-center'
                                      aria-hidden='true'
                                    >
                                      <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                                    </div>
                                    <div className='relative flex justify-center'></div>
                                  </div>
                                ) : (
                                  <div className='flex items-center'>
                                    <input
                                      id={`group-${option.value}`}
                                      name={`filter-${groupFilter.id}`}
                                      type='radio'
                                      defaultChecked={option.value === group}
                                      onChange={changeGroup}
                                      className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                    />
                                    <label
                                      htmlFor={`group-${option.value}`}
                                      className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                )}
                              </div>
                            ))}
                          </form>
                        </Popover.Panel>
                      </Transition>
                    </Popover>

                    {/* status filter */}
                    <Popover
                      as='div'
                      key={statusFilter.name}
                      id={`desktop-menu-${statusFilter.id}`}
                      className='relative inline-block text-left shrink-0'
                    >
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'>
                          <span>{statusFilter.name}</span>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md p-4 shadow-2xl ring-1 ring-opacity-5 focus:outline-none bg-white ring-black dark:bg-gray-900 dark:ring-gray-700'>
                          <form className='space-y-4'>
                            {statusFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={`status-${option.value}`}
                                  name={`filter-${statusFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === status}
                                  onChange={changeStatus}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={`status-${option.value}`}
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

                    {/* sort by filter */}
                    <Popover
                      as='div'
                      key={sortFilter.name}
                      id={`desktop-menu-${sortFilter.id}`}
                      className='relative inline-block text-left shrink-0'
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
                                  id={`sort-${option.value}`}
                                  name={`filter-${sortFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === sortBy}
                                  onChange={changeSortBy}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={`sort-${option.value}`}
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

                    {/* layout filter */}
                    <Popover
                      as='div'
                      key={layoutFilter.name}
                      id={`desktop-menu-${layoutFilter.id}`}
                      className='relative inline-block text-left shrink-0'
                    >
                      <div>
                        <Popover.Button className='group inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100'>
                          <span>{layoutFilter.name}</span>
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
                            {layoutFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={`layout-${option.value}`}
                                  name={`filter-${layoutFilter.id}`}
                                  type='radio'
                                  defaultChecked={option.value === layout}
                                  onChange={changeLayout}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={`layout-${option.value}`}
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
                    Filters
                  </button>
                </div>
              </div>

              {/* Active filters */}
              <div>
                <div className='mx-auto pt-3 sm:flex sm:items-center'>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    Active filters
                  </h3>
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px sm:ml-4 sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  {/* group */}
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 pl-3 pr-2 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span>
                          {/*  //// todo i18n */}
                          <span className='text-gray-500 dark:text-gray-400'>Group:</span>{' '}
                          {groupLabel}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* status */}
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 pl-3 pr-2 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span>
                          {/*  //// todo i18n */}
                          <span className='text-gray-500 dark:text-gray-400'>Status:</span>{' '}
                          {statusLabel}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* sort by */}
                  <div className='mt-2 sm:mt-0 sm:ml-4'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 pl-3 pr-2 text-sm font-medium border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                        <span>
                          {/*  //// todo i18n */}
                          <span className='text-gray-500 dark:text-gray-400'>Sort by:</span>{' '}
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
                      className='text-sm hover:underline text-gray-700 dark:text-gray-200'
                    >
                      Reset filters
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

Filter.displayName = 'Filter'
