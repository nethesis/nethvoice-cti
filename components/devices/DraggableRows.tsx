// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faChevronDown,
  faChevronUp,
  faCircleInfo,
  faCircleXmark,
  faGripVertical,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { DeviceSectionOperatorSearch } from './DeviceSectionOperatorSearch'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { KeyTypeSelect } from './KeyTypeSelect'
import { Tooltip } from 'react-tooltip'
import { isEmpty, isEqual } from 'lodash'
import { Button, InlineNotification, TextInput } from '../common'
import { Combobox } from '@headlessui/react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface DraggableRowsProps {
  deviceButtonConfigurationInformation: any
  usableKeys: number
  currentPage: number
  itemsPerPage: number
  onSelectFilteredButtons: (filteredButtons: any) => void
  onVisibilityPagination: (visibility: any) => void
  newButtonData: any
  isSetKeysToAllOperatorsClicked: any
  onResetKeysToOperatorsClicked: () => void
  onChangeKeysObject: (numberEdited: any) => void
  onChangeFinalkeysObject: (finalKeysObject: any) => void
}

export default function DraggableRows({
  deviceButtonConfigurationInformation,
  usableKeys,
  currentPage,
  itemsPerPage,
  onSelectFilteredButtons,
  onVisibilityPagination,
  newButtonData,
  isSetKeysToAllOperatorsClicked,
  onResetKeysToOperatorsClicked,
  onChangeKeysObject,
  onChangeFinalkeysObject,
}: DraggableRowsProps) {
  const [buttonsStatusObject, setButtonsStatusObject] = useState<any>([])

  const [filteredButtons, setFilteredButtons] = useState([])
  const [originalButtonsStatus, setOriginalButtonsStatus]: any = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [missingInputError, setMissingInputError] = useState<boolean>(false)
  const [indexError, setIndexError] = useState<boolean>(false)
  const [keysTypeSelected, setKeysTypeSelected] = useState<any>(null)

  const updateSelectedTypeKey = (newTypeKey: string) => {
    setKeysTypeSelected(newTypeKey)
  }

  const [isContactSelected, setIsContactSelected] = useState<boolean>(false)

  const updatePhonebookContactInformation = (statusModal: boolean) => {
    setIsContactSelected(statusModal)
  }

  const [selectedUserNameInformation, setSelectedUserNameInformation] = useState<any>(null)
  const updateSelectedUserName = (newUserNameInformation: string) => {
    setSelectedUserNumber(newUserNameInformation)
  }

  //check if user select a type from combobox
  useEffect(() => {
    if (keysTypeSelected !== null && keysTypeSelected !== '') {
      setMissingInputError(false)
    }
  }, [keysTypeSelected])

  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const operators: any = useSelector((state: RootState) => state.operators)

  const clearTextFilter = () => {
    setTextFilter('')
    textFilterRef.current.focus()
  }

  function changeTextFilter(event: any) {
    const newTextFilter = event.target.value
    setTextFilter(newTextFilter)
  }

  useEffect(() => {
    if (!isEmpty(deviceButtonConfigurationInformation)) {
      // Extract information on keys
      if (usableKeys) {
        const buttonsStatus = []
        for (let i = 1; i <= usableKeys; i++) {
          const typeKey = `linekey_type_${i}`
          const valueKey = `linekey_value_${i}`
          const labelKey = `linekey_label_${i}`

          // Check if the keys exist in the object
          const typeValue = deviceButtonConfigurationInformation?.variables[typeKey] ?? ''
          const valueValue = deviceButtonConfigurationInformation?.variables[valueKey] ?? ''
          const labelValue = deviceButtonConfigurationInformation?.variables[labelKey] ?? ''

          const buttonInfo = {
            id: i,
            type: typeValue,
            value: valueValue,
            label: labelValue,
          }

          buttonsStatus.push(buttonInfo)
        }

        if (!isEmpty(buttonsStatus)) {
          setButtonsStatusObject(buttonsStatus)
          setOriginalButtonsStatus(buttonsStatus)
        }
      } else {
        return
      }
    }
  }, [deviceButtonConfigurationInformation, usableKeys])

  // Insert new key information from operators store
  useEffect(() => {
    if (isSetKeysToAllOperatorsClicked) {
      const updatedButtons: any = [...buttonsStatusObject]
      const blfRowsToAdd: any[] = []

      Object.keys(operators?.extensions || {}).forEach((exten, index) => {
        // Check max number of keys
        if (index < usableKeys) {
          const operator: any = operators?.extensions[exten]

          // New row information
          const newButton: any = {
            id: index + 1,
            type: 'blf',
            label: `${operator?.name}`,
            value: exten,
          }

          blfRowsToAdd.push(newButton)
        }
      })

      updatedButtons.splice(0, blfRowsToAdd.length, ...blfRowsToAdd)

      const updatedButtonsWithIndices = updatedButtons.map((button: any, index: number) => ({
        ...button,
        id: index + 1,
      }))

      setFilteredButtons(updatedButtonsWithIndices)
      setButtonsStatusObject(updatedButtonsWithIndices)

      // Set modal to false
      onResetKeysToOperatorsClicked()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSetKeysToAllOperatorsClicked, operators?.extensions])

  // Input field section
  const [textFilter, setTextFilter] = useState('')

  const [visibleFilter, setVisibleFilter] = useState(false)

  useEffect(() => {
    const updatedFilteredButtons = buttonsStatusObject?.filter((button: any) => {
      const buttonLabel = `${button?.id} - ${button?.label} (${button?.value})`.toLowerCase()
      const filterText = textFilter.toLowerCase()
      return buttonLabel.includes(filterText)
    })

    if (updatedFilteredButtons?.length < 11) {
      setVisibleFilter(false)
      onVisibilityPagination(false)
    } else {
      setVisibleFilter(true)
      onVisibilityPagination(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonsStatusObject, textFilter])

  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)

  const updateSelectedRowIndex = (newIndex: number) => {
    setSelectedRowIndex(newIndex)
  }

  const [editedRowIndex, setEditedRowIndex] = useState<number | null>(null)

  const [isUserEditingIndex, setIsUserEditingIndex] = useState(false)

  const resetInput = () => {
    setSelectedUserNumber(null)
    setKeysTypeSelected(null)
    setEditedRowIndex(null)
    setIsUserEditingIndex(false)
  }

  const [numberOfKeysEdited, setNumberOfkeysEdited] = useState<number>(0)

  const confirmEditRow = (rowData: any) => {
    if (editedRowIndex !== null && keysTypeSelected !== null) {
      const targetIndex = editedRowIndex - 1

      if (targetIndex >= 0 && targetIndex < filteredButtons.length) {
        const updatedButtons: any = [...filteredButtons]

        // Save selected row data before swapping
        const selectedRow: any = { ...updatedButtons[targetIndex] }
        let typeSelectedLabelValue = ''
        switch (keysTypeSelected) {
          case 'blf':
            typeSelectedLabelValue = operators?.extensions[selectedUserInformation]?.name || '-'
            break
          case 'speedCall':
            typeSelectedLabelValue = !isContactSelected
              ? operators?.extensions[selectedUserInformation]?.name || '-'
              : selectedUserInformation !== ''
              ? selectedUserInformation
              : '-'
            break
          case 'line':
            typeSelectedLabelValue = t('Devices.Line')
            break
          case 'dnd':
            typeSelectedLabelValue = t('Devices.Do not disturb (DND)')
            break
          case 'toggleQueue':
            typeSelectedLabelValue = t('Devices.Toggle login/logout queue')
            break
          default:
            break
        }

        // Update the row with new data
        updatedButtons[targetIndex] = {
          ...selectedRow,
          type: keysTypeSelected,
          value: selectedUserInformation,
          label: typeSelectedLabelValue || '-',
        }

        // Update status with new data
        setFilteredButtons(updatedButtons)
        setButtonsStatusObject(updatedButtons)

        setIsEditing(true)
        setMissingInputError(false)
        resetInput()
        const changes = getChanges(originalButtonsStatus, updatedButtons)
        if (changes?.length > 0) {
          setNumberOfkeysEdited(changes?.length)
          onChangeKeysObject(changes?.length)
        }
      }
    } else {
      setMissingInputError(true)
    }
  }

  const getChanges = (original: any[], updated: any[]) => {
    const changes = []

    for (let i = 0; i < original?.length; i++) {
      if (!isEqual(original[i], updated[i])) {
        changes.push({
          original: original[i],
          updated: updated[i],
        })
      }
    }

    return changes
  }

  const deleteRow = (rowData: any) => {
    const targetIndex = rowData.id - 1

    const updatedButtons: any = [...filteredButtons]

    // Remove row data
    updatedButtons.splice(targetIndex, 1)

    // Update index after delete
    for (let i = targetIndex; i < updatedButtons.length; i++) {
      updatedButtons[i] = {
        ...updatedButtons[i],
        id: i + 1,
      }
    }

    // Update status
    setFilteredButtons(updatedButtons)
    setButtonsStatusObject(updatedButtons)
    setIsEditing(true)
  }

  useEffect(() => {
    if (newButtonData) {
      // Find the index of the row to update with same id
      const existingRowIndex = buttonsStatusObject.findIndex(
        (button: any) => button?.id === newButtonData?.id,
      )

      if (existingRowIndex !== -1) {
        //
        const updatedButtons = [...buttonsStatusObject]
        updatedButtons[existingRowIndex] = newButtonData
        setButtonsStatusObject(updatedButtons)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newButtonData])

  const [selectedUserInformation, setSelectedUserNumber] = useState<any>(null)

  const updateSelectedUserInformation = (newUserInformation: string) => {
    setSelectedUserNumber(newUserInformation)
  }

  const handleClickIcon = (clickedIndex: number) => {
    setSelectedRowIndex((prevIndex) => (prevIndex === clickedIndex ? null : clickedIndex))
    setIsEditing(false)
  }

  const [query, setQuery] = useState('')
  // const [selectedNumber, setSelectedNumber] = useState<number | null>(null)

  const numbers = Array.from({ length: usableKeys }, (_, index) => index + 1)

  const filteredNumbers =
    query === ''
      ? numbers
      : numbers.filter((number) => {
          return number.toString().toLowerCase().includes(query.toLowerCase())
        })

  const selectNewRowIndex = (value: any) => {
    setEditedRowIndex(value as number)
  }

  useEffect(() => {
    if (selectedRowIndex !== null) {
      setEditedRowIndex(selectedRowIndex + 1)
    }
  }, [selectedRowIndex])

  // Dynamic row list of physical phone keys
  const renderButtons = () => {
    const filteredButtons = buttonsStatusObject?.filter((button: any) => {
      const buttonLabel = `${button?.id} - ${button?.label} (${button?.value})`.toLowerCase()
      const filterText = textFilter.toLowerCase()
      return buttonLabel.includes(filterText)
    })

    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentFilteredItems = filteredButtons.slice(indexOfFirstItem, indexOfLastItem)

    return currentFilteredItems.map((buttonRow: any, index: number) => (
      <Draggable key={buttonRow?.id} draggableId={buttonRow?.id?.toString()} index={index}>
        {(provided) => (
          <li
            ref={provided?.innerRef}
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            className=''
          >
            <div
              className={`${
                selectedRowIndex === index && !isEditing ? 'bg-gray-100' : ''
              } grid items-center py-4 px-2 grid-cols-[4rem,auto,1rem]`}
            >
              <div className='flex items-center'>
                <FontAwesomeIcon
                  icon={faGripVertical}
                  className='h-4 w-4 text-primary dark:text-primaryDark mr-2'
                />
                <span>{buttonRow?.id} -</span>
              </div>

              <div className='flex items-center justify-start whitespace-nowrap'>
                <span>
                  {buttonRow?.label !== '' ? buttonRow?.label : t('Devices.Not configurated')}
                </span>
                {buttonRow?.type !== 'dnd' &&
                  buttonRow?.type !== 'line' &&
                  buttonRow?.value !== '' && <span className='ml-1'>({buttonRow?.value})</span>}
              </div>
              <div className='flex items-end justify-end'>
                <Button variant='ghost' onClick={() => handleClickIcon(index)}>
                  <FontAwesomeIcon
                    icon={selectedRowIndex === index && !isEditing ? faChevronUp : faChevronDown}
                    className='h-4 w-4 cursor-pointer'
                  />
                </Button>
              </div>
            </div>

            {selectedRowIndex === index && !isEditing && (
              <div className='px-2'>
                <div className='flex items-center mt-4'>
                  <span>{t('Devices.Key position')}</span>
                  <FontAwesomeIcon
                    icon={faCircleInfo}
                    className='h-4 w-4 pl-2 text-primary dark:text-primaryDark flex items-center tooltip-configure-key-position-information'
                    aria-hidden='true'
                  />
                  {/* Pin information tooltip */}
                  <Tooltip anchorSelect='.tooltip-configure-key-position-information' place='right'>
                    {t('Devices.Pin information tooltip') || ''}
                  </Tooltip>
                </div>

                {/* Choose new index for selected key */}
                <Combobox
                  as='div'
                  value={editedRowIndex}
                  onChange={(value: any) => {
                    selectNewRowIndex(value)
                  }}
                  defaultValue={selectedRowIndex + 1}
                >
                  <div className='relative mt-2 mb-4'>
                    <Combobox.Input
                      className='w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6'
                      onChange={(event) => setQuery(event?.target?.value)}
                      displayValue={(number: any) => number?.toString()}
                      placeholder={`${t(
                        'Devices.Search physical phone draggable row index placeholder message',
                        {
                          usableKeys,
                        },
                      )}`}
                    />

                    {/* Choose a number from 1 to {usableKeys} */}
                    <Combobox.Button className='absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none'>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className='h-4 w-4 mr-1 flex items-center'
                        aria-hidden='true'
                      />
                    </Combobox.Button>

                    {filteredNumbers?.length > 0 && (
                      <Combobox.Options className='absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                        {filteredNumbers.map((number) => (
                          <Combobox.Option
                            key={number}
                            value={number}
                            className={({ active }) =>
                              classNames(
                                'relative cursor-default select-none py-2 pl-8 pr-4',
                                active
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-gray-900 dark:text-gray-200',
                              )
                            }
                          >
                            {({ active, selected }) => (
                              <>
                                <span
                                  className={`${selected ? 'block truncate font-semibold' : ''} `}
                                >
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

                {/* Choose new type for selected key */}
                <KeyTypeSelect
                  defaultSelectedType={buttonRow?.type}
                  updateSelectedTypeKey={updateSelectedTypeKey}
                  inputMissing={missingInputError}
                />

                {/* Insert name or number only if type equal to blf or speedCall */}
                {(buttonRow?.type === 'blf' ||
                  buttonRow?.type === 'speedCall' ||
                  keysTypeSelected === 'blf' ||
                  keysTypeSelected === 'speedCall') && (
                  <>
                    <div className='mb-2'>
                      <span>
                        {keysTypeSelected === 'blf'
                          ? t('Devices.Name or extension')
                          : t('Devices.Name or number')}
                      </span>
                    </div>
                    {/* Search user input */}
                    <DeviceSectionOperatorSearch
                      typeSelected={keysTypeSelected}
                      updateSelectedUserNumber={updateSelectedUserInformation}
                      defaultValue={buttonRow?.label}
                      updatePhonebookContactInformation={updatePhonebookContactInformation}
                      updateSelectedUserName={updateSelectedUserName}
                    ></DeviceSectionOperatorSearch>
                  </>
                )}
                <div className='flex items-center space-x-3'>
                  {/* Confirm button */}
                  <div className='flex items-center mb-6'>
                    <Button
                      variant='primary'
                      onClick={() => {
                        confirmEditRow(buttonRow)
                      }}
                    >
                      <span className='text-sm font-medium leading-5'>{t('Common.Confirm')}</span>
                    </Button>
                  </div>

                  {/* Delete key button */}
                  <div className='flex items-center mb-6'>
                    <Button
                      variant='ghost'
                      onClick={() => {
                        deleteRow(buttonRow)
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className='h-4 w-4 mr-3 text-primary dark:text-primaryDark flex items-center tooltip-configure-key-position-information'
                        aria-hidden='true'
                      ></FontAwesomeIcon>
                      <span className='text-primary dark:text-primaryDark text-sm font-medium leading-5'>
                        {t('Common.Delete')}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Divider */}
            <div className='relative col-span-3'>
              <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                <div className='w-full border-t border-gray-300 dark:border-gray-600' />
              </div>
            </div>
          </li>
        )}
      </Draggable>
    ))
  }

  useEffect(() => {
    setFilteredButtons(buttonsStatusObject)
    onChangeFinalkeysObject(buttonsStatusObject)
  }, [buttonsStatusObject, textFilter])

  useEffect(() => {
    onSelectFilteredButtons(filteredButtons)
  }, [filteredButtons, onSelectFilteredButtons])

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const updatedButtonsStatus = [...buttonsStatusObject]
    const [draggedButton] = updatedButtonsStatus.splice(result?.source?.index, 1)
    updatedButtonsStatus.splice(result?.destination?.index, 0, draggedButton)

    // Update index after drag
    const updatedButtonsWithIndices = updatedButtonsStatus.map((button, index) => ({
      ...button,
      id: index + 1,
    }))

    setButtonsStatusObject(updatedButtonsWithIndices)
  }

  return (
    <>
      <div className='flex items-center'>
        <TextInput
          placeholder={t('Devices.Search') || ''}
          className='max-w-xl py-4'
          value={textFilter}
          onChange={changeTextFilter}
          ref={textFilterRef}
          icon={textFilter?.length ? faCircleXmark : undefined}
          onIconClick={() => clearTextFilter()}
          trailingIcon={true}
        />
      </div>
      <div className='overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
        <div className='pt-2 max-h-[24rem]'>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='phoneKeysList'>
              {(provided) => (
                <ul {...provided?.droppableProps} ref={provided?.innerRef}>
                  {renderButtons()}
                  {provided?.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </>
  )
}
