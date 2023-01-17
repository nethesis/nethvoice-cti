// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { RadioGroup } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPalette,
  faBorderAll,
  IconDefinition,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState, store } from '../store'
import { setTheme } from '../lib/darkTheme'
import { Integrations, ClearCache } from '../components/settings'
import { useEffect, useState } from 'react'
import { Button } from '../components/common'
import { v4 as uuidv4 } from 'uuid'

interface SettingsMenuTypes {
  name: string
  icon: IconDefinition
  href: string
  current: boolean
}

const settingsMenu: SettingsMenuTypes[] = [
  // { name: 'General', href: '#', icon: faGear, current: false }, ////
  { name: 'Theme', href: '#', icon: faPalette, current: true },
  { name: 'Integrations', href: '#', icon: faBorderAll, current: false },
  { name: 'Cache', href: '#', icon: faDatabase, current: false },
]

const themeOptions = [
  {
    id: 'system',
    title: 'System',
    description: 'Use light or dark theme according to system preferences',
  },
  {
    id: 'light',
    title: 'Light',
    description: '',
  },
  {
    id: 'dark',
    title: 'Dark',
    description: '',
  },
]

const Settings: NextPage = () => {
  const { theme } = useSelector((state: RootState) => state.darkTheme)
  const [items, setItems] = useState<SettingsMenuTypes[]>(settingsMenu)
  const [currentSection, setCurrentSection] = useState<string>(settingsMenu[0].name)
  const auth = useSelector((state: RootState) => state.authentication)
  const [firstRender, setFirstRender]: any = useState(true)
  const [isLoaded, setLoaded] = useState(false)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }

    if (!isLoaded) {
      changeSection('Theme')
    }
  }, [firstRender, isLoaded])

  const onChangeTheme = (newTheme: string) => {
    setTheme(newTheme, auth.username)
  }

  const changeSection = (name: string) => {
    const currentItems = items.map((route) => {
      if (name === route.name) {
        route.current = true
        setCurrentSection(name)
      } else {
        route.current = false
      }
      return route
    })
    setItems(currentItems)
  }

  const authStore = useSelector((state: RootState) => state.authentication)

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
      queue: 'ksd fjaskljklsdfj aklsdj fklasd fkla afkl',
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

  return (
    <>
      <div>
        <div className='mx-auto max-w-screen-xl px-4 pt-4 pb-6 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 lg:pb-16'>
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
                        'group border-l-4 px-3 py-2 flex items-center text-sm font-medium cursor-pointer',
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={classNames(
                          item.current
                            ? 'text-primaryLight group-hover:text-primaryLight dark:text-primary dark:group-hover:text-primary'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400',
                          'flex-shrink-0 -ml-1 mr-3 h-6 w-6',
                        )}
                        aria-hidden='true'
                      />
                      <span className='truncate'>{item.name}</span>
                    </a>
                  ))}
                </nav>
              </aside>
              {/* main content */}
              <div className='divide-y divide-gray-200 dark:divide-gray-700 lg:col-span-9'>
                {/* Theme section */}
                {currentSection === 'Theme' && (
                  <div className='py-6 px-4 sm:p-6 lg:pb-8'>
                    <div>
                      <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                        Theme
                      </h2>
                    </div>

                    <RadioGroup value={theme} onChange={onChangeTheme}>
                      <div className='isolate mt-1 -space-y-px rounded-md bg-white dark:bg-gray-900 shadow-sm'>
                        {themeOptions.map((themeOption, settingIdx) => (
                          <RadioGroup.Option
                            key={themeOption.title}
                            value={themeOption.id}
                            className={({ checked }) =>
                              classNames(
                                settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                                settingIdx === themeOptions.length - 1
                                  ? 'rounded-bl-md rounded-br-md'
                                  : '',
                                checked
                                  ? 'bg-primaryLighter border-primaryLight dark:bg-primaryDarker dark:border-primaryDark z-10'
                                  : 'border-gray-200 dark:border-gray-700',
                                'relative border p-4 flex cursor-pointer focus:outline-none',
                              )
                            }
                          >
                            {({ active, checked }) => (
                              <>
                                <span
                                  className={classNames(
                                    checked
                                      ? 'bg-primary border-transparent'
                                      : 'bg-white border-gray-300 dark:bg-gray-900 dark:border-gray-600',
                                    active ? 'ring-2 ring-offset-2 ring-primary' : '',
                                    'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center',
                                  )}
                                  aria-hidden='true'
                                >
                                  <span className='rounded-full bg-white dark:bg-gray-900 w-1.5 h-1.5' />
                                </span>
                                <span className='ml-3 flex flex-col'>
                                  <RadioGroup.Label
                                    as='span'
                                    className={classNames(
                                      checked
                                        ? 'text-primaryDarker dark:text-primaryLighter'
                                        : 'text-gray-900 dark:text-gray-100',
                                      'block text-sm font-medium',
                                    )}
                                  >
                                    {themeOption.title}
                                  </RadioGroup.Label>
                                  {themeOption.description && (
                                    <RadioGroup.Description
                                      as='span'
                                      className={classNames(
                                        checked
                                          ? 'text-primaryDark dark:text-primaryLight'
                                          : 'text-gray-500 dark:text-gray-400',
                                        'block text-sm',
                                        'mt-1',
                                      )}
                                    >
                                      {themeOption.description}
                                    </RadioGroup.Description>
                                  )}
                                </span>
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>

                    {/* //// remove test buttons */}
                    {/* <div className='mt-6'>
                      <Button variant='white' onClick={() => createCallNotif()}>
                        <span>Create personal call notif</span>
                      </Button>
                      <Button
                        variant='white'
                        onClick={() => createQueueCallNotif()}
                        className='ml-2'
                      >
                        <span>Create queue call notif</span>
                      </Button>
                      <Button
                        variant='white'
                        onClick={() => createChatNotif()}
                        className='ml-2'
                      >
                        <span>Create chat notif</span>
                      </Button>
                    </div> */}
                  </div>
                )}
                {/* Integrations section */}
                {currentSection === 'Integrations' && <Integrations />}
                {/* Clean cache */}
                {currentSection === 'Cache' && <ClearCache />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings
