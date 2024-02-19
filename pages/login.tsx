// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { saveCredentials } from '../lib/login'
import { useState, useRef, useEffect } from 'react'
import { TextInput, InlineNotification, Button } from '../components/common'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEye, faEyeSlash, faPhone } from '@fortawesome/free-solid-svg-icons'
import { checkDarkTheme } from '../lib/darkTheme'
import { useTranslation } from 'react-i18next'
import { store } from '../store'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  getHtmlFaviconElement,
  getProductName,
  getProductSubname,
  getSavedQueryParams,
  reloadPage,
} from '../lib/utils'
import Head from 'next/head'
import { capitalize } from 'lodash'
import { loginBeforeDashboard } from '../services/user'

export default function Login() {
  const [pwdVisible, setPwdVisible] = useState(false)
  const [messageError, setMessaggeError] = useState('')
  const [onError, setOnError] = useState(false)
  const [loading, setLoading] = useState(false)
  const ctiStatus = useSelector((state: RootState) => state.ctiStatus)

  const { t } = useTranslation()

  const queryParams = getSavedQueryParams()

  const [idInterval, setIdInterval] = useState<any>(0)
  const [linkHtmlFaviconElement, setLinkHtmlFaviconElement] = useState<any>(null)
  const [variableCheck, setVariableCheck] = useState(false)

  useEffect(() => {
    if (queryParams != undefined && queryParams.includes('error')) {
      const newUrl = `login?${queryParams}`

      window.history.pushState({ path: newUrl }, '', newUrl)
      if (queryParams === 'error=sessionExpired') {
        store.dispatch.ctiStatus.setUserInformationMissing(true)
        store.dispatch.ctiStatus.setWebRtcError(true)
      } else {
        store.dispatch.ctiStatus.setWebRtcError(true)
      }
      setLinkHtmlFaviconElement(getHtmlFaviconElement())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams, window.location.href])

  const visibilityChangeHandler = () => {
    if (
      document?.visibilityState &&
      queryParams &&
      queryParams != undefined &&
      queryParams.includes('error') &&
      window.location.href.includes('/login')
    ) {
      reloadPage()
    }
  }

  // Manage change of visibility
  document.addEventListener('visibilitychange', visibilityChangeHandler)

  useEffect(() => {
    if (linkHtmlFaviconElement) {
      manageFaviconInterval()
      return () => {
        clearFaviconInterval()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctiStatus.webRtcError, ctiStatus.isPhoneRinging, window.location, linkHtmlFaviconElement])

  function manageFaviconInterval() {
    const warningMessageFavicon = t('Common.DoubleLogin')
    const callingMessageFavicon = t('Common.Calling')
    const sessionExpiredMessageFavicon = t('Common.SessionExpired')
    setVariableCheck(true)
    // setVariableCheck(true)

    let flashFavicon = true
    if (ctiStatus.webRtcError || ctiStatus.isPhoneRinging) {
      const intervalId = setInterval(() => {
        if (flashFavicon) {
          if (ctiStatus.webRtcError) {
            if (linkHtmlFaviconElement) {
              linkHtmlFaviconElement.href = 'favicon-warn.ico'
            }
            if (ctiStatus.isUserInformationMissing) {
              window.document.title = sessionExpiredMessageFavicon
              linkHtmlFaviconElement.href = 'favicon-warn.ico'
            } else {
              window.document.title = warningMessageFavicon
            }
          } else {
            if (linkHtmlFaviconElement) {
              linkHtmlFaviconElement.href = 'favicon-call.ico'
            }
            window.document.title = callingMessageFavicon
          }
        } else {
          if (linkHtmlFaviconElement) {
            linkHtmlFaviconElement.href = 'favicon.ico'
          }
          window.document.title = productName
        }
        flashFavicon = !flashFavicon
      }, 800)
      store.dispatch.ctiStatus.setIdInterval(intervalId)
      setIdInterval(intervalId)
    } else {
      clearFaviconInterval()
    }
  }

  // Get current page name, clean the path from / and capitalize page name
  function cleanProductNamePageTitle() {
    if (router.pathname) {
      // Delete slash at the beginning of the path
      const cleanRouterPath: string = router.pathname.replace(/^\/|\/$/g, '')
      // Return path with the uppercase first character
      return t(`Common.${capitalize(cleanRouterPath)}`) + ' - ' + productName
    }
  }

  function clearFaviconInterval() {
    let cleanTitlePageName: any = cleanProductNamePageTitle()

    if (idInterval > 0) {
      clearInterval(idInterval)
    } else {
      // Use the interval id from the store
      clearInterval(ctiStatus.idInterval)
    }

    if (linkHtmlFaviconElement) {
      linkHtmlFaviconElement.href = 'favicon.ico'
    }
    window.document.title = cleanTitlePageName
  }

  let iconSelect = loading ? (
    <FontAwesomeIcon icon={faCircleNotch} className='fa-spin loader fa-lg' />
  ) : (
    <></>
  )

  useEffect(() => {
    function showNotification() {
      if (document.visibilityState !== 'visible' && variableCheck) {
        if (Notification.permission === 'granted') {
          if (ctiStatus.webRtcError) {
            if (ctiStatus.isUserInformationMissing) {
              // Create notification with caller informations
              const notification = new Notification(`${t('Common.Session expired')}`, {
                body: `${t('Common.Click to redirect')}`,
              })

              setVariableCheck(false)

              notification.onclick = function () {
                notification.close()
                window.focus()
              }
            } else {
              // Create notification with caller informations
              const notification = new Notification(`${t('Common.User login duplicated')}`, {
                body: `${t('Common.You have made login in another tab')}`,
              })

              setVariableCheck(false)

              notification.onclick = function () {
                notification.close()
                window.focus()
              }
            }
          }
        } else {
          Notification.requestPermission()

            .then((permission) => {
              if (permission === 'granted') {
                showNotification()
              }
            })
            .catch((error) => {
              console.error('No permissions', error)
            })
        }
      }
    }

    showNotification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variableCheck])

  const [userNotAuthorized, setUserNotAuthorized] = useState(false)

  let errorAlert = onError ? (
    <div className='relative w-full'>
      <div className='absolute -bottom-[104px] w-full'>
        <InlineNotification
          type='error'
          title={userNotAuthorized ? t('Login.User not autorized') : t('Login.Login failed')}
        >
          <p>{messageError}</p>
        </InlineNotification>
      </div>
    </div>
  ) : ctiStatus.webRtcError || window.location.href.includes('?error') ? (
    ctiStatus.isUserInformationMissing || window.location.href.includes('sessionExpired') ? (
      <div className='relative w-full'>
        <div className='absolute -bottom-[104px] w-full'>
          <InlineNotification type='error' title={t('Common.Warning')}>
            <p>{t('Login.Session expired, log in again')}</p>
          </InlineNotification>
        </div>
      </div>
    ) : (
      <div className='relative w-full'>
        <div className='absolute -bottom-[104px] w-full'>
          <InlineNotification type='error' title={t('Common.Warning')}>
            <p>{t('Login.The application is open in another window')}</p>
          </InlineNotification>
        </div>
      </div>
    )
  ) : (
    <></>
  )

  const router = useRouter()
  const usernameRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const passwordRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (window !== undefined) {
      const username = usernameRef.current.value
      const password = passwordRef.current.value
      setOnError(false)

      const res = await fetch(
        // @ts-ignore
        window.CONFIG.API_SCHEME + window.CONFIG.API_ENDPOINT + '/webrest/authentication/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        },
      )

      const callStatus = res.status
      const nonce = res.headers.get('www-authenticate')?.split(' ')[1]
      const token = nonce ? hmacSHA1(`${username}:${password}:${nonce}`, password).toString() : ''

      handleLogin(callStatus, token, username)
    }
  }

  const handleLogin = async (callStatus: any, token: any, username: any) => {
    if (token) {
      saveCredentials(username, token)
      let userPreferenceOnLogin: any = {}
      try {
        userPreferenceOnLogin = await loginBeforeDashboard(username, token)
        if (
          // TO DO - remove this check when the backend will be ready
          userPreferenceOnLogin?.profile?.macro_permissions?.nethvoice_cti?.value === undefined ||
          // not this
          userPreferenceOnLogin?.profile?.macro_permissions?.nethvoice_cti?.value
        ) {
          setUserNotAuthorized(false)
          router.push('/')
        } else {
          setUserNotAuthorized(true)
          setOnError(true)
          setMessaggeError(`${t('Login.Contact administrator for access')}`)
        }
      } catch (error) {
        console.log(error)
      }

      // clean errors from storage
      sessionStorage.clear()
      if (ctiStatus.webRtcError || window.location.href.includes('webrtcError')) {
        store?.dispatch?.ctiStatus?.setWebRtcError(false)
      }
      if (ctiStatus.isUserInformationMissing || window.location.href.includes('sessionExpired')) {
        store?.dispatch?.ctiStatus?.setUserInformationMissing(false)
      }
      setLoading(false)
      checkDarkTheme()
    } else {
      if (callStatus === 401) {
        setOnError(true)
        setMessaggeError(`${t('Login.Wrong username or password')}`)
      } else if (callStatus === 404) {
        setOnError(true)
        setMessaggeError(`${t('Login.Network connection is lost')}`)
      }
      setLoading(false)
    }
  }

  // Get product name to show in the tab
  const productName = getProductName()

  const productSubname = getProductSubname()

  return (
    <>
      <div>
        <Head>
          <title>{productName}</title>
        </Head>
      </div>
      <div className='flex min-h-full'>
        <div className='flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 2xl:px-32'>
          <div className='mx-auto w-full max-w-sm lg:w-96'>
            <div className='flex flex-col items-center justify-center'>
              {/* Nextjs <Image> is not suitable for rebranding: it always uses the aspect ratio of the original logo  */}
              <img
                className='mx-auto w-auto items-center object-contain object-bottom'
                src='/login_logo.svg'
                alt='logo'
              />
              <div className='flex items-center text-primary dark:text-primaryDark p-4'>
                <FontAwesomeIcon
                  icon={faPhone}
                  className='mr-1.5 h-5 w-5 flex-shrink-0'
                  aria-hidden='true'
                />
                {productSubname}
              </div>
            </div>
            <div className='mt-8'>
              <div className='mt-6'>
                <form action='#' method='POST' onSubmit={doLogin} className='space-y-6'>
                  <div>
                    <label
                      htmlFor='email'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      {t('Login.User')}
                    </label>
                    <div className='mt-1'>
                      <TextInput
                        placeholder=''
                        name='username'
                        ref={usernameRef}
                        error={onError ? true : false}
                        required
                        autoComplete='username'
                        autoFocus
                      ></TextInput>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label
                      htmlFor='password'
                      className='block text-sm font-medium text-gray-700 dark:text-gray-200'
                    >
                      {t('Login.Password')}
                    </label>
                    <div className='mt-1'>
                      <TextInput
                        placeholder=''
                        name='password'
                        type={pwdVisible ? 'text' : 'password'}
                        icon={pwdVisible ? faEye : faEyeSlash}
                        onIconClick={() => setPwdVisible(!pwdVisible)}
                        trailingIcon={true}
                        error={onError ? true : false}
                        ref={passwordRef}
                        required
                        autoComplete='current-password'
                      />
                    </div>
                  </div>
                  <div>
                    <Button
                      size='large'
                      fullHeight={true}
                      fullWidth={true}
                      variant='primary'
                      type='submit'
                    >
                      {t('Login.Sign in')}
                      {iconSelect}
                    </Button>
                  </div>
                </form>
                {errorAlert}
              </div>
            </div>
          </div>
        </div>
        <div className='relative hidden w-0 flex-1 lg:block'>
          {/* Nextjs <Image> is not suitable for rebranding: it always uses the aspect ratio of the original image  */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className='absolute inset-0 h-full w-full object-cover'
            src='/nethvoice_cti_1300x2000.png'
            alt='background image'
          />
        </div>
      </div>
    </>
  )
}
