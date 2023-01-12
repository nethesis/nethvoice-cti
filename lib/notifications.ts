// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { getJSONItem, setJSONItem } from './storage'

/**
 * Used to load user notifications from the local storage entry "notifications-username"
 *
 * @param currentUsername username currently logged in
 */
export const loadNotificationsFromStorage = (currentUsername: string) => {
  return getJSONItem(`notifications-${currentUsername}`) || []
}

/**
 * Used to add an notification item inside a local storage entry "notifications-username"
 *
 * @param notification a JSON object
 * @param currentUsername username currently logged in
 */
export const saveNotificationsToStorage = (notifications: any[], currentUsername: string) => {
  setJSONItem(`notifications-${currentUsername}`, notifications)
}
