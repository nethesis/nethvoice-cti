// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '@nethesis/chat-island/dist/index.css'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { callPhoneNumber, isNethlinkOnline } from '../../lib/utils'
import { ChatToast, type ChatNotice } from './ChatToast'

const ChatIsland = dynamic(() => import('@nethesis/chat-island').then((mod) => mod.ChatIsland), {
  ssr: false,
})

/** Open the chat with a colleague or a group address; in NethLink when it runs. */
export const openChatWith = (username: string) => {
  if (isNethlinkOnline()) window.location.href = `nethlink://chat?to=${encodeURIComponent(username)}`
  else window.dispatchEvent(new CustomEvent('chat-island-open', { detail: { username } }))
}

export const newChat = () => {
  if (isNethlinkOnline()) window.location.href = 'nethlink://chat'
  else window.dispatchEvent(new CustomEvent('chat-island-new'))
}

/** One island at a time: with NethLink running the chat lives there. */
export const useChatInNethlink = () => useSelector(() => isNethlinkOnline())

/** Chat switched on for this NethVoice (window.CONFIG). */
export const chatEnabled = () => typeof window !== 'undefined' && String((window as any).CONFIG?.CHAT_ENABLED) === 'true'

/** Chat on and allowed by the CTI profile. */
export const useChatAllowed = () =>
  useSelector((state: RootState) => chatEnabled() && !!(state.user as any)?.profile?.macro_permissions?.nethvoice_cti?.permissions?.chat?.value)

export function ChatIslandMount() {
  const allowed = useChatAllowed()
  const inNethlink = useChatInNethlink()
  const auth = useSelector((state: RootState) => state.authentication)
  const currentUser = useSelector((state: RootState) => state.user)
  const operatorsStore = useSelector((state: RootState) => state.operators)

  const config = useMemo(() => {
    if (!auth.token || !currentUser.username) return ''
    // @ts-ignore
    return btoa(`${window.CONFIG.API_ENDPOINT}:${currentUser.username}:${auth.token}`)
  }, [auth.token, currentUser.username])

  const [ready, setReady] = useState(false)
  const [notice, setNotice] = useState<ChatNotice | null>(null)
  const closeNotice = useCallback(() => setNotice(null), [])
  useEffect(() => {
    const on = (name: string, fn: (detail: any) => void) => {
      const handler = (e: Event) => fn((e as CustomEvent).detail)
      window.addEventListener(name, handler)
      return () => window.removeEventListener(name, handler)
    }
    const offs = [
      on('chat-island-status', (d) => {
        store.dispatch.chat.setStatus(d.status)
        setReady(true)
      }),
      on('chat-island-unread', (d) => store.dispatch.chat.setUnread(d.total)),
      on('chat-island-conversations', (d) => store.dispatch.chat.setConversations(d.conversations)),
      on('chat-island-call', (d) => d?.number && callPhoneNumber(d.number)),
      // Messages from the same conversation add up in one toast.
      on('chat-island-notify', (d) => d?.body && setNotice((n) => ({ ...d, count: n && n.peer === d.peer ? n.count + 1 : 1 }))),
    ]
    return () => offs.forEach((off) => off())
  }, [])

  // Colleagues for the island: names, avatars, presence, number.
  useEffect(() => {
    const operators: any = operatorsStore.operators || {}
    const avatars: any = operatorsStore.avatars || {}
    const contacts = Object.values(operators)
      .filter((op: any) => op?.username && op.username !== currentUser.username)
      .map((op: any) => ({
        username: op.username,
        name: op.name || op.username,
        avatar: avatars[op.username],
        presence: op.mainPresence,
        number: op.endpoints?.mainextension?.[0]?.id,
      }))
    if (contacts.length) {
      window.dispatchEvent(new CustomEvent('chat-island-contacts', { detail: { contacts } }))
    }
    // resent once the island is up
  }, [operatorsStore.operators, operatorsStore.avatars, currentUser.username, ready])

  useEffect(() => {
    if (!inNethlink) return
    store.dispatch.chat.setConversations([])
    store.dispatch.chat.setUnread(0)
  }, [inNethlink])

  if (!config || !allowed || inNethlink) return null
  return (
    <>
      <ChatIsland dataConfig={config} serviceWorker='/chat-island-sw.js' newChatButton={false} maxHeads={5} notifications='auto' />
      <div className='fixed top-6 right-9 z-50'>
        <ChatToast notice={notice} onOpen={openChatWith} onClose={closeNotice} />
      </div>
    </>
  )
}
