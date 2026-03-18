// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { faBell } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { InlineNotification, Switch } from '../common'
import { RootState, Dispatch } from '../../store'
import { setNotificationSettings } from '../../lib/notifications'
import { getUserInfo } from '../../services/user'

type NotificationSettingsItem = {
  id: 'call-summary'
  titleKey: string
  descriptionKey: string
}

export function getAvailableNotificationSettings(callSummaryEnabled: boolean): NotificationSettingsItem[] {
  const items: NotificationSettingsItem[] = []

  if (callSummaryEnabled) {
    items.push({
      id: 'call-summary',
      titleKey: 'Settings.Call summary notifications',
      descriptionKey: 'Settings.Call summary notifications description',
    })
  }

  return items
}

export const Notifications = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch<Dispatch>()
  const userStore = useSelector((state: RootState) => state.user)
  const isCallSummaryEnabled = userStore?.call_summary_enabled === true
  const availableNotificationSettings = getAvailableNotificationSettings(isCallSummaryEnabled)
  const [callSummaryNotifications, setCallSummaryNotifications] = useState<boolean | null>(null)
  const [saveError, setSaveError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const refreshUserSettings = async () => {
      if (availableNotificationSettings.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const userInfo = await getUserInfo()

        if (!isMounted || !userInfo?.data) {
          return
        }

        dispatch.user.update({
          default_device: userInfo?.data?.default_device,
          name: userInfo?.data?.name,
          username: userInfo?.data?.username,
          mainextension: userInfo?.data?.endpoints?.mainextension?.[0]?.id || '',
          mainPresence: userInfo?.data?.mainPresence,
          endpoints: userInfo?.data?.endpoints,
          profile: userInfo?.data?.profile,
          avatar: userInfo?.data?.settings?.avatar,
          settings: userInfo?.data?.settings,
          recallOnBusy: userInfo?.data?.recallOnBusy,
          lkhash: userInfo?.data?.lkhash,
          call_summary_enabled: userInfo?.data?.call_summary_enabled === true,
          urlOpened: false,
          feature_codes: userStore.feature_codes,
        })

        setCallSummaryNotifications(userInfo.data.settings?.call_summary_notifications !== false)
      } catch (error) {
        if (isMounted) {
          setCallSummaryNotifications(userStore.settings?.call_summary_notifications !== false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    refreshUserSettings()

    return () => {
      isMounted = false
    }
  }, [availableNotificationSettings.length, dispatch, userStore.feature_codes])

  const onToggleSummaryNotifications = async (enabled: boolean) => {
    setCallSummaryNotifications(enabled)
    setSaveError('')

    try {
      await setNotificationSettings({
        call_summary_notifications: enabled,
      })

      const userInfo = await getUserInfo()
      if (userInfo?.data) {
        dispatch.user.update({
          default_device: userInfo?.data?.default_device,
          name: userInfo?.data?.name,
          username: userInfo?.data?.username,
          mainextension: userInfo?.data?.endpoints?.mainextension?.[0]?.id || '',
          mainPresence: userInfo?.data?.mainPresence,
          endpoints: userInfo?.data?.endpoints,
          profile: userInfo?.data?.profile,
          avatar: userInfo?.data?.settings?.avatar,
          settings: userInfo?.data?.settings,
          recallOnBusy: userInfo?.data?.recallOnBusy,
          lkhash: userInfo?.data?.lkhash,
          call_summary_enabled: userInfo?.data?.call_summary_enabled === true,
          urlOpened: false,
          feature_codes: userStore.feature_codes,
        })
        setCallSummaryNotifications(userInfo.data.settings?.call_summary_notifications !== false)
      }
    } catch (error) {
      setCallSummaryNotifications(userStore.settings?.call_summary_notifications !== false)
      setSaveError(String(t('Settings.Notifications save failed') || ''))
    }
  }

  return (
    <div className='py-6 px-4 sm:p-6 lg:pb-8'>
      <div>
        <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
          {t('Settings.Notifications')}
        </h2>
      </div>

      {saveError ? (
        <div className='mb-6'>
          <InlineNotification type='error' title={saveError} />
        </div>
      ) : null}

      <div className='space-y-4'>
        {availableNotificationSettings.map((notificationItem) => (
          <div
            key={notificationItem.id}
            className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='flex items-start gap-3'>
                <FontAwesomeIcon
                  icon={faBell}
                  className='mt-1 text-gray-500 dark:text-gray-400'
                />
                <div>
                  <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                    {t(notificationItem.titleKey)}
                  </h3>
                  <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                    {t(notificationItem.descriptionKey)}
                  </p>
                </div>
              </div>
              {notificationItem.id === 'call-summary' ? (
                !isLoading && callSummaryNotifications !== null ? (
                  <Switch on={callSummaryNotifications} changed={onToggleSummaryNotifications} />
                ) : (
                  <div className='h-6 w-11 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
                )
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
