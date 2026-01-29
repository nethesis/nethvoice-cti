// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'
import { loadPreference } from './storage'

export const PAGE_SIZE = 10
export const DEFAULT_CONTACT_TYPE_FILTER = 'all'
export const DEFAULT_SORT_BY = 'name'

export function getPhonebookUrl() {
  if (window == undefined) {
    return ''
  }

  // @ts-ignore
  return `${window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT}/api/phonebook/`
}

export async function getPhonebook(
  pageNum: number,
  textFilter: string,
  contactType: string,
  sortBy: string,
  pageSize: number = PAGE_SIZE,
) {
  if (window == undefined) {
    return
  }
  let apiUrl = getPhonebookUrl()

  if (textFilter.trim()) {
    apiUrl += `search/${textFilter.trim()}`
  } else {
    apiUrl += `search/`
  }
  const offset = (pageNum - 1) * pageSize
  apiUrl += `?offset=${offset}&limit=${pageSize}&view=${contactType}`

  try {
    const { data, status } = await axios.get(apiUrl)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function getContact(contactId: number, source: string) {
  if (window == undefined) {
    return
  }

  const contactPath = source === 'cti' ? 'cticontact' : 'contact'
  let apiUrl = getPhonebookUrl() + `${contactPath}/${contactId}`

  try {
    const { data, status } = await axios.get(apiUrl)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function createContact(contactData: any) {
  if (window == undefined) {
    return
  }
  let apiUrl = getPhonebookUrl() + 'create'

  try {
    const { data, status } = await axios.post(apiUrl, contactData)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function editContact(contactData: any) {
  if (window == undefined) {
    return
  }
  let apiUrl = getPhonebookUrl() + 'modify_cticontact'

  try {
    const { data, status } = await axios.post(apiUrl, contactData)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export async function deleteContact(contactId: string) {
  if (window == undefined) {
    return
  }
  let apiUrl = getPhonebookUrl() + 'delete_cticontact'

  try {
    const { data, status } = await axios.post(apiUrl, { id: contactId })
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export function reloadPhonebook() {
  store.dispatch.phonebook.reload()
}

export async function fetchContact(contactId: number, source: string) {
  const res = await getContact(contactId, source)
  const contact = mapContact(res)
  openShowContactDrawer(contact)
}

export function mapContact(contact: any) {
  // kind & display name
  if (contact?.kind) {
    // Use existing kind if it's already set
    if (contact?.kind === 'person') {
      contact.displayName = contact?.name
    } else {
      contact.displayName = contact?.company
    }
  } else {
    // Determine kind based on content: if name exists and is not just "-", it's a person
    if (contact?.name && contact?.name !== '-') {
      contact.kind = 'person'
      contact.displayName = contact?.name
    } else {
      contact.kind = 'company'
      contact.displayName = contact?.company
    }
  }

  // company contacts
  if (contact?.contacts) {
    contact.contacts = JSON.parse(contact?.contacts)
  }
  return contact
}

export const openShowContactDrawer = (contact: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showContact',
    config: contact,
  })
}

export const openCreateContactDrawer = () => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditContact',
    config: { isEdit: false },
  })
}

export const openCreateContactDrawerWithPhone = (contact: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditContact',
    config: { isEdit: false, contact: contact },
  })
}

export const openEditContactDrawer = (contact: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditContact',
    config: { isEdit: true, contact: contact },
  })
}

export const openAddToContactDrawer = (contact: any, phone: any) => {
  contact.phone = phone
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditContact',
    config: { isEdit: true, contact: contact },
  })
}

export const openCreateLastCallContact = (contact: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditContact',
    config: { isEdit: false, isCreateContactUserLastCalls: true, contact: contact },
  })
}

export const getFilterValues = (currentUsername: string) => {
  const contactType =
    loadPreference('phonebookContactTypeFilter', currentUsername) || DEFAULT_CONTACT_TYPE_FILTER

  const sortBy = loadPreference('phonebookSortBy', currentUsername) || DEFAULT_SORT_BY

  return { contactType, sortBy }
}

export const mapPhonebookResponse = (phonebookResponse: any) => {
  if (!phonebookResponse) {
    return null
  }

  phonebookResponse.rows.map((contact: any) => {
    return mapContact(contact)
  })

  // total pages
  phonebookResponse.totalPages = Math.ceil(phonebookResponse.count / PAGE_SIZE)
  return phonebookResponse
}

// Retrieve contact information trough id
export async function retrieveContact(contactId: any) {
  try {
    const { data, status } = await axios.get('/phonebook/contact/' + contactId)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
