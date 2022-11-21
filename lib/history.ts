// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { RootState, store } from '../store'
import { useSelector } from 'react-redux'
import { NavItemsProps } from '../config/routes'

export const PAGE_SIZE = 10
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
  removeLostCalls: boolean,
) {
  if (window == undefined) {
    return
  }

  const offset = (pageNum - 1) * PAGE_SIZE

  let apiUrl = getHistoryUrl()
  let userUrlApi = apiUrl + '/webrest/'
  if (callType === 'switchboard') {
    userUrlApi += 'histcallswitch/interval'
  } else {
    userUrlApi += 'historycall/interval/' + callType + '/' + username
  }
  userUrlApi +=
    '/' + from + '/' + to
  if(textSearch){
    userUrlApi += '/' + textSearch + '?offset=' + offset + '&limit=' + PAGE_SIZE + '&sort=' + sort
  }else{
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

export const openDrawerHistory = (contact: any, source: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showContactHistory',
    config: contact,
  })
}
