// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentPropsWithRef, forwardRef, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleXmark,
  faXmark,
  faPlus,
  faChevronDown,
  faFileAudio,
  faRecordVinyl,
} from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useTranslation } from 'react-i18next'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { add, isEmpty } from 'lodash'
import { getPhysicalDeviceButtonConfiguration } from '../../lib/devices'

export interface ConfigureKeysSectionProps extends ComponentPropsWithRef<'div'> {
  deviceId: any
}

export const ConfigureKeysSection = forwardRef<HTMLButtonElement, ConfigureKeysSectionProps>(
  ({ deviceId, className, ...props }, ref) => {
    const { t } = useTranslation()
    const auth = useSelector((state: RootState) => state.authentication)
    const operators: any = useSelector((state: RootState) => state.operators)
    const profile = useSelector((state: RootState) => state.user)

    // Drag and drop section
    // Manage drag and drop

    function handleDragEnd(result: any) {
      // if (!result.destination) {
      //   return
      // }
      // // Get current customer cards list in the current order
      // const currentOrder = [...customerCardOrder]
      // // Reorder the order depending on drag and drop
      // const [removed] = currentOrder.splice(result.source.index, 1)
      // currentOrder.splice(result.destination.index, 0, removed)
      // // Save new order
      // setCustomerCardOrder(currentOrder)
    }

    const [macAddressDevice, setMacAddressDevice] = useState('')

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

    useEffect(() => {
      if (macAddressDevice !== '') {
        const getMacAddressInformation = async () => {
          try {
            setGetConfigurationInformationError('')
            const deviceConfigurationInformation = await getPhysicalDeviceButtonConfiguration(
              macAddressDevice,
            )
            setDeviceButtonConfigurationInformation(deviceConfigurationInformation)
            setDeviceButtonConfigurationInformationLoaded(true)
          } catch (error) {
            setGetConfigurationInformationError('Cannot retrieve configuration information')
          }
        }
        getMacAddressInformation()
      }
    }, [macAddressDevice])

    // let getMacFromExten = exten => {
    //     try {
    //       return $scope.allExtensions[exten].mac ? $scope.allExtensions[exten].mac.toUpperCase() : undefined;
    //     } catch (e) {
    //       console.error(e);
    //     }
    //   };

    return (
      <>
        <div className='pt-4'>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='customer-cards'>
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef}>
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </>
    )
  },
)

ConfigureKeysSection.displayName = 'ConfigureKeysSection'
