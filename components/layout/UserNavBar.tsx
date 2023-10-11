// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useCallback, useEffect, useState } from 'react'
import { SpeedDial } from './SpeedDial'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faPhone, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { getJSONItem, setJSONItem } from '../../lib/storage'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { UserLastCalls } from './UserLastCalls'
import { Tooltip } from 'react-tooltip'
import { useTranslation } from 'react-i18next'

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
  const [tabReady, setTabReady] = useState<boolean>(false)

  const [tabs, setTabs] = useState<TabTypes[]>([
    {
      icon: faBolt,
      name: 'speed_dial',
      active: false,
      label: t('NavBars.Speed dials'),
    },
    {
      icon: faPhone,
      name: 'last_calls',
      active: false,
      label: t('NavBars.Last calls'),
    },
  ])

  const changeTab = useCallback(
    (name: string, save: boolean = false): void => {
      let minOnce = false
      setTabs((state) =>
        state.map((tab) => {
          if (tab.name === name) {
            tab.active = true
            minOnce = true
          } else {
            tab.active = false
          }
          return tab
        }),
      )
      // Save the new tab to localstorage
      if (minOnce && save) {
        const preferences = getJSONItem(`preferences-${username}`) || {}
        preferences['userSideBarTab'] = name
        setJSONItem(`preferences-${username}`, preferences)
      }
    },
    [username],
  )

  useEffect(() => {
    if (username) {
      const preferences = getJSONItem(`preferences-${username}`) || {}
      if (preferences.userSideBarTab) {
        changeTab(preferences.userSideBarTab)
      } else {
        changeTab('speed_dial')
      }
      setTabReady(true)
    }
  }, [username])

  return (
    <>
      {/* The tabs content */}
      {tabReady &&
        tabs.map((tab, i) => {
          if (tab.active && tab.name === 'speed_dial') {
            return <SpeedDial key={i} />
          } else if (tab.active && tab.name === 'last_calls') {
            return <UserLastCalls key={i} />
          }
        })}
      {/* The side menu */}
      <div
        style={{ width: '3.125rem' }}
        className='border-gray-200 dark:border-gray-700 border-l bg-white dark:bg-gray-900 py-6 flex flex-col items-center gap-6 relative z-10'
      >
        {tabs.map((tab, i) => (
          <div
            key={i}
            onClick={() => changeTab(tab.name, true)}
            className={`${
              tab.active
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
            } hover:bg-gray-100 hover:dark:bg-gray-700 w-8 h-8 rounded flex justify-center items-center relative cursor-pointer`}
            data-tooltip-id={'tooltip-side-menu'}
            data-tooltip-content={tab.label}
          >
            <FontAwesomeIcon size='lg' icon={tab.icon} />
            {tab.active && <div style={activeStyles} className='bg-primary' />}
          </div>
        ))}
      </div>
      <Tooltip id='tooltip-side-menu' place='left' />
    </>
  )
}

type TabTypes = {
  icon: IconDefinition
  name: 'speed_dial' | 'last_calls'
  active: boolean
  label: string
}
