// Copyright (C) 2023 Nethesis S.r.l.
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
import { closeSideDrawer, getProductName } from '../../lib/utils'
import { store } from '../../store'
import {
  buildOperators,
  retrieveAvatars,
  retrieveExtensions,
  retrieveFavoriteOperators,
  retrieveGroups,
  retrieveUserEndpoints,
} from '../../lib/operators'
import { useEventListener } from '../../lib/hooks/useEventListener'
import { retrieveQueues } from '../../lib/queuesLib'
import Head from 'next/head'
import { capitalize } from 'lodash'

interface LayoutProps {
  children: ReactNode
}
import { useTranslation } from 'react-i18next'

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

  const queuesStore = useSelector((state: RootState) => state.queues)

  const ctiStatus = useSelector((state: RootState) => state.ctiStatus)
  const [linkHtmlFaviconElement, setLinkHtmlFaviconElement] = useState<any>(null)

  const productName = getProductName()
  // Get current page name, clean the path from / and capitalize page name
  function cleanProductNamePageTitle() {
    if (router.pathname) {
      // Delete slash at the beginning of the path
      const cleanRouterPath: string = router.pathname.replace(/^\/|\/$/g, '')
      // Return path with the uppercase first character
      if (cleanRouterPath) {
        return t(`Common.${capitalize(cleanRouterPath)}`) + ' - ' + productName
      }
    }
  }

  // Get icon html icon path
  function getHtmlFaviconElement() {
    if (typeof window === 'undefined') {
      return ''
    }

    let faviconHtmlElement = document.querySelector("link[rel*='icon']") as HTMLLinkElement
    return faviconHtmlElement
  }

  const { t } = useTranslation()
  const [idInterval, setIdInterval] = useState<any>(0)

  function manageFaviconInterval() {
    const warningMessageFavicon = t('Common.Warning')
    const callingMessageFavicon = t('Common.Calling')
    setLinkHtmlFaviconElement(getHtmlFaviconElement())
    let flashFavicon = true
    if (ctiStatus.webRtcError || ctiStatus.isPhoneRinging) {
      setIdInterval(
        setInterval(() => {
          if (flashFavicon) {
            if (ctiStatus.webRtcError) {
              if (linkHtmlFaviconElement) {
                linkHtmlFaviconElement.href = 'favicon-warn.ico'
              }
              window.document.title = warningMessageFavicon
            } else if (ctiStatus.isPhoneRinging) {
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
        }, 800),
      )
    } else {
      clearInterval(idInterval)
    }
  }

  // Call the function to interrupt the dynamic icon interval
  function clearFaviconInterval() {
    clearInterval(idInterval)
    if (linkHtmlFaviconElement) {
      linkHtmlFaviconElement.href = 'favicon.ico'
    }
  }

  useEffect(() => {
    manageFaviconInterval()
    return () => {
      clearFaviconInterval()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctiStatus.webRtcError, ctiStatus.isPhoneRinging])

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
          profile: userInfo.data.profile,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          retrieveFavoriteOperators(authStore)
        } catch (e) {
          store.dispatch.operators.setErrorMessage('Cannot retrieve operators')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    operatorsStore.isUserEndpointsLoaded,
    operatorsStore.isGroupsLoaded,
    operatorsStore.isExtensionsLoaded,
    operatorsStore.isAvatarsLoaded,
    operatorsStore.isFavoritesLoaded,
  ])

  // register to phone island events

  const user = authStore.username
  const { mainPresence: topBarPresence, mainextension } = useSelector(
    (state: RootState) => state.user,
  )

  // load / reload queues
  useEffect(() => {
    if (mainextension && operatorsStore.isOperatorsLoaded && !queuesStore.isLoaded) {
      retrieveQueues(authStore.username, mainextension, operatorsStore.operators)
    }
  }, [queuesStore.isLoaded, operatorsStore.isOperatorsLoaded, mainextension])

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

  useEventListener('phone-island-main-presence', (data: any) => {
    const opName = Object.keys(data)[0]
    const mainPresence = data[opName].mainPresence
    store.dispatch.operators.updateMainPresence(opName, mainPresence)
    if (data[user] && data[user].mainPresence !== topBarPresence) {
      dispatch.user.updateMainPresence(mainPresence)
    }
  })

  useEventListener('phone-island-conversations', (data) => {
    const opName = Object.keys(data)[0]
    const conversations = data[opName].conversations
    store.dispatch.operators.updateConversations(opName, conversations)

    // update queue connected calls

    let queueConnectedCalls: any = {}

    Object.values(conversations).forEach((conversation: any) => {
      if (conversation.throughQueue && conversation.connected && conversation.queueId) {
        const queueFound = queuesStore.queues[conversation.queueId]

        if (queueFound) {
          let calls = queueConnectedCalls[queueFound.queue] || []
          calls.push({ conversation, operatorUsername: opName })
          queueConnectedCalls[queueFound.queue] = calls
        }
      }
    })

    Object.keys(queueConnectedCalls).forEach((queueId: string) => {
      const connectedCalls = queueConnectedCalls[queueId]
      store.dispatch.queues.setConnectedCalls(queueId, connectedCalls)
    })
  })

  useEventListener('phone-island-queue-update', (data: any) => {
    const queueId = Object.keys(data)[0]
    const queueData = data[queueId]

    // skip events related to unknown queues
    const knownQueues = Object.keys(queuesStore.queues)

    if (!knownQueues.includes(queueId)) {
      return
    }

    store.dispatch.queues.processQueue({
      queueData,
      username: authStore.username,
      mainextension,
      operators: operatorsStore.operators,
    })
  })

  useEventListener('phone-island-queue-member-update', (data: any) => {
    const opMainExtension = Object.keys(data)[0]
    const queueMemberData = data[opMainExtension]
    store.dispatch.queues.setQueueMember(queueMemberData)
  })

  return (
    <>
      <div>
        <Head>
          <title>{cleanProductNamePageTitle()}</title>
        </Head>
      </div>
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
    </>
  )
}
