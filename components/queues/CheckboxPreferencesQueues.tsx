import React, { FC, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { isEmpty } from 'lodash'
import { setQueueUserPreferences } from '../../lib/queuesLib'

interface CheckboxPreferencesQueuesProps {
  className?: string
}

export const CheckboxPreferencesQueues: FC<CheckboxPreferencesQueuesProps> = ({
  className,
}): JSX.Element => {
  const { t } = useTranslation()
  const userSettingsInformation = useSelector((state: RootState) => state.user.settings)
  const dispatch = useDispatch()

  async function changeQueueUserPreferences(value: boolean, type: string) {
    let informationObject: any = {}
    if (type === 'logout') {
      informationObject.queue_auto_logout = value
    } else if (type === 'login') {
      informationObject.queue_auto_login = value
    } else if (type === 'pause') {
      informationObject.queue_auto_pause_onpresence = value
    } else if (type === 'callForward/dnd') {
      informationObject.queue_autopause_presencelist = value
    }
    try {
      if (!isEmpty(informationObject)) {
        await setQueueUserPreferences(informationObject)
      }
    } catch (e) {
      console.error(e)
    }
  }

  function updateLogoutStatus(event: any) {
    const isChecked = event.target.checked
    dispatch.user.updateLogoutQueue(isChecked)
    changeQueueUserPreferences(isChecked, 'logout')
  }

  function updateLoginStatus(event: any) {
    const isChecked = event.target.checked
    dispatch.user.updateLoginQueue(isChecked)
    changeQueueUserPreferences(isChecked, 'login')
  }

  function updatePauseStatus(event: any) {
    const isChecked = event.target.checked
    dispatch.user.updatePauseQueue(isChecked)
    changeQueueUserPreferences(isChecked, 'pause')
  }

  const qPauseAvailPresence: any = ['callforward', 'dnd']
  const [qPauseSelectedPresence, setQPauseSelectedPresence]: any = useState([])
  const [qPauseSelectedPresenceStringify, setQPauseSelectedPresenceStringify]: any = useState('')

  const updateSettings = (selectedPresence: any) => {
    let isChecked = false
    if (selectedPresence !== '[]') {
      isChecked = true
    }
    dispatch.user.updateQueueAutopausePresencelist(isChecked, selectedPresence)
    changeQueueUserPreferences(selectedPresence, 'callForward/dnd')
  }

  const handlePauseStatusChange = (presence: any) => {
    const updatedPresence: any = qPauseSelectedPresence.includes(presence)
      ? qPauseSelectedPresence.filter((item: any) => item !== presence)
      : [...qPauseSelectedPresence, presence]
    setQPauseSelectedPresence(updatedPresence)
    let updatePresenceStringify = JSON.stringify(updatedPresence)
    setQPauseSelectedPresenceStringify(updatePresenceStringify)
    updateSettings(updatePresenceStringify)
  }

  return (
    <fieldset>
      <legend className='sr-only'>Notifications</legend>
      <div className='space-y-5'>
        {/* logout  */}
        <div className='relative flex items-start'>
          <div className='flex h-6 items-center'>
            <input
              id='comments'
              aria-describedby='comments-description'
              name='comments'
              type='checkbox'
              defaultChecked={userSettingsInformation?.queue_auto_logout}
              value={userSettingsInformation?.queue_auto_logout}
              onChange={updateLogoutStatus}
              className='h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600'
            />
          </div>
          <div className='ml-3 text-sm'>
            <label
              htmlFor='comments'
              className='font-medium leading-6 text-gray-900 dark:text-gray-100 mt-4 text-sm'
            >
              {t('Settings.Logout from queue automatically')}
            </label>
            <p id='comments-description' className='text-gray-500 dark:text-gray-200'>
              {t('Settings.When you exit the app')}
            </p>
          </div>
        </div>

        {/* login  */}
        <div className='relative flex items-start'>
          <div className='flex h-6 items-center'>
            <input
              id='candidates'
              aria-describedby='candidates-description'
              name='candidates'
              type='checkbox'
              defaultChecked={userSettingsInformation?.queue_auto_login}
              value={userSettingsInformation?.queue_auto_login}
              onChange={updateLoginStatus}
              className='h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600'
            />
          </div>
          <div className='ml-3 text-sm leading-6'>
            <label htmlFor='candidates' className='font-medium text-gray-900 dark:text-gray-300'>
              {t('Settings.Login from queue automatically')}
            </label>
            <p id='candidates-description' className='text-gray-500 dark:text-gray-200'>
              {t('Settings.When you exit the app')}
            </p>
          </div>
        </div>

        {/* pause  */}
        <div className='relative flex items-start'>
          <div className='flex h-6 items-center'>
            <input
              id='offers'
              aria-describedby='offers-description'
              name='offers'
              type='checkbox'
              defaultChecked={userSettingsInformation?.queue_auto_pause_onpresence}
              value={userSettingsInformation?.queue_auto_pause_onpresence}
              onChange={updatePauseStatus}
              className='h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 '
            />
          </div>
          <div className='ml-3 text-sm leading-6'>
            <label htmlFor='offers' className='font-medium text-gray-900 dark:text-gray-300'>
              {t('Settings.Pause from queue automatically')}
            </label>
            <p id='offers-description' className='text-gray-500 dark:text-gray-200'>
              {t('Settings.When you exit the app')}
            </p>
          </div>
        </div>
        {userSettingsInformation?.queue_auto_pause_onpresence && (
          <>
            <div className='ml-7 grid grid-cols-[8rem,8rem] gap-2 whitespace-nowrap'>
              {qPauseAvailPresence.map((presence: any) => (
                <div key={presence} className='relative flex items-start'>
                  <div className='flex h-6 items-center'>
                    <input
                      id={presence}
                      name={presence}
                      type='checkbox'
                      defaultChecked={Array.isArray(userSettingsInformation?.queue_autopause_presencelist) && userSettingsInformation?.queue_autopause_presencelist.includes(presence)}
                      onChange={() => handlePauseStatusChange(presence)}
                      className='h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600'
                    />
                  </div>
                  <div className='ml-3 text-sm leading-6'>
                    <label
                      htmlFor={presence}
                      className='font-medium text-gray-900 dark:text-gray-300'
                    >
                      {presence === 'callforward' ? 'Call Forward' : 'Do Not Disturb'}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </fieldset>
  )
}

CheckboxPreferencesQueues.displayName = 'CheckboxPreferencesQueues'
