import { FC, useEffect, useMemo, useState } from 'react'
import { t } from 'i18next'
import { Combobox } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleUser, faHeadset } from '@fortawesome/free-solid-svg-icons'
import { cloneDeep, debounce } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import classNames from 'classnames'
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

  const [selectedInformationUser, setSelectedInformationUser] = useState<any>([])
  const [selectedNumber, setSelectedNumber] = useState<any>(null)

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

  const resultSelected = (result: any) => {
    const phoneProps = ['extension', 'cellphone', 'homephone', 'workphone']
    if (result?.name) {
      let selectedName = result?.name
      setSelectedInformationUser(selectedName)
    }

    if (result) {
      const operatorId =
        result?.resultType === 'operator' ? result?.endpoints?.mainextension[0]?.id : ''

      let selectNumber =
        operatorId || phoneProps.map((prop) => result[prop]).find((value) => value) || ''
      setSelectedNumber(selectNumber)
      if (selectNumber) {
        setSelectedInformationUser(selectNumber)
      }
    }

    // const fullInformation = `${selectedName}(${selectNumber.toString()})`

    // To DO - handle result selection
  }

  return (
    <Combobox as='div' value={selectedInformationUser} onChange={setSelectedInformationUser}>
      <div className='relative mt-2 mb-4'>
        <Combobox.Input
          className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
          onChange={debouncedChangeQuery}
          displayValue={(informationUser) => selectedInformationUser?.name}
        />

        {query?.length > 0 && (
          <Combobox.Options className='absolute z-10 mt-1 max-h-64 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm max-h-42 '>
            <div
              className={classNames(
                'max-h-64 min-w-0 flex-auto scroll-py-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25',
              )}
            >
              {results.map((result: any, index: number) => (
                <Combobox.Option
                  key={'result-' + index}
                  value={result}
                  className={({ active }) =>
                    classNames(
                      'flex select-none items-center rounded-md p-2 h-14 cursor-pointer',
                      active && 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100',
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <div className='w-10 text-center'>
                        <FontAwesomeIcon
                          icon={result?.resultType === 'operator' ? faHeadset : faCircleUser}
                          className='h-4 w-4 text-gray-500 dark:text-gray-400'
                        />
                      </div>
                      <span className='ml-2 flex-auto truncate'>{result?.name}</span>
                    </>
                  )}
                </Combobox.Option>
              ))}
            </div>
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
