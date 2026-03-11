// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { Fragment } from 'react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { Popover, PopoverButton, PopoverGroup, PopoverPanel, Transition } from '@headlessui/react'
import { useTranslation } from 'react-i18next'
import Datepicker from 'react-tailwindcss-datepicker'
import { useTheme } from '../../../theme/Context'

interface FilterDesktopProps {
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

export const FilterDesktop: React.FC<FilterDesktopProps> = ({
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
    <PopoverGroup className='hidden sm:flex sm:items-baseline sm:space-x-4'>
      {/* call type filter */}
      <Popover
        as='div'
        key={callTypeFilter?.name}
        id={`desktop-menu-${callTypeFilter?.id}`}
        className='relative inline-block text-left'
      >
        <div>
          <PopoverButton className='px-3 py-2 text-sm leading-4 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
            <span> {t(`History.${callTypeFilter?.name}`)}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
              aria-hidden='true'
            />
          </PopoverButton>
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
          <PopoverPanel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md flex flex-col space-y-4 bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-900 dark:ring-gray-700 '>
            {/* Call type */}
            <>
              <form className='space-y-4'>
                {callTypeFilter?.options
                  ?.filter((option: any) => {
                    // check user permissions for switchboard and groups type
                    if (option.value === 'switchboard') {
                      return profile?.macro_permissions?.cdr?.permissions?.ad_cdr?.value
                    } else if (option.value === 'group') {
                      return profile?.macro_permissions?.cdr?.permissions?.group_cdr?.value
                    } else {
                      return true
                    }
                  })
                  .map((option: any) => (
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
              </form>

              {/* Divider */}
              <div className='relative '>
                <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                  <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                </div>
              </div>
            </>

            {/* Call direction */}
            {internalUsed && (
              <form className='space-y-4'>
                {callDirectionFilter.options.map((option: any) => (
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
              </form>
            )}
            {!internalUsed && (
              <form className='space-y-4'>
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
              </form>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>

      {/* Date filter */}
      <Popover className='relative inline-block text-left'>
        <div>
          <PopoverButton className='px-3 py-2 text-sm leading-4 rounded border p-2  shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
            <span> {t(`History.${date.name}`)}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
              aria-hidden='true'
            />
          </PopoverButton>
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
          <PopoverPanel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md bg-white ring-black dark:bg-gray-900 dark:ring-gray-600  p-4 shadow-2xl ring-1 ring-opacity-5'>
            <div className='flex pb-4'>
              <div className='relative flex-1'>
                <label htmlFor='startTime' className='text-gray-700 dark:text-gray-300 mt-2'>
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
                <label htmlFor='endTime' className='text-gray-700 dark:text-gray-300 mb-2'>
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
              displayFormat={'DD/MM/YYYY'}
              inputClassName={classNames(datePickerTheme.base)}
            />
          </PopoverPanel>
        </Transition>
      </Popover>

      {/* Sort filter */}
      <Popover
        as='div'
        key={sortFilter.name}
        id={`desktop-menu-${sortFilter.id}`}
        className='relative inline-block text-left'
      >
        <div>
          <PopoverButton className='px-3 py-2 text-sm leading-4 p-2 rounded border shadow-sm border-gray-300 bg-white text-gray-700 hover:bg-gray-100 focus:ring-primaryLight dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-primaryDark group inline-flex items-center justify-center font-medium  hover:text-gray-900 dark:hover:text-gray-100'>
            <span>{t(`History.${sortFilter.name}`)}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className='ml-2 h-3 w-3 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
              aria-hidden='true'
            />
          </PopoverButton>
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
          <PopoverPanel className='absolute right-0 z-10 mt-2 origin-top-right rounded-md p-4 shadow-2xl ring-1 ring-opacity-5 focus:outline-none bg-white ring-black dark:bg-gray-900 dark:ring-gray-600'>
            <form className='space-y-4'>
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
                    className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                  >
                    {t(`History.${option.label}`)}
                  </label>
                </div>
              ))}
            </form>
          </PopoverPanel>
        </Transition>
      </Popover>
    </PopoverGroup>
  )
}
