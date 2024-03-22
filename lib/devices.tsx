// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'
import { getJSONItem, loadPreference } from './storage'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadset } from '@fortawesome/free-solid-svg-icons'

export const openShowEditPhysicalPhone = (phoneInformation: any, pinstatus: any) => {
  let phoneModel: any = {}
  phoneModel = {
    ...phoneInformation,
    pinStatus: pinstatus,
  }
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showEditPhysicalPhone',
    config: phoneModel,
  })
}

export const openShowSwitchAudioInput = (status: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showSwitchDeviceInputOutput',
    config: status,
  })
}

export const getInputOutputLocalStorageValue = (currentUsername: string) => {
  const audioInputType = getJSONItem('phone-island-audio-input-device') || ''

  const audioOutputType = getJSONItem('phone-island-audio-output-device') || ''

  return { audioInputType, audioOutputType }
}

// Set main device id
export async function setMainDevice(deviceIdInformation: any) {
  try {
    const { data, status } = await axios.post('/user/default_device', deviceIdInformation)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getPhysicalDeviceButtonConfiguration(macAddress: any) {
  try {
    const { data, status } = await axios.get('/tancredi/api/v1/phones/' + macAddress + '?inherit=1')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getPhoneModelData(model: any) {
  try {
    const { data, status } = await axios.get('/tancredi/api/v1/models/' + model)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Save the configuration of buttons of physical phone into the server.
 */
export async function saveBtnsConfig(macAddress: any, keyUpdatedObject: any) {
  try {
    const { data, status } = await axios.patch(
      '/tancredi/api/v1/phones/' + macAddress,
      keyUpdatedObject,
    )
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Save the configuration of buttons of physical phone into the server.
 */
export async function reloadPhysicalPhone(exten: any) {
  try {
    const { data, status } = await axios.post('/astproxy/phone_reload', { exten: exten })
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getDevicesPin() {
  try {
    const { data, status } = await axios.get('/astproxy/pinstatus')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function setPin(obj: any) {
  try {
    const { data, status } = await axios.post('/astproxy/pin', obj)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getDevicesPinStatusForDevice() {
  try {
    const { data, status } = await axios.get('/astproxy/pin')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const tableHeader = () => {
  return (
    <thead className='bg-gray-50 dark:bg-gray-800'>
      <tr className=''>
        <th
          scope='col'
          className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6 w-[15.5rem]'
        >
          {t('Devices.Device name')}
        </th>
        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
          <p className='ml-2'>{t('Devices.Status')}</p>
        </th>
        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold text-transparent '>
          {t('Devices.Main device')}
        </th>
        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold sr-only'>
          {t('Devices.Edit')}
        </th>

        <th scope='col' className='relative py-3.5 sm:pr-6'>
          <span className='sr-only'>{t('Devices.Set as main device')}</span>
        </th>
      </tr>
    </thead>
  )
}

export const titleTable = (deviceType: string) => {
  return (
    <div className='flex items-center space-x-2'>
      <FontAwesomeIcon
        icon={deviceType === 'webrtc' ? faHeadset : faHeadset}
        className='h-4 w-4 flex justify-center text-gray-700 dark:text-gray-500'
      />
      <span>{deviceType === 'webrtc' ? t('Devices.Web phone') : t('Devices.NethLink')}</span>
    </div>
  )
}
