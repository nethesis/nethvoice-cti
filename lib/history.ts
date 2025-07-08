// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError, callPhoneNumber } from './utils'
import { store } from '../store'
import { loadPreference } from './storage'
import { getOperatorByPhoneNumber, openShowOperatorDrawer } from './operators'
import { cloneDeep } from 'lodash'

export const PAGE_SIZE = 10
export const DEFAULT_CALL_TYPE_FILTER = 'user'
export const DEFAULT_CALL_DIRECTION_FILTER = 'all'
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
  sort: string,
  type: string,
  pageNum: number,
  pageSize: number = PAGE_SIZE,
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
  const offset = (pageNum - 1) * pageSize

  let apiUrl = getHistoryUrl()
  let userUrlApi = apiUrl + '/webrest/'
  if (callType === 'switchboard') {
    userUrlApi += 'histcallswitch/interval'
  } else if (callType === 'group') {
    userUrlApi += 'histcallsgroups/interval'
  } else {
    userUrlApi += 'historycall/interval/' + callType + '/' + username
  }
  userUrlApi += '/' + from + '/' + to
  if (textSearch) {
    userUrlApi += '/' + textSearch + '?offset=' + offset + '&limit=' + pageSize + '&sort=' + sort
  } else {
    userUrlApi += '?offset=' + offset + '&limit=' + pageSize + '&sort=' + sort
  }
  if (callType === 'user') {
    if (type != 'all') {
      userUrlApi += '&direction=' + type + '&removeLostCalls=' + removeLostCalls
    } else {
      userUrlApi += '&removeLostCalls=' + removeLostCalls
    }
  }
  if (callType === 'switchboard' || callType === 'groups') {
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
  name: string,
  company: string,
  number: string,
  callType: string,
  operators: any,
) => {
  // check if phone number belongs to an operator
  const operatorFound: any = getOperatorByPhoneNumber(number, operators)

  if (operatorFound) {
    const operator = cloneDeep(operatorFound)
    operator.lastCallsType = callType

    // show operator drawer
    openShowOperatorDrawer(operator)
  } else {
    // show history drawer
    if (number !== 's' && number !== '') {
      let contact = {
        name: name,
        company: company,
        number: number,
        callType: callType,
      }

      store.dispatch.sideDrawer.update({
        isShown: true,
        contentType: 'showContactHistory',
        config: contact,
      })
    }
  }
}

export async function searchDrawerHistoryUser(
  username: string,
  dataBeginSearch: string,
  dateEndSearch: string,
  number: string,
  sort: string,
  pageSize: number = PAGE_SIZE,
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
    '?offset=0&limit=' +
    pageSize +
    '&sort=' +
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
  pageSize: number = PAGE_SIZE,
) {
  let apiUrl = getHistoryUrl()
  number = number.trim()
  let historycallUrlApiSwitchboard =
    apiUrl +
    '/webrest/histcallswitch/interval/' +
    dataBeginSearch +
    '/' +
    dateEndSearch +
    '/' +
    number +
    '?offset=0&limit=' +
    pageSize +
    '&sort=' +
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
  const callType =
    loadPreference('historyCallTypeFilter', currentUsername) || DEFAULT_CALL_TYPE_FILTER

  const callDirection =
    loadPreference('historyCallTypeDirection', currentUsername) || DEFAULT_CALL_DIRECTION_FILTER

  const sortBy = loadPreference('historySortTypePreference', currentUsername) || DEFAULT_SORT_BY

  return { callType, callDirection, sortBy }
}

export const openAddToPhonebookDrawer = (operator: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'addToPhonebookDrawer',
    config: operator,
  })
}

export const callUser = (user: any, event: any = undefined) => {
  const phoneNumber = user.number
  callPhoneNumber(phoneNumber)

  // stop propagation of click event
  if (event) {
    event.stopPropagation()
  }
}

export const getLastCalls = async (
  username: string,
  dateFrom: string,
  dateTo: string,
  sort: SortTypes = 'time_desc',
): Promise<LastCallsResponse> => {
  try {
    if (sort === 'time_desc') {
      sort = 'time%20desc'
    } else if (sort === 'time_asc') {
      sort = 'time%20asc'
    }

    const requestUrl = `${getHistoryUrl()}/webrest/historycall/interval/user/${username}/${dateFrom}/${dateTo}?offset=0&limit=15&sort=${sort}&removeLostCalls=undefined`
    const { data, status } = await axios.get(requestUrl)

    if (status === 200) {
      return data
    } else {
      throw 'Error retrieving the last calls'
    }
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const downloadCallRec = async (idRecording: string) => {
  try {
    const requestUrl = `${getHistoryUrl()}/webrest/historycall/down_callrec/${idRecording}`
    const { data, status } = await axios.get(requestUrl)

    if (status === 200) {
      return data
    } else {
      throw 'Error retrieving recording'
    }
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const deleteRec = async (idRecording: string) => {
  try {
    const requestUrl = `${getHistoryUrl()}/webrest/historycall/delete_callrec`
    const { data, status } = await axios.post(requestUrl, { id: idRecording })

    if (status === 200) {
      return data
    } else {
      throw 'Error removing recording'
    }
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export interface CallTypes {
  time: number
  channel: string
  dstchannel: string
  uniqueid: string
  linkedid: string
  userfield: string
  duration: number
  billsec: number
  disposition: string
  dcontext: string
  recordingfile: string
  cnum: string
  cnam: string
  ccompany: string
  src: string
  dst: string
  dst_cnam: string
  dst_ccompany: string
  clid: string
  direction: 'in' | 'out'
  queue: string
}

export interface LastCallsResponse {
  count: number
  rows: CallTypes[]
}

export type SortTypes = 'time_desc' | 'time_asc' | string
