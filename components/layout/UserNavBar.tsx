// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from 'react'
import { SpeedDial } from './SpeedDial'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBolt,
  faPhone,
  faVoicemail,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { getJSONItem } from '../../lib/storage'
import { RootState, store } from '../../store'
import { useSelector } from 'react-redux'
import { UserLastCalls } from './UserLastCalls'
import { useTranslation } from 'react-i18next'
import { UserVoiceMail } from './UserVoiceMail'
import { isEmpty } from 'lodash'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'

const activeStyles = {
  width: '.1875rem',
  height: '1.25rem',
  right: '0',
  top: '.375rem',
  borderRadius: '0rem .375rem .375rem 0rem',
  transform: 'rotate(180deg)',
  position: 'absolute',
} as React.CSSProperties

export const UserNavBar: FC = () => {
  const { t } = useTranslation()

  const username = useSelector((state: RootState) => state.user.username)
  const profile = useSelector((state: RootState) => state.user)

  const [tabReady, setTabReady] = useState<boolean>(false)
  const [tabs, setTabs] = useState<TabTypes[]>([])

  // Initialize tabs - initially all inactive
  useEffect(() => {
    setTabs([
      ...(profile?.profile?.macro_permissions?.phonebook?.value
        ? [
            {
              icon: faBolt,
              name: 'speed_dial' as const,
              active: false,
              label: t('NavBars.Speed dials'),
            },
          ]
        : []),

      {
        icon: faPhone,
        name: 'last_calls' as const,
        active: false,
        label: t('NavBars.Last calls'),
      },
      ...(!isEmpty(profile?.endpoints?.voicemail)
        ? [
            {
              icon: faVoicemail,
              name: 'voice_mails' as const,
              active: false,
              label: t('NavBars.Voice mail'),
            },
          ]
        : []),
    ])
  }, [profile?.endpoints?.voicemail, profile?.profile?.macro_permissions?.phonebook?.value])

  const rightSideStatus = useSelector((state: RootState) => state.rightSideMenu)

  // Check store for userSideBarTab value and initialize/open tab if needed
  useEffect(() => {
    if (username && tabReady) {
      const userPreferences = getJSONItem(`preferences-${username}`) || {}

      // If userSideBarTab has a value, open that tab
      if (userPreferences.userSideBarTab && userPreferences.userSideBarTab !== '') {
        const tabToOpen = userPreferences.userSideBarTab
        setTabs((state) =>
          state.map((tab) => {
            tab.active = tab.name === tabToOpen
            return tab
          }),
        )

        store.dispatch.rightSideMenu.toggleSideMenu({
          tabName: tabToOpen,
          username,
          force: true,
        })
      }
    }
  }, [username, tabReady])

  const clickedTab = (tabName: any) => {
    // Check if we're clicking on the already active tab
    const isCurrentTabActive = tabs.find((tab) => tab.name === tabName)?.active

    if (isCurrentTabActive) {
      // Close the sidebar and reset userSideBarTab to empty string
      setTabs((state) =>
        state.map((tab) => {
          tab.active = false
          return tab
        }),
      )

      store.dispatch.rightSideMenu.toggleSideMenu({
        tabName: '',
        username,
        force: false,
      })
    } else {
      // Open the selected tab and set userSideBarTab with the tab value
      setTabs((state) =>
        state.map((tab) => {
          tab.active = tab.name === tabName
          return tab
        }),
      )

      store.dispatch.rightSideMenu.toggleSideMenu({
        tabName: tabName,
        username,
        force: true,
      })
    }
  }

  // Set tabReady to true once everything is initialized
  useEffect(() => {
    if (username) {
      setTabReady(true)
    }
  }, [username])

  return (
    <>
      {/* The tabs content */}
      {tabReady &&
        tabs.map((tab, i) => {
          if (tab?.active && tab?.name === 'speed_dial') {
            return <SpeedDial key={i} />
          } else if (tab.active && tab.name === 'last_calls') {
            return <UserLastCalls key={i} />
          } else if (tab.active && tab.name === 'voice_mails') {
            return <UserVoiceMail key={i} />
          }
        })}
      {/* The side menu */}
      <div
        style={{ width: '3.125rem' }}
        className='border-gray-200 dark:border-gray-700 border-l bg-sidebar dark:bg-sidebarDark py-6 flex flex-col items-center gap-6 relative z-10'
      >
        {tabs.map((tab, i) => (
          <div
            key={i}
            onClick={() => clickedTab(tab?.name)}
            className={`${
              tab.active
                ? 'text-currentSidebarIconText dark:text-currentSidebarIconTextDark bg-sidebarIconBackground dark:bg-sidebarIconBackgroundDark'
                : 'text-sidebarIconText dark:text-sidebarIconTextDark dark:hover:text-currentSidebarIconTextDark hover:text-currentSidebarIconText hover:bg-sidebarIconBackground dark:hover:bg-sidebarIconBackgroundDark'
            } w-8 h-8 rounded flex justify-center items-center relative cursor-pointer`}
            data-tooltip-id={'tooltip-side-menu'}
            data-tooltip-content={tab?.label}
          >
            <FontAwesomeIcon size='lg' icon={tab.icon} />
            {tab?.active && (
              <div
                style={activeStyles}
                className='bg-currentBadgePrimary dark:bg-currentBadgePrimaryDark'
              />
            )}
          </div>
        ))}
      </div>
      <CustomThemedTooltip id='tooltip-side-menu' place='left' />
    </>
  )
}

type TabTypes = {
  icon: IconDefinition
  name: 'speed_dial' | 'last_calls' | 'voice_mails'
  active: boolean
  label: string
}
