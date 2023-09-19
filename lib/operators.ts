// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { callPhoneNumber, handleNetworkError } from '../lib/utils'
import { store } from '../store'
import { loadCache, loadPreference, saveCache, savePreference } from './storage'
import { isEmpty, cloneDeep } from 'lodash'

export const AVAILABLE_STATUSES = ['online', 'cellphone', 'callforward', 'voicemail']
export const UNAVAILABLE_STATUSES = ['dnd', 'busy', 'incoming', 'ringing']
export const DEFAULT_GROUP_FILTER = 'all'
export const DEFAULT_STATUS_FILTER = 'all'
export const DEFAULT_SORT_BY = 'favorites'
export const DEFAULT_LAYOUT = 'standard'
export const AVATARS_EXPIRATION_MILLIS = 24 * 60 * 60 * 1000 // 24 hours

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

export async function getExtensions() {
  try {
    const { data } = await axios.get('/astproxy/extensions')
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
    'ringing',
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

export const callOperator = (operator: any, event: any = undefined) => {
  const phoneNumber = operator.endpoints.mainextension[0].id
  callPhoneNumber(phoneNumber)

  // stop propagation of click event
  if (event) {
    event.stopPropagation()
  }
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
  store.dispatch.operators.setOperatorsLoaded(false)
}

export const getFilterValues = (currentUsername: string) => {
  const group = loadPreference('operatorsGroupFilter', currentUsername) || DEFAULT_GROUP_FILTER

  const status = loadPreference('operatorsStatusFilter', currentUsername) || DEFAULT_STATUS_FILTER

  const sortBy = loadPreference('operatorsSortBy', currentUsername) || DEFAULT_SORT_BY

  const layout = loadPreference('operatorsLayout', currentUsername) || DEFAULT_LAYOUT

  return { group, status, sortBy, layout }
}

export const retrieveUserEndpoints = async () => {
  store.dispatch.operators.setUserEndpointsLoaded(false)

  try {
    const endpoints = await getUserEndpointsAll()
    store.dispatch.operators.setUserEndpoints(endpoints)
    store.dispatch.operators.setUserEndpointsLoaded(true)
  } catch (e) {
    console.error(e)
    store.dispatch.operators.setErrorMessage('Cannot retrieve user endpoints')
    store.dispatch.operators.setOperatorsLoaded(true)
    store.dispatch.operators.setLoading(false)
  }
}

export const retrieveGroups = async () => {
  store.dispatch.operators.setGroupsLoaded(false)

  try {
    const groups = await getGroups()
    store.dispatch.operators.setGroups(groups)
    store.dispatch.operators.setGroupsLoaded(true)
  } catch (e) {
    console.error(e)
    store.dispatch.operators.setErrorMessage('Cannot retrieve groups')
    store.dispatch.operators.setOperatorsLoaded(true)
    store.dispatch.operators.setLoading(false)
  }
}

export const retrieveExtensions = async () => {
  store.dispatch.operators.setExtensionsLoaded(false)

  try {
    const extensions = await getExtensions()
    store.dispatch.operators.setExtensions(extensions)
    store.dispatch.operators.setExtensionsLoaded(true)
  } catch (e) {
    console.error(e)
    store.dispatch.operators.setErrorMessage('Cannot retrieve conversations')
    store.dispatch.operators.setOperatorsLoaded(true)
    store.dispatch.operators.setLoading(false)
  }
}

export const retrieveAvatars = async (authStore: any) => {
  store.dispatch.operators.setAvatarsLoaded(false)

  try {
    let avatars = loadCache('operatorsAvatars', authStore.username)

    if (!avatars) {
      // avatars not cached or cache has expired
      avatars = await getAllAvatars()
      const expiration = new Date().getTime() + AVATARS_EXPIRATION_MILLIS
      saveCache('operatorsAvatars', avatars, authStore.username, expiration)
    }
    store.dispatch.operators.setAvatars(avatars)
    store.dispatch.operators.setAvatarsLoaded(true)
  } catch (e) {
    console.error(e)
    store.dispatch.operators.setErrorMessage('Cannot retrieve avatars')
    store.dispatch.operators.setOperatorsLoaded(true)
    store.dispatch.operators.setLoading(false)
  }
}

export const retrieveFavoriteOperators = (authStore: any) => {
  store.dispatch.operators.setFavoritesLoaded(false)
  const favoriteOperators = loadPreference('favoriteOperators', authStore.username) || []
  store.dispatch.operators.setFavorites(favoriteOperators)
  store.dispatch.operators.setFavoritesLoaded(true)
}

export const buildOperators = (operatorsStore: any) => {
  let operators = cloneDeep(operatorsStore.userEndpoints)

  // groups

  for (let [groupName, groupData] of Object.entries(operatorsStore.groups)) {
    // @ts-ignore
    for (const username of groupData.users) {
      if (operators[username]) {
        let groups = operators[username].groups || []
        groups.push(groupName)
        operators[username].groups = groups
      }
    }
  }

  // conversations

  for (const [extNum, extData] of Object.entries(operatorsStore.extensions)) {
    // @ts-ignore
    if (!isEmpty(extData.conversations)) {
      const opFound: any = Object.values(operators).find((op: any) => {
        return op.endpoints.extension.some((ext: any) => ext.id === extNum)
      })

      if (opFound) {
        let conversations = opFound.conversations || []

        // @ts-ignore
        Object.values(extData.conversations).forEach((conv) => {
          conversations.push(conv)
        })
        opFound.conversations = conversations
      }
    }
  }

  // favorites

  for (const username of operatorsStore?.favorites) {
    if (operators[username]) {
      operators[username].favorite = true
    }
  }
  // avatars

  for (const [username, avatarBase64] of Object.entries(operatorsStore.avatars)) {
    if (operators[username]) {
      operators[username].avatarBase64 = avatarBase64
    }
  }
  store.dispatch.operators.setOperators(operators)
  store.dispatch.operators.setOperatorsLoaded(true)
  store.dispatch.operators.setLoading(false)
}

export const getOperatorByPhoneNumber = (phoneNumber: string, operators: any) => {
  return Object.values(operators).find((operator: any) =>
    operator.endpoints.extension.find((ext: any) => ext.id === phoneNumber),
  )
}

export const getInfiniteScrollOperatorsPageSize = () => {
  let pageSize = 30

  if (typeof window !== 'undefined' && window.innerHeight > 1000) {
    pageSize = 100
  }
  return pageSize
}

export async function postRecallOnBusy(obj: any) {
  try {
    const { data, status } = await axios.post('/astproxy/recall_on_busy', obj)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
