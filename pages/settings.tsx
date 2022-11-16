// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { RadioGroup } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPalette } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { setTheme } from '../lib/darkTheme'

const settingsMenu = [
  // { name: 'General', href: '#', icon: faGear, current: false }, ////
  { name: 'Theme', href: '#', icon: faPalette, current: true },
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

  const onChangeTheme = (newTheme: string) => {
    setTheme(newTheme)
  }

  return (
    <>
      <div>
        <div className='mx-auto max-w-screen-xl px-4 pt-4 pb-6 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 lg:pb-16'>
          <div className='overflow-hidden rounded-lg bg-white shadow'>
            <div className='divide-y divide-gray-200 lg:grid lg:grid-cols-12 lg:divide-y-0 lg:divide-x'>
              {/* settings menu */}
              <aside className='py-6 lg:col-span-3 dark:bg-gray-800'>
                <nav className='space-y-1'>
                  {settingsMenu.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-primaryLighter border-primaryLight text-primaryDark hover:bg-primaryLighter hover:text-primaryDark'
                          : 'border-transparent text-gray-900 hover:bg-gray-50 hover:text-gray-900',
                        'group border-l-4 px-3 py-2 flex items-center text-sm font-medium',
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={classNames(
                          item.current
                            ? 'text-primaryLight group-hover:text-primaryLight'
                            : 'text-gray-400 group-hover:text-gray-500',
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
              <form className='divide-y divide-gray-200 lg:col-span-9' action='#' method='POST'>
                {/* Profile section */}
                <div className='py-6 px-4 sm:p-6 lg:pb-8'>
                  <div>
                    <h2 className='text-lg font-medium leading-6 text-gray-900 mb-6'>Theme</h2>
                  </div>

                  <RadioGroup value={theme} onChange={onChangeTheme}>
                    {/* <RadioGroup.Label className='text-sm font-medium text-gray-900'> //// 
                      Theme
                    </RadioGroup.Label> */}
                    <div className='isolate mt-1 -space-y-px rounded-md bg-white shadow-sm'>
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
                                ? 'bg-primaryLighter border-primaryLight z-10'
                                : 'border-gray-200',
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
                                    : 'bg-white border-gray-300',
                                  active ? 'ring-2 ring-offset-2 ring-primary' : '',
                                  'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center',
                                )}
                                aria-hidden='true'
                              >
                                <span className='rounded-full bg-white w-1.5 h-1.5' />
                              </span>
                              <span className='ml-3 flex flex-col'>
                                <RadioGroup.Label
                                  as='span'
                                  className={classNames(
                                    checked ? 'text-primaryDarker' : 'text-gray-900',
                                    'block text-sm font-medium',
                                  )}
                                >
                                  {themeOption.title}
                                </RadioGroup.Label>
                                {themeOption.description && (
                                  <RadioGroup.Description
                                    as='span'
                                    className={classNames(
                                      checked ? 'text-primaryDark' : 'text-gray-500',
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
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings
