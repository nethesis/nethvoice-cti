// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { RefObject, createRef, useState, useEffect } from 'react'
import {
  faCheck,
  faClipboard,
  faTriangleExclamation,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, InlineNotification, Modal } from '../common'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { newIslandConfig } from '../../lib/settings'
import {
  getPhoneIslandToken,
  phoneIslandTokenCheck,
  removePhoneIslandToken,
} from '../../services/authentication'
import { useTranslation } from 'react-i18next'
import { getProductName } from '../../lib/utils'

export const Integrations = () => {
  const [copied, setCopied] = useState<boolean>(false)
  const [config, setConfig] = useState<string>('')
  const currentUser = useSelector((state: RootState) => state.user)
  const webRTCExtension = currentUser.endpoints.extension.find((el) => el.type === 'webrtc')
  const [showMondal, setShowMondal] = useState(false)
  const cancelButtonRef: RefObject<HTMLButtonElement> = createRef()
  const [tokenExists, setTokenExists] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { t } = useTranslation()

  const productName = getProductName()

  const newConfig = async () => {
    setLoading(true)
    const data = await getPhoneIslandToken()
    if (data.token) {
      const config = newIslandConfig({
        // @ts-ignore
        hostname: window.CONFIG.API_ENDPOINT,
        username: data.username,
        auth_token: data.token,
        sip_exten: webRTCExtension.id,
        sip_secret: webRTCExtension.secret,
        // @ts-ignore
        janus_host: window.CONFIG.JANUS_HOST,
        // @ts-ignore
        janus_port: window.CONFIG.JANUS_PORT,
      })
      setConfig(config)
      setCopied(false)
      setTokenExists(true)
    }
    setLoading(false)
  }

  const removeConfig = async () => {
    setLoading(true)
    setShowMondal(false)
    const removed = await removePhoneIslandToken()
    if (removed) {
      setConfig('')
      setTokenExists(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    const checkPhoneIslandToken = async () => {
      setLoading(true)
      const data = await phoneIslandTokenCheck()
      if (data.exists) {
        setTokenExists(true)
      }
      setLoading(false)
    }
    checkPhoneIslandToken()
  }, [])

  return (
    <>
      {/* The Integration section */}
      <section aria-labelledby='phone-configuration-heading'>
        <div className='shadow sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            <div>
              <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                {t('Settings.Integrations')}
              </h2>
            </div>
            <div>
              <h4
                id='phone-configuration-heading'
                className='text-sm font-medium leading-6 text-gray-900 dark:text-gray-100'
              >
                {t('Settings.Phone Island configuration')}
              </h4>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                {t('Settings.phone_island_integration_description', { productName })}
              </p>
              <p className='mt-6 flex items-center gap-2'>
                {loading && (
                  <Button variant='white' disabled>
                    {t('Common.Loading')}{' '}
                    <FontAwesomeIcon icon={faCircleNotch} className='fa-spin ml-2' />
                  </Button>
                )}
                {!loading && !tokenExists && (
                  <Button variant='white' onClick={newConfig}>
                    {t('Settings.Get Phone Island configuration')}{' '}
                  </Button>
                )}
                {!loading && tokenExists && (
                  <Button variant='white' onClick={() => setShowMondal(true)}>
                    {t('Settings.Revoke configuration')}
                  </Button>
                )}
              </p>

              {config && (
                <>
                  <InlineNotification className='mt-5' type='warning' title={t('Common.Warning')}>
                    <p>
                      {t(
                        'Settings.The configuration string below is shown only once. If you will need it later, please save it in a safe place',
                      )}
                    </p>
                  </InlineNotification>
                  <div className='mt-5 bg-gray-50 dark:bg-gray-900 dark:border dark:border-gray-800 p-5 rounded-lg text-gray-900 dark:text-gray-100 flex gap-5 items-center'>
                    <div className='text-sm break-all'>{config}</div>
                    <CopyToClipboard text={config} onCopy={() => setCopied(true)}>
                      <Button variant='white' className='h-9 w-9'>
                        {copied ? (
                          <FontAwesomeIcon
                            className='w-4 h-4 text-green-600'
                            icon={faCheck}
                            aria-hidden='true'
                          />
                        ) : (
                          <FontAwesomeIcon
                            className='w-4 h-4'
                            icon={faClipboard}
                            aria-hidden='true'
                          />
                        )}
                      </Button>
                    </CopyToClipboard>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* Remove token confirmation modal */}
      <Modal show={showMondal} focus={cancelButtonRef} onClose={() => setShowMondal(false)}>
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0'>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className='h-5 w-5 text-red-600'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-200'>
              {t('Settings.Revoke Phone Island configuration')}
            </h3>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>
                {t('Settings.Any Phone Island using the current configuration will stop working')}
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={removeConfig}>
            {t('Settings.Revoke')}
          </Button>
          <Button variant='white' onClick={() => setShowMondal(false)} ref={cancelButtonRef}>
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}
