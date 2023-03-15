// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { formatDurationLoc } from '../../lib/dateTime'
import { DEFAULT_CALLS_LOAD_PERIOD, DEFAULT_CALLS_REFRESH_INTERVAL } from '../../lib/queuesLib'
import { loadPreference, savePreference } from '../../lib/storage'
import { RootState } from '../../store'
import { Button, RangeSlider } from '../common'

export const Queues = () => {
  const { t } = useTranslation()
  const [firstRender, setFirstRender]: any = useState(true)
  const [callsRefreshInterval, setCallsRefreshInterval]: any = useState(
    DEFAULT_CALLS_REFRESH_INTERVAL,
  )
  const [callsLoadPeriod, setCallsLoadPeriod]: any = useState(DEFAULT_CALLS_LOAD_PERIOD)
  const authStore = useSelector((state: RootState) => state.authentication)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }

    const refreshInterval =
      loadPreference('queuesCallsRefreshInterval', authStore.username) ||
      DEFAULT_CALLS_REFRESH_INTERVAL
    setCallsRefreshInterval(refreshInterval)

    const loadPeriod =
      loadPreference('queuesCallsLoadPeriod', authStore.username) || DEFAULT_CALLS_LOAD_PERIOD
    setCallsLoadPeriod(loadPeriod)
  }, [firstRender])

  const onChangeCallsRefreshInterval = (value: any) => {
    setCallsRefreshInterval(value)
  }

  const onAfterChangeCallsRefreshInterval = (value: any) => {
    savePreference('queuesCallsRefreshInterval', value, authStore.username)
  }

  const onChangeCallsLoadPeriod = (value: any) => {
    setCallsLoadPeriod(value)
  }

  const onAfterChangeCallsLoadPeriod = (value: any) => {
    savePreference('queuesCallsLoadPeriod', value, authStore.username)
  }

  const resetToDefaults = () => {
    setCallsRefreshInterval(DEFAULT_CALLS_REFRESH_INTERVAL)
    savePreference('queuesCallsRefreshInterval', DEFAULT_CALLS_REFRESH_INTERVAL, authStore.username)

    setCallsLoadPeriod(DEFAULT_CALLS_LOAD_PERIOD)
    savePreference('queuesCallsLoadPeriod', DEFAULT_CALLS_LOAD_PERIOD, authStore.username)
  }

  return (
    <>
      <section aria-labelledby='clear-cache-heading'>
        <div className='sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            <div>
              <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                {t('Settings.Queues')}
              </h2>
            </div>
            <div>
              <h4
                id='clear-cache-heading'
                className='text-sm font-medium leading-6 text-gray-900 dark:text-gray-100'
              >
                {t('Settings.Queue calls')}
              </h4>
              {/* calls refresh interval */}
              <p className='mt-5 text-sm text-gray-500 dark:text-gray-400'>
                {t('Settings.Refresh calls every')}:{' '}
                <span className='font-semibold'>{formatDurationLoc(callsRefreshInterval)}</span>
              </p>
              <div className='mt-2'>
                <RangeSlider
                  orientation='horizontal'
                  value={callsRefreshInterval}
                  min={20}
                  max={60}
                  step={5}
                  onChange={onChangeCallsRefreshInterval}
                  onAfterChange={onAfterChangeCallsRefreshInterval}
                  className='w-48 h-5'
                />
              </div>
              {/* calls load period */}
              <p className='mt-6 text-sm text-gray-500 dark:text-gray-400'>
                {t('Settings.Load calls of last')}:{' '}
                <span className='font-semibold'>
                  {formatDurationLoc(callsLoadPeriod * 60 * 60)}
                </span>
              </p>
              <div className='mt-2'>
                <RangeSlider
                  orientation='horizontal'
                  value={callsLoadPeriod}
                  min={1}
                  max={12}
                  step={1}
                  onChange={onChangeCallsLoadPeriod}
                  onAfterChange={onAfterChangeCallsLoadPeriod}
                  className='w-48 h-5'
                />
              </div>
              {/* reset to defaults */}
              <Button variant='white' className='mt-5' onClick={resetToDefaults}>
                {t('Common.Reset to defaults')}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
