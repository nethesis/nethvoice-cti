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
import { closeSideDrawer, getProductName, getHtmlFaviconElement } from '../../lib/utils'
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
import { retrieveQueueManager } from '../../lib/queueManager'
import Head from 'next/head'
import { capitalize, isEmpty } from 'lodash'
import { doLogout } from '../../services/login'
import { UserNavBar } from './UserNavBar'
import { getProfilingInfo } from '../../services/profiling'
import { ProfilingTypes } from '../../models/profiling'

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
  const operatorsStore: any = useSelector((state: RootState) => state.operators)
  const [firstRenderOperators, setFirstRenderOperators] = useState(true)
  const [firstRenderUserInfo, setFirstRenderUserInfo] = useState(true)
  const [firstRenderGlobalSearchListener, setFirstRenderGlobalSearchListener] = useState(true)
  const [firstRenderFaviconCheck, setFirstRenderFaviconCheck]: any = useState(true)

  const [isUserInfoLoaded, setUserInfoLoaded] = useState(false)
  const authStore = useSelector((state: RootState) => state.authentication)

  const queuesStore = useSelector((state: RootState) => state.queues)

  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

  const ctiStatus = useSelector((state: RootState) => state.ctiStatus)
  const [linkHtmlFaviconElement, setLinkHtmlFaviconElement] = useState<any>(null)

  const productName = getProductName()
  // Get current page name, clean the path from / and capitalize page name
  function cleanProductNamePageTitle() {
    if (router.pathname) {
      // Delete slash at the beginning of the path
      const cleanRouterPath: string = router.pathname.replace(/^\/|\/$/g, '')
      // Return path with the uppercase first character
      return t(`Common.${capitalize(cleanRouterPath)}`) + ' - ' + productName
    }
  }

  const { t } = useTranslation()

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

  const [resfreshUserInfo, setResfreshUserInfo] = useState(true)

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
          settings: userInfo.data.settings,
        })
        setUserInfoLoaded(true)
      } else {
        if (!ctiStatus.isUserInformationMissing) {
          // update global store
          store.dispatch.ctiStatus.setUserInformationMissing(true)
          // force logout
          doLogout()
        }
      }
    }

    // visibilityChangeHandler do not manage refresh, this is only for refresh case
    if (resfreshUserInfo) {
      fetchUserInfo()
      setResfreshUserInfo(false)
    }
    const visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible') {
        setResfreshUserInfo(false)
        setUserInfoLoaded(false)
        fetchUserInfo()
      } else {
        // TODO Implement actions when the visibility is off
      }
    }

    // Manage change of visibility
    document.addEventListener('visibilitychange', visibilityChangeHandler)

    // Refresh api every hours
    const reloadInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUserInfo()
      }
      // Set timer to 50 minutes
    }, 1000 * 50 * 60)

    // Clean interval if user leave the page
    return () => {
      clearInterval(reloadInterval)
      document.removeEventListener('visibilitychange', visibilityChangeHandler)
    }
  }, [isUserInfoLoaded])

  // get profiling data on page load
  useEffect(() => {
    const fetchProfilingInfo = async () => {
      const profilingInfo: ProfilingTypes = await getProfilingInfo()

      if (profilingInfo) {
        dispatch.profiling.update(profilingInfo)
      }
    }

    fetchProfilingInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  //load / reload queue manager queues
  useEffect(() => {
    if (mainextension && operatorsStore.isOperatorsLoaded && !queueManagerStore.isLoaded) {
      retrieveQueueManager(authStore.username, mainextension, operatorsStore.operators)
    }
  }, [queueManagerStore.isLoaded, operatorsStore.isOperatorsLoaded, mainextension])

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

  const currentUsername = authStore.username
  const { operators } = useSelector((state: RootState) => state.operators)
  const { profile } = useSelector((state: RootState) => state.user)

  //Get user information from store
  const userInformation = useSelector((state: RootState) => state.user)

  const [conversationObject, setConversationObject]: any = useState({})

  const [variableCheck, setVariableCheck] = useState(false)

  useEffect(() => {
    function showNotification() {
      if (document.visibilityState !== 'visible' && variableCheck) {
        if (Notification.permission === 'granted') {
          let iconUrl = ''

          if (conversationObject) {
            if (conversationObject?.avatar && conversationObject?.avatar != '') {
              //If caller has avatar use it
              iconUrl = conversationObject?.avatar
            } else {
              //Else use default icon
              const svgString = `
                <svg class="h-full w-full text-gray-600 bg-white" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              `
              // Convert svg icon
              const blob = new Blob([svgString], { type: 'image/svg+xml' })
              iconUrl = URL.createObjectURL(blob)
            }

            // Create notification with caller informations
            const notification = new Notification(`${conversationObject?.name}`, {
              body: `${conversationObject?.number}`,
              icon: iconUrl,
            })

            setVariableCheck(false)

            notification.onclick = function () {
              notification.close()
              window.focus()
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

  useEventListener('phone-island-conversations', (data) => {
    const opName = Object.keys(data)[0]
    const conversations = data[opName].conversations
    store.dispatch.operators.updateConversations(opName, conversations)

    // update queue connected calls

    let queueConnectedCalls: any = {}

    let queueManagerConnectedCalls: any = {}

    Object.values(conversations).forEach((conversation: any) => {
      if (conversation.throughQueue && conversation.connected && conversation.queueId) {
        const queueFound = queuesStore.queues[conversation.queueId]
        const queueManagerFound = queueManagerStore.queues[conversation.queueId]

        if (queueFound) {
          let calls = queueConnectedCalls[queueFound.queue] || []
          calls.push({ conversation, operatorUsername: opName })
          queueConnectedCalls[queueFound.queue] = calls
        }

        if (queueManagerFound) {
          let callsQueueManager = queueManagerConnectedCalls[queueManagerFound.queue] || []
          callsQueueManager.push({ conversation, operatorUsername: opName })
          queueManagerConnectedCalls[queueManagerFound.queue] = callsQueueManager
        }
      }
    })

    Object.keys(queueConnectedCalls).forEach((queueId: string) => {
      const connectedCalls = queueConnectedCalls[queueId]
      store.dispatch.queues.setConnectedCalls(queueId, connectedCalls)
    })

    Object.keys(queueConnectedCalls).forEach((queueId: string) => {
      const connectedQueueManagerCalls = queueManagerConnectedCalls[queueId]
      store.dispatch.queueManagerQueues.setConnectedCalls(queueId, connectedQueueManagerCalls)
    })

    setVariableCheck(false)
    if (
      data[currentUsername] &&
      data[currentUsername]?.conversations &&
      operators[currentUsername]?.mainPresence === 'ringing'
    ) {
      const firstElementConversation = Object.keys(data[currentUsername].conversations)[0]

      if (firstElementConversation && !isEmpty(data[currentUsername]?.conversations)) {
        let callerInfo =
          operatorsStore?.extensions[
            data[currentUsername]?.conversations[firstElementConversation]?.counterpartNum
          ]

        let callerUsername = callerInfo?.username
        let callerAvatar = operatorsStore.avatars[callerUsername]
        let notificationObject: any = {
          number: data[currentUsername]?.conversations[firstElementConversation]?.counterpartNum,
          name: data[currentUsername]?.conversations[firstElementConversation]?.counterpartName,
          avatar: callerAvatar || '',
        }
        //Set all the content that will be displayed on notification
        setConversationObject(notificationObject)
        setVariableCheck(true)
      }
    }

    /* CUSTOMER CARDS SECTION
     * On phone-island-conversations event must be checked if user:
     * - Has customer card permissions
     * - Which type of customer card permissions has selected ( never, incoming )
     * - If path if different from customer card
     * - Which type of mainPresence status has got ( ringing, busy )
     * - Check if counterpartNum is not present in allExtension api call result
     */

    // If status is equal to ringing and customer card equal to incoming
    if (
      data[currentUsername] &&
      operators[currentUsername] &&
      operators[currentUsername]?.mainPresence === 'ringing' &&
      profile?.macro_permissions?.customer_card?.value &&
      data[currentUsername]?.conversations &&
      !router.pathname.includes('customercards') &&
      userInformation?.settings?.open_ccard === 'incoming'
    ) {
      if (data[currentUsername]?.conversations) {
        // Get key from first element of conversation
        const firstConversationKey = Object.keys(data[currentUsername].conversations)[0]
        //set customer type default type to person
        const customerType = 'person'

        // Check if key exist and number of caller is not internal
        if (
          firstConversationKey &&
          !operatorsStore?.extensions[
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum
          ]
        ) {
          // Get counterpartName from first element of conversation
          const customerCardNumber =
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum
          if (customerType && customerCardNumber) {
            let ccardObject: any = '#' + customerCardNumber + '-' + customerType
            dispatch.customerCards.updateCallerCustomerCardInformation(ccardObject)
          }
          // If all conditions are satisfied go to customercards and set in to the store number and type
          router
            .replace(
              {
                pathname: `/customercards`,
              },
              undefined,
              {
                shallow: true,
              },
            )
            .catch((e) => {
              if (!e.cancelled) {
                throw e
              }
            })
        }
      }
    }

    // If status is equal to busy and customer card equal to connected
    if (
      data[currentUsername] &&
      operators[currentUsername] &&
      operators[currentUsername]?.mainPresence === 'busy' &&
      profile?.macro_permissions?.customer_card?.value &&
      data[currentUsername]?.conversations &&
      !router.pathname.includes('customercards') &&
      userInformation?.settings?.open_ccard === 'connected'
    ) {
      if (data[currentUsername]?.conversations) {
        // Get key from first element of conversation
        const firstConversationKey = Object.keys(data[currentUsername].conversations)[0]
        //set customer type default type to person
        const customerType = 'person'

        // Check if key exist and number of caller is not internal
        if (
          firstConversationKey &&
          !operatorsStore?.extensions[
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum
          ]
        ) {
          // Get counterpartName from first element of conversation
          const customerCardNumber =
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum
          if (customerType && customerCardNumber) {
            let ccardObject: any = '#' + customerCardNumber + '-' + customerType
            dispatch.customerCards.updateCallerCustomerCardInformation(ccardObject)
          }
          // If all conditions are satisfied go to customercards and set in to the store number and type
          router
            .replace(
              {
                pathname: `/customercards`,
              },
              undefined,
              {
                shallow: true,
              },
            )
            .catch((e) => {
              if (!e.cancelled) {
                throw e
              }
            })
        }
      }
    }
  })

  useEventListener('phone-island-queue-update', (data: any) => {
    const queueId = Object.keys(data)[0]
    const queueData = data[queueId]

    // skip events related to unknown queues
    const knownQueues = Object.keys(queuesStore.queues)

    // skip events related to unknown queue manager queues
    const knownQueueManagerQueues = Object.keys(queueManagerStore.queues)

    // queue
    if (!knownQueues.includes(queueId)) {
      return
    }

    // queue manager
    if (!knownQueueManagerQueues.includes(queueId)) {
      return
    }

    store.dispatch.queues.processQueue({
      queueData,
      username: authStore.username,
      mainextension,
      operators: operatorsStore.operators,
    })

    store.dispatch.queueManagerQueues.processQueue({
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
    store.dispatch.queueManagerQueues.setQueueMember(queueMemberData)
  })

  //check if the user makes a double login
  useEventListener('phone-island-user-already-login', () => {
    if (!ctiStatus.webRtcError) {
      // update global store
      store.dispatch.ctiStatus.setWebRtcError(true)
      // force logout
      doLogout()
    }
  })

  const [idInterval, setIdInterval] = useState<any>(0)

  function manageFaviconInterval() {
    const warningMessageFavicon = t('Common.Warning')
    const callingMessageFavicon = t('Common.Calling')
    setLinkHtmlFaviconElement(getHtmlFaviconElement())
    let flashFavicon = true
    if (ctiStatus.webRtcError || ctiStatus.isPhoneRinging) {
      const intervalId = setInterval(() => {
        if (flashFavicon) {
          if (ctiStatus.webRtcError) {
            if (linkHtmlFaviconElement) {
              ;('you are entered wrong')
              linkHtmlFaviconElement.href = 'favicon-warn.ico'
            }
            window.document.title = warningMessageFavicon
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

  useEffect(() => {
    manageFaviconInterval()
    return () => {
      clearFaviconInterval()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctiStatus.webRtcError, ctiStatus.isPhoneRinging])

  // Check if the user is in the main page but have the wrong icon
  useEffect(() => {
    if (firstRenderFaviconCheck) {
      setFirstRenderFaviconCheck(false)
      return
    }
    if (idInterval === 0 && !ctiStatus.webRtcError && linkHtmlFaviconElement) {
      linkHtmlFaviconElement.href = 'favicon.ico'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRenderFaviconCheck])

  //check if server reloaded
  useEventListener('phone-island-server-reloaded', () => {
    setUserInfoLoaded(false)
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
            <main className='flex-1 overflow-y-auto' id='main-content'>
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
            <UserNavBar />
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
