// Copyright (C) 2022 Nethesis S.r.l.
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

export const Integrations = () => {
  const [copied, setCopied] = useState<boolean>(false)
  const [config, setConfig] = useState<string>('')
  const currentUser = useSelector((state: RootState) => state.user)
  const webRTCExtension = currentUser.endpoints.extension.find((el) => el.type === 'webrtc')
  const [showMondal, setShowMondal] = useState(false)
  const cancelButtonRef: RefObject<HTMLButtonElement> = createRef()
  const [tokenExists, setTokenExists] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

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
      })
      setConfig(config)
      setCopied(false)
      setTokenExists(true)
    }
    setLoading(false)
  }

  const removeConfig = async () => {
    const removed = await removePhoneIslandToken()
    if (removed) {
      setConfig('')
      setTokenExists(false)
      setShowMondal(false)
    }
  }

  useEffect(() => {
    const checkPhoneIslandToken = async () => {
      const data = await phoneIslandTokenCheck()
      if (data.exists) setTokenExists(true)
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
                Integrations
              </h2>
            </div>
            <div>
              <h4
                id='phone-configuration-heading'
                className='text-sm font-medium leading-6 text-gray-900 dark:text-gray-100'
              >
                Phone widget configuration
              </h4>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                Anytime the user starts or receives a phone call, a floating phone widget is shown
                on CTI user interface. This widget can be imported and used into other web
                applications. Click the button below to get the configuration string needed to
                import the phone widget into your web application.
              </p>
              <p className='mt-6 flex items-center gap-2'>
                {!tokenExists && (
                  <Button variant='secondary' onClick={newConfig}>
                    Get phone widget configuration{' '}
                    {loading && <FontAwesomeIcon icon={faCircleNotch} className='fa-spin ml-2' />}
                  </Button>
                )}
                {tokenExists && (
                  <Button variant='danger' onClick={() => setShowMondal(true)}>
                    Revoke
                  </Button>
                )}
              </p>

              {config && (
                <>
                  <InlineNotification className='mt-5 border-none' type='warning' title='Important'>
                    <p>
                      The configuration string below is shown only once. If you will need it later,
                      please save it in a safe place
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
            <h3 className='text-lg font-medium leading-6 text-gray-900'>
              Revoke widget configuration
            </h3>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>
                Any phone widget using the current configuration will stop working
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={removeConfig}>
            Revoke
          </Button>
          <Button variant='white' onClick={() => setShowMondal(false)} ref={cancelButtonRef}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}
