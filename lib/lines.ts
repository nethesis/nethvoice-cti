// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError, getApiEndpoint, getApiScheme } from './utils'
import { store } from '../store'
import { loadPreference } from './storage'

export const PAGE_SIZE = 10
export const DEFAULT_SORT_BY = 'description'
export const DEFAULT_SORT_BY_ANNOUNCEMENT = 'description'

const apiEnpoint = getApiEndpoint()
const apiScheme = getApiScheme()
const apiUrl = apiScheme + apiEnpoint + '/webrest/'

// Get phone lines list
export async function retrieveLines() {
  let userUrlApi = apiUrl + 'offhour/list'

  try {
    const { data, status } = await axios.get(userUrlApi)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Get announcements list
export async function getAnnouncements() {
  let userUrlApi = apiUrl + '/offhour/list_announcement'

  try {
    const { data, status } = await axios.get(userUrlApi)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Set record announcent
export async function setRecordMsg() {
  let userUrlApi = apiUrl + '/offhour/record_announcement'

  try {
    const { data, status } = await axios.post(userUrlApi)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Set offhour
export async function setOffHour(offHourElement: any) {
  let userUrlApi = apiUrl + '/offhour/set_offhour/'

  try {
    const { data, status } = await axios.post(userUrlApi, offHourElement)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Enable message
export async function enableMsg(msgElement: any) {
  let userUrlApi = apiUrl + '/offhour/enable_announcement'

  try {
    const { data, status } = await axios.post(userUrlApi, msgElement)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Delete message
export async function deleteMsg(msgElement: string) {
  let userUrlApi = apiUrl + '/offhour/delete_announcement'
  let objectToSend = {
    id: msgElement.toString(),
  }
  try {
    const { data, status } = await axios.post(userUrlApi, objectToSend)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Modify message
export async function modifyMsg(msgElement: any) {
  let userUrlApi = apiUrl + '/offhour/modify_announcement'

  try {
    const { data, status } = await axios.post(userUrlApi, msgElement)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Upload audio message
export async function uploadAudioMsg(msgElement: any) {
  let userUrlApi = apiUrl + '/offhour/upload_announcement'
  try {
    const { data, status } = await axios.post(userUrlApi, msgElement)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Listen audio message
export async function listenMsg(keyMessage: any) {
  let userUrlApi = apiUrl + '/offhour/listen_announcement/' + keyMessage

  try {
    const { data, status } = await axios.get(userUrlApi)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Download audio message
export async function downloadMsg(keyMessage: any) {
  let userUrlApi = apiUrl + '/offhour/download_announcement/' + keyMessage

  let pathForDownload: any = userUrlApi
  try {
    const { data } = await axios.get(userUrlApi)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const openShowTelephoneLinesDrawer = (name: any, number: any) => {
  const config = { name, number }

  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showTelephoneLines',
    config: config,
  })
}

export const openShowTelephoneAnnouncementDrawer = () => {
  const config = {}

  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showTelephoneAnnouncement',
    config: config,
  })
}

export const openShowRuleDetailsDrawer = (name: any) => {
  const config = { name }

  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showRuleDetails',
    config: config,
  })
}

export const getFilterValues = (currentUsername: string) => {
  const sortBy = loadPreference('telephoneLinesSortBy', currentUsername) || DEFAULT_SORT_BY

  return { sortBy }
}

export const getFilterAnnouncementValues = (currentUsername: string) => {
  const sortBy = loadPreference('telephoneAnnouncementSortBy', currentUsername) || DEFAULT_SORT_BY

  return { sortBy }
}
