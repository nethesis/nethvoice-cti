// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { RootState, store } from '../store'
import { LinesView, AnnouncementView, RulesView } from '../components/lines'

const Lines: NextPage = () => {
  const { t } = useTranslation()
  const [currentTab, setCurrentTab] = useState('lines')

  const tabs = [
    { name: t('Lines.Lines management'), value: 'lines' },
    { name: t('Lines.Ads'), value: 'ads' },
    // { name: t('Lines.Rules'), value: 'rules' },
  ]

  const changeTab = (tabName: string) => {
    const selectedTab = tabs.find((tab) => tab.name === tabName)

    if (selectedTab) {
      setCurrentTab(selectedTab.value)
    }
  }

  useEffect(() => {
    store.dispatch.lines.setLoaded(false)
  }, [])

  return (
    <>
      <div>
        <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>
          {t('Applications.Phone lines and announcements')}
        </h1>
        {/* tabs */}
        <>
          <div className='mb-6'>
            {/* mobile tabs */}
            <div className='sm:hidden'>
              <label htmlFor='tabs' className='sr-only'>
                {t('Queues.Select a tab')}
              </label>
              <select
                id='tabs'
                name='tabs'
                className='block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:bg-gray-900'
                defaultValue={currentTab}
                onChange={(event) => changeTab(event.target.value)}
              >
                {tabs.map((tab) => (
                  <option key={tab.value}>{tab.name}</option>
                ))}
              </select>
            </div>
            {/* desktop tabs */}
            <div className='hidden sm:block'>
              <div className='border-b border-gray-300 dark:border-gray-600'>
                <nav className='-mb-px flex space-x-8' aria-label='Tabs'>
                  {tabs.map((tab) => (
                    <a
                      key={tab.name}
                      onClick={() => changeTab(tab.name)}
                      className={classNames(
                        tab.value === currentTab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600',
                        'cursor-pointer whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                      )}
                      aria-current={tab.value === currentTab ? 'page' : undefined}
                    >
                      {tab.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          <div>
            {currentTab === 'lines' ? (
              <LinesView />
            ) : currentTab === 'ads' ? (
              <AnnouncementView />
            ) : // ) : currentTab === 'rules' ? (
            //   <RulesView />
            null}
          </div>
        </>
      </div>
    </>
  )
}

export default Lines
