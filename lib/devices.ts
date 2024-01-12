// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'

export const openShowEditPhysicalPhone = (emptyString: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showEditPhysicalPhone',
    config: emptyString,
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