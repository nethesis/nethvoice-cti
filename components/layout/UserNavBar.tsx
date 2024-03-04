// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useCallback, useEffect, useState } from 'react'
import { SpeedDial } from './SpeedDial'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faPhone, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { getJSONItem, loadPreference, setJSONItem } from '../../lib/storage'
import { RootState, store } from '../../store'
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

  const auth = useSelector((state: RootState) => state.authentication)

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

  const rightSideStatus: any = useSelector((state: RootState) => state.rightSideMenu)

  const [defaultTabSelected, setDefaultTabSelected] = useState('')

  //On first render of page get value of tab from local storage
  useEffect(() => {
    if (!rightSideStatus?.actualTab && defaultTabSelected !== '') {
      store.dispatch.rightSideMenu.updateTab(defaultTabSelected)
    }
  }, [rightSideStatus?.actualTab, defaultTabSelected])

  const [firstClickOnTab, setFirstClickOnTab] = useState(false)

  const clickedTab = (tabName: any, save: boolean) => {
    let rightSideMenuOpened = rightSideStatus?.isSideMenuOpened
    // avoid conflict with useEffect
    if (!firstClickOnTab) {
      setFirstClickOnTab(true)
    }
    setDefaultTabSelected(tabName)
    const preferences = getJSONItem(`preferences-${username}`) || {}
    preferences['userSideBarTab'] = tabName
    setJSONItem(`preferences-${username}`, preferences)
    setTabs((state) =>
      state.map((tab) => {
        if (tab?.name === tabName) {
          tab.active = true
        } else {
          tab.active = false
        }
        return tab
      }),
    )

    // Check if selected tab is already active
    const isTabActive = tabs.find((tab) => tab.name === tabName)?.active

    // on click update selected tab name inside store
    store.dispatch.rightSideMenu.updateTab(tabName)
    if (isTabActive) {
      // Close side menu if tab is already active
      store.dispatch.rightSideMenu.setRightSideMenuOpened(!rightSideMenuOpened)

      store.dispatch.rightSideMenu.setShown(!rightSideMenuOpened)
      saveTabStatusToStorage(!rightSideMenuOpened)
    } else {
      // Otherwise open side menu
      store.dispatch.rightSideMenu.setShown(true)
      store.dispatch.rightSideMenu.setRightSideMenuOpened(true)
      saveTabStatusToStorage(true)
    }
  }

  const saveTabStatusToStorage = (isRightTabOpen: any) => {
    const preferences = getJSONItem(`preferences-${username}`)
    preferences['rightTabStatus'] = isRightTabOpen
    setJSONItem(`preferences-${username}`, preferences)
  }

  const [firstRender, setFirstRender] = useState(true)

  const userPreferences = getJSONItem(`preferences-${username}`) || {}

  const getTabValuesFromLocalStorage = (currentUsername: string) => {
    const rightSideMenuTabSelectedLocalStorage = loadPreference('userSideBarTab', currentUsername)
    return { rightSideMenuTabSelectedLocalStorage }
  }

  //Get selected user side menu selected value from the local storage
  useEffect(() => {
    const localStorageTabValues = getTabValuesFromLocalStorage(auth.username)
    if (
      localStorageTabValues?.rightSideMenuTabSelectedLocalStorage &&
      localStorageTabValues?.rightSideMenuTabSelectedLocalStorage !== ''
    ) {
      setDefaultTabSelected(localStorageTabValues?.rightSideMenuTabSelectedLocalStorage)
      if (!firstClickOnTab) {
        setTabs((state) =>
          state.map((tab) => {
            if (tab?.name === localStorageTabValues?.rightSideMenuTabSelectedLocalStorage) {
              tab.active = true
            } else {
              tab.active = false
            }
            return tab
          }),
        )
      }
    } else {
      setDefaultTabSelected('speed_dial')
      if (!firstClickOnTab) {
        setTabs((state) =>
          state.map((tab) => {
            if (tab?.name === 'speed_dial') {
              tab.active = true
            } else {
              tab.active = false
            }
            return tab
          }),
        )
      }
    }

    setTabReady(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //Get the selected filter from the local storage
  useEffect(() => {
    if (firstRender && username && userPreferences) {
      setFirstRender(false)
      return
    }
    if (username && userPreferences) {
      if (userPreferences?.rightTabStatus !== undefined) {
        store.dispatch.rightSideMenu.setShown(userPreferences?.rightTabStatus)

        store.dispatch.rightSideMenu.setRightSideMenuOpened(userPreferences?.rightTabStatus)
      }
    }
  }, [firstRender, username, userPreferences?.rightTabStatus])

  return (
    <>
      {/* The tabs content */}
      {tabReady &&
        tabs.map((tab, i) => {
          if (tab?.active && tab?.name === 'speed_dial') {
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
            onClick={() => clickedTab(tab?.name, true)}
            className={`${
              tab.active
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50'
            } hover:bg-gray-100 hover:dark:bg-gray-700 w-8 h-8 rounded flex justify-center items-center relative cursor-pointer`}
            data-tooltip-id={'tooltip-side-menu'}
            data-tooltip-content={tab?.label}
          >
            <FontAwesomeIcon size='lg' icon={tab.icon} />
            {tab?.active && <div style={activeStyles} className='bg-primary dark:bg-primaryDark' />}
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
