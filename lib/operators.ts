// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from '../lib/utils'
import { store } from '../store'
import { loadPreference, savePreference } from './storage'

export const AVAILABLE_STATUSES = ['online', 'cellphone', 'callforward', 'voicemail']
export const UNAVAILABLE_STATUSES = ['dnd', 'busy', 'incoming']
export const DEFAULT_GROUP_FILTER = 'all'
export const DEFAULT_STATUS_FILTER = 'all'
export const DEFAULT_SORT_BY = 'favorites'
export const DEFAULT_LAYOUT = 'standard'

export async function getUserEndpointsAll() {
  try {
    const { data } = await axios.get('/user/endpoints/all')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getAllAvatars() {
  try {
    const { data } = await axios.get('/user/all_avatars')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getGroups() {
  try {
    const { data } = await axios.get('/astproxy/opgroups')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export function searchStringInOperator(operator: any, queryText: string) {
  const regex = /[^a-zA-Z0-9]/g
  queryText = queryText.replace(regex, '')
  let found = false

  // search in string attributes
  found = ['name', 'username', 'group'].some((attrName) => {
    return new RegExp(queryText, 'i').test(operator[attrName]?.replace(regex, ''))
  })

  if (found) {
    return true
  }

  const endpoints = operator.endpoints

  // search in extensions
  found = endpoints.extension.some((extension: any) => {
    return new RegExp(queryText, 'i').test(extension.id.replace(regex, ''))
  })

  if (found) {
    return true
  }

  // search in cellphones
  found = endpoints.cellphone.some((cellphone: any) => {
    return new RegExp(queryText, 'i').test(cellphone.id.replace(regex, ''))
  })
}

export const openShowOperatorDrawer = (operator: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showOperator',
    config: operator,
  })
}

export const sortByOperatorStatus = (operator1: any, operator2: any) => {
  const statusRanking = [
    'online',
    'cellphone',
    'callforward',
    'voicemail',
    'incoming',
    'busy',
    'dnd',
    'offline',
  ]
  const rank1 = statusRanking.indexOf(operator1.mainPresence)
  const rank2 = statusRanking.indexOf(operator2.mainPresence)

  if (rank1 < rank2) {
    return -1
  }
  if (rank1 > rank2) {
    return 1
  }
  return 0
}

export const sortByFavorite = (operator1: any, operator2: any) => {
  if (operator1.favorite < operator2.favorite || !operator1.favorite) {
    return 1
  }
  if (operator1.favorite > operator2.favorite || !operator2.favorite) {
    return -1
  }
  return 0
}

export const callOperator = (operator: any) => {
  console.log('call operator', operator) ////
}

export const isOperatorCallable = (operator: any, currentUsername: string) => {
  return (
    operator.endpoints.extension.length > 0 &&
    (operator.mainPresence === 'online' ||
      operator.mainPresence === 'cellphone' ||
      operator.mainPresence === 'callforward' ||
      operator.mainPresence === 'voicemail') &&
    operator.status !== 'busy' &&
    operator.status !== 'onhold' &&
    operator.username !== currentUsername
  )
}

export const addOperatorToFavorites = (operatorToAdd: string, currentUsername: string) => {
  const favoriteOperators = loadPreference('favoriteOperators', currentUsername) || []
  favoriteOperators.push(operatorToAdd)
  savePreference('favoriteOperators', favoriteOperators, currentUsername)
}

export const removeOperatorFromFavorites = (operatorToRemove: string, currentUsername: string) => {
  let favoriteOperators = loadPreference('favoriteOperators', currentUsername) || []
  favoriteOperators = favoriteOperators.filter((op: any) => op !== operatorToRemove)
  savePreference('favoriteOperators', favoriteOperators, currentUsername)
}

export function reloadOperators() {
  store.dispatch.operators.reload()
}

export const getFilterValues = (currentUsername: string) => {
  const group = loadPreference('operatorsGroupFilter', currentUsername) || DEFAULT_GROUP_FILTER

  const status = loadPreference('operatorsStatusFilter', currentUsername) || DEFAULT_STATUS_FILTER

  const sortBy = loadPreference('operatorsSortBy', currentUsername) || DEFAULT_SORT_BY

  const layout = loadPreference('operatorsLayout', currentUsername) || DEFAULT_LAYOUT

  return { group, status, sortBy, layout }
}
