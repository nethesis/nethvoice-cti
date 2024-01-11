// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  ComponentPropsWithRef,
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
  faTriangleExclamation,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useTranslation } from 'react-i18next'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { isEmpty } from 'lodash'
import { getPhoneModelData, getPhysicalDeviceButtonConfiguration } from '../../lib/devices'
import { Button, InlineNotification, Modal, TextInput } from '../common'
import { use } from 'i18next'

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
        const buttonsStatus = []
        for (let i = 1; i <= 65; i++) {
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
      }
    }, [deviceButtonConfigurationInformation])

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

    useEffect(() => {
      setFilteredButtons(buttonsStatusObject)
    }, [buttonsStatusObject, textFilter])

    const renderButtons = () => {
      const filteredButtons = buttonsStatusObject?.filter((button: any) => {
        const buttonLabel = `${button?.id} - ${button?.label} (${button?.value})`.toLowerCase()
        const filterText = textFilter.toLowerCase()
        return buttonLabel.includes(filterText)
      })

      const indexOfLastItem = currentPage * itemsPerPage
      const indexOfFirstItem = indexOfLastItem - itemsPerPage
      const currentFilteredItems = filteredButtons.slice(indexOfFirstItem, indexOfLastItem)

      return currentFilteredItems.map((button: any, index: any) => (
        <Draggable key={button?.id} draggableId={button?.id?.toString()} index={index}>
          {(provided) => (
            <li
              ref={provided?.innerRef}
              {...provided?.draggableProps}
              {...provided?.dragHandleProps}
              className='grid items-center py-2 grid-cols-[4rem,auto,1rem]'
            >
              <div className='flex items-center'>
                <FontAwesomeIcon
                  icon={faGripVertical}
                  className='h-4 w-4 text-primary dark:text-primaryDark mr-2'
                />
                <span>{button?.id} -</span>
              </div>

              <div className='flex items-center justify-start whitespace-nowrap'>
                <span>{button?.label !== '' ? button?.label : t('Devices.Not configurated')}</span>
                {button?.value !== '' && <span className='ml-1'>({button?.value})</span>}
              </div>
              <div className='flex items-end justify-end'>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className='h-4 w-4 text-primary dark:text-primaryDark mr-2'
                />
              </div>

              {/* Divider */}
              <div className='relative col-span-3 mt-2'>
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
        </div>

        <div className='flex justify-between pt-4'>
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
