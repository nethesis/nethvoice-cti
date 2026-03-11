// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { Fragment } from 'react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faXmark } from '@fortawesome/free-solid-svg-icons'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useTranslation } from 'react-i18next'
import Datepicker from 'react-tailwindcss-datepicker'
import { useTheme } from '../../../theme/Context'

interface FilterMobileProps {
  open: boolean
  setOpen: (open: boolean) => void
  callTypeFilter: any
  callType: string
  changeCallType: (event: any) => void
  profile: any
  internalUsed: boolean
  callDirectionFilter: any
  callDirectionFilterNoInternal: any
  callDirection: string
  changeCallDirection: (event: any) => void
  date: any
  hourBeginRef: React.MutableRefObject<HTMLInputElement>
  hourEndRef: React.MutableRefObject<HTMLInputElement>
  hourBeginValue: string
  hourEndValue: string
  changeHourBegin: () => void
  changeHourEnd: () => void
  selectedLanguage: string
  dateValue: any
  changeDateBegin: (date: any) => void
  sortFilter: any
  sortBy: string
  changeSortBy: (event: any) => void
}

export const FilterMobile: React.FC<FilterMobileProps> = ({
  open,
  setOpen,
  callTypeFilter,
  callType,
  changeCallType,
  profile,
  internalUsed,
  callDirectionFilter,
  callDirectionFilterNoInternal,
  callDirection,
  changeCallDirection,
  date,
  hourBeginRef,
  hourEndRef,
  hourBeginValue,
  hourEndValue,
  changeHourBegin,
  changeHourEnd,
  selectedLanguage,
  dateValue,
  changeDateBegin,
  sortFilter,
  sortBy,
  changeSortBy,
}) => {
  const { t } = useTranslation()
  const { timePicker: timePickerTheme, datePicker: datePickerTheme } = useTheme().theme

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as='div' className='relative z-40 sm:hidden' onClose={setOpen}>
        <TransitionChild
          as={Fragment}
          enter='transition-opacity ease-linear duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition-opacity ease-linear duration-300'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black bg-opacity-25 dark:bg-black dark:bg-opacity-25' />
        </TransitionChild>

        <div className='fixed inset-0 z-40 flex'>
          <TransitionChild
            as={Fragment}
            enter='transition ease-in-out duration-300 transform'
            enterFrom='translate-x-full'
            enterTo='translate-x-0'
            leave='transition ease-in-out duration-300 transform'
            leaveFrom='translate-x-0'
            leaveTo='translate-x-full'
          >
            <DialogPanel className='relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto py-4 pb-6 shadow-xl bg-white dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
              <div className='flex items-center justify-between px-4'>
                <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>
                  {t('History.Filters')}
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
                {/* call type filter (mobile) */}
                <Disclosure
                  as='div'
                  key={callTypeFilter?.name}
                  className='border-t border-gray-200 px-4 py-6 dark:border-gray-700'
                >
                  {({ open }) => (
                    <>
                      <h3 className='-mx-2 -my-3 flow-root'>
                        <DisclosureButton className='flex w-full items-center justify-between px-2 py-3 text-sm bg-white text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                          <span className='font-medium text-gray-900 dark:text-gray-100'>
                            {t(`History.${callTypeFilter?.name}`)}
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
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className='pt-6 flex flex-col space-y-2'>
                        <fieldset>
                          <legend className='sr-only'>{callTypeFilter?.name}</legend>
                        </fieldset>
                        {/* show call type filter only if user has cdr permissions */}
                        {profile?.macro_permissions?.cdr?.permissions?.ad_cdr?.value && (
                          <>
                            <div className='space-y-4'>
                              {callTypeFilter?.options?.map((option: any) => (
                                <div key={option?.value} className='flex items-center'>
                                  <input
                                    id={option?.value}
                                    name={`filter-${callTypeFilter?.id}`}
                                    type='radio'
                                    defaultChecked={option?.value === callType}
                                    onChange={changeCallType}
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
                            </div>

                            {/* Divider  */}
                            <div className='relative'>
                              <div
                                className='absolute inset-0 flex items-center'
                                aria-hidden='true'
                              >
                                <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
                              </div>
                            </div>
                          </>
                        )}

                        <fieldset>
                          <legend className='sr-only'>{callDirectionFilter?.name}</legend>
                        </fieldset>

                        {/* Call direction filter (mobile) */}
                        {internalUsed && (
                          <div className='space-y-4'>
                            {callDirectionFilter.options.map((option: any) => (
                              <div key={option?.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${callDirectionFilter.id}`}
                                  type='radio'
                                  defaultChecked={
                                    callType === 'user' && callDirection === 'internal'
                                      ? option.value === 'all'
                                      : option.value === callDirection
                                  }
                                  onChange={changeCallDirection}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                >
                                  {t(`History.${option.label}`)}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        {!internalUsed && (
                          <div className='space-y-4'>
                            {callDirectionFilterNoInternal.options.map((option: any) => (
                              <div key={option.value} className='flex items-center'>
                                <input
                                  id={option.value}
                                  name={`filter-${callDirectionFilter.id}`}
                                  type='radio'
                                  defaultChecked={
                                    callType === 'user' && callDirection === 'internal'
                                      ? option.value === 'all'
                                      : option.value === callDirection
                                  }
                                  onChange={changeCallDirection}
                                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                                />
                                <label
                                  htmlFor={option.value}
                                  className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                                >
                                  {t(`History.${option.label}`)}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              </form>

              {/* Date input mobile */}
              <form className='mt-4'>
                <Disclosure
                  as='div'
                  key={date.name}
                  className='border-t border-gray-200 px-4 py-6 dark:border-gray-700'
                >
                  {({ open }) => (
                    <>
                      <h3 className='-mx-2 -my-3 flow-root'>
                        <DisclosureButton className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                          <span className='font-medium text-gray-900 dark:text-gray-100'>
                            {t(`History.${date.name}`)}
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
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className='pt-6 flex flex-col'>
                        <fieldset>
                          <legend className='sr-only'>{date.name}</legend>
                        </fieldset>
                        <div className='flex pb-4'>
                          <div className='relative flex-1'>
                            <label
                              htmlFor='startTime'
                              className='text-gray-700 dark:text-gray-300 mt-2'
                            >
                              {t('History.Start time')}:
                            </label>
                            <input
                              id='startTime'
                              type='time'
                              ref={hourBeginRef}
                              onChange={changeHourBegin}
                              defaultValue={hourBeginValue}
                              className={classNames(timePickerTheme.base)}
                            />
                          </div>
                          <div className='mx-4'></div>
                          <div className='relative flex-1'>
                            <label
                              htmlFor='endTime'
                              className='text-gray-700 dark:text-gray-300 mb-2'
                            >
                              {t('History.End time')}:
                            </label>
                            <input
                              id='endTime'
                              type='time'
                              ref={hourEndRef}
                              onChange={changeHourEnd}
                              defaultValue={hourEndValue}
                              className={classNames(timePickerTheme.base)}
                            />
                          </div>
                        </div>

                        <Datepicker
                          i18n={selectedLanguage?.toString()}
                          value={dateValue}
                          onChange={changeDateBegin}
                          primaryColor={'emerald'}
                          showShortcuts={false}
                          separator={t('History.to') || ''}
                          placeholder={t('History.Choose a date range') || ''}
                          inputClassName={classNames(datePickerTheme.base)}
                        />
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              </form>

              {/* Sort input mobile */}
              <form className='mt-4'>
                <Disclosure
                  as='div'
                  key={sortFilter.name}
                  className='border-t border-gray-200 px-4 py-6 dark:border-gray-700'
                >
                  {({ open }) => (
                    <>
                      <h3 className='-mx-2 -my-3 flow-root'>
                        <DisclosureButton className='flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 dark:bg-gray-900 dark:text-gray-500'>
                          <span className='font-medium text-gray-900 dark:text-gray-100'>
                            {t(`History.${sortFilter.name}`)}
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
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className='pt-6 flex flex-col'>
                        <fieldset>
                          <legend className='sr-only'>{t(`History.${sortFilter.name}`)}</legend>
                        </fieldset>
                        <div className='space-y-4'>
                          {sortFilter.options.map((option: any) => (
                            <div key={option.value} className='flex items-center'>
                              <input
                                id={option.value}
                                name={`filter-${sortFilter.id}`}
                                type='radio'
                                defaultChecked={option.value === sortBy}
                                onChange={changeSortBy}
                                className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                              />
                              <label
                                htmlFor={option.value}
                                className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200 space-y-4'
                              >
                                {t(`History.${option.label}`)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
