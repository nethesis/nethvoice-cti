// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import Image from 'next/image'
import { isTokenStored, setToken } from '../lib/login'
import { useRouter } from 'next/router'
import { useState, useRef } from 'react'
import { TextInput, Button } from '../components/common'
import hmacSHA256 from 'crypto-js/hmac-sha256'
import Base64 from 'crypto-js/enc-base64'
import { MdLock, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import Logo from '../public/logo.png'

export default function Login() {
  const [pwdVisible, setPwdVisible] = useState(false)
  const [messageError, setMessaggeError] = useState('')
  const [onError, setOnError] = useState(false)
  const router = useRouter()
  const usernameRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const passwordRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (window !== undefined) {
      if (!isTokenStored()) {
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
        const nonce = res.headers.get('www-authenticate')?.split(' ')[0]
        const token = nonce
          ? Base64.stringify(hmacSHA256(`${username}:${password}:${nonce}`, password))
          : ''
        if (token) {
          router.push('/')
          {
            setToken(token)
          }
        } else {
          if (callStatus === 401) {
            setOnError(true)
            setMessaggeError('Unauthorized')
          } else if (callStatus === 404) {
            setOnError(true)
            setMessaggeError('Not Found')
          }
        }
      } else {
        router.push('/')
      }
    }
  }

  return (
    <>
      <div className='bg-gray-100 h-screen'>
        <div className='flex items-center h-screen justify-center py-40 px-4 sm:px-6 lg:px-8'>
          <div className=' w-full max-w-md space-y-8'>
            <div>
              <div className='flex justify-center'>
                <Image
                  className='mx-auto h-12 w-auto'
                  src={Logo}
                  alt='Your Company'
                  width='100'
                  height='100'
                  unoptimized={true}
                />
              </div>
              <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-700'>
                NethVoice CTI
              </h2>
            </div>
            <form className='mt-8 space-y-6' action='#' method='POST' onSubmit={doLogin}>
              <div className='flex flex-col -space-y-1.5'>
                <TextInput
                  placeholder='Enter your username'
                  name='username'
                  squared='bottom'
                  ref={usernameRef}
                  required
                />
                <div className='pt-px'>
                  <TextInput
                    placeholder='Enter your password'
                    name='password'
                    squared='top'
                    type={pwdVisible ? 'text' : 'password'}
                    icon={pwdVisible ? MdOutlineVisibility : MdOutlineVisibilityOff}
                    onIconClick={() => setPwdVisible(!pwdVisible)}
                    trailingIcon={true}
                    error={onError ? true : false}
                    helper={onError ? messageError : ''}
                    ref={passwordRef}
                    required
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
                  {' '}
                  <span className='absolute inset-y-0 left-0 flex items-center pl-3'>
                    <MdLock
                      className='h-5 w-5 text-sky-400 group-hover:text-indigo-400'
                      aria-hidden='true'
                    />
                  </span>
                  Sign in
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
