// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useRef } from 'react'
import classNames from 'classnames'
import { TextInput } from '../../common'
import { Fragment, useState, useEffect } from 'react'
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCircleXmark, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { savePreference } from '../../../lib/storage'
import { DEFAULT_OUTCOME_FILTER, getFilterValues } from '../../../lib/queuesLib'
import { useTranslation } from 'react-i18next'
import { cloneDeep, isEmpty } from 'lodash'

export interface NotManagedCallsFilterProps extends ComponentPropsWithRef<'div'> {
  updateTextFilter: Function
  updateOutcomeFilter: Function
  updateQueuesFilter: Function
}

export const NotManagedCallsFilter = forwardRef<HTMLButtonElement, NotManagedCallsFilterProps>(
  ({ updateTextFilter, updateOutcomeFilter, updateQueuesFilter, className, ...props }, ref) => {
    const { t } = useTranslation()
    const auth = useSelector((state: RootState) => state.authentication)
    const [textFilter, setTextFilter] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
    const [open, setOpen] = useState(false)
    const [outcome, setOutcome] = useState('')
    const [selectedQueues, setSelectedQueues]: any = useState([])

    const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

    const outcomeFilter = {
      id: 'outcome',
      name: t('Queues.Outcome'),
      options: [
        { value: 'lost', label: t('Queues.Not managed') },
        { value: 'done', label: t('Queues.Managed') },
        { value: 'all', label: t('Queues.All') },
      ],
    }

    const queuesFilter = {
      id: 'queues',
      name: t('Queues.Queues'),
      options: Object.values(queueManagerStore.queues).map((queue: any) => {
        return { value: queue.queue, label: `${queue.name} (${queue.queue})` }
      }),
    }

    function changeTextFilter(event: any) {
      const newTextFilter = event.target.value
      setTextFilter(newTextFilter)

      // notify parent component
      updateTextFilter(newTextFilter)
    }

    function changeQueuesFilter(event: any) {
      const isChecked = event.target.checked
      const newSelectedQueues = cloneDeep(selectedQueues)

      if (isChecked) {
        newSelectedQueues.push(event.target.value)
        setSelectedQueues(newSelectedQueues)
      } else {
        let index = newSelectedQueues.indexOf(event.target.value)
        newSelectedQueues.splice(index, 1)
        setSelectedQueues(newSelectedQueues)
      }
      savePreference('queuesSelectedQueues', newSelectedQueues, auth.username)

      // notify parent component
      updateQueuesFilter(newSelectedQueues)
    }

    function changeOutcomeFilter(event: any) {
      const newOutcome = event.target.id.split('outcome-')[1]
      setOutcome(newOutcome)
      savePreference('queuesOutcomeFilter', newOutcome, auth.username)

      // notify parent component
      updateOutcomeFilter(newOutcome)
    }

    // retrieve filter values from local storage

    useEffect(() => {
      const filterValues = getFilterValues(auth.username)
      setOutcome(filterValues.outcome)
      updateOutcomeFilter(filterValues.outcome)

      if (isEmpty(filterValues.selectedQueues)) {
        // select all queues
        const allQueueCodes = Object.values(queueManagerStore.queues).map((queue: any) => {
          return queue.queue
        })
        setSelectedQueues(allQueueCodes)
        updateQueuesFilter(allQueueCodes)
      } else {
        // select queues from preferences
        setSelectedQueues(filterValues.selectedQueues)
        updateQueuesFilter(filterValues.selectedQueues)
      }
    }, [])

    // outcome label

    const [outcomeLabel, setOutcomeLabel] = useState('')
    useEffect(() => {
      const found = outcomeFilter.options.find((option) => option.value === outcome)

      if (found) {
        setOutcomeLabel(found.label)
      }
    }, [outcome, outcomeFilter.options])

    // queues label

    const [queuesLabel, setQueuesLabel] = useState('')
    useEffect(() => {
      if (!isEmpty(selectedQueues)) {
        setQueuesLabel(selectedQueues.join(', '))
      } else {
        // if no queues are selected, it's equivalent to select all of them
        const allQueueCodes = queuesFilter.options.map((queue: any) => queue.value)
        setQueuesLabel(allQueueCodes.join(', '))
      }
    }, [selectedQueues, queuesFilter.options])

    const resetFilters = () => {
      setTextFilter('')
      updateTextFilter('') // notify parent component

      setOutcome(DEFAULT_OUTCOME_FILTER)
      updateOutcomeFilter(DEFAULT_OUTCOME_FILTER) // notify parent component
      savePreference('queuesOutcomeFilter', DEFAULT_OUTCOME_FILTER, auth.username)

      // select all queues
      const allQueueCodes = Object.values(queueManagerStore.queues).map((queue: any) => {
        return queue.queue
      })
      setSelectedQueues(allQueueCodes)
      updateQueuesFilter(allQueueCodes)
      savePreference('queuesSelectedQueues', allQueueCodes, auth.username)
    }

    const clearTextFilter = () => {
      setTextFilter('')
      updateTextFilter('')
      textFilterRef.current.focus()
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
                  <Dialog.Panel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 py-4 pb-6 shadow-xl bg-white dark:bg-gray-900'>
                    <div className='flex items-center justify-between px-4'>
                      <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                        {t('Common.Filters')}
                      </h2>
                      <button
                        type='button'
                        className='-mr-2 flex h-10 w-10 items-center justify-center rounded-md focus:outline-none focus:ring-2 p-2 bg-white text-gray-400 hover:bg-gray-50 focus:ring-primaryLight dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:focus:ring-primaryDark'
                        onClick={() => setOpen(false)}
                      >
                        <span className='sr-only'>{t('Common.Close menu')}</span>
                        <FontAwesomeIcon icon={faXmark} className='h-5 w-5' aria-hidden='true' />
                      </button>
                    </div>

                    {/* Filters (mobile) */}
                    <form className='mt-4'>
                      {/* outcome filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={outcomeFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {outcomeFilter.name}
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
                                <legend className='sr-only'>{outcomeFilter.name}</legend>
                                <div className='space-y-4'>
                                  {outcomeFilter.options.map((option) => (
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
                                            id={`outcome-${option.value}`}
                                            name={`filter-${outcomeFilter.id}`}
                                            type='radio'
                                            defaultChecked={option.value === outcome}
                                            onChange={changeOutcomeFilter}
                                            className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                          />
                                          <label
                                            htmlFor={`outcome-${option.value}`}
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
                      {/* queues filter (mobile) */}
                      <Disclosure
                        as='div'
                        key={queuesFilter.name}
                        className='border-t px-4 py-6 border-gray-200 dark:border-gray-700'
                      >
                        {({ open }) => (
                          <>
                            <h3 className='-mx-2 -my-3 flow-root'>
                              <Disclosure.Button className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                                <span className='font-medium text-gray-900 dark:text-gray-100'>
                                  {queuesFilter.name}
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
                                <legend className='sr-only'>{queuesFilter.name}</legend>
                                <div className='space-y-4'>
                                  {queuesFilter.options.map((option) => (
                                    <div key={option.value} className='flex items-center'>
                                      <input
                                        id={`queues-${option.value}`}
                                        name={`filter-${queuesFilter.id}`}
                                        type='checkbox'
                                        defaultChecked={selectedQueues.includes(option.value)}
                                        value={option.value}
                                        onChange={changeQueuesFilter}
                                        className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                      />
                                      <label
                                        htmlFor={`queues-${option.value}`}
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
                {t('Queues.Calls filters')}
              </h2>

              <div className='flex items-center'>
                <div className='flex items-center'>
                  <TextInput
                    placeholder={t('Queues.Filter calls') || ""}
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
                  <Popover.Group className='hidden sm:flex sm:items-baseline sm:space-x-4'>
                    {/* outcome filter */}
                    <Popover
                      as='div'
                      key={outcomeFilter.name}
                      id={`desktop-menu-${outcomeFilter.id}`}
                      className='relative inline-block text-left shrink-0'
                    >
                      <div>
                        <Popover.Button className='px-3 py-2 text-sm leading-4 p-2 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
                          <span>{outcomeFilter.name}</span>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md min-w-max p-4 shadow-2xl ring-1 focus:outline-none ring-opacity-5 bg-white ring-black dark:ring-opacity-5 dark:bg-gray-900 dark:ring-gray-700'>
                          <form className='space-y-4'>
                            {outcomeFilter.options.map((option) => (
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
                                      id={`outcome-${option.value}`}
                                      name={`filter-${outcomeFilter.id}`}
                                      type='radio'
                                      defaultChecked={option.value === outcome}
                                      onChange={changeOutcomeFilter}
                                      className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                    />
                                    <label
                                      htmlFor={`outcome-${option.value}`}
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

                    {/* queues filter */}

                    <Popover
                      as='div'
                      key={queuesFilter.name}
                      id={`desktop-menu-${queuesFilter.id}`}
                      className='relative inline-block text-left shrink-0'
                    >
                      <div>
                        <Popover.Button className='px-3 py-2 text-sm leading-4 p-2 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
                          <span>{queuesFilter.name}</span>
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
                        <Popover.Panel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md min-w-max p-4 shadow-2xl ring-1 focus:outline-none ring-opacity-5 bg-white ring-black dark:ring-opacity-5 dark:bg-gray-900 dark:ring-gray-700'>
                          <form className='space-y-4'>
                            {queuesFilter.options.map((option) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={`queues-${option.value}`}
                                  name={`filter-${queuesFilter.id}`}
                                  type='checkbox'
                                  defaultChecked={selectedQueues.includes(option.value)}
                                  value={option.value}
                                  onChange={changeQueuesFilter}
                                  className='h-4 w-4 rounded border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primary dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={`queues-${option.value}`}
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

              {/* Active filters */}
              <div>
                <div className='mx-auto pt-3 flex flex-wrap items-center gap-y-2 gap-x-4'>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400 text-left sm:text-center'>
                    {t('Common.Active filters')}
                  </h3>
                  {/* separator */}
                  <div aria-hidden='true' className='h-5 w-px block bg-gray-300 dark:bg-gray-600' />
                  {/* outcome */}
                  <div className='mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                        <span>
                          <span className='text-gray-600 dark:text-gray-300'>
                            {t('Queues.Outcome')}:
                          </span>{' '}
                          {outcomeLabel}
                        </span>
                      </span>
                    </div>
                  </div>
                  {/* queues */}
                  <div className='mt-0'>
                    <div className='-m-1 flex flex-wrap items-center'>
                      <span className='m-1 inline-flex items-center rounded-full border py-1.5 px-3 text-sm font-medium border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-100'>
                        <span>
                          <span className='text-gray-600 dark:text-gray-300'>
                            {t('Queues.Queues')}:
                          </span>{' '}
                          {queuesLabel}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* separator */}
                  <div
                    aria-hidden='true'
                    className='h-5 w-px sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  {/* reset filters */}
                  <div className='mt-0 text-center'>
                    <button
                      type='button'
                      onClick={() => resetFilters()}
                      className='text-sm hover:underline text-primary dark:text-primaryDark'
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

NotManagedCallsFilter.displayName = 'NotManagedCallsFilter'
