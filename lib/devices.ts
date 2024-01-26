// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'

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
