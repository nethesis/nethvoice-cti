import { FC, useEffect, useMemo, useState } from 'react'
import { t } from 'i18next'
import { Combobox, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faMagnifyingGlass,
  faPhone,
  faSearch,
} from '@fortawesome/free-solid-svg-icons'
import { cloneDeep, debounce } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import classNames from 'classnames'
import { EmptyState } from '../common'
import { sortByProperty } from '../../lib/utils'
import { getPhonebook, mapPhonebookResponse } from '../../lib/phonebook'

interface DeviceSectionOperatorSearchProps {
  typeSelected: string
}

export const DeviceSectionOperatorSearch: FC<DeviceSectionOperatorSearchProps> = ({
  typeSelected,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults]: any[] = useState([])
  const [isLoaded, setLoaded]: any[] = useState(true)

  const operators: any = useSelector((state: RootState) => state.operators)

  const [selectedInformationUser, setSelectedInformationUser] = useState<any>(null)
  const resultSelected = (result: any) => {
    console.log('this is result', result)
    setSelectedInformationUser(result?.name)
    // To DO - handle result selection
  }

  const [phonebookError, setPhonebookError] = useState('')

  const searchPhonebook = async (query: string, isQueryPhoneNumber: boolean) => {
    setPhonebookError('')

    try {
      //remove space and slash characters
      let noSlashCharactersQuery = query.replace(/\//g, '')
      const res = await getPhonebook(1, noSlashCharactersQuery, 'all', 'name')

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

      return phonebookResults
    } catch (e) {
      console.error(e)
      setPhonebookError('Cannot retrieve phonebook contacts')
      return []
    }
  }

  const searchOperators = (cleanQuery: string, cleanRegex: RegExp) => {
    let operatorsResults = Object.values(operators.operators).filter((op: any) => {
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

  const debouncedChangeQuery = useMemo(
    () =>
      debounce(async (event: any) => {
        const query = event.target.value
        setQuery(query)
        setResults([])
        const cleanRegex = /[^a-zA-Z0-9]/g
        const cleanQuery = query.replace(cleanRegex, '')

        if (cleanQuery.length == 0) {
          return
        }

        let results: any[] = []
        setLoaded(false)
        let isPhoneNumber = false

        if (typeSelected === 'speedCall') {
          // is it a phone number?
          if (/^\+?[0-9|\s]+$/.test(cleanQuery)) {
            // show "Call phone number" result
            isPhoneNumber = true
            const callPhoneNumberResult = {
              resultType: 'callPhoneNumber',
              phoneNumber: query.trim(),
            }
            results.push(callPhoneNumberResult)
          }

          const operatorsResults = searchOperators(cleanQuery, cleanRegex)
          const phonebookResults = await searchPhonebook(query.trim(), isPhoneNumber)
          results = results.concat(operatorsResults, phonebookResults)
        } else {
          const operatorsResults = searchOperators(cleanQuery, cleanRegex)
          results = results.concat(operatorsResults)
        }

        setResults(results)
        setLoaded(true)
      }, 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operators?.operators],
  )

  // Stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedChangeQuery.cancel()
    }
  }, [debouncedChangeQuery])

  const [showUserList, setShowUserList] = useState(false)

  return (
    <Combobox as='div' onChange={resultSelected} value={selectedInformationUser}>
      {({ open }: any) => (
        <>
          <div className='relative flex items-center border-gray-300 mb-4'>
            <Combobox.Input
              className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
              placeholder={`${t('Devices.Type to search')}`}
              onChange={debouncedChangeQuery}
            />
          </div>
          <Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
            <FontAwesomeIcon
              icon={faChevronDown}
              className='h-4 w-4 flex items-center tooltip-configure-key-position-information'
              aria-hidden='true'
            />
          </Combobox.Button>

          <Transition
            show={open}
            enter='transition duration-100 ease-out'
            enterFrom='transform scale-95 opacity-0'
            enterTo='transform scale-100 opacity-100'
            leave='transition duration-75 ease-out'
            leaveFrom='transform scale-100 opacity-100'
            leaveTo='transform scale-95 opacity-0'
          >
            {query?.length > 0 && (
              <>
                <Combobox.Options
                  as='div'
                  static
                  hold
                  className='mt-[-0.7rem] max-h-60 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'
                >
                  <div
                    className={classNames(
                      'max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25',
                    )}
                  >
                    <div className='-mx-2 text-sm text-gray-700 dark:text-gray-200'>
                      {/* skeleton */}
                      {!isLoaded &&
                        Array.from(Array(4)).map((e, index) => (
                          <Combobox.Option
                            as='div'
                            key={index}
                            value={index}
                            className={({ active: any }) =>
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
                      {isLoaded && !results.length && query?.length > 2 && (
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
                        !!results?.length &&
                        results.map((result: any, index: number) => (
                          <Combobox.Option
                            as='div'
                            key={'result-' + index}
                            value={result}
                            className={({ active }) =>
                              classNames(
                                'flex select-none items-center rounded-md p-2 h-14 cursor-pointer',
                                active &&
                                  'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
                              )
                            }
                          >
                            {({ active }) => (
                              <>
                                <div className='w-10 text-center'>
                                  <FontAwesomeIcon
                                    icon={faPhone}
                                    className='h-4 w-4 text-gray-500 dark:text-gray-400'
                                  />
                                </div>
                                <span className='ml-2 flex-auto truncate'>{result?.name}</span>
                              </>
                            )}
                          </Combobox.Option>
                        ))}
                    </div>
                  </div>
                </Combobox.Options>
              </>
            )}
          </Transition>
        </>
      )}
    </Combobox>
  )
}
