// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'
import { loadPreference } from './storage'

export const PAGE_SIZE = 10
export const DEFAULT_CONTACT_TYPE_FILTER = 'user'
export const DEFAULT_CONTACT_DIRECTION_FILTER = 'all'
export const DEFAULT_SORT_BY = 'time%20desc'

export function getHistoryUrl() {
  if (window == undefined) {
    return ''
  }
  // @ts-ignore
  return `${window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT}`
}

export async function search(
  callType: string,
  username: string,
  from: string,
  to: string,
  textSearch: string,
  pageNum: number,
  sort: string,
  type: string,
) {
  if (window == undefined) {
    return
  }
  let removeLostCalls: boolean = false
  if (type === 'in') {
    removeLostCalls = true
  } else {
    removeLostCalls = false
  }
  const offset = (pageNum - 1) * PAGE_SIZE

  let apiUrl = getHistoryUrl()
  let userUrlApi = apiUrl + '/webrest/'
  if (callType === 'switchboard') {
    userUrlApi += 'histcallswitch/interval'
  } else {
    userUrlApi += 'historycall/interval/' + callType + '/' + username
  }
  userUrlApi += '/' + from + '/' + to
  if (textSearch) {
    userUrlApi += '/' + textSearch + '?offset=' + offset + '&limit=' + PAGE_SIZE + '&sort=' + sort
  } else {
    userUrlApi += '?offset=' + offset + '&limit=' + PAGE_SIZE + '&sort=' + sort
  }
  if (callType === 'user') {
    if (type != 'all') {
      userUrlApi += '&direction=' + type + '&removeLostCalls=' + removeLostCalls
    } else {
      userUrlApi += '&removeLostCalls=' + removeLostCalls
    }
  }
  if (callType === 'switchboard') {
    if (type != 'all') {
      userUrlApi += '&type=' + type + '&removeLostCalls=' + removeLostCalls
    } else {
      userUrlApi += '&removeLostCalls=' + removeLostCalls
    }
  }

  try {
    const { data, status } = await axios.get(userUrlApi)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const openDrawerHistory = (
  name: any,
  company: any,
  number: any,
  dataBegin: any,
  dateEnd: any,
  username: any,
  selectionType: any,
  sort: any,
  direction: any,
  disposition: any,
  contactType: any,
  cnam: any,
  ccompany: any,
  src: any,
  dst_cnam: any,
  dst_ccompany: any,
  dst: any,
) => {
  let contact = {
    name: name,
    company: company,
    number: number,
    dateBegin: dataBegin,
    dateEnd: dateEnd,
    username: username,
    selectionType: selectionType,
    sort: sort,
    direction: direction,
    disposition: disposition,
    contactType: contactType,
    cnam: cnam,
    ccompany: ccompany,
    src: src,
    dst_cnam: dst_cnam,
    dst_ccompany: dst_ccompany,
    dst: dst,
  }
  if (number !== 's' && number !== '') {
    store.dispatch.sideDrawer.update({
      isShown: true,
      contentType: 'showContactHistory',
      config: contact,
    })
  }
}

export async function searchDrawerHistoryUser(
  username: string,
  dataBeginSearch: string,
  dateEndSearch: string,
  number: string,
  sort: string,
) {
  let apiUrl = getHistoryUrl()
  let historycallUrlApiUser =
    apiUrl +
    '/webrest/historycall/interval/user/' +
    username +
    '/' +
    dataBeginSearch +
    '/' +
    dateEndSearch +
    '/' +
    number +
    '?offset=0&limit=10&sort=' +
    sort +
    '&removeLostCalls=false'

  try {
    const { data, status } = await axios.get(historycallUrlApiUser)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function searchDrawerHistorySwitchboard(
  dataBeginSearch: string,
  dateEndSearch: string,
  number: string,
  sort: string,
) {
  let apiUrl = getHistoryUrl()
  let historycallUrlApiSwitchboard =
    apiUrl +
    '/webrest/histcallswitch/interval/' +
    dataBeginSearch +
    '/' +
    dateEndSearch +
    '/' +
    number +
    '?offset=0&limit=10&sort=' +
    sort +
    '&removeLostCalls=false'
  try {
    const { data, status } = await axios.get(historycallUrlApiSwitchboard)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const getFilterValues = (currentUsername: string) => {
  const contactType =
    loadPreference('historyContactTypeFilter', currentUsername) || DEFAULT_CONTACT_TYPE_FILTER

  const contactDirection =
    loadPreference('historyContactTypeDirection', currentUsername) ||
    DEFAULT_CONTACT_DIRECTION_FILTER

  const sortBy = loadPreference('historySortTypePreference', currentUsername) || DEFAULT_SORT_BY

  return { contactType, contactDirection, sortBy }
}
