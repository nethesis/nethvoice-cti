// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The top bar
 *
 */

import React from 'react'

import { FC, useEffect, useState, createRef, RefObject } from 'react'

import { Avatar, Dropdown, Modal, TextInput, Button, Badge } from '../common'
import { doLogout } from '../../services/login'
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
  faUser,
  faHeadset,
  faMobile,
  faCheck,
  faVoicemail,
  faArrowRight,
  faDesktop,
} from '@fortawesome/free-solid-svg-icons'
import { getUserInfo } from '../../services/user'
import { setTheme } from '../../lib/darkTheme'
import { loadNotificationsFromStorage } from '../../lib/notifications'
import { GlobalSearch } from './GlobalSearch'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'
import { isEmpty } from 'lodash'
import { setMainDevice } from '../../lib/devices'
import { eventDispatch } from '../../lib/hooks/eventDispatch'

interface TopBarProps {
  openMobileCb: () => void
}

export const TopBar: FC<TopBarProps> = ({ openMobileCb }) => {
  const { name, mainextension, mainPresence, avatar } = useSelector(
    (state: RootState) => state?.user,
  )
  const { theme } = useSelector((state: RootState) => state.darkTheme)
  const auth = useSelector((state: RootState) => state.authentication)
  const sideDrawer = useSelector((state: RootState) => state.sideDrawer)
  const [firstNotificationsRender, setFirstNotificationsRender]: any = useState(true)
  const authStore = useSelector((state: RootState) => state.authentication)
  const notificationsStore = useSelector((state: RootState) => state.notifications)
  const operators = useSelector((state: RootState) => state.operators.operators)
  const profile = useSelector((state: RootState) => state.user)

  const [mainDeviceType, setMainDeviceType] = useState('')
  const [noMobileListDevice, setNoMobileListDevice]: any = useState([])

  // Check wich type of device is the main device
  // also filter all the device except the mobile one
  useEffect(() => {
    if (profile?.endpoints) {
      let extensionObj: any = profile.endpoints
      if (profile?.default_device?.id && !isEmpty(extensionObj)) {
        const extensionType = extensionObj.extension.find(
          (ext: any) => ext.id === profile?.default_device?.id,
        )
        if (extensionType?.type !== '') {
          setMainDeviceType(extensionType?.type)
        }
      }
      if (!isEmpty(extensionObj)) {
        const filteredDevices = extensionObj?.extension?.filter(
          (device: any) => device?.type !== 'mobile',
        )
        setNoMobileListDevice(filteredDevices)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.default_device])

  const { t } = useTranslation()

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
            default_device: userInfo.data.default_device,
            name: userInfo.data.name,
            username: userInfo.data.username,
            mainextension: userInfo.data.endpoints.mainextension[0].id,
            mainPresence: userInfo.data.mainPresence,
            endpoints: userInfo.data.endpoints,
            profile: userInfo.data.profile,
            avatar: userInfo.data.settings.avatar,
            settings: userInfo?.data?.settings,
            recallOnBusy: userInfo?.data?.recallOnBusy,
            lkhash: userInfo?.data?.lkhash,
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
          default_device: userInfo.data.default_device,
          name: userInfo.data.name,
          username: userInfo.data.username,
          mainextension: userInfo.data.endpoints.mainextension[0].id,
          mainPresence: userInfo.data.mainPresence,
          endpoints: userInfo.data.endpoints,
          profile: userInfo.data.profile,
          avatar: userInfo.data.settings.avatar,
          settings: userInfo?.data?.settings,
          recallOnBusy: userInfo?.data?.recallOnBusy,
          lkhash: userInfo?.data?.lkhash,
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

  const disconnectionFunction = () => {
    let emptyObjectLogout: any = {}
    doLogout(emptyObjectLogout)
  }

  const setMainDeviceId = async (device: any, deviceType: string, deviceInformationObject: any) => {
    let deviceIdInfo: any = {}
    if (device) {
      deviceIdInfo.id = device
      try {
        await setMainDevice(deviceIdInfo)
        dispatch.user.updateDefaultDevice(deviceIdInfo)
        if (deviceType === 'webrtc') {
          eventDispatch('phone-island-attach', { deviceInformationObject })
        } else {
          eventDispatch('phone-island-detach', { deviceInformationObject })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const dropdownItems = (
    <>
      <div className='cursor-default'>
        <Dropdown.Header>
          <span className='block text-sm mb-1 text-dropdownText dark:text-dropdownTextDark'>
            {t('TopBar.Signed in as')}
          </span>
          <span className='text-sm font-medium flex justify-between text-dropdownText dark:text-dropdownTextDark'>
            <span className='truncate pr-2'>{name}</span>
            <span className='text-sm font-normal'>{mainextension}</span>
          </span>
        </Dropdown.Header>
      </div>
      {/* Divider */}
      <div className='relative pt-2'>
        <div className='absolute inset-0 flex items-center' aria-hidden='true'>
          <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
        </div>
      </div>
      {/* Choose presence */}
      <Popover className='md:relative hover:bg-gray-200 dark:hover:bg-gray-700'>
        {({ open }) => (
          <>
            <Popover.Button
              className={classNames(
                open ? '' : '',
                'relative text-left cursor-pointer px-5 py-2 text-sm flex items-center gap-3 w-full text-dropdownText dark:text-dropdownTextDark',
              )}
            >
              <StatusDot status={mainPresence} className='flex mr-1' />
              <span className='text-sm font-normal'>{t('TopBar.Presence')}</span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className='ml-auto h-4 w-4 flex justify-center'
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
                  <div className='relative bg-dropdownBg dark:bg-dropdownBgDark dark:border-gray-700 py-2'>
                    <Dropdown.Item onClick={() => setPresence('online')}>
                      <div className='text-dropdownText dark:text-dropdownTextDark'>
                        <div className='flex items-center'>
                          <StatusDot status='online' className='flex mr-2' />
                          <p className='flex text-sm font-medium'>{t('TopBar.Online')}</p>
                        </div>
                        <p className='text-sm mt-2'>{t('TopBar.Make and receive phone calls')}</p>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setPresence('callforward')}>
                      <div className='text-dropdownText dark:text-dropdownTextDark'>
                        <div className='flex items-center'>
                          <StatusDot status='callforward' className='flex mr-2' />
                          <p className='flex text-sm font-medium'> {t('TopBar.Call forward')}</p>
                          <FontAwesomeIcon icon={faArrowRight} className='h-4 w-4 ml-2' />
                        </div>
                        <p className='text-sm mt-2'>
                          {t('TopBar.Forward incoming calls to another phone number')}
                        </p>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setPresence('voicemail')}>
                      <div className='text-dropdownText dark:text-dropdownTextDark'>
                        <div className='flex items-center'>
                          <StatusDot status='voicemail' className='flex mr-2' />
                          <p className='flex text-sm font-medium'> {t('TopBar.Voicemail')}</p>
                          <FontAwesomeIcon icon={faVoicemail} className='h-4 w-4 ml-2' />
                        </div>
                        <p className='text-sm mt-2'>{t('TopBar.Activate voicemail')}</p>
                      </div>
                    </Dropdown.Item>
                    <div className='relative py-2'>
                      <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                        <div className='w-full border-t border-gray-300 dark:border-gray-600' />
                      </div>
                    </div>
                    <Dropdown.Item onClick={() => setPresence('dnd')}>
                      <div className='text-dropdownText dark:text-dropdownTextDark'>
                        <div className='flex items-center'>
                          <StatusDot status='dnd' className='flex mr-2' />
                          <p className='flex text-sm font-medium'>{t('TopBar.Do not disturb')}</p>
                        </div>
                        <p className='text-sm mt-2'>{t('TopBar.Do not receive any calls')}</p>
                      </div>
                    </Dropdown.Item>
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>

      {/* Choose main device */}
      <Popover className='md:relative hover:bg-gray-200 dark:hover:bg-gray-700'>
        {({ open }) => (
          <>
            <Popover.Button
              className={classNames(
                open ? '' : '',
                'relative text-left cursor-pointer px-5 py-2 text-sm flex items-center gap-3 w-full text-dropdownText dark:text-dropdownTextDark',
              )}
            >
              <FontAwesomeIcon
                icon={
                  mainDeviceType === 'webrtc'
                    ? faHeadset
                    : mainDeviceType === 'physical'
                    ? faOfficePhone
                    : mainDeviceType === 'nethlink'
                    ? faDesktop
                    : faHeadset
                }
                className='ml-[-0.2rem] h-4 w-4 flex justify-center '
              />
              <span className='text-sm font-normal'>{t('TopBar.Main device')}</span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className='ml-auto h-4 w-4 flex justify-center'
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
              {/* List of device to choose */}
              <Popover.Panel className='absolute sm:mr-[4.788rem] sm:-mt-10 right-0 z-10 w-screen max-w-xs sm:-translate-x-1/2 transform px-0.5 sm:px-1 xs:mr-[6rem] '>
                <div className='overflow-hidden shadow-lg ring-1 ring-gray-200 dark:ring-gray-700 ring-opacity-1 rounded-md'>
                  <div className='relative bg-white dark:border-gray-700 dark:bg-gray-900 py-2'>
                    {noMobileListDevice.map((device: any) => (
                      <Dropdown.Item
                        key={device?.id}
                        onClick={() => setMainDeviceId(device?.id, device?.type, device)}
                      >
                        <div className='truncate'>
                          <div className='flex items-center space-x-2'>
                            {device?.id === profile?.default_device?.id ? (
                              <FontAwesomeIcon
                                icon={faCheck}
                                className='ml-auto mr-2 h-4 w-4 flex justify-center text-primary dark:text-dropdownTextDark'
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faCheck}
                                className='ml-auto mr-2 h-4 w-4 flex justify-center text-primary dark:text-dropdownTextDark invisible select-none'
                              />
                            )}

                            <FontAwesomeIcon
                              icon={
                                device?.type === 'webrtc'
                                  ? faHeadset
                                  : device?.type === 'physical'
                                  ? faOfficePhone
                                  : faDesktop
                              }
                              className='ml-auto h-4 w-4 flex justify-center text-dropdownText dark:text-dropdownTextDark'
                            />
                            {device?.type === 'webrtc' && (
                              <p className='text-sm'>{t('Devices.Web phone')}</p>
                            )}
                            {device?.type === 'physical' && (
                              <p className='truncate flex text-sm font-medium max-w-[6rem] line-clamp-2'>
                                {device?.description || t('Devices.IP phone')}
                              </p>
                            )}
                            {device?.type === 'nethlink' && (
                              <p className='flex text-sm font-medium line-clamp-2'>
                                {t('Devices.PhoneLink')}
                              </p>
                            )}
                          </div>
                        </div>
                      </Dropdown.Item>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>

      {/* profile picture redirect */}
      <Dropdown.Item icon={faUser}>
        <Link href={{ pathname: '/settings', query: { section: 'Profile picture' } }}>
          <a>{t('Settings.Profile picture')}</a>
        </Link>
      </Dropdown.Item>
      {/* Divider */}
      <div className='relative pt-2'>
        <div className='absolute inset-0 flex items-center' aria-hidden='true'>
          <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
        </div>
      </div>

      {/* toggle light/dark theme  */}
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
          ? `${t('TopBar.Switch to light theme')}`
          : `${t('TopBar.Switch to dark theme')}`}
      </Dropdown.Item>
      <Dropdown.Item icon={faArrowRightFromBracket} onClick={() => disconnectionFunction()}>
        {t('TopBar.Logout')}
      </Dropdown.Item>
    </>
  )

  return (
    <header className='w-full'>
      <div className='relative z-50 flex h-16 flex-shrink-0 border-b shadow-sm border-gray-200 dark:border-gray-700 bg-topbar dark:bg-topbarDark'>
        <button
          type='button'
          className='border-r px-4 focus:outline-none focus:ring-2 focus:ring-inset md:hidden focus:ring-primaryLight border-gray-200 text-gray-500 dark:focus:ring-primaryDark dark:border-gray-700 dark:text-gray-400'
          onClick={openMobileCb}
        >
          <span className='sr-only'>{t('TopBar.Open sidebar')}</span>
          <FontAwesomeIcon icon={faBars} className='h-5 w-5' aria-hidden='true' />
        </button>
        <div className='flex flex-1 justify-end px-4 sm:px-6'>
          <GlobalSearch />
          <div className='ml-2 flex items-center space-x-2'>
            {/* status badge ( voicemail or callforward) */}
            {(mainPresence === 'callforward' || mainPresence === 'voicemail') && (
              <Badge
                variant={mainPresence === 'callforward' ? 'callforward' : 'voicemail'}
                rounded='full'
                size='small'
              >
                <span>
                  {mainPresence === 'callforward'
                    ? t('TopBar.Call forward')
                    : t('TopBar.Voicemail')}
                </span>
                <FontAwesomeIcon
                  icon={mainPresence === 'callforward' ? faArrowRight : faVoicemail}
                  className='h-4 w-4 ml-2 text-topBarText dark:text-topBarTextDark'
                  aria-hidden='true'
                />
              </Badge>
            )}

            {/* Notifications drawer */}
            <Button variant='ghost' onClick={() => openNotificationsDrawer()}>
              <span className='relative inline-block'>
                <FontAwesomeIcon
                  icon={faBell}
                  className={
                    'h-5 w-5 py-1 px-0.5 flex-shrink-0 ' +
                    (sideDrawer?.isShown && sideDrawer?.contentType === 'notifications'
                      ? ' text-primary dark:text-primaryDark'
                      : ' text-topBarText dark:text-topBarTextDark')
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
            <Dropdown items={dropdownItems} position='left' className='pl-3'>
              <span className='sr-only'>{t('TopBar.Open user menu')}</span>
              <Avatar
                size='small'
                rounded='full'
                placeholderType='person'
                src={operators[profile?.username]?.avatarBase64}
                status={operators[profile?.username]?.mainPresence}
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
                    {t('TopBar.Enter phone number for call forward')}
                  </h3>
                  <div className='mt-3 flex flex-col gap-2'>
                    <TextInput
                      placeholder={t('Common.Phone number') || ''}
                      name='number'
                      ref={numberInputRef}
                    />
                  </div>
                </div>
              </Modal.Content>
              <Modal.Actions>
                <Button variant='primary' onClick={() => closedModalSaved()}>
                  {t('Common.Save')}
                </Button>
                <Button variant='white' onClick={() => setShowPresenceModal(false)}>
                  {t('Common.Cancel')}
                </Button>
              </Modal.Actions>
            </form>
          </Modal>
        </div>
      </div>
    </header>
  )
}
