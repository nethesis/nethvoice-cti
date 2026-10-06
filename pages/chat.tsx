// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEllipsisVertical,
  faMagnifyingGlass,
  faCommentDots,
  faPaperclip,
  faCommentMedical,
  faRightFromBracket,
  faTrash,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { RootState } from '../store'
import { Avatar, Button, ConfirmationModal, Dropdown, TextInput } from '../components/common'
import { Table, type TableColumn } from '../components/common/Table'
import { newChat, openChatWith, useChatAllowed } from '../components/chat'
import { MissingPermission } from '../components/common/MissingPermissionsPage'
import type { ChatConversation } from '../models/chat'
import { ChatTime } from '../components/chat/ChatTime'

/** Conversations table; a row opens the chat in the island. */
const Chat: NextPage = () => {
  const { t } = useTranslation()
  const { conversations, status } = useSelector((state: RootState) => state.chat)
  const operators = useSelector((state: RootState) => state.operators.operators) as any
  const [query, setQuery] = useState('')
  const allowed = useChatAllowed()
  const [toDelete, setToDelete] = useState<ChatConversation | null>(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? conversations.filter((c) => c.name.toLowerCase().includes(q) || c.peer.includes(q) || c.last?.body.toLowerCase().includes(q))
      : conversations
  }, [conversations, query])

  const displayName = (username?: string) => (username && operators?.[username]?.name) || username || ''

  if (!allowed) return <MissingPermission />
  const columns: TableColumn[] = [
    {
      header: t('Chat.Conversation'),
      cell: (c: ChatConversation) => (
        <div className='flex items-center'>
          <div className='relative h-10 w-10 flex-shrink-0'>
            {c.kind === 'group' && c.avatar ? (
              <Avatar src={c.avatar} size='base' />
            ) : c.kind === 'group' ? (
              <span className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-700 text-white'>
                <FontAwesomeIcon icon={faUsers} className='h-4 w-4' />
              </span>
            ) : (
              <>
                <Avatar src={c.avatar} size='base' placeholderType='operator' />
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 ${c.online || c.mobile ? 'bg-green-500' : 'bg-gray-400'}`} />
              </>
            )}
          </div>
          <div className='ml-4 min-w-0'>
            <div className={`truncate ${c.unread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-secondaryNeutral dark:text-secondaryNeutralDark'}`}>{c.name}</div>
            {c.inactive && <div className='mt-1 text-sm text-gray-500 dark:text-gray-400'>{t('Chat.No longer active')}</div>}
            {c.kind === 'group' && c.members && (
              <div className='mt-1 text-sm text-gray-500 dark:text-gray-400 truncate' title={c.members.map(displayName).join(', ')}>
                {c.members.length} {t('Chat.members')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: t('Chat.Last message'),
      cell: (c: ChatConversation) => (
        <div className='flex items-center gap-3 min-w-0'>
          <span className={`truncate text-sm ${c.unread ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {c.last ? (
              <>
                {c.last.mine ? `${t('Chat.You')}: ` : c.kind === 'group' && c.last.nick ? `${displayName(c.last.nick)}: ` : ''}
                {c.last.oob ? (
                  <>
                    <FontAwesomeIcon icon={faPaperclip} className='h-3.5 w-3.5 mr-1' />
                    {t('Chat.Attachment')}
                  </>
                ) : (
                  c.last.body
                )}
              </>
            ) : (
              <span className='italic'>{t('Chat.No messages yet')}</span>
            )}
          </span>
          {c.unread > 0 && (
            <span className='shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary dark:bg-primaryDark text-white dark:text-gray-950 text-xs font-medium flex items-center justify-center'>
              {c.unread}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t('Chat.Time'),
      width: '13rem',
      cell: (c: ChatConversation) => (c.last ? <ChatTime ts={c.last.ts} /> : null),
    },
    {
      header: '',
      width: '4rem',
      className: 'text-right',
      // A CTI group's chat follows the CTI: nothing to leave or delete here.
      cell: (c: ChatConversation, i: number) => c.peer.startsWith('cti-') ? null : (
        <div className='flex items-center justify-end gap-2' onClick={(e) => e.stopPropagation()}>
          <Dropdown
            items={
              <Dropdown.Item icon={c.kind === 'group' && !c.owner ? faRightFromBracket : faTrash} isRed onClick={() => setToDelete(c)}>
                {c.kind === 'group' && !c.owner ? t('Chat.Leave') : t('Chat.Delete')}
              </Dropdown.Item>
            }
            position={i === list.length - 1 ? 'topVoicemail' : 'left'}
          >
            <Button variant='ghost' className='py-2 px-2 h-9 w-9'>
              <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
              <span className='sr-only'>{t('Chat.Open menu')}</span>
            </Button>
          </Dropdown>
        </div>
      ),
    },
  ]

  return (
    <div>
      <ConfirmationModal
        show={!!toDelete}
        onClose={() => setToDelete(null)}
        title={toDelete?.kind === 'group' && !toDelete.owner ? t('Chat.Leave') : t('Chat.Delete')}
        description={toDelete?.kind === 'group' ? (toDelete.owner ? t('Chat.Delete group confirm', { name: toDelete.name }) : t('Chat.Leave confirm', { name: toDelete.name })) : t('Chat.Delete confirm', { name: toDelete?.name ?? '' })}
        confirmLabel={toDelete?.kind === 'group' && !toDelete.owner ? t('Chat.Leave') : t('Common.Delete')}
        onConfirm={() => {
          if (toDelete) window.dispatchEvent(new CustomEvent('chat-island-delete', { detail: { username: toDelete.peer } }))
          setToDelete(null)
        }}
      />
      <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6'>{t('Chat.Conversations')}</h1>
      <div className='flex items-center justify-between gap-4 mb-6'>
        <div className='max-w-md flex-1'>
          <TextInput placeholder={t('Chat.Search') || ''} icon={faMagnifyingGlass} value={query} onChange={(e: any) => setQuery(e.target.value)} />
        </div>
        <div className='flex items-center gap-3'>
          {status !== 'online' && <span className='text-sm text-gray-500 dark:text-gray-400'>{t('Chat.Offline')}</span>}
          <Button variant='primary' onClick={newChat} disabled={status !== 'online'}>
            <FontAwesomeIcon icon={faCommentMedical} className='h-4 w-4 mr-2' />
            {t('Chat.New chat')}
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        data={list}
        emptyState={{
          title: t('Chat.No conversations'),
          description: t('Chat.No conversations description') || '',
          icon: <FontAwesomeIcon icon={faCommentDots} className='mx-auto h-12 w-12' aria-hidden='true' />,
        }}
        onRowClick={(c: ChatConversation) => openChatWith(c.peer)}
        rowKey={(c: ChatConversation) => c.peer}
        trClassName='h-[84px]'
        scrollable={true}
        maxHeight='calc(100vh - 16rem)'
      />
    </div>
  )
}

export default Chat
