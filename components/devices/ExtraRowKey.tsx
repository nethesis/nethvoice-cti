import { FC, Fragment, useState } from 'react'
import { t } from 'i18next'
import {  Listbox, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'

import { DeviceSectionOperatorSearch } from './DeviceSectionOperatorSearch'

interface ExtraRowKeyProps {
  typeSelected?: string
}

export const ExtraRowKey: FC<ExtraRowKeyProps> = ({}) => {


  const [keysTypeSelected, setKeysTypeSelected] = useState<any>(null)

  const handleTypeChange = (event: any) => {
    const selectedType = event
    setKeysTypeSelected(selectedType)
  }

  const typesList = [
    { value: 'blf', label: `${t('Devices.Busy lamp field (BLF)')}` },
    { value: 'line', label: `${t('Devices.Line')}` },
    { value: 'dnd', label: `${t('Devices.Do not disturb (DND)')}` },
    { value: 'speedCall', label: `${t('Devices.Speed call')}` },
    { value: 'toggleQueue', label: `${t('Devices.Toggle login/logout queue')}` },
  ]

  return (
    <>
      <div className='mb-6'>
        <div className='mb-6'>
          <Listbox value={keysTypeSelected || ''} onChange={handleTypeChange}>
            {({ open }) => (
              <>
                <div className='relative mt-2'>
                  <Listbox.Button className='relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 sm:text-sm sm:leading-6'>
                    <span className='block truncate'>
                      {keysTypeSelected
                        ? typesList.find((type) => type.value === keysTypeSelected)?.label
                        : t('Devices.Choose type')}
                    </span>
                    <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className='h-4 w-4 mr-1 text-primary dark:text-primaryDark cursor-pointer'
                      />
                    </span>
                  </Listbox.Button>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave='transition ease-in duration-100'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                  >
                    <Listbox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                      {typesList.map((type) => (
                        <Listbox.Option
                          key={type.value}
                          className={({ active }) =>
                            classNames(
                              active
                                ? 'bg-emerald-600 text-white'
                                : 'text-gray-900 dark:text-gray-200',
                              'relative cursor-default select-none py-2 pl-3 pr-9',
                            )
                          }
                          value={type.value}
                        >
                          {({ selected, active }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? 'font-semibold' : 'font-normal',
                                  'block truncate',
                                )}
                              >
                                {type.label}
                              </span>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? 'text-white' : 'text-emerald-600',
                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                  )}
                                >
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className='h-4 w-4 text-primary dark:text-primaryDark cursor-pointer'
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </>
            )}
          </Listbox>
        </div>
      </div>

      {(keysTypeSelected === 'blf' || keysTypeSelected === 'speedCall') && (
        <>
          <div className='mb-2'>
            <span> {t('Devices.Name or number')}</span>
          </div>
          <DeviceSectionOperatorSearch
            typeSelected={keysTypeSelected}
          ></DeviceSectionOperatorSearch>
        </>
      )}
    </>
  )
}
