// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '@nethesis/phone-island/dist/index.css'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '../store'
import { Layout } from '../components/layout'
import { getCredentials, updateAuthStore } from '../lib/login'
import { useRouter } from 'next/router'
import { RouteGuard } from '../config/router'
import { Service } from '../config/service'
import { checkDarkTheme } from '../lib/darkTheme'
import { Island } from '../components/island'

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const { username, token } = getCredentials()
    const loaded = () => setIsLoading(false)

    // Load the auth data to the store
    if (username && token) {
      updateAuthStore(username, token)
      loaded()
    } else {
      router.push('/login')
      router.events.on('routeChangeComplete', loaded)
    }

    return () => {
      router.events.off('routeChangeComplete', loaded)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // check if dark theme should be enabled
  useEffect(() => {
    checkDarkTheme()
  }, [])

  return (
    <>
      {!isLoading && (
        <Provider store={store}>
          {router.pathname !== '/login' ? (
            <>
              <Service>
                <Layout>
                  <RouteGuard>
                    <Component {...pageProps} />
                  </RouteGuard>
                </Layout>
              </Service>
              <Island />
            </>
          ) : (
            // Render the Login page
            <Component {...pageProps} />
          )}
        </Provider>
      )}
    </>
  )
}

export default MyApp
