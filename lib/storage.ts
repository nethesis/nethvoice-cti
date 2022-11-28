// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the methods to manage browser's storage
 */

/**
 * Saves an Item to localstorage
 *
 * @param name - The key of the object
 * @param value - The object to save
 *
 */

export const setJSONItem = (name: string, value: object) => {
  localStorage.setItem(name, JSON.stringify(value))
}

type SavedType = string | null

/**
 * Gets an Item from localstorage
 *
 * @param name - The key used to save the object
 *
 */

export const getJSONItem = (name: string) => {
  const saved: SavedType = localStorage.getItem(name)
  const initialValue = saved && JSON.parse(saved)
  return initialValue || ''
}

/**
 * Deletes an Item from localstorage
 *
 * @param name - The key used to save the object
 *
 */

export const removeItem = (name: string) => {
  localStorage.removeItem(name)
}

export const setStringItem = (name: string, value: string) => {
  localStorage.setItem(name, value)
}

export const getStringItem = (name: string) => {
  return localStorage.getItem(name)
}

/**
 * Used to save user preferences inside a local storage entry "preferences-username"
 *
 * @param preferenceName name of the preference
 * @param preferenceValue can be a string or a JSON object
 * @param currentUsername username currently logged in
 */
export const savePreference = (
  preferenceName: string,
  preferenceValue: any,
  currentUsername: string,
) => {
  const preferences = getJSONItem(`preferences-${currentUsername}`) || {}
  preferences[preferenceName] = preferenceValue
  setJSONItem(`preferences-${currentUsername}`, preferences)
}

/**
 * Used to load user preferences from the local storage entry "preferences-username"
 *
 * @param preferenceName name of the preference
 * @param currentUsername username currently logged in
 * @returns
 */
export const loadPreference = (preferenceName: string, currentUsername: string) => {
  const preferences = getJSONItem(`preferences-${currentUsername}`) || {}
  return preferences[preferenceName]
}
