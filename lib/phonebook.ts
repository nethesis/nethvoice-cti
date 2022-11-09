// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'

export const PAGE_SIZE = 10

export function getPhonebookUrl() {
  if (window == undefined) {
    return ''
  }

  // @ts-ignore
  return `${window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT}/webrest/phonebook/`
}

export async function getPhonebook(
  pageNum: number,
  filterText: string,
  contactType: string,
  sortBy: string,
) {
  if (window == undefined) {
    return
  }
  let apiUrl = getPhonebookUrl()

  if (filterText.trim()) {
    apiUrl += `search/${filterText.trim()}`
  } else {
    apiUrl += `searchstartswith/A`
  }
  const offset = (pageNum - 1) * PAGE_SIZE
  apiUrl += `?offset=${offset}&limit=${PAGE_SIZE}&view=${contactType}`

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
  if (contact.name) {
    contact.kind = 'person'
    contact.displayName = contact.name
  } else {
    contact.kind = 'company'
    contact.displayName = contact.company
  }

  // company contacts
  if (contact.contacts) {
    contact.contacts = JSON.parse(contact.contacts)
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

export const openEditContactDrawer = (contact: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditContact',
    config: { isEdit: true, contact: contact },
  })
}
