// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ReactNode, useState, useEffect } from 'react'
import { NavBar, TopBar, MobileNavBar, SideDrawer, UserSidebarDrawer } from '.'
import { navItems, NavItemsProps } from '../../config/routes'
import { useRouter } from 'next/router'
import { getUserInfo } from '../../services/user'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../../store'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { closeSideDrawer, getProductName, closeToast } from '../../lib/utils'
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
import { Portal } from '@headlessui/react'
import { ParkCards } from '../parks/parkCards'
import { motion, useAnimation } from 'framer-motion'

interface LayoutProps {
  children: ReactNode
}
import { useTranslation } from 'react-i18next'
import Toast from '../common/Toast'
import { getCustomerCardsList, setUserSettings } from '../../lib/customerCard'
import { retrieveParksList } from '../../lib/park'
import { Tooltip } from 'react-tooltip'
import { getJSONItem, setJSONItem } from '../../lib/storage'
import { eventDispatch } from '../../lib/hooks/eventDispatch'
import { setMainDevice } from '../../lib/devices'

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false)
  const router = useRouter()
  const [items, setItems] = useState<NavItemsProps[]>(navItems)
  const dispatch = useDispatch<Dispatch>()
  const sideDrawer = useSelector((state: RootState) => state.sideDrawer)
  const toast = useSelector((state: RootState) => state.toast)
  const operatorsStore: any = useSelector((state: RootState) => state.operators)
  const [firstRenderOperators, setFirstRenderOperators] = useState(true)
  const [firstRenderGlobalSearchListener, setFirstRenderGlobalSearchListener] = useState(true)
  const [firstRenderAttach, setFirstRenderAttach] = useState(true)
  const [firstRenderDetach, setFirstRenderDetach] = useState(true)

  const [isUserInfoLoaded, setUserInfoLoaded] = useState(false)
  const authStore = useSelector((state: RootState) => state.authentication)

  const queuesStore = useSelector((state: RootState) => state.queues)

  const queueManagerStore = useSelector((state: RootState) => state.queueManagerQueues)

  const ctiStatus = useSelector((state: RootState) => state.ctiStatus)

  const profilePicture = useSelector((state: RootState) => state.profilePicture)

  const currentUsername = authStore.username
  const { operators } = useSelector((state: RootState) => state.operators)
  const { profile } = useSelector((state: RootState) => state.user)
  const {avoidClose} = useSelector((state: RootState) => state.sideDrawer)

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
    if (router?.pathname?.includes('/lines')) {
      items[5].current = true
    }

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
          default_device: userInfo.data.default_device,
          name: userInfo.data.name,
          username: userInfo.data.username,
          mainextension: userInfo.data.endpoints.mainextension[0].id,
          mainPresence: userInfo.data.mainPresence,
          endpoints: userInfo.data.endpoints,
          profile: userInfo.data.profile,
          avatar: userInfo.data.settings.avatar,
          settings: userInfo.data.settings,
          recallOnBusy: userInfo?.data?.recallOnBusy,
          lkhash: userInfo?.data?.lkhash,
        })
        setUserInfoLoaded(true)
      } else {
        if (!ctiStatus.isUserInformationMissing) {
          // update global store
          store.dispatch.ctiStatus.setUserInformationMissing(true)
          store.dispatch.ctiStatus.setWebRtcError(true)
          // force logout
          let isLogoutError: any = {
            isUserInformationMissing: true,
          }
          doLogout(isLogoutError)
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

    // Refresh api every 45 minutes
    const reloadInterval = setInterval(() => {
      fetchUserInfo()
      // Set timer to 45 minutes
    }, 1000 * 45 * 60)

    // Clean interval if user leave the page
    return () => {
      clearInterval(reloadInterval)
      document.removeEventListener('visibilitychange', visibilityChangeHandler)
    }
  }, [isUserInfoLoaded, resfreshUserInfo])

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

  // check here
  useEffect(() => {
    if (profilePicture?.isProfileEdite) {
      localStorage.removeItem('caches-' + authStore.username)
      retrieveAvatars(authStore)
      store?.dispatch?.profilePicture?.setEditedProfile(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profilePicture?.isProfileEdite])

  // get operators on page load
  useEffect(() => {
    async function fetchOperators() {
      if (profile?.macro_permissions?.presence_panel?.value) {
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
    }

    if (firstRenderOperators) {
      setFirstRenderOperators(false)
    } else {
      fetchOperators()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    operatorsStore.isOperatorsLoaded,
    firstRenderOperators,
    profile?.macro_permissions?.presence_panel?.value,
  ])

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
    if (
      mainextension &&
      operatorsStore.isOperatorsLoaded &&
      !queuesStore.isLoaded &&
      profile?.macro_permissions?.queue_agent?.value
    ) {
      retrieveQueues(authStore.username, mainextension, operatorsStore.operators)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    queuesStore.isLoaded,
    operatorsStore.isOperatorsLoaded,
    mainextension,
    profile?.macro_permissions?.queue_agent?.value,
  ])

  //load / reload queue manager queues
  useEffect(() => {
    if (
      mainextension &&
      operatorsStore.isOperatorsLoaded &&
      !queueManagerStore.isLoaded &&
      profile?.macro_permissions?.qmanager?.value
    ) {
      retrieveQueueManager(authStore.username, mainextension, operatorsStore.operators)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    queueManagerStore.isLoaded,
    operatorsStore.isOperatorsLoaded,
    mainextension,
    profile?.macro_permissions?.qmanager?.value,
  ])

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

  //Get user information from store
  const userInformation = useSelector((state: RootState) => state.user)

  useEventListener('phone-island-webrtc-unregistered', (data: any) => {})

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
                <svg className="h-full w-full text-gray-600 bg-white" viewBox="0 0 24 24">
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

  function isObjectEmpty(obj: any) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false
      }
    }
    return true
  }

  //set desktop phone device information
  const [desktopPhoneDevice, setDesktopPhoneDevice]: any = useState({})
  const [webrtcData, setWebrtcData]: any = useState({})

  useEffect(() => {
    if (userInformation?.endpoints) {
      let endpointsInformation = userInformation?.endpoints
      if (endpointsInformation?.extension) {
        setDesktopPhoneDevice(
          endpointsInformation?.extension.filter((phone) => phone?.type === 'nethlink'),
        )
        setWebrtcData(endpointsInformation?.extension.filter((phone) => phone?.type === 'webrtc'))
      }
    }
  }, [userInformation?.endpoints])

  const setMainDeviceId = async (device: any) => {
    let deviceIdInfo: any = {}
    if (device) {
      deviceIdInfo.id = device
      try {
        await setMainDevice(deviceIdInfo)
        dispatch.user.updateDefaultDevice(deviceIdInfo)
      } catch (err) {
        console.log(err)
      }
    }
  }

  const [isFirstLogin, setIsFirstLogin] = useState(true)

  useEffect(() => {
    if (isFirstLogin) {
      setIsFirstLogin(false)
      return
    }
    //set webrtc as default device if desktop phone is offline and if is setted as default device
    if (
      desktopPhoneDevice?.length > 0 &&
      desktopPhoneDevice[0]?.id !== '' &&
      operatorsStore?.extensions[desktopPhoneDevice[0]?.id]?.status &&
      operatorsStore?.extensions[desktopPhoneDevice[0]?.id]?.status === 'offline' &&
      userInformation?.default_device?.type === 'nethlink' &&
      webrtcData?.length > 0
    ) {
      let deviceIdInfo: any = {}
      deviceIdInfo = webrtcData[0]?.id
      setMainDeviceId(deviceIdInfo)
      dispatch.user.updateDefaultDevice(webrtcData[0]?.id)
      let deviceInformationObject = webrtcData[0]
      setIsFirstLogin(false)
      eventDispatch('phone-island-default-device-change', { deviceInformationObject })
    }
    // if default_device is setted to physical device detach phone island to avoid problems
    if (userInformation?.default_device?.type === 'physical') {
      let deviceInformationObject = webrtcData[0]
      eventDispatch('phone-island-detach', { deviceInformationObject })
    }
  }, [
    desktopPhoneDevice,
    operatorsStore?.extensions,
    webrtcData,
    userInformation?.default_device?.type,
  ])

  useEventListener('phone-island-conversations', (data) => {
    const opName = Object.keys(data)[0]
    const conversations = data[opName].conversations
    store.dispatch.operators.updateConversations(opName, conversations)
    if (!firstRenderAttach) {
      setFirstRenderAttach(true)
    }
    if (!firstRenderDetach) {
      setFirstRenderDetach(true)
    }
    // update queue connected calls

    let queueConnectedCalls: any = {}

    let queueManagerConnectedCalls: any = {}

    Object.values(conversations).forEach((conversation: any) => {
      if (conversation?.throughQueue && conversation?.connected && conversation?.queueId) {
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
      store?.dispatch?.queues?.setConnectedCalls(queueId, connectedCalls)
    })

    Object.keys(queueConnectedCalls).forEach((queueId: string) => {
      const connectedQueueManagerCalls = queueManagerConnectedCalls[queueId]
      store?.dispatch?.queueManagerQueues?.setConnectedCalls(queueId, connectedQueueManagerCalls)
    })

    // To delete connected calls we need to check user inside store
    // and also user inside data received from phone island event
    //Queues
    for (const queueId in queuesStore?.queues) {
      const queue = queuesStore?.queues[queueId]

      if (!isObjectEmpty(queue?.connectedCalls)) {
        const updatedConnectedCalls = queue.connectedCalls.filter((call: any) => {
          if (data[call?.operatorUsername]) {
            const conversation = data[call?.operatorUsername].conversations
            return !isObjectEmpty(conversation)
          }

          return true
        })

        store.dispatch.queues.setConnectedCalls(queueId, updatedConnectedCalls)
      }
    }

    //Queue manager
    for (const queueId in queueManagerStore?.queues) {
      const queueManagerQueues = queueManagerStore?.queues[queueId]

      if (!isObjectEmpty(queueManagerQueues?.connectedCalls)) {
        const updatedConnectedCalls = queueManagerQueues.connectedCalls.filter((call: any) => {
          if (data[call?.operatorUsername]) {
            const conversation = data[call?.operatorUsername].conversations
            return !isObjectEmpty(conversation)
          }

          return true
        })

        store.dispatch.queueManagerQueues.setConnectedCalls(queueId, updatedConnectedCalls)
      }
    }

    // If user start a call or receive a call close side drawer
    if (data[currentUsername] && isEmpty(data[currentUsername]?.conversations) && !avoidClose) {
      dispatch?.sideDrawer?.setShown(false)
    }

    // When user close listen call set to false and empty id conversation
    if (data[currentUsername] && isEmpty(data[currentUsername]?.conversations)) {
      let listeningInformations = {
        isListening: false,
        listening_id: '',
      }
      store?.dispatch?.userActions?.updateListeningInformation(listeningInformations)
    }

    // When user close intrude call set to false and empty id conversation
    if (data[currentUsername] && isEmpty(data[currentUsername]?.conversations)) {
      let intrudeInfo = {
        isIntrude: false,
        intrude_id: '',
      }
      store?.dispatch?.userActions?.updateIntrudeInformation(intrudeInfo)
    }

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
     * - Which type of customer card permissions has selected ( disabled, incoming )
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
          ] &&
          operatorsStore?.extensions[
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum
          ] !== '<unknown>'
        ) {
          // Get counterpartName from first element of conversation
          const customerCardNumber =
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum

          if (customerType && customerCardNumber && customerCardNumber !== 'unknown') {
            let ccardObject: any = '#' + customerCardNumber + '-' + customerType
            dispatch.customerCards.updateCallerCustomerCardInformation(ccardObject)
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
          ] &&
          operatorsStore?.extensions[
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum
          ] !== '<unknown>'
        ) {
          // Get counterpartName from first element of conversation
          const customerCardNumber =
            data[currentUsername]?.conversations[firstConversationKey]?.counterpartNum
          if (customerType && customerCardNumber && customerCardNumber !== 'unknown') {
            let ccardObject: any = '#' + customerCardNumber + '-' + customerType
            dispatch.customerCards.updateCallerCustomerCardInformation(ccardObject)

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
    }

    let extenUpdateObject: any = {
      status: data[currentUsername]?.status,
      dnd: data[currentUsername]?.dnd,
      port: data[currentUsername]?.port,
      sipuseragent: data[currentUsername]?.sipuseragent,
      username: data[currentUsername]?.username,
    }
    //check type of extenUpdate event
    // Update user extension
    store.dispatch.operators.updateExten(data[currentUsername]?.number, extenUpdateObject)
    if (
      !isEmpty(desktopPhoneDevice) &&
      data[currentUsername]?.number === desktopPhoneDevice[0]?.id &&
      data[currentUsername]?.status === 'online' &&
      isEmpty(data[currentUsername]?.conversation)
    ) {
      if (firstRenderDetach) {
        setMainDeviceId(desktopPhoneDevice[0]?.id)
        dispatch.user.updateDefaultDevice(desktopPhoneDevice[0]?.id)
        let deviceInformationObject = desktopPhoneDevice[0]
        setFirstRenderDetach(false)
        eventDispatch('phone-island-default-device-change', { deviceInformationObject })
      }
    } else if (
      data[currentUsername]?.number === desktopPhoneDevice[0]?.id &&
      data[currentUsername]?.status === 'offline' &&
      isEmpty(data[currentUsername]?.conversation)
    ) {
      if (firstRenderAttach) {
        let deviceIdInfo: any = {}
        deviceIdInfo = webrtcData[0]?.id
        setMainDeviceId(deviceIdInfo)
        dispatch.user.updateDefaultDevice(webrtcData[0]?.id)
        let deviceInformationObject = webrtcData[0]
        setFirstRenderAttach(false)
        eventDispatch('phone-island-default-device-change', { deviceInformationObject })
        eventDispatch('phone-island-attach', { deviceInformationObject })
      }
    }
  })

  // Save prev user main presence state
  const [prevOperatorState, setPrevOperatorState] = useState<string | null>(null)

  const currentOperator = operators[currentUsername]

  //check if user has closed current calls
  const [closedCall, setClosedCall] = useState(false)

  //check previous user mainPresence
  useEffect(() => {
    if (
      currentOperator &&
      currentOperator.mainPresence === 'online' &&
      (prevOperatorState === 'busy' || prevOperatorState === 'ringing') &&
      !closedCall
    ) {
      setClosedCall(true)
    } else {
      setClosedCall(false)
    }

    setPrevOperatorState(currentOperator ? currentOperator.mainPresence : null)
  }, [currentOperator, prevOperatorState, closedCall])

  // If user has closed phone island call let reload last calls
  useEffect(() => {
    if (closedCall) {
      store.dispatch.lastCalls.setReloadLastCalls(true)
    } else {
      store.dispatch.lastCalls.setReloadLastCalls(false)
    }
  }, [closedCall])

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

    store.dispatch.queues.processQueue({
      queueData,
      username: authStore.username,
      mainextension,
      operators: operatorsStore.operators,
    })

    // // queue manager
    if (!knownQueueManagerQueues.includes(queueId)) {
      return
    }

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
    store?.dispatch?.queues?.setQueueMember(queueMemberData)
    store?.dispatch?.queueManagerQueues?.setQueueMember(queueMemberData)
  })

  //check if the user makes a double login
  useEventListener('phone-island-user-already-login', () => {
    if (!ctiStatus?.webRtcError) {
      // update global store
      store?.dispatch?.ctiStatus?.setWebRtcError(true)
      // force logout
      let isLogoutError: any = {
        isWebrtcError: true,
      }
      doLogout(isLogoutError)
    }
  })

  //check if server reloaded
  useEventListener('phone-island-server-reloaded', () => {
    setResfreshUserInfo(true)
  })

  //check if server restart
  useEventListener('phone-island-server-disconnected', () => {
    if (!ctiStatus.isUserInformationMissing) {
      // update global store
      store.dispatch.ctiStatus.setUserInformationMissing(true)
      store.dispatch.ctiStatus.setWebRtcError(true)
      // force logout
      let isLogoutError: any = {
        isUserInformationMissing: true,
      }
      doLogout(isLogoutError)
    }
  })

  //check if socket reconnect
  useEventListener('phone-island-socket-disconnected', () => {})

  let timeoutSeconds = 3000

  useEffect(() => {
    if (toast?.isShown) {
      //  Timeout for toast
      setTimeout(() => {
        closeToast()
      }, timeoutSeconds)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast])

  //Avoid to see customer card if customer list is empty and preferences is not setted to never show
  const [customerCardsList, setCustomerCardsList]: any = useState({})
  const [isCustomerCardsListLoaded, setIsCustomerCardsListLoaded] = useState(false)
  const [customerCardError, setCustomerCardError] = useState('')

  // retrieve customer cards
  useEffect(() => {
    async function getCustomerCards() {
      if (!isCustomerCardsListLoaded && profile?.macro_permissions?.customer_card?.value) {
        try {
          setCustomerCardError('')
          const res = await getCustomerCardsList()
          setCustomerCardsList(res)
        } catch (e) {
          console.error(e)
          setCustomerCardError('Cannot retrieve customer cards list')
        }
        setIsCustomerCardsListLoaded(true)
      }
    }
    getCustomerCards()
  }, [
    isCustomerCardsListLoaded,
    customerCardsList,
    profile?.macro_permissions?.customer_card?.value,
  ])

  const ccardStatus = userInformation?.settings?.open_ccard
  useEffect(() => {
    if (isEmpty(customerCardsList) && ccardStatus !== 'disabled') {
      const ccardObject = {} as Record<string, any>
      ccardObject.open_ccard = 'disabled'
      changeCCardSettings(ccardObject)
      dispatch.user.updateSettings(ccardObject)
    }
  }, [customerCardsList])

  async function changeCCardSettings(ccardObject: any) {
    try {
      await setUserSettings(ccardObject)
      dispatch.user.updateSettings(ccardObject)
    } catch (e) {
      console.error(e)
    }
  }

  const parkingInfo = useSelector((state: RootState) => state.park)

  useEventListener('phone-island-parking-update', () => {
    // On phone island event reload park lists
    retrieveParksList()
  })

  const [firstRenderPark, setFirstRenderPark] = useState(true)
  useEffect(() => {
    if (firstRenderPark) {
      setFirstRenderPark(false)
      return
    }

    retrieveParksList()
  }, [firstRenderPark])

  const controls = useAnimation()

  useEffect(() => {
    if (parkingInfo?.isParkingFooterVisible) {
      controls.start({ y: 0, transition: { type: 'spring', damping: 10, stiffness: 200 } })
    }
  }, [parkingInfo?.isParkingFooterVisible, controls])

  const rightSideStatus: any = useSelector((state: RootState) => state.rightSideMenu)

  const { theme } = useSelector((state: RootState) => state?.darkTheme)
  const phoneIslandThemePreference = getJSONItem(`phone-island-theme-selected`) || ''

  useEffect(() => {
    if (
      phoneIslandThemePreference === null ||
      phoneIslandThemePreference === undefined ||
      phoneIslandThemePreference === ''
    ) {
      if (
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        setJSONItem('phone-island-theme-selected', { themeSelected: 'light' })
      } else {
        setJSONItem('phone-island-theme-selected', { themeSelected: 'dark' })
      }
    }
  }, [phoneIslandThemePreference, theme])

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
          <div className='flex flex-1 items-stretch overflow-hidden bg-body dark:bg-bodyDark'>
            <main
              className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 ${
                parkingInfo?.isParkingFooterVisible &&
                profile?.macro_permissions?.settings?.permissions?.parkings?.value
                  ? 'h-[55rem]'
                  : ''
              }`}
              id='main-content'
            >
              {/* Primary column */}
              <section
                aria-labelledby='primary-heading'
                className='flex min-w-0 flex-1 flex-col lg:order-last p-8'
              >
                {/* The page content */}
                {children}
              </section>
              <Portal>
                <SideDrawer
                  isShown={sideDrawer.isShown}
                  contentType={sideDrawer.contentType}
                  config={sideDrawer.config}
                  drawerClosed={() => closeSideDrawer()}
                />
                <UserSidebarDrawer isShown={rightSideStatus.isShown} />
              </Portal>
            </main>

            {/* Secondary column (hidden on smaller screens) */}
            <UserNavBar />
            <div className='absolute bottom-6 right-9 z-50'>
              {toast?.isShown && (
                <div>
                  <Toast
                    type={toast?.contentType || 'info'}
                    title={toast?.tytle || ''}
                    onClose={() => closeToast()}
                    show={toast?.isShown}
                    timeout={timeoutSeconds / 1000}
                  >
                    {toast?.message}
                  </Toast>
                </div>
              )}
            </div>

            {parkingInfo?.isParkingFooterVisible &&
            profile?.macro_permissions?.settings?.permissions?.parkings?.value ? (
              <motion.div
                className='absolute bottom-0 left:0 sm:bottom-0 sm:left-0 md:bottom-0 md:left-20'
                initial={{ y: 100 }}
                animate={controls}
              >
                <ParkCards />
                <Tooltip anchorSelect='.tooltip-parking-button' className='relative z-30'>
                  {t('Parks.Click and hold to take current parking in call')}
                </Tooltip>
              </motion.div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
