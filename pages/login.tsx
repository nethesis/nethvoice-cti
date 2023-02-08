// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Image from 'next/image'
import { saveCredentials } from '../lib/login'
import { useState, useRef } from 'react'
import { TextInput, InlineNotification, Button } from '../components/common'
import hmacSHA1 from 'crypto-js/hmac-sha1'
import Background from '../public/login_background.png'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { checkDarkTheme } from '../lib/darkTheme'
import { useTranslation } from 'react-i18next'

export default function Login() {
  const [pwdVisible, setPwdVisible] = useState(false)
  const [messageError, setMessaggeError] = useState('')
  const [onError, setOnError] = useState(false)
  const [loading, setLoading] = useState(false)

  const { t } = useTranslation()
  let iconSelect = loading ? (
    <FontAwesomeIcon icon={faCircleNotch} className='fa-spin loader fa-lg' />
  ) : (
    <></>
  )
  let errorAlert = onError ? (
    <div className='relative w-full'>
      <div className='absolute -bottom-[104px] w-full'>
        <InlineNotification type='error' title='Login Failed'>
          <p>{messageError}</p>
        </InlineNotification>
      </div>
    </div>
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
      if (token) {
        saveCredentials(username, token)
        router.push('/')
        setLoading(false)
        checkDarkTheme()
      } else {
        if (callStatus === 401) {
          setOnError(true)
          setMessaggeError('Wrong username or password.')
        } else if (callStatus === 404) {
          setOnError(true)
          setMessaggeError('The network connection is lost')
        }
        setLoading(false)
      }
    }
  }

  return (
    <>
      <div className='flex min-h-full'>
        <div className='flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24'>
          <div className='mx-auto w-full max-w-sm lg:w-96'>
            <div className='flex items-center justify-center'>
              {' '}
              {/* Nextjs <Image> is not suitable for rebranding: it always uses the aspect ratio of the original logo  */}
              <img
                className='mx-auto w-auto items-center object-contain object-bottom'
                src='/login_logo.png'
                alt='logo'
              />
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
          <Image
            className='absolute inset-0 h-full w-full object-cover'
            src={Background}
            alt='Background image'
            layout='fill'
            unoptimized={true}
          />
        </div>
      </div>
    </>
  )
}
