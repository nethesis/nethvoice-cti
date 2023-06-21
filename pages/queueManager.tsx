// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { StatisticsView } from '../components/queues'
import { QueueManagerDashboard } from '../components/queueManager/QueueManagerDashboard'
import { QueueManagement } from '../components/queueManager/QueueManagement'
import { NotManagedCalls } from '../components/queueManager/NotManagedCalls'
import { RealTimeManagement } from '../components/queueManager/RealTimeManagement'
import { Summary } from '../components/queueManager/Summary'
import { Monitor } from '../components/queueManager/Monitor'
import { useSelector } from 'react-redux'
import { RootState, store } from '../store'

const QueueManager: NextPage = () => {
  const { t } = useTranslation()
  const queuesStore = useSelector((state: RootState) => state.queues)
  const [currentTab, setCurrentTab] = useState('live')

  const tabs = [
    { name: t('QueueManager.Dashboard'), value: 'dashboard' },
    { name: t('QueueManager.Queues management'), value: 'queueManagement' },
    { name: t('QueueManager.Not managed calls'), value: 'notManagedCalls' },
    { name: t('QueueManager.Live'), value: 'live' },
    { name: t('QueueManager.Summary'), value: 'summary' },
    { name: t('QueueManager.Monitor'), value: 'monitor' },
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
          {t('QueueManager.Queue manager')}
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
            {currentTab === 'dashboard' ? (
              <QueueManagerDashboard />
            ) : currentTab === 'queueManagement' ? (
              <QueueManagement />
            ) : currentTab === 'notManagedCalls' ? (
              <NotManagedCalls />
            ) : currentTab === 'live' ? (
              <RealTimeManagement />
            ) : currentTab === 'summary' ? (
              <Summary />
            ) : currentTab === 'monitor' ? (
              <Monitor />
            ) : null}
          </div>
        </>
      </div>
    </>
  )
}

export default QueueManager