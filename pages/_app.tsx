// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '../store'
import Script from 'next/script'
import 'react-loading-skeleton/dist/skeleton.css'
import { Layout } from '../components/layout'
import { getCredentials, updateAuthStore } from '../lib/login'
import { useRouter } from 'next/router'
import { RouteGuard } from '../components/router'

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const router = useRouter()

  useEffect(() => {
    const { username, token } = getCredentials()
    // Load the auth data to the store
    if (username && token) {
      updateAuthStore(username, token)
    } else {
      router.push('/login')
    }
    setIsLoading(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {!isLoading && (
        <Provider store={store}>
          {router.pathname !== '/login' ? (
            <Layout>
              <RouteGuard>
                <Component {...pageProps} />
              </RouteGuard>
            </Layout>
          ) : (
            // Render the Login page
            <Component {...pageProps} />
          )}
        </Provider>
      )}

      {/* Import env variables */}
      <Script src={`config/config.${process.env.NODE_ENV}.js`}></Script>
    </>
  )
}

export default MyApp
