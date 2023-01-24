// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ReactNode, useState, useEffect } from 'react'
import { NavBar, TopBar, MobileNavBar, SpeedDial, SideDrawer } from '.'
import { navItems, NavItemsProps } from '../../config/routes'
import { useRouter } from 'next/router'
import { getUserInfo } from '../../services/user'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../../store'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { closeSideDrawer } from '../../lib/utils'
import { store } from '../../store'
import {
  buildOperators,
  retrieveAvatars,
  retrieveExtensions,
  retrieveFavorites,
  retrieveGroups,
  retrieveUserEndpoints,
} from '../../lib/operators'
import { useEventListener } from '../../lib/hooks/useEventListener'

interface LayoutProps {
  children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false)
  const router = useRouter()
  const [items, setItems] = useState<NavItemsProps[]>(navItems)
  const dispatch = useDispatch<Dispatch>()
  const sideDrawer = useSelector((state: RootState) => state.sideDrawer)
  const operatorsStore = useSelector((state: RootState) => state.operators)
  const [firstRenderOperators, setFirstRenderOperators] = useState(true)
  const [firstRenderUserInfo, setFirstRenderUserInfo] = useState(true)
  const [firstRenderGlobalSearchListener, setFirstRenderGlobalSearchListener] = useState(true)
  const [isUserInfoLoaded, setUserInfoLoaded] = useState(false)
  const authStore = useSelector((state: RootState) => state.authentication)

  useEffect(() => {
    const currentItems = items.map((route) => {
      if (router.pathname === route.href) {
        route.current = true
      } else {
        route.current = false
      }
      return route
    })

    setItems(currentItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // get logged user data on page load
  useEffect(() => {
    const fetchUserInfo = async () => {
      const userInfo = await getUserInfo()

      if (userInfo && userInfo.data) {
        dispatch.user.update({
          name: userInfo.data.name,
          username: userInfo.data.username,
          mainextension: userInfo.data.endpoints.mainextension[0].id,
          mainPresence: userInfo.data.mainPresence,
          endpoints: userInfo.data.endpoints,
          avatar: userInfo.data.settings.avatar,
        })
        setUserInfoLoaded(true)
      }
    }

    if (firstRenderUserInfo) {
      setFirstRenderUserInfo(false)
      return
    }

    if (!isUserInfoLoaded) {
      fetchUserInfo()
    }
  }, [isUserInfoLoaded, firstRenderUserInfo])

  // get operators on page load
  useEffect(() => {
    async function fetchOperators() {
      if (!operatorsStore.isOperatorsLoaded && !operatorsStore.isLoading) {
        store.dispatch.operators.setLoading(true)
        store.dispatch.operators.setOperatorsLoaded(false)
        store.dispatch.operators.setErrorMessage('')

        try {
          retrieveUserEndpoints()
          retrieveGroups()
          retrieveExtensions()
          retrieveAvatars(authStore)
          retrieveFavorites(authStore)
        } catch (e) {
          store.dispatch.operators.setErrorMessage('Cannot retrieve user endpoints')
          store.dispatch.operators.setOperatorsLoaded(true)
          store.dispatch.operators.setLoading(false)
        }
      }
    }

    if (firstRenderOperators) {
      setFirstRenderOperators(false)
    } else {
      fetchOperators()
    }
  }, [operatorsStore.isOperatorsLoaded, firstRenderOperators])

  // detect when operators data has been loaded
  useEffect(() => {
    if (
      operatorsStore.isUserEndpointsLoaded &&
      operatorsStore.isGroupsLoaded &&
      operatorsStore.isExtensionsLoaded &&
      operatorsStore.isAvatarsLoaded &&
      operatorsStore.isFavoritesLoaded
    ) {
      buildOperators(operatorsStore)
    }
  }, [
    operatorsStore.isUserEndpointsLoaded,
    operatorsStore.isGroupsLoaded,
    operatorsStore.isExtensionsLoaded,
    operatorsStore.isAvatarsLoaded,
    operatorsStore.isFavoritesLoaded,
  ])

  // register to phone island events

  useEventListener('phone-island-main-presence', (data) => {
    const opName = Object.keys(data)[0]
    const mainPresence = data[opName].mainPresence
    store.dispatch.operators.updateMainPresence(opName, mainPresence)
  })

  useEventListener('phone-island-conversations', (data) => {
    const opName = Object.keys(data)[0]
    const conversations = data[opName].conversations
    store.dispatch.operators.updateConversations(opName, conversations)
  })

  // global search listeners

  const globalSearchClick = (event: any) => {
    const globalSearch = document.querySelector('#globalSearch')

    if (globalSearch) {
      const withinBoundaries = event.composedPath().includes(globalSearch)

      if (withinBoundaries) {
        // dim the screen and set user attention on global search
        store.dispatch.globalSearch.setFocused(true)
      } else {
        // close global search
        store.dispatch.globalSearch.setOpen(false)
        store.dispatch.globalSearch.setFocused(false)
      }
    }
  }

  useEffect(() => {
    if (firstRenderGlobalSearchListener) {
      setFirstRenderGlobalSearchListener(false)
    } else {
      document.addEventListener('click', globalSearchClick)
    }

    return () => {
      // clean up event listener
      document.removeEventListener('click', globalSearchClick)
    }
  }, [firstRenderGlobalSearchListener])

  return (
    <div className='flex h-full'>
      {/* Navigation bar */}
      <NavBar items={items} />
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Top heading bar */}
        <TopBar openMobileCb={() => setOpenMobileMenu(true)} />
        {/* Mobile navigation bar */}
        <MobileNavBar
          show={openMobileMenu}
          items={items}
          closeMobileMenu={() => setOpenMobileMenu(false)}
        />
        {/* Main content */}
        <div className='flex flex-1 items-stretch overflow-hidden'>
          <main className='flex-1 overflow-y-auto'>
            {/* Primary column */}
            <section
              aria-labelledby='primary-heading'
              className='flex min-w-0 flex-1 flex-col lg:order-last p-8'
            >
              {/* The page content */}
              {children}
            </section>
          </main>
          {/* Secondary column (hidden on smaller screens) */}
          <SpeedDial />
          <SideDrawer
            isShown={sideDrawer.isShown}
            contentType={sideDrawer.contentType}
            config={sideDrawer.config}
            drawerClosed={() => closeSideDrawer()}
          />
        </div>
      </div>
    </div>
  )
}
