// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { RootState } from '../store'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { savePreference, loadPreference } from '../lib/storage'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { VoicemailInbox } from '../components/history/voicemail inbox/VoicemailInbox'
import { Calls } from '../components/history/calls/Calls'
import { isEmpty } from 'lodash'

interface tabsType {
  name: string
  href: string
  current: boolean
}

const History: NextPage = () => {
  const { t } = useTranslation()
  const profile = useSelector((state: RootState) => state.user)
  const auth = useSelector((state: RootState) => state.authentication)

  const [items, setItems] = useState<tabsType[]>([])
  const [currentSection, setCurrentSection] = useState<string>('')
  const [userPreference, setUserPreference] = useState<string>('')

  useEffect(() => {
    if (!auth.username) return

    const savedTab = loadPreference('historySelectedTab', auth.username)
    if (savedTab) {
      setUserPreference(savedTab)
    }
  }, [auth.username])

  useEffect(() => {
    if (!profile || !auth.username) return

    const newTabs: tabsType[] = [
      { name: 'Calls', href: '#', current: false },
      ...(!isEmpty(profile?.endpoints?.voicemail)
        ? [{ name: 'Voicemail inbox', href: '#', current: false }]
        : []),
    ]

    const preferenceAvailable = userPreference && newTabs.some((tab) => tab.name === userPreference)

    let tabToSelect: any

    if (preferenceAvailable) {
      tabToSelect = userPreference
    } else {
      tabToSelect = newTabs[0].name
    }

    const updatedTabs = newTabs.map((tab) => ({
      ...tab,
      current: tab.name === tabToSelect,
    }))

    setItems(updatedTabs)
    setCurrentSection(tabToSelect)
  }, [profile, auth.username, userPreference])

  const changeSection = (sectionName: string) => {
    if (!items.some((item) => item.name === sectionName)) {
      if (items.length > 0) {
        sectionName = items[0].name
      } else {
        return
      }
    }

    const currentItems = items.map((route) => ({
      ...route,
      current: sectionName === route.name,
    }))

    setUserPreference(sectionName)
    setItems(currentItems)
    setCurrentSection(sectionName)

    if (auth.username) {
      savePreference('historySelectedTab', sectionName, auth.username)
    }
  }

  return (
    <>
      <div className='mb-6 gap-8'>
        <h1 className='text-2xl font-semibold text-title dark:text-titleDark'>
          {t('History.History')}
        </h1>
        {/* mobile tabs */}
        <div className='sm:hidden'>
          <label htmlFor='tabs' className='sr-only'>
            {t('Queues.Select a tab')}
          </label>
          <select
            id='tabs'
            name='tabs'
            className='block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primaryDark dark:focus:ring-primaryDark dark:bg-gray-900'
            defaultValue={currentSection}
            onChange={(event) => changeSection(event.target.value)}
          >
            {items.map((item) => (
              <option key={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
        {/* desktop tabs */}
        <div className='hidden sm:block overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
          <div className='border-b border-gray-300 dark:border-gray-600'>
            <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
              {items.map((item: any) => (
                <a
                  key={item.name}
                  onClick={() => changeSection(item.name)}
                  className={classNames(
                    item.name === currentSection
                      ? 'border-primary dark:border-primaryDark text-primary dark:text-primaryDark'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600',
                    'cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {t(`History.${item.name}`)}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div>
        {currentSection === 'Calls' ? (
          <Calls />
        ) : currentSection === 'Voicemail inbox' ? (
          <VoicemailInbox />
        ) : null}
      </div>
    </>
  )
}

export default History
