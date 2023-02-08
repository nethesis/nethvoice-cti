// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The top bar
 *
 */

import React from 'react'

import { FC, useEffect, useState, createRef, RefObject } from 'react'

import { Avatar, Dropdown, Modal, TextInput, Button } from '../common'
import { logout } from '../../services/login'
import { useRouter } from 'next/router'
import { removeItem } from '../../lib/storage'
import { store } from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, Dispatch } from '../../store'
import classNames from 'classnames'
import { changeStatusPresence, forwardStatus } from '../../lib/topBar'
import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { StatusDot } from '../common'
import {
  faArrowRightFromBracket,
  faBars,
  faSun,
  faMoon,
  faBell,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons'
import { getUserInfo } from '../../services/user'
import { setTheme } from '../../lib/darkTheme'
import { loadNotificationsFromStorage } from '../../lib/notifications'
import { GlobalSearch } from './GlobalSearch'

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

  const dispatch = useDispatch<Dispatch>()

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

  const [showPresenceModal, setShowPresenceModal] = React.useState(false)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPresenceModal(false)
  }
  const numberInputRef: RefObject<HTMLInputElement> = createRef()

  function showModalPresence() {
    setShowPresenceModal(true)
  }

  const setPresence = async (presence: any) => {
    if (presence === 'callforward') {
      showModalPresence()
    } else {
      try {
        await changeStatusPresence(presence)
        const userInfo = await getUserInfo()

        if (userInfo && userInfo.data) {
          dispatch.user.update({
            name: userInfo.data.name,
            username: userInfo.data.username,
            mainextension: userInfo.data.endpoints.mainextension[0].id,
            mainPresence: userInfo.data.mainPresence,
            endpoints: userInfo.data.endpoints,
            avatar: userInfo.data.settings.avatar,
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const setForwardPresence = async (number: any) => {
    let presence: any = 'callforward'
    try {
      await forwardStatus(presence, number)
      const userInfo = await getUserInfo()

      if (userInfo && userInfo.data) {
        dispatch.user.update({
          name: userInfo.data.name,
          username: userInfo.data.username,
          mainextension: userInfo.data.endpoints.mainextension[0].id,
          mainPresence: userInfo.data.mainPresence,
          endpoints: userInfo.data.endpoints,
          avatar: userInfo.data.settings.avatar,
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const closedModalSaved = () => {
    setShowPresenceModal(false)
    setForwardPresence(numberInputRef.current?.value)
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
      <Popover className='md:relative hover:bg-gray-200 dark:hover:bg-gray-700'>
        {({ open }) => (
          <>
            <Popover.Button
              className={classNames(
                open ? '' : '',
                'relative text-left cursor-pointer px-5 py-2 text-sm flex items-center gap-3 w-full ',
              )}
            >
              <StatusDot status={mainPresence} className='flex' />
              Presence
              <FontAwesomeIcon
                icon={faChevronRight}
                className='ml-auto h-3 w-3 flex justify-center text-gray-400 dark:text-gray-500'
              />
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
              <Popover.Panel className='absolute sm:mr-[4.788rem] sm:-mt-10 right-0 z-10 w-screen max-w-xs sm:-translate-x-1/2 transform px-0.5 sm:px-1 xs:mr-[6rem] '>
                <div className='overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 ring-opacity-1 rounded-md'>
                  <div className='relative bg-white dark:border-gray-700 dark:bg-gray-900 py-2'>
                    <a
                      className='flex px-5 py-3 items-start transition duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700'
                      onClick={() => setPresence('online')}
                    >
                      <div>
                        <div className='flex items-center'>
                          <StatusDot status='online' className='flex mr-2' />
                          <p className='flex text-sm font-medium'> Online</p>
                        </div>
                        <p className='text-sm text-gray-500'>Make and receive phone calls.</p>
                      </div>
                    </a>
                    <a
                      className='flex px-5 py-3 items-start transition duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700'
                      onClick={() => setPresence('callforward')}
                    >
                      <div className=''>
                        <div className='flex items-center'>
                          <StatusDot status='callforward' className='flex mr-2' />
                          <p className='flex text-sm font-medium'> Call forward</p>
                        </div>
                        <p className='text-sm text-gray-500'>
                          Forward incoming calls to another phone number.
                        </p>
                      </div>
                    </a>
                    <div className='relative py-2'>
                      <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                        <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
                      </div>
                    </div>
                    <a
                      className='flex px-5 py-3 items-start transition duration-150 ease-in-out hover:bg-gray-200 dark:hover:bg-gray-700'
                      onClick={() => setPresence('dnd')}
                    >
                      <div>
                        <div className='flex items-center'>
                          <StatusDot status='dnd' className='flex mr-2' />
                          <p className='flex text-sm font-medium'> Do not disturb</p>
                        </div>
                        <p className='text-sm text-gray-500'>Do not receive any calls.</p>
                      </div>
                    </a>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
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
        <div className='flex flex-1 justify-end px-4 sm:px-6'>
          <GlobalSearch />
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
                status={mainPresence}
              />
            </Dropdown>
          </div>
          <Modal
            show={showPresenceModal}
            focus={numberInputRef}
            onClose={() => setShowPresenceModal(false)}
          >
            <form onSubmit={handleSubmit}>
              <Modal.Content>
                <div className='mt-3 text-center sm:mt-0 sm:text-left w-full'>
                  <h3 className='text-lg font-medium leading-6 text-center text-gray-900 dark:text-gray-100'>
                    Enter phone number for call forward
                  </h3>
                  <div className='mt-3 flex flex-col gap-2'>
                    <TextInput placeholder='Phone number' name='number' ref={numberInputRef} />
                  </div>
                </div>
              </Modal.Content>
              <Modal.Actions>
                <Button variant='primary' onClick={() => closedModalSaved()}>
                  Save
                </Button>
                <Button variant='white' onClick={() => setShowPresenceModal(false)}>
                  Cancel
                </Button>
              </Modal.Actions>
            </form>
          </Modal>
        </div>
      </div>
    </header>
  )
}
