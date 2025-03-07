// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'
import { getJSONItem, loadPreference } from './storage'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faHeadset } from '@fortawesome/free-solid-svg-icons'

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

export const openShowSwitchDeviceInputOutput = (status: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showSwitchDeviceInputOutput',
    config: status,
  })
}

export const openShowDownloadLinkContent = (status: any, defaultOS: string) => {
  let objConfig = {
    urlStatus: status,
    selectedOS: defaultOS,
  }
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showDownloadLinkContent',
    config: objConfig,
  })
}

export const getInputOutputLocalStorageValue = (currentUsername: string) => {
  const audioInputType = getJSONItem('phone-island-audio-input-device') || ''
  const audioOutputType = getJSONItem('phone-island-audio-output-device') || ''
  const videoInputType = getJSONItem('phone-island-video-input-device') || ''

  return { audioInputType, audioOutputType, videoInputType }
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

export const getPhysicalDeviceButtonConfiguration = async (macAddress: any) => {
  try {
    const { username, token } = store.getState().authentication
    const res = await fetch(
      // @ts-ignore
      window.CONFIG.API_SCHEME +
        // @ts-ignore
        window.CONFIG.VOICE_ENDPOINT +
        '/webrest/tancredi/api/v1/phones/' +
        macAddress +
        '?inherit=1',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${username}:${token}`,
        },
      },
    )
    const data = await res.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

export const getPhoneModelData = async (model: any) => {
  try {
    const { username, token } = store.getState().authentication
    const res = await fetch(
      // @ts-ignore
      window.CONFIG.API_SCHEME +
        // @ts-ignore
        window.CONFIG.VOICE_ENDPOINT +
        '/webrest/tancredi/api/v1/models/' +
        model,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${username}:${token}`,
        },
      },
    )
    const data = await res.json()
    return data
  } catch (error) {
    console.error(error)
  }
}

export const saveBtnsConfig = async (macAddress: any, keyUpdatedObject: any) => {
  try {
    const { username, token } = store.getState().authentication
    const res = await fetch(
      // @ts-ignore
      window.CONFIG.API_SCHEME +
        // @ts-ignore
        window.CONFIG.VOICE_ENDPOINT +
        '/webrest/tancredi/api/v1/phones/' +
        macAddress,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${username}:${token}`,
        },
        body: JSON.stringify(keyUpdatedObject),
      },
    )
    return res
  } catch (error) {
    console.error(error)
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

export async function getDownloadLink() {
  try {
    const { data, status } = await axios.get(
      'https://api.github.com/repos/nethesis/nethlink/releases/latest',
    )
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const tableHeader = () => {
  return (
    <thead className='bg-gray-100 dark:bg-gray-800'>
      <tr>
        <th scope='col' className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6'>
          {t('Devices.Device name')}
        </th>
        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
          {t('Devices.Status')}
        </th>
        <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
          <span className='sr-only'> {t('Devices.Edit')}</span>
        </th>
        <th scope='col' className='py-3.5 text-right text-sm font-semibold'>
          <span className='sr-only'> {t('Devices.Edit')}</span>
        </th>
        <th scope='col' className='relative py-3.5 pl-3 pr-4 text-right'>
          <span className='sr-only'> {t('Devices.Edit')}</span>
        </th>
      </tr>
    </thead>
  )
}

export const titleTable = (deviceType: string) => {
  return (
    <div className='flex items-center space-x-2'>
      <FontAwesomeIcon
        icon={deviceType === 'webrtc' ? faHeadset : faDesktop}
        className='h-4 w-4 flex justify-center text-gray-700 dark:text-gray-500'
      />
      <span>{deviceType === 'webrtc' ? t('Devices.Web phone') : t('Devices.PhoneLink')}</span>
    </div>
  )
}
