// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Checks the token validity
 */

import { useState, useEffect, ReactNode, FC } from 'react'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface RouterGuardProps {
  children: ReactNode
}

export const RouteGuard: FC<RouterGuardProps> = ({ children }) => {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const auth = useSelector((state: RootState) => state.authentication)

  useEffect(() => {
    // On initial load - run auth check
    authCheck()

    // On route change start - hide page content by setting authorized to false
    const hideContent = (url: string) => {
      console.log('RouteGuard: Route change start to', url)
      setAuthorized(false)
    }
    router.events.on('routeChangeStart', hideContent)

    // On route change complete - run auth check
    const onRouteChangeComplete = (url: string) => {
      console.log('RouteGuard: Route change complete to', url)
      authCheck()
    }
    router.events.on('routeChangeComplete', onRouteChangeComplete)

    // Add error handler
    const onRouteChangeError = (err: Error, url: string) => {
      console.error('RouteGuard: Route change error to', url, err)
      setAuthorized(true) // Keep authorized to show error page
    }
    router.events.on('routeChangeError', onRouteChangeError)

    // Unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent)
      router.events.off('routeChangeComplete', onRouteChangeComplete)
      router.events.off('routeChangeError', onRouteChangeError)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const authCheck = () => {
    // Redirect to login page if accessing a private page and not logged in
    console.log('RouteGuard authCheck:', { 
      route: router.pathname, 
      username: auth.username, 
      hasToken: !!auth.token 
    })
    if (auth.username && auth.token) {
      console.log('RouteGuard: Setting authorized to true')
      setAuthorized(true)
    } else {
      console.log('RouteGuard: Setting authorized to false, redirecting to login')
      setAuthorized(false)
      router.push('/login')
    }
  }

  return <>{authorized && children}</>
}
