// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { QueuesManagementView, CallsView, StatisticsView } from '../components/queues'
import { InlineNotification } from '../components/common'
import { useSelector } from 'react-redux'
import { RootState, store } from '../store'

const Queues: NextPage = () => {
  const { t } = useTranslation()
  const queuesStore = useSelector((state: RootState) => state.queues)
  const [currentTab, setCurrentTab] = useState('queues')

  const tabs = [
    { name: t('Queues.Queues management'), value: 'queues' },
    { name: t('Queues.Calls'), value: 'calls' },
    { name: t('Queues.Statistics'), value: 'stats' },
  ]

  const changeTab = (tabName: string) => {
    const selectedTab = tabs.find((tab) => tab.name === tabName)

    if (selectedTab) {
      setCurrentTab(selectedTab.value)
    }
  }

  // load queues when navigating to queues page
  useEffect(() => {
    store.dispatch.queues.setLoaded(false)
  }, [])

  return (
    <>
      <div>
        <h1 className='text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100'>
          {t('Queues.Queues')}
        </h1>
        {/* queues error */}
        {queuesStore.errorMessage && (
          <InlineNotification type='error' title={queuesStore.errorMessage}></InlineNotification>
        )}
        {/* tabs */}
        {!queuesStore.errorMessage && (
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
                  className='block w-full rounded-md py-2 pl-3 pr-10 text-base focus:outline-none sm:text-sm border-gray-300 focus:border-primary focus:ring-primary dark:border-gray-600 dark:focus:border-primary dark:focus:ring-primary dark:bg-gray-900'
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
              {currentTab === 'queues' ? (
                <QueuesManagementView />
              ) : currentTab === 'calls' ? (
                <CallsView />
              ) : currentTab === 'stats' ? (
                <StatisticsView />
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default Queues
