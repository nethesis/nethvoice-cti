// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The top bar
 *
 */

import { FC, useEffect, useState } from 'react'
import { Avatar, Button, Dropdown } from '../common'
import { logout } from '../../services/login'
import { useRouter } from 'next/router'
import { removeItem } from '../../lib/storage'
import { store } from '../../store'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import classNames from 'classnames'
import { changeStatusPresence } from '../../lib/topBar'
import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faArrowRightFromBracket,
  faBars,
  faSun,
  faMoon,
  faBell,
  faChevronLeft,
} from '@fortawesome/free-solid-svg-icons'
import { setTheme } from '../../lib/darkTheme'
import { loadNotificationsFromStorage } from '../../lib/notifications'

const solutions = [
  {
    name:'online',
    status: 'Online',
    description: 'Allows users to to make and receive phone calls.',
    href: '#',
  },
  {
    name:'forward',
    status: 'Forward',
    description: 'Allows users to forward incoming calls to another number or destination.',
    href: '#',
  },
  {
    name:'mobile',
    status: 'Mobile',
    description: 'Learn how to maximize our platform to get the most out of it.',
    href: '#',
  },
  {
    name:'dnd',
    status: 'Do not disturb',
    description: 'Check out webinars with experts and learn about our annual conference.',
    href: '#',
  },
]

interface TopBarProps {
  openMobileCb: () => void
}

export const TopBar: FC<TopBarProps> = ({ openMobileCb }) => {
  const router = useRouter()
  const { name, mainextension, mainPresence, avatar } = useSelector(
    (state: RootState) => state.user,
  )
  const { theme } = useSelector((state: RootState) => state.darkTheme)
  const auth = useSelector((state: RootState) => state.authentication)
  const sideDrawer = useSelector((state: RootState) => state.sideDrawer)
  const [firstNotificationsRender, setFirstNotificationsRender]: any = useState(true)
  const authStore = useSelector((state: RootState) => state.authentication)
  const notificationsStore = useSelector((state: RootState) => state.notifications)

  // get notifications on page load
  useEffect(() => {
    if (firstNotificationsRender) {
      setFirstNotificationsRender(false)
      return
    }

    if (!notificationsStore.isLoaded) {
      store.dispatch.notifications.setLoaded(false)
      const notifications = loadNotificationsFromStorage(authStore.username)
      store.dispatch.notifications.setNotifications(notifications)
      store.dispatch.notifications.setLoaded(true)
    }
  }, [firstNotificationsRender, notificationsStore.isLoaded])

  console.log( 'mainPresence', mainPresence)
  const doLogout = async () => {
    const res = await logout()
    //// TODO logout api is currently authenticated. For this reason we must not check res.ok (this is a temporary workaround)

    // if (res && res.ok) {

    // Remove credentials from localstorage
    removeItem('credentials')
    // Reset the authentication store
    store.dispatch.authentication.reset()
    // Redirect to login page
    router.push('/login')

    // } ////
  }

  const toggleDarkTheme = () => {
    if (
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setTheme('light', auth.username)
    } else {
      setTheme('dark', auth.username)
    }
  }

  const openNotificationsDrawer = () => {
    store.dispatch.sideDrawer.update({
      isShown: true,
      contentType: 'notifications',
      config: null,
    })
  }
  const setPresence = async (presence: any) => {
    try{
      await changeStatusPresence(presence)
    }catch(err){
      console.log(err)
    }
  }

  const dropdownItems = (
    <>
      <div className='cursor-default'>
        <Dropdown.Header>
          <span className='block text-sm mb-1'>Signed in as</span>
          <span className='text-sm font-medium flex justify-between'>
            <span className='truncate pr-2'>{name}</span>
            <span className='text-sm font-normal'>{mainextension}</span>
          </span>
        </Dropdown.Header>
      </div>
      <Dropdown.Item
        icon={
          theme === 'dark' ||
          (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? faSun
            : faMoon
        }
        onClick={toggleDarkTheme}
      >
        {theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
          ? 'Switch to light theme'
          : 'Switch to dark theme'}
      </Dropdown.Item>
      <Popover className='relative hover:bg-gray-200 dark:hover:bg-gray-700'>
        {({ open }) => (
          <>
            <Popover.Button
              className={classNames(
                open ? '' : '',
                'relative text-left cursor-pointer px-4 py-2 text-sm flex items-center gap-3 w-full ',
              )}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                className='h-4 w-4 flex text-gray-500 dark:text-gray-400'
                aria-hidden='true'
              />
              Presence
            </Popover.Button>
            <Transition
              as={Fragment}
              enter='transition ease-out duration-200'
              enterFrom='opacity-0 translate-y-1'
              enterTo='opacity-100 translate-y-0'
              leave='transition ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 translate-y-1'
            >
              <Popover.Panel className='absolute mr-4 mt-0 right-0 z-10 w-screen max-w-md -translate-x-1/2 transform px-2 sm:px-0'>
                <div className='overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5'>
                  <div className='relative grid gap-6 bg-white dark:border-gray-700 dark:bg-gray-900 px-5 py-6 sm:gap-8 sm:p-8'>
                    {solutions.map((item) => (
                      <a
                        key={item.status}
                        href={item.href}
                        onClick={() => setPresence(item.name)}
                        className='-m-3 flex items-start rounded-lg p-3 transition duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700'
                      >
                        <div className='ml-4' >
                          <p className='text-base font-medium'>{item.status}</p>
                          <p className='mt-1 text-sm text-gray-500'>{item.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
      <Dropdown.Item icon={faArrowRightFromBracket} onClick={doLogout}>
        Logout
      </Dropdown.Item>
    </>
  )

  return (
    <header className='w-full'>
      <div className='relative z-10 flex h-16 flex-shrink-0 border-b shadow-sm border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
        <button
          type='button'
          className='border-r px-4 focus:outline-none focus:ring-2 focus:ring-inset md:hidden focus:ring-primaryLight border-gray-200 text-gray-500 dark:focus:ring-primaryDark dark:border-gray-700 dark:text-gray-400'
          onClick={openMobileCb}
        >
          <span className='sr-only'>Open sidebar</span>
          <FontAwesomeIcon icon={faBars} className='h-5 w-5' aria-hidden='true' />
        </button>
        <div className='flex flex-1 justify-between px-4 sm:px-6'>
          <div className='flex flex-1'>
            <form className='flex w-full md:ml-0' action='#' method='GET'>
              <label htmlFor='search-field' className='sr-only'>
                Find and call
              </label>
              <div className='relative w-full text-gray-400 focus-within:text-gray-600 dark:text-gray-500 dark:focus-within:text-gray-300'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center'>
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className='h-4 w-4 flex-shrink-0'
                    aria-hidden='true'
                  />
                </div>
                <input
                  name='search-field'
                  id='search-field'
                  className='h-full w-full border-transparent py-2 pl-8 pr-3 text-base focus:border-transparent focus:outline-none focus:ring-0 bg-white focus:placeholder-gray-400 text-gray-900 placeholder-gray-500 dark:bg-gray-900 dark:focus:placeholder-gray-500 dark:text-gray-100 dark:placeholder-gray-400'
                  placeholder='Call'
                  type='search'
                />
              </div>
            </form>
          </div>
          <div className='ml-2 flex items-center space-x-2'>
            {/* Notifications drawer */}
            <Button variant='ghost' onClick={() => openNotificationsDrawer()}>
              <span className='relative inline-block'>
                <FontAwesomeIcon
                  icon={faBell}
                  className={
                    'h-5 w-5 py-1 px-0.5 flex-shrink-0 ' +
                    (sideDrawer.isShown && sideDrawer.contentType === 'notifications'
                      ? ' text-primary dark:text-primary'
                      : ' text-gray-500 dark:text-gray-400')
                  }
                  aria-hidden='true'
                />
                {/* badge with notifications number */}
                {notificationsStore.unreadCount > 0 && (
                  <span
                    className={
                      'absolute flex justify-center items-center top-1.5 right-0.5 h-4 -translate-y-1/2 translate-x-1/2 transform rounded-full text-xs ring-2 ring-white dark:ring-gray-700 text-white bg-red-500 ' +
                      (notificationsStore.unreadCount < 10 ? 'w-4' : 'w-6')
                    }
                  >
                    <span>
                      {notificationsStore.unreadCount < 10 ? notificationsStore.unreadCount : '9+'}
                    </span>
                  </span>
                )}
              </span>
            </Button>
            {/* Profile dropdown */}
            <Dropdown items={dropdownItems} position='left' divider={true} className='pl-3'>
              <span className='sr-only'>Open user menu</span>
              <Avatar
                rounded='full'
                src={avatar}
                placeholderType='person'
                size='small'
                status={mainPresence || 'offline'}
              />
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  )
}
