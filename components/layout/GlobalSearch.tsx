// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { ComponentProps, useEffect, useMemo } from 'react'
import { FC, useState } from 'react'
import classNames from 'classnames'
import { Transition, Combobox } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faChevronRight,
  faPhone,
  faSearch,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons'
import { RootState, store } from '../../store'
import { useSelector } from 'react-redux'
import { cloneDeep, debounce } from 'lodash'
import { Avatar, EmptyState, InlineNotification } from '../common'
import { openShowOperatorDrawer } from '../../lib/operators'
import { getPhonebook, mapPhonebookResponse, openShowContactDrawer } from '../../lib/phonebook'
import { callPhoneNumber, sortByProperty } from '../../lib/utils'
import { OperatorSummary } from '../operators/OperatorSummary'
import { ContactSummary } from '../phonebook/ContactSummary'

interface GlobalSearchProps extends ComponentProps<'div'> {}

export const GlobalSearch: FC<GlobalSearchProps> = () => {
  const [query, setQuery] = useState('')
  const globalSearchStore = useSelector((state: RootState) => state.globalSearch)
  const [results, setResults]: any[] = useState([])
  const operatorsStore = useSelector((state: RootState) => state.operators)
  const [isLoaded, setLoaded]: any[] = useState(true)
  const [phonebookError, setPhonebookError] = useState('')

  const searchOperators = (cleanQuery: string, cleanRegex: RegExp) => {
    let operatorsResults = Object.values(operatorsStore.operators).filter((op: any) => {
      return (
        new RegExp(cleanQuery, 'i').test(op.name.replace(cleanRegex, '')) ||
        new RegExp(cleanQuery, 'i').test(op.endpoints?.mainextension[0]?.id)
      )
    })

    if (operatorsResults.length) {
      operatorsResults = cloneDeep(operatorsResults)

      operatorsResults.forEach((op: any) => {
        op.resultType = 'operator'
      })
    }
    operatorsResults.sort(sortByProperty('name'))
    return operatorsResults
  }

  const searchPhonebook = async (query: string, isQueryPhoneNumber: boolean) => {
    setPhonebookError('')

    try {
      const res = await getPhonebook(1, query, 'all', 'name')
      let phonebookResults = mapPhonebookResponse(res).rows
      let isNumberInPhonebook = false

      if (phonebookResults.length) {
        phonebookResults.forEach((contact: any) => {
          // set result type
          contact.resultType = 'contact'

          if (isQueryPhoneNumber) {
            // check if contact has the queried number
            const extensionNoSpaces = contact.extension?.replace(/\s/g, '')
            const workphoneNoSpaces = contact.workphone?.replace(/\s/g, '')
            const cellphoneNoSpaces = contact.cellphone?.replace(/\s/g, '')
            const queryNoSpaces = query.replace(/\s/g, '')

            if ([extensionNoSpaces, workphoneNoSpaces, cellphoneNoSpaces].includes(queryNoSpaces)) {
              isNumberInPhonebook = true
            }
          }
        })
      }

      if (isQueryPhoneNumber && !isNumberInPhonebook) {
        // suggest to add number to phonebook
        const addToPhonebookResult = { resultType: 'addToPhonebook', phoneNumber: query.trim() }
        phonebookResults.unshift(addToPhonebookResult)
      }
      return phonebookResults
    } catch (e) {
      console.error(e)
      setPhonebookError('Cannot retrieve phonebook contacts')
      return []
    }
  }

  const debouncedChangeQuery = useMemo(
    () =>
      debounce(async (event: any) => {
        const query = event.target.value
        setQuery(query)
        setResults([])
        store.dispatch.globalSearch.setOpen(false)
        store.dispatch.globalSearch.setFocused(true)
        const cleanRegex = /[^a-zA-Z0-9]/g
        const cleanQuery = query.replace(cleanRegex, '')

        if (cleanQuery.length == 0) {
          return
        }

        let results: any[] = []
        setLoaded(false)
        let isPhoneNumber = false

        // is it a phone number?
        if (/^\+?[0-9|\s]+$/.test(cleanQuery)) {
          // show "Call phone number" result
          isPhoneNumber = true
          const callPhoneNumberResult = { resultType: 'callPhoneNumber', phoneNumber: query.trim() }
          results.push(callPhoneNumberResult)
          store.dispatch.globalSearch.setOpen(true)
        }

        if (query.length > 2) {
          store.dispatch.globalSearch.setOpen(true)
          const operatorsResults = searchOperators(cleanQuery, cleanRegex)
          const phonebookResults = await searchPhonebook(query.trim(), isPhoneNumber)
          results = results.concat(operatorsResults, phonebookResults)
        }
        setResults(results)
        setLoaded(true)
      }, 400),
    [operatorsStore.operators],
  )

  // Stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedChangeQuery.cancel()
    }
  }, [debouncedChangeQuery])

  const resultSelected = (result: any) => {
    if (!result) {
      return
    }

    switch (result.resultType) {
      case 'callPhoneNumber':
        callPhoneNumber(result.phoneNumber)
        break
      case 'addToPhonebook':
        //// TODO
        break
      case 'operator':
        openShowOperatorDrawer(result)
        break
      case 'contact':
        openShowContactDrawer(result)
        break
      default:
        break
    }

    // close global search
    setTimeout(() => {
      store.dispatch.globalSearch.setOpen(false)
      store.dispatch.globalSearch.setFocused(false)
    }, 100)
  }

  return (
    <>
      {globalSearchStore.isFocused && (
        <>
          <div className='bg-gray-500 bg-opacity-75 dark:bg-gray-500 fixed left-0 md:left-28 top-16 right-0 bottom-0 opacity-100 transition-opacity'></div>
          <div className='fixed left-0 md:left-28 top-16 right-0 bottom-0 z-50 overflow-y-auto'></div>
        </>
      )}
      <div
        id='globalSearch'
        className={classNames(
          'absolute left-[53px] md:left-0 sm:w-[70%] md:w-[75%] 2xl:w-[50vw] transform divide-y divide-gray-200 overflow-hidden bg-white transition-all rounded-lg z-[60]',
          globalSearchStore.isFocused ? 'w-[calc(100vw - 52px)]' : 'w-[50%]',
        )}
      >
        <Combobox onChange={resultSelected} nullable>
          {({ open, activeOption }: any) => (
            <>
              <div className='relative flex items-center'>
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className='pointer-events-none absolute left-4 h-5 w-5 text-gray-400'
                  aria-hidden='true'
                />
                <Combobox.Input
                  className='h-[63px] w-full border-0 bg-transparent pl-12 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm'
                  placeholder='Search or compose...'
                  onChange={debouncedChangeQuery}
                />
              </div>

              <Transition
                show={open}
                enter='transition duration-100 ease-out'
                enterFrom='transform scale-95 opacity-0'
                enterTo='transform scale-100 opacity-100'
                leave='transition duration-75 ease-out'
                leaveFrom='transform scale-100 opacity-100'
                leaveTo='transform scale-95 opacity-0'
              >
                {globalSearchStore.isOpen && (
                  <Combobox.Options
                    as='div'
                    static
                    hold
                    className='flex divide-x border divide-gray-100'
                  >
                    <div
                      className={classNames(
                        'max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4',
                      )}
                    >
                      <div className='-mx-2 text-sm text-gray-700'>
                        {/* phonebook error */}
                        {phonebookError && (
                          <InlineNotification
                            type='error'
                            title={phonebookError}
                            className='mb-4'
                          ></InlineNotification>
                        )}
                        {/* skeleton */}
                        {!isLoaded &&
                          Array.from(Array(4)).map((e, index) => (
                            <Combobox.Option
                              as='div'
                              key={index}
                              value={index}
                              className={({ active }) =>
                                classNames(
                                  'flex cursor-default select-none items-center rounded-md p-2 h-14',
                                )
                              }
                            >
                              <div className='animate-pulse rounded-full h-8 w-8 bg-gray-300 dark:bg-gray-600'></div>
                              <div className='ml-2 animate-pulse h-3 rounded w-[40%] bg-gray-300 dark:bg-gray-600'></div>
                            </Combobox.Option>
                          ))}
                        {/* no search results */}
                        {isLoaded && !results.length && query.length > 2 && (
                          <Combobox.Option
                            as='div'
                            value={'no-results'}
                            className={({ active }) =>
                              classNames(
                                'flex justify-center cursor-default select-none items-center rounded-md p-2',
                              )
                            }
                          >
                            <EmptyState
                              title='No results'
                              description='Try changing your search query'
                              icon={
                                <FontAwesomeIcon
                                  icon={faSearch}
                                  className='mx-auto h-14 w-14'
                                  aria-hidden='true'
                                />
                              }
                            />
                          </Combobox.Option>
                        )}
                        {/* results */}
                        {isLoaded &&
                          !!results.length &&
                          results.map((result: any, index: number) => (
                            <Combobox.Option
                              as='div'
                              key={'result-' + index}
                              value={result}
                              className={({ active }) =>
                                classNames(
                                  'flex select-none items-center rounded-md p-2 h-14 cursor-pointer',
                                  active && 'bg-gray-100 text-gray-900',
                                )
                              }
                            >
                              {({ active }) => (
                                <>
                                  {/* call phone number */}
                                  {result.resultType === 'callPhoneNumber' && (
                                    <>
                                      <div className='w-8 text-center'>
                                        <FontAwesomeIcon
                                          icon={faPhone}
                                          className='h-4 w-4 text-gray-500 dark:text-gray-500'
                                        />
                                      </div>
                                      <span className='ml-2 flex-auto truncate'>
                                        Call {result.phoneNumber}
                                      </span>
                                    </>
                                  )}
                                  {/* add to phonebook */}
                                  {result.resultType === 'addToPhonebook' && (
                                    <>
                                      <div className='w-8 text-center'>
                                        <FontAwesomeIcon
                                          icon={faUserPlus}
                                          className='h-4 w-4 text-gray-500 dark:text-gray-500'
                                        />
                                      </div>
                                      <span className='ml-2 flex-auto truncate'>
                                        Add {result.phoneNumber} to phonebook
                                      </span>
                                    </>
                                  )}
                                  {/* operator */}
                                  {result.resultType === 'operator' && (
                                    <>
                                      <Avatar
                                        rounded='full'
                                        src={result.avatarBase64}
                                        placeholderType='person'
                                        size='base'
                                        status={result.mainPresence}
                                      />
                                      <span className='ml-2 flex-auto truncate'>{result.name}</span>
                                    </>
                                  )}
                                  {/* phonebook contact */}
                                  {result.resultType === 'contact' && (
                                    <>
                                      <Avatar placeholderType={result.kind} size='base' />
                                      <span className='ml-2 flex-auto truncate'>
                                        {result.displayName}
                                      </span>
                                    </>
                                  )}
                                  {active && (
                                    <FontAwesomeIcon
                                      icon={faChevronRight}
                                      className='mr-2 h-3 w-3 flex-none text-gray-400'
                                      aria-hidden='true'
                                    />
                                  )}
                                </>
                              )}
                            </Combobox.Option>
                          ))}
                      </div>
                    </div>
                    {/* right frame */}
                    {isLoaded &&
                      activeOption &&
                      activeOption.resultType &&
                      ['operator', 'contact'].includes(activeOption.resultType) && (
                        <div className='hidden h-96 w-1/2 flex-none flex-col overflow-y-auto lg:flex p-5'>
                          {/* operator */}
                          {activeOption.resultType === 'operator' && (
                            <OperatorSummary operator={activeOption} isShownFavorite={false} />
                          )}
                          {/* phonebook contact */}
                          {activeOption.resultType === 'contact' && (
                            <ContactSummary contact={activeOption} isShownContactMenu={false} />
                          )}
                        </div>
                      )}
                  </Combobox.Options>
                )}
              </Transition>
            </>
          )}
        </Combobox>
      </div>
    </>
  )
}
