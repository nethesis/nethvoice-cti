import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { Combobox } from '@headlessui/react'
import { t } from 'i18next'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface ComboboxNumberProps {
  maxNumber: number
  onSelect: (selectedNumber: any) => void
  defaultValue?: number
}

export default function ComboboxNumber({ maxNumber, onSelect, defaultValue }: ComboboxNumberProps) {
  const [query, setQuery] = useState('')
  const [selectedNumber, setSelectedNumber] = useState<number | null>(defaultValue || null)

  useEffect(() => {
    if (defaultValue !== undefined) {
      onSelect(defaultValue)
    }
  }, [defaultValue, onSelect])

  const numbers = Array.from({ length: maxNumber }, (_, index) => index + 1)

  const filteredNumbers =
    query === ''
      ? numbers
      : numbers.filter((number) => {
          return number.toString().toLowerCase().includes(query.toLowerCase())
        })

  return (
    <Combobox
      as='div'
      value={selectedNumber}
      onChange={(value) => {
        setSelectedNumber(value as number)
        onSelect(value)
      }}
    >
      <div className='relative mt-2 mb-4'>
        <Combobox.Input
          className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(number: any) => number?.toString()}
          placeholder={`${t('Devices.Search physical phone index placeholder message', {
            maxNumber,
          })}`}
        />
        <Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
          <FontAwesomeIcon
            icon={faChevronDown}
            className='h-4 w-4 mr-1 flex items-center'
            aria-hidden='true'
          />
        </Combobox.Button>

        {filteredNumbers.length > 0 && (
          <Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
            {filteredNumbers.map((number) => (
              <Combobox.Option
                key={number}
                value={number}
                className={({ active }) =>
                  classNames(
                    'relative cursor-default select-none py-2 pl-8 pr-4',
                    active ? 'bg-emerald-600 text-white' : 'text-gray-900 dark:text-gray-200',
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <span className={`${selected ? 'block truncate font-semibold' : ''} `}>
                      {number}
                    </span>

                    {selected && (
                      <span
                        className={classNames(
                          'absolute inset-y-0 left-0 flex items-center pl-1.5',
                          active ? 'text-white' : 'text-emerald-600',
                        )}
                      >
                        <FontAwesomeIcon
                          icon={faCheck}
                          className='h-4 w-4 mr-3 text-primary dark:text-primaryDark flex items-center tooltip-configure-key-position-information'
                          aria-hidden='true'
                        />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
