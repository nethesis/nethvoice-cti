// Copyright (C) 2022 Nethesis S.r.l.
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
    const hideContent = () => setAuthorized(false)
    router.events.on('routeChangeStart', hideContent)

    // On route change complete - run auth check
    router.events.on('routeChangeComplete', authCheck)

    // Unsubscribe from events in useEffect return function
    return () => {
      router.events.off('routeChangeStart', hideContent)
      router.events.off('routeChangeComplete', authCheck)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const authCheck = () => {
    // Redirect to login page if accessing a private page and not logged in
    if (auth.username && auth.token) {
      setAuthorized(true)
    } else {
      setAuthorized(false)
      router.push('/login')
    }
  }

  return <>{authorized && children}</>
}
