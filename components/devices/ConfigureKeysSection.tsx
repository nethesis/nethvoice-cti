// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  ComponentPropsWithRef,
  Fragment,
  MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faGripVertical,
  faCircleXmark,
  faChevronRight,
  faChevronLeft,
  faCircleInfo,
  faArrowRight,
  faChevronUp,
  faTrash,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useTranslation } from 'react-i18next'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { isEmpty } from 'lodash'
import { getPhoneModelData, getPhysicalDeviceButtonConfiguration } from '../../lib/devices'
import { Avatar, Button, Modal, TextInput } from '../common'
import { Tooltip } from 'react-tooltip'
import { closeSideDrawer } from '../../lib/utils'
import ComboboxNumber from '../common/ComboboxNumber'
import { DeviceSectionOperatorSearch } from './DeviceSectionOperatorSearch'
import { Listbox, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { ExtraRowKey } from './ExtraRowKey'

export interface ConfigureKeysSectionProps extends ComponentPropsWithRef<'div'> {
  deviceId: any
  modalAllOperatorsKeyStatus: Function
  viewModalAllKeys: boolean
}

export const ConfigureKeysSection = forwardRef<HTMLButtonElement, ConfigureKeysSectionProps>(
  ({ deviceId, modalAllOperatorsKeyStatus, viewModalAllKeys, className, ...props }, ref) => {
    const { t } = useTranslation()
    const auth = useSelector((state: RootState) => state.authentication)
    const operators: any = useSelector((state: RootState) => state.operators)
    const profile = useSelector((state: RootState) => state.user)

    // Drag and drop section
    // Manage drag and drop

    const [macAddressDevice, setMacAddressDevice] = useState('')

    /**
     * First step : get mac address from device id
     * Second step : get physical phone information from model name
     * Third step : set number of possible keys
     * Fourth step : create list of keys
     */

    // Call function if mac address is not been set
    useEffect(() => {
      if (macAddressDevice === '') {
        getMacAddressDeviceFromId()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [operators?.extensions])

    // Get mac address from device id
    const getMacAddressDeviceFromId = () => {
      if (!isEmpty(operators?.extensions) && deviceId) {
        const macAddress = operators?.extensions[deviceId]?.mac.toUpperCase()
        setMacAddressDevice(macAddress)
        findEndpointById(deviceId)
      }
    }

    const [currentLineNum, setCurrentLineNum] = useState<any>([])

    const findEndpointById = (id: string): void => {
      for (const endpoint of profile?.endpoints?.extension) {
        if (endpoint.id === id) {
          setCurrentLineNum(endpoint?.numLineKeys)
          break
        }
      }
    }

    const [deviceButtonConfigurationInformation, setDeviceButtonConfigurationInformation] =
      useState<any>([])

    const [
      deviceButtonConfigurationInformationLoaded,
      setDeviceButtonConfigurationInformationLoaded,
    ] = useState(false)

    const [getConfigurationInformationError, setGetConfigurationInformationError] = useState('')

    const [modelPhoneName, setModelPhoneName] = useState('')
    const [modelPhoneNameLoaded, setModelPhoneNameLoaded] = useState(false)
    const [modelPhoneNameError, setModelPhoneNameError] = useState('')
    const [usableKeys, setUsableKeys] = useState(0)

    useEffect(() => {
      if (macAddressDevice !== '') {
        const getMacAddressInformation = async () => {
          try {
            setDeviceButtonConfigurationInformationLoaded(false)
            setGetConfigurationInformationError('')
            const deviceConfigurationInformation = await getPhysicalDeviceButtonConfiguration(
              macAddressDevice,
            )
            setDeviceButtonConfigurationInformation(deviceConfigurationInformation)
            setDeviceButtonConfigurationInformationLoaded(true)
            if (!isEmpty(deviceConfigurationInformation)) {
              getModelInformation(deviceConfigurationInformation)
            }
          } catch (error) {
            setGetConfigurationInformationError('Cannot retrieve configuration information')
          }
        }
        getMacAddressInformation()
      }
    }, [macAddressDevice])

    // Get all physical phone information and set the number of usable keys
    const getModelInformation = async (phoneInformation: any) => {
      try {
        setModelPhoneNameError('')
        setModelPhoneNameLoaded(false)
        const physicalPhoneModelNameInformation = await getPhoneModelData(phoneInformation?.model)
        setModelPhoneName(physicalPhoneModelNameInformation)
        if (physicalPhoneModelNameInformation?.variables?.cap_linekey_count !== undefined) {
          setUsableKeys(physicalPhoneModelNameInformation?.variables?.cap_linekey_count)
        } else {
          // No usable phone keys
          setUsableKeys(0)
        }
        setModelPhoneNameLoaded(true)
      } catch (error) {
        setModelPhoneNameError('Cannot retrieve configuration information')
      }
    }

    const [buttonsStatusObject, setButtonsStatusObject] = useState<any>([])

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
          }
        } else {
          return
        }
      }
    }, [deviceButtonConfigurationInformation, usableKeys])

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [filteredButtons, setFilteredButtons] = useState([])

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

    const [isLeftButtonVisible, setLeftButtonVisible] = useState(false)
    const [isRightButtonVisible, setRightButtonVisible] = useState(true)

    // Pagination section
    const paginate = (pageNumber: any) => {
      setCurrentPage(pageNumber)
      setLeftButtonVisible(pageNumber > 1)

      setRightButtonVisible(pageNumber < Math.ceil(filteredButtons?.length / itemsPerPage))
    }

    // Input field section
    const [textFilter, setTextFilter] = useState('')

    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

    const clearTextFilter = () => {
      setTextFilter('')
      textFilterRef.current.focus()
    }

    function changeTextFilter(event: any) {
      const newTextFilter = event.target.value
      setTextFilter(newTextFilter)
    }

    // key input field section
    const [keyTextFilter, setKeyTextFilter] = useState('')

    const keyTextFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>

    const clearKeyTextFilter = () => {
      setKeyTextFilter('')
      keyTextFilterRef.current.focus()
    }

    function changeKeyTextFilter(event: any) {
      const newKeyTextFilter = event.target.value
      setKeyTextFilter(newKeyTextFilter)
    }

    useEffect(() => {
      setFilteredButtons(buttonsStatusObject)
    }, [buttonsStatusObject, textFilter])

    const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)

    const handleClickIcon = (clickedIndex: number) => {
      setSelectedRowIndex((prevIndex) => (prevIndex === clickedIndex ? null : clickedIndex))
    }

    const [keysTypeSelected, setKeysTypeSelected] = useState<any>(null)

    const typesList = [
      { value: 'blf', label: `${t('Devices.Busy lamp field (BLF)')}` },
      { value: 'line', label: `${t('Devices.Line')}` },
      { value: 'dnd', label: `${t('Devices.Do not disturb (DND)')}` },
      { value: 'speedCall', label: `${t('Devices.Speed call')}` },
      { value: 'toggleQueue', label: `${t('Devices.Toggle login/logout queue')}` },
    ]

    const handleTypeChange = (event: any) => {
      const selectedType = event
      setKeysTypeSelected(selectedType)
    }

    const updateExtraRowVisbilityStatus = (status: boolean) => {
      setIsExtraRowActive(status)
    }

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

      return currentFilteredItems.map((button: any, index: number) => (
        <Draggable key={button?.id} draggableId={button?.id?.toString()} index={index}>
          {(provided) => (
            <li
              ref={provided?.innerRef}
              {...provided?.draggableProps}
              {...provided?.dragHandleProps}
              className=''
            >
              <div
                className={`${
                  selectedRowIndex === index ? 'bg-gray-100' : ''
                } grid items-center py-4 px-2 grid-cols-[4rem,auto,1rem]`}
              >
                <div className='flex items-center'>
                  <FontAwesomeIcon
                    icon={faGripVertical}
                    className='h-4 w-4 text-primary dark:text-primaryDark mr-2'
                  />
                  <span>{button?.id} -</span>
                </div>

                <div className='flex items-center justify-start whitespace-nowrap'>
                  <span>
                    {button?.label !== '' ? button?.label : t('Devices.Not configurated')}
                  </span>
                  {button?.value !== '' && <span className='ml-1'>({button?.value})</span>}
                </div>
                <div className='flex items-end justify-end'>
                  <Button variant='ghost' onClick={() => handleClickIcon(index)}>
                    <FontAwesomeIcon
                      icon={selectedRowIndex === index ? faChevronUp : faChevronDown}
                      className='h-4 w-4 text-primary dark:text-primaryDark cursor-pointer'
                    />
                  </Button>
                </div>
              </div>

              {selectedRowIndex === index && (
                <div className='px-2'>
                  <div className='flex items-center mt-4'>
                    <span>{t('Devices.Key position')}</span>
                    <FontAwesomeIcon
                      icon={faCircleInfo}
                      className='h-4 w-4 pl-2 text-primary dark:text-primaryDark flex items-center tooltip-configure-key-position-information'
                      aria-hidden='true'
                    />
                    {/* Pin information tooltip */}
                    <Tooltip
                      anchorSelect='.tooltip-configure-key-position-information'
                      place='right'
                    >
                      {t('Devices.Pin information tooltip') || ''}
                    </Tooltip>
                  </div>
                  <ComboboxNumber
                    maxNumber={usableKeys}
                    onSelect={() => {}}
                    defaultValue={selectedRowIndex + 1}
                  />
                  <div className='mb-2 mt-4'>
                    <span> {t('Devices.Type')}</span>
                  </div>
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

                  {/* Insert name or number only if type equal to blf or speedCall */}
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

                  {/* Delete key button */}
                  <div className='flex items-center mb-6'>
                    <Button variant='ghost'>
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

    const [visibleFilter, setVisibleFilter] = useState(false)

    useEffect(() => {
      const updatedFilteredButtons = buttonsStatusObject?.filter((button: any) => {
        const buttonLabel = `${button?.id} - ${button?.label} (${button?.value})`.toLowerCase()
        const filterText = textFilter.toLowerCase()
        return buttonLabel.includes(filterText)
      })

      if (updatedFilteredButtons.length < 11) {
        setVisibleFilter(false)
      } else {
        setVisibleFilter(true)
      }
    }, [buttonsStatusObject, textFilter])

    const cancelSetKeysToAllButtonRef = useRef() as MutableRefObject<HTMLButtonElement>

    // Set key to all operators function
    const handleAssignAllKeys = async () => {}

    // Modal with example of first two operators of operators list
    const renderDynamicRows = () => {
      return Object.keys(operators?.extensions)
        .slice(0, 2)
        .map((key, index) => {
          const exampleOperator = operators?.extensions[key]

          return (
            <div
              key={key}
              className='grid grid-cols-[8rem,2rem,3rem] whitespace-nowrap w-full items-center py-2'
            >
              {/* Operator avatar and name */}
              <div className='flex space-x-2 items-center truncate'>
                <Avatar
                  size='base'
                  placeholderType='person'
                  src={operators?.avatars[exampleOperator?.username]}
                  status={operators?.operators[exampleOperator?.username]?.mainPresence}
                />
                <div className='max-w-sm truncate'>
                  <span>{`${exampleOperator?.name}`}</span>
                </div>
              </div>

              {/* Arrow icon*/}
              <div className='mx-2'>
                <FontAwesomeIcon icon={faArrowRight} className='h-4 w-4' />
              </div>

              {/* Operator icon, name, and number */}
              <div className='flex items-center ml-2'>
                <FontAwesomeIcon
                  icon={faGripVertical}
                  className='h-4 w-4 text-primary dark:text-primaryDark mr-2'
                />

                {/* operator name */}
                <span className='ml-2 mr-2'>{index + 1} -</span>

                {/* extension */}
                <div className=''>
                  <span>{`${exampleOperator?.name}`}</span>
                </div>

                <span className='ml-1'>({`${exampleOperator?.exten || '-'}`})</span>
              </div>
              {/* Divider */}
              {/* <div className='relative flex col-span-3 mt-2 w-full'>
                <div className='absolute inset-x-0 bottom-0 flex items-center' aria-hidden='true'>
                  <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                </div>
              </div> */}
            </div>
          )
        })
    }

    //Extra row status used to add or change id for keys
    const [isExtraRowActive, setIsExtraRowActive] = useState(false)

    const activateDeactivateExtraRow = () => {
      setIsExtraRowActive(!isExtraRowActive)
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
        <div className='pt-2'>
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

          {/* Button for add new row */}
          {isExtraRowActive && (
            <ExtraRowKey
              usableKeys={usableKeys}
              updateExtraRowVisbility={updateExtraRowVisbilityStatus}
            ></ExtraRowKey>
          )}
        </div>

        <div className='flex justify-between pt-4'>
          {!isExtraRowActive && (
            <div className='flex justify-start'>
              <Button variant='white' onClick={() => activateDeactivateExtraRow()}>
                <span className='text-primary dark:text-primaryDark leading-5 text-sm font-medium'>
                  {t('Devices.Add key')}
                </span>
              </Button>
            </div>
          )}

          <div className='flex justify-end space-x-2'>
            <Button
              variant='white'
              onClick={() => paginate(currentPage - 1)}
              disabled={!isLeftButtonVisible}
              className={!isLeftButtonVisible ? 'invisible' : ''}
            >
              <FontAwesomeIcon icon={faChevronLeft} className='h-4 w-4' />
            </Button>
            <Button
              variant='white'
              onClick={() => paginate(currentPage + 1)}
              disabled={!isRightButtonVisible}
              className={!isRightButtonVisible || !visibleFilter ? 'invisible' : ''}
            >
              <FontAwesomeIcon icon={faChevronRight} className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Divider  */}
        <div className='relative flex col-span-3 my-6 w-full'>
          <div className='absolute inset-x-0 bottom-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>

        <div className='flex justify-end'>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='mb-4'>
            <span className='text-primary dark:text-primaryDark leading-5 text-sm font-medium'>
              {t('Common.Cancel')}
            </span>
          </Button>
          <Button variant='primary' type='submit' className='mb-4 ml-4'>
            <span className='leading-5 text-sm font-medium'>{t('Common.Edit')}</span>
          </Button>
        </div>

        {/* Set key to all operators modal */}
        <Modal
          show={viewModalAllKeys}
          focus={cancelSetKeysToAllButtonRef}
          onClose={() => modalAllOperatorsKeyStatus(false)}
        >
          <Modal.Content>
            <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 bg-blue-100 dark:bg-blue-900'>
              <FontAwesomeIcon
                icon={faCircleInfo}
                className='h-5 w-5 text-blue-700 dark:text-blue-200'
                aria-hidden='true'
              />
            </div>
            <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
                {t('Devices.Assign keys for all operators')}
              </h3>
              <div className='mt-3 mb-4'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {t('Devices.Assign key for all operators modal message')}.
                </p>
              </div>
              <span className='font-normal text-sm leading-5 text-gray-700 dark:text-gray-200'>
                {t('Common.Example')}
              </span>
              <div className='mt-2'>{renderDynamicRows()}</div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button variant='primary' onClick={() => handleAssignAllKeys()}>
              {t('Devices.Assign keys')}
            </Button>
            <Button
              variant='ghost'
              onClick={() => modalAllOperatorsKeyStatus(false)}
              ref={cancelSetKeysToAllButtonRef}
            >
              <span className='text-sm leading-5 font-mediun text-primary dark:text-primaryDark'>
                {t('Common.Cancel')}
              </span>
            </Button>
          </Modal.Actions>
        </Modal>
      </>
    )
  },
)

ConfigureKeysSection.displayName = 'ConfigureKeysSection'
