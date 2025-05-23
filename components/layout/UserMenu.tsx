import React from 'react'
import { Dropdown } from '../common'
import { faArrowRightFromBracket, faUser, faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { PresenceMenu } from './PresenceMenu'
import { DeviceMenu } from './DeviceMenu'

interface UserMenuProps {
  name: string
  mainextension: string
  mainPresence: string
  profile: any
  phoneLinkData: any[]
  operatorsStore: any
  theme: string
  mainDeviceType: string
  noMobileListDevice: any[]
  toggleDarkTheme: () => void
  setPresence: (presence: string) => void
  setForwardPresence: (number: string) => void
  setMainDeviceId: (device: any) => void
  disconnectionFunction: () => void
}

export const UserMenu: React.FC<UserMenuProps> = ({
  name,
  mainextension,
  mainPresence,
  profile,
  phoneLinkData,
  operatorsStore,
  theme,
  mainDeviceType,
  noMobileListDevice,
  toggleDarkTheme,
  setPresence,
  setForwardPresence,
  setMainDeviceId,
  disconnectionFunction,
}) => {
  const { t } = useTranslation()

  return (
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
          <div className='w-full border-t border-gray-300 dark:border-gray-700' />
        </div>
      </div>

      {/* Presence Menu */}
      <PresenceMenu
        mainPresence={mainPresence}
        profile={profile}
        setPresence={setPresence}
        setForwardPresence={setForwardPresence}
      />

      {/* Device Menu */}
      <DeviceMenu
        mainDeviceType={mainDeviceType}
        noMobileListDevice={noMobileListDevice}
        profile={profile}
        phoneLinkData={phoneLinkData}
        operatorsStore={operatorsStore}
        setMainDeviceId={setMainDeviceId}
      />

      {/* Profile picture redirect */}
      <Link href={{ pathname: '/settings', query: { section: 'Profile picture' } }}>
        <Dropdown.Item icon={faUser}>
          <span>{t('Settings.Profile picture')}</span>
        </Dropdown.Item>
      </Link>

      {/* Divider */}
      <div className='relative pt-2'>
        <div className='absolute inset-0 flex items-center' aria-hidden='true'>
          <div className='w-full border-t border-gray-300 dark:border-gray-700' />
        </div>
      </div>

      {/* Toggle light/dark theme */}
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

      {/* Logout */}
      <Dropdown.Item icon={faArrowRightFromBracket} onClick={disconnectionFunction}>
        {t('TopBar.Logout')}
      </Dropdown.Item>
    </>
  )
}
