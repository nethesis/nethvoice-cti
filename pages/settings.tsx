// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPalette,
  faBorderAll,
  IconDefinition,
  faDatabase,
  faMobile,
  faUsers,
  faIdCardClip,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState, store } from '../store'
import { Integrations, ClearCache } from '../components/settings'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useTranslation } from 'react-i18next'
import { Queues } from '../components/settings/Queues'
import { useRouter } from 'next/router'
import { Theme } from '../components/settings/Theme'
import { MobileApp } from '../components/settings/MobileApp'
import { CustomerCards } from '../components/settings/CustomerCards'

interface SettingsMenuTypes {
  name: string
  icon: IconDefinition
  href: string
  current: boolean
}

const Settings: NextPage = () => {
  const { t } = useTranslation()
  const authStore = useSelector((state: RootState) => state.authentication)
  const [firstRender, setFirstRender]: any = useState(true)
  const router = useRouter()

  const settingsMenu: SettingsMenuTypes[] = [
    { name: 'Cache', href: '#', icon: faDatabase, current: false },
    { name: 'Customer cards', href: '#', icon: faIdCardClip, current: false },
    { name: 'Integrations', href: '#', icon: faBorderAll, current: false },
    { name: 'Queues', href: '#', icon: faUsers, current: false },
    { name: 'Mobile App', href: '#', icon: faMobile, current: false },
    { name: 'Theme', href: '#', icon: faPalette, current: true },
  ]

  const [items, setItems] = useState<SettingsMenuTypes[]>(settingsMenu)
  const [currentSection, setCurrentSection] = useState<string>(settingsMenu[0].name)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    let section = router.query.section as string

    if (!section) {
      section = 'Theme'
    }
    changeSection(section)
  }, [firstRender])

  const changeSection = (sectionName: string) => {
    const currentItems = items.map((route) => {
      if (sectionName === route.name) {
        route.current = true
        setCurrentSection(sectionName)
      } else {
        route.current = false
      }
      return route
    })
    setItems(currentItems)
  }

  //// remove mock
  const createCallNotif = () => {
    const notif = {
      id: uuidv4(),
      type: 'missedCall',
      timestamp: new Date().getTime(),
      isRead: false,
      name: 'Test user',
      number: '222',
    }
    store.dispatch.notifications.addNotification({
      notification: notif,
      currentUsername: authStore.username,
    })
  }

  //// remove mock
  const createQueueCallNotif = () => {
    const notif = {
      id: uuidv4(),
      type: 'missedCall',
      timestamp: new Date().getTime(),
      isRead: false,
      name: 'Test user',
      number: '222',
      queue: 'Commerciali',
    }
    store.dispatch.notifications.addNotification({
      notification: notif,
      currentUsername: authStore.username,
    })
  }

  //// remove mock
  const createChatNotif = () => {
    const notif = {
      id: uuidv4(),
      type: 'chat',
      timestamp: new Date().getTime(),
      isRead: false,
      name: 'John Doe',
      message:
        'Hey there, lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore',
    }
    store.dispatch.notifications.addNotification({
      notification: notif,
      currentUsername: authStore.username,
    })
  }

  const { profile } = useSelector((state: RootState) => state.user)

  return (
    <>
      {profile?.macro_permissions?.cdr?.value ? (
        <div>
          <div className='mx-auto'>
            <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>
              {t('Settings.Settings')}
            </h1>
            <div className='overflow-hidden rounded-lg bg-white shadow dark:bg-gray-900'>
              <div className='divide-y divide-gray-200 dark:divide-gray-700 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x'>
                {/* settings menu */}
                <aside className='py-6 lg:col-span-3'>
                  <nav className='space-y-1'>
                    {items.map((item: any) => (
                      <a
                        key={item.name}
                        onClick={() => changeSection(item.name)}
                        className={classNames(
                          item.current
                            ? 'bg-primaryLighter border-primaryLight text-primaryDark hover:bg-primaryLighter hover:text-primaryDark dark:bg-primaryDarker dark:border-primaryDark dark:text-primaryLight dark:hover:bg-primaryDarker dark:hover:text-primaryLight'
                            : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-100 dark:hover:bg-gray-900 dark:hover:text-gray-100',
                          'group border-l-4 px-3 py-3 flex items-center text-sm font-medium cursor-pointer',
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className={classNames(
                            item.current
                              ? 'text-primary group-hover:text-primary dark:text-primaryLight dark:group-hover:text-primaryLight'
                              : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400',
                            'flex-shrink-0 -ml-1 mr-3 h-4 w-4',
                          )}
                          aria-hidden='true'
                        />
                        <span className='truncate'>{t(`Settings.${item.name}`)}</span>
                      </a>
                    ))}
                  </nav>
                </aside>
                {/* main content */}
                <div className='lg:col-span-9'>
                  {/* Theme section */}
                  {currentSection === 'Theme' && <Theme />}
                  {/* Queues */}
                  {currentSection === 'Queues' && <Queues />}
                  {/* Integrations section */}
                  {currentSection === 'Integrations' && <Integrations />}
                  {/* Clean cache */}
                  {currentSection === 'Cache' && <ClearCache />}
                  {/* Mobile app */}
                  {currentSection === 'Mobile App' && <MobileApp />}
                  {/* Customer cards */}
                  {currentSection === 'Customer cards' && <CustomerCards />}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-center h-screen'>
          <div className='text-center'>
            <FontAwesomeIcon icon={faExclamationTriangle} className='text-red-500 text-6xl mb-4' />
            <p className='text-xl text-red-500'>{t('Common.Permission error')}</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Settings
