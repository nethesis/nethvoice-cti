// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The top bar
 *
 */

import { FC } from 'react'
import { Avatar, Dropdown } from '../common'
import { logout } from '../../services/login'
import { useRouter } from 'next/router'
import { removeItem } from '../../lib/storage'
import { store } from '../../store'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faArrowRightFromBracket,
  faBars,
} from '@fortawesome/free-solid-svg-icons'

interface TopBarProps {
  openMobileCb: () => void
}

export const TopBar: FC<TopBarProps> = ({ openMobileCb }) => {
  const router = useRouter()
  const { name, mainextension, mainPresence } = useSelector((state: RootState) => state.user)

  const doLogout = async () => {
    const res = await logout()
    if (res && res.ok) {
      // Remove credentials from localstorage
      removeItem('credentials')
      // Reset the authentication store
      store.dispatch.authentication.reset()
      // Redirect to login page
      router.push('/login')
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
      <Dropdown.Item icon={faArrowRightFromBracket} onClick={doLogout}>
        Logout
      </Dropdown.Item>
    </>
  )

  return (
    <header className='w-full'>
      <div className='relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm'>
        <button
          type='button'
          className='border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primaryLight md:hidden'
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
              <div className='relative w-full text-gray-400 focus-within:text-gray-600'>
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
                  className='h-full w-full border-transparent py-2 pl-8 pr-3 text-base text-gray-900 placeholder-gray-500 focus:border-transparent focus:placeholder-gray-400 focus:outline-none focus:ring-0'
                  placeholder='Call'
                  type='search'
                />
              </div>
            </form>
          </div>
          <div className='ml-2 flex items-center space-x-4 sm:ml-6 sm:space-x-6'>
            {/* Profile dropdown */}
            <Dropdown items={dropdownItems} position='left' divider={true}>
              <span className='sr-only'>Open user menu</span>
              <Avatar
                rounded='full'
                src='https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                unoptimized={true}
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
