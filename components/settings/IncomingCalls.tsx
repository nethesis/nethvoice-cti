// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { loadPreference, savePreference } from '../../lib/storage'
import CopyComponent from '../common/CopyComponent'
import { InlineNotification, TextInput } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { getParamUrl } from '../../services/user'
import { setIncomingCallsPreference } from '../../lib/incomingCall'

// URL opening trigger options
const TRIGGER_RINGING = 'ringing'
const TRIGGER_ANSWERED = 'answered'
const TRIGGER_BUTTON = 'button'
const TRIGGER_NEVER = 'never'

export const IncomingCalls = () => {
  const { t } = useTranslation()
  const authStore = useSelector((state: RootState) => state.authentication)
  const userStore = useSelector((state: RootState) => state.user)
  const dispatch = useDispatch()

  const [callUrl, setCallUrl] = useState<string>('')
  const [urlTrigger, setUrlTrigger] = useState<string>(TRIGGER_NEVER)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [paramUrlError, setParamUrlError] = useState<string>('')

  // Default URL in case API fails
  const defaultExampleUrl = 'https://www.example.com/customers?phone={phone}'

  // Load URL from API and saved preferences
  useEffect(() => {
    const fetchParamUrl = async () => {
      setIsLoading(true)
      try {
        const response = await getParamUrl()
        const apiUrl = response?.data?.url || defaultExampleUrl

        // Once API URL is loaded, check for saved preferences
        const savedUrl = loadPreference('incomingCallUrl', authStore.username) || apiUrl
        setCallUrl(savedUrl)

        // Determine trigger value from store or localStorage with fallback
        let triggerValue = TRIGGER_NEVER

        // Check if there's a value stored in user settings
        if (userStore.settings?.open_param_url) {
          triggerValue = userStore.settings.open_param_url
        } else {
          // Otherwise check localStorage
          const savedTrigger = loadPreference('incomingCallTrigger', authStore.username)
          if (savedTrigger) {
            triggerValue = savedTrigger
          }
        }

        setUrlTrigger(triggerValue)
        savePreference('incomingCallTrigger', triggerValue, authStore.username)

        setParamUrlError('')
      } catch (error) {
        setParamUrlError('Cannot retrieve URL configuration')

        // Use default example and saved preferences as fallback
        const savedUrl = loadPreference('incomingCallUrl', authStore.username) || defaultExampleUrl
        setCallUrl(savedUrl)

        // Fallback for trigger value
        let triggerValue = TRIGGER_NEVER
        if (userStore.settings?.open_param_url) {
          triggerValue = userStore.settings.open_param_url
        } else {
          const savedTrigger = loadPreference('incomingCallTrigger', authStore.username)
          if (savedTrigger) {
            triggerValue = savedTrigger
          }
        }

        setUrlTrigger(triggerValue)
        savePreference('incomingCallTrigger', triggerValue, authStore.username)
      } finally {
        setIsLoading(false)
      }
    }

    fetchParamUrl()
  }, [authStore.username, userStore.settings?.open_param_url])

  // Save URL when changed
  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value
    setCallUrl(newUrl)
    savePreference('incomingCallUrl', newUrl, authStore.username)
  }

  // Save trigger option when changed
  const handleTriggerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTrigger = event.target.id
    setUrlTrigger(newTrigger)

    // Save to localStorage
    savePreference('incomingCallTrigger', newTrigger, authStore.username)

    try {
      // Set new vaure to /me
      await setIncomingCallsPreference({ open_param_url: newTrigger })

      // store
      dispatch.user.updateOpenParamUrl(newTrigger)
    } catch (error) {
      setParamUrlError(t('Settings.Error saving settings') || '')
    }
  }

  return (
    <>
      <div className='p-4 sm:p-8 lg:pb-8'>
        <div>
          <h2 className='text-base font-medium leading-6 text-primaryNeutral dark:text-primaryNeutralDark mb-4'>
            {t('Settings.Incoming calls')}
          </h2>
        </div>

        {/* URL input section */}
        <div className='mb-4 max-w-3xl'>
          <div className='flex items-center mb-2'>
            <label
              htmlFor='callUrl'
              className='block text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark'
            >
              {t('Settings.URL opened on incoming call')}
            </label>

            {/* Info icon with tooltip */}
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='ml-2 h-4 w-4 text-iconTooltip dark:text-iconTooltipDark cursor-help'
              data-tooltip-id='url-info-tooltip'
              data-tooltip-content={t(
                'Settings.This URL opens automatically for external incoming calls',
              )}
            />
            <CustomThemedTooltip id='url-info-tooltip' place='right' />
          </div>

          <div className='relative'>
            <div className='pointer-events-none'>
              <TextInput
                id='callUrl'
                name='callUrl'
                value={isLoading ? t('Settings.Loading...') || 'Loading...' : callUrl}
                onChange={handleUrlChange}
                placeholder='https://www.example.com/customers?phone={phone}'
                className='w-full'
                disabled={true}
                title={t('Settings.This field can only be modified by the administrator') || ''}
              />
            </div>

            {/* Overlay for the copy button that remains clickable */}
            <div className='absolute inset-y-0 right-0 flex items-center pr-3 z-20'>
              <CopyComponent
                number={callUrl}
                id='incoming-call-url'
                isWhite={true}
                notificationPosition='right'
              />
            </div>

            <div
              className='absolute inset-0 bg-transparent z-10 cursor-not-allowed'
              data-tooltip-id='disabled-field-tooltip'
              data-tooltip-content={t(
                'Settings.This field can only be modified by the administrator',
              )}
            ></div>
            <CustomThemedTooltip id='disabled-field-tooltip' place='top' />
          </div>

          {/* Error message if API fails */}
          {paramUrlError && (
            <InlineNotification
              type='error'
              title={t('Settings.Error loading URL configuration')}
              className='mt-2 mb-2 max-w-3xl'
            >
              <p>{paramUrlError}</p>
            </InlineNotification>
          )}

          {/* Info message about popup*/}
          <InlineNotification
            type='info'
            title={t('Settings.Enable pop-ups in your browser')}
            className='my-8 max-w-3xl'
          >
            <p>
              {t(
                'Settings.To correctly open the Call-activated URL, you need to enable pop-ups in your browser.',
              )}
            </p>
          </InlineNotification>
        </div>

        {/* URL opening trigger section */}
        <div className='mb-6 max-w-3xl'>
          <h3 className='text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark mb-4'>
            {t('Settings.URL opening trigger')}
          </h3>

          <div className='space-y-4'>
            {/* Ringing option */}
            <div className='flex items-start'>
              <div className='flex h-5 items-center'>
                <input
                  id={TRIGGER_RINGING}
                  name='urlTrigger'
                  type='radio'
                  checked={urlTrigger === TRIGGER_RINGING}
                  onChange={handleTriggerChange}
                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label
                  htmlFor={TRIGGER_RINGING}
                  className='font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'
                >
                  {t('Settings.When the call is ringing')}
                </label>
              </div>
            </div>

            {/* Answered option */}
            <div className='flex items-start'>
              <div className='flex h-5 items-center'>
                <input
                  id={TRIGGER_ANSWERED}
                  name='urlTrigger'
                  type='radio'
                  checked={urlTrigger === TRIGGER_ANSWERED}
                  onChange={handleTriggerChange}
                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label
                  htmlFor={TRIGGER_ANSWERED}
                  className='font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'
                >
                  {t('Settings.When the call is answered')}
                </label>
              </div>
            </div>

            {/* Button option */}
            <div className='flex items-start'>
              <div className='flex h-5 items-center'>
                <input
                  id={TRIGGER_BUTTON}
                  name='urlTrigger'
                  type='radio'
                  checked={urlTrigger === TRIGGER_BUTTON}
                  onChange={handleTriggerChange}
                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label
                  htmlFor={TRIGGER_BUTTON}
                  className='font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'
                >
                  {t('Settings.When clicking the button on the Phone Island')}
                </label>
              </div>
            </div>

            {/* Never option */}
            <div className='flex items-start'>
              <div className='flex h-5 items-center'>
                <input
                  id={TRIGGER_NEVER}
                  name='urlTrigger'
                  type='radio'
                  checked={urlTrigger === TRIGGER_NEVER}
                  onChange={handleTriggerChange}
                  className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                />
              </div>
              <div className='ml-3 text-sm'>
                <label
                  htmlFor={TRIGGER_NEVER}
                  className='font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'
                >
                  {t('Settings.Never')}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
