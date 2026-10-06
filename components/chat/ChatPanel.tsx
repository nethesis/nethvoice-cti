// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useRef } from 'react'

/** A spot the chat island renders into: announced on mount, and again when the island comes up. */
const Slot = ({ event, className }: { event: string; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const announce = (el: HTMLElement | null) => window.dispatchEvent(new CustomEvent(event, { detail: { el } }))
    const onStatus = () => announce(ref.current)
    announce(ref.current)
    window.addEventListener('chat-island-status', onStatus)
    return () => {
      window.removeEventListener('chat-island-status', onStatus)
      announce(null)
    }
  }, [event])
  return <div ref={ref} className={className} />
}

/** The right panel with the pinned conversation. */
export const ChatPanel = () => (
  <aside className='relative z-20 hidden lg:block h-full lg:w-96 xl:w-[32rem] 2xl:w-[40rem] border-l border-gray-200 dark:border-gray-700'>
    <Slot event='chat-island-pin-target' className='h-full' />
  </aside>
)

/** The island's chat heads, among the rail icons. */
export const ChatRail = () => <Slot event='chat-island-rail-target' />
