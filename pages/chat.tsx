// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell,
  faBellSlash,
  faEllipsisVertical,
  faMagnifyingGlass,
  faMessage,
  faPaperclip,
  faRightFromBracket,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { enGB, it } from 'date-fns/locale'
import i18next from 'i18next'
import { RootState, store } from '../store'
import { Avatar, Button, ConfirmationModal, Dropdown, TextInput } from '../components/common'
import { Table, type TableColumn } from '../components/common/Table'
import { newChat, openChatWith, useChatAllowed } from '../components/chat'
import { MissingPermission } from '../components/common/MissingPermissionsPage'
import type { ChatConversation } from '../models/chat'
import { Pagination } from '../components/common/Pagination'
import { openShowOperatorDrawer } from '../lib/operators'
import { faNewChat, groupInitials, groupLook } from '../components/chat/icons'

/** The conversations: a name opens the operator's (or the group's) drawer, Open chat the chat in the island. */
const Chat: NextPage = () => {
  const { t } = useTranslation()
  const { conversations, status } = useSelector((state: RootState) => state.chat)
  const operators = useSelector((state: RootState) => state.operators.operators) as any
  const avatars = useSelector((state: RootState) => state.operators.avatars) as any
  const [query, setQuery] = useState('')
  const allowed = useChatAllowed()
  const [toDelete, setToDelete] = useState<ChatConversation | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q
      ? conversations.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.peer.includes(q) ||
            c.last?.body.toLowerCase().includes(q),
        )
      : conversations
  }, [conversations, query])
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize))
  const current = Math.min(page, totalPages)
  const rows = list.slice((current - 1) * pageSize, current * pageSize)

  const displayName = (username?: string) =>
    (username && operators?.[username]?.name) || username || ''
  const showDetails = (c: ChatConversation) =>
    c.kind === 'group'
      ? store.dispatch.sideDrawer.update({ isShown: true, contentType: 'showChatGroup', config: c })
      : operators?.[c.peer] && openShowOperatorDrawer(operators[c.peer])
  const locale = i18next?.languages?.[0] === 'it' ? it : enGB

  if (!allowed) return <MissingPermission />
  const columns: TableColumn[] = [
    {
      header: t('Chat.Conversation'),
      cell: (c: ChatConversation) => (
        <button
          type='button'
          className='flex items-center text-left min-w-0'
          onClick={() => showDetails(c)}
        >
          <div className='relative h-10 w-10 flex-shrink-0'>
            {c.kind === 'group' && c.avatar ? (
              <Avatar src={c.avatar} size='base' />
            ) : c.kind === 'group' ? (
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                  groupLook(c.peer, c.name).className
                }`}
              >
                {groupInitials(c.name)}
              </span>
            ) : (
              <Avatar
                src={avatars?.[c.peer] ?? c.avatar}
                size='base'
                placeholderType='operator'
                status={operators?.[c.peer]?.mainPresence ?? 'offline'}
              />
            )}
          </div>
          <div className='ml-4 min-w-0'>
            <div className='flex items-center gap-2 min-w-0'>
              <span
                className={`truncate ${
                  c.unread
                    ? 'font-semibold text-gray-900 dark:text-gray-100'
                    : 'font-medium text-gray-900 dark:text-gray-100'
                }`}
              >
                {c.name}
              </span>
              {c.muted && (
                <FontAwesomeIcon
                  icon={faBellSlash}
                  className='h-3.5 w-3.5 shrink-0 text-indigo-700 dark:text-indigo-400'
                  title={t('Chat.Muted') || ''}
                />
              )}
            </div>
            <div className='text-sm text-gray-500 dark:text-gray-400 truncate'>
              {c.kind === 'group'
                ? `${c.members?.length ?? 0} ${t('Chat.members')}`
                : c.inactive
                ? t('Chat.No longer active')
                : `@${c.peer}`}
            </div>
          </div>
        </button>
      ),
    },
    {
      header: t('Chat.Last message'),
      cell: (c: ChatConversation) => (
        <div className='flex items-center gap-3 min-w-0'>
          <span
            className={`truncate text-sm ${
              c.unread
                ? 'font-medium text-gray-900 dark:text-gray-100'
                : 'text-gray-700 dark:text-gray-200'
            }`}
          >
            {c.last ? (
              <>
                {c.last.mine
                  ? `${t('Chat.You')}: `
                  : c.kind === 'group' && c.last.nick
                  ? `${displayName(c.last.nick)}: `
                  : ''}
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
              t('Chat.No messages')
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
      header: t('Chat.Date'),
      width: '16rem',
      // As the last calls: how long ago, then the date.
      cell: (c: ChatConversation) =>
        c.last ? (
          <span className='text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap'>
            {formatDistanceToNowStrict(c.last.ts, { addSuffix: true, locale })} (
            {format(c.last.ts, 'd MMM yyyy HH:mm', { locale })})
          </span>
        ) : (
          <span className='text-gray-500 dark:text-gray-400'>-</span>
        ),
    },
    {
      header: '',
      width: '13rem',
      className: 'text-right',
      cell: (c: ChatConversation, i: number) => (
        <div className='flex items-center justify-end gap-2'>
          <Button
            variant='ghost'
            className='whitespace-nowrap text-primaryActive dark:text-primaryActiveDark'
            onClick={() => openChatWith(c.peer)}
          >
            <FontAwesomeIcon icon={faMessage} className='h-4 w-4 mr-2' />
            {t('OperatorDrawer.Open chat')}
          </Button>
          <Dropdown
            items={
              // The items take no colour of their own: not the table cell's grey.
              <div className='text-gray-700 dark:text-gray-200'>
                <div
                  className={
                    c.peer.startsWith('cti-') ? '' : 'border-b border-gray-200 dark:border-gray-700'
                  }
                >
                  <Dropdown.Item
                    icon={c.muted ? faBell : faBellSlash}
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent('chat-island-mute', {
                          detail: { peer: c.peer, muted: !c.muted },
                        }),
                      )
                    }
                  >
                    {c.muted ? t('Chat.Unmute') : t('Chat.Mute')}
                  </Dropdown.Item>
                </div>
                {/* A CTI group's chat follows the CTI: nothing to leave or delete here. */}
                {!c.peer.startsWith('cti-') && (
                  <Dropdown.Item
                    icon={c.kind === 'group' && !c.owner ? faRightFromBracket : faTrash}
                    isRed
                    onClick={() => setToDelete(c)}
                  >
                    {c.kind === 'group' && !c.owner ? t('Chat.Leave') : t('Chat.Delete')}
                  </Dropdown.Item>
                )}
              </div>
            }
            position={i === rows.length - 1 && rows.length > 2 ? 'topVoicemail' : 'left'}
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
        description={
          toDelete?.kind === 'group'
            ? toDelete.owner
              ? t('Chat.Delete group confirm', { name: toDelete.name })
              : t('Chat.Leave confirm', { name: toDelete.name })
            : t('Chat.Delete confirm', { name: toDelete?.name ?? '' })
        }
        confirmLabel={
          toDelete?.kind === 'group' && !toDelete.owner ? t('Chat.Leave') : t('Common.Delete')
        }
        onConfirm={() => {
          if (toDelete)
            window.dispatchEvent(
              new CustomEvent('chat-island-delete', { detail: { username: toDelete.peer } }),
            )
          setToDelete(null)
        }}
      />
      <h1 className='text-2xl font-medium text-gray-900 dark:text-gray-100 mb-6'>
        {t('Chat.Conversations')}
      </h1>
      <div className='flex items-center justify-between gap-4 mb-6'>
        <div className='max-w-md flex-1'>
          <TextInput
            placeholder={t('Chat.Search') || ''}
            icon={faMagnifyingGlass}
            value={query}
            onChange={(e: any) => (setQuery(e.target.value), setPage(1))}
          />
        </div>
        <div className='flex items-center gap-3'>
          {status !== 'online' && (
            <span className='text-sm text-gray-500 dark:text-gray-400'>{t('Chat.Offline')}</span>
          )}
          <Button variant='primary' onClick={newChat} disabled={status !== 'online'}>
            <FontAwesomeIcon icon={faNewChat} className='h-4 w-4 mr-2' />
            {t('Chat.New chat')}
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        data={rows}
        emptyState={{
          title: t('Chat.No conversations'),
          description: t('Chat.No conversations description') || '',
          icon: (
            <FontAwesomeIcon icon={faMessage} className='mx-auto h-12 w-12' aria-hidden='true' />
          ),
        }}
        rowKey={(c: ChatConversation) => c.peer}
        trClassName='h-[68px]'
        scrollable={true}
        maxHeight='calc(100vh - 18rem)'
        footer={
          list.length > 0 ? (
            <Pagination
              currentPage={current}
              totalPages={totalPages}
              totalItems={list.length}
              pageSize={pageSize}
              onPreviousPage={() => setPage(Math.max(1, current - 1))}
              onNextPage={() => setPage(Math.min(totalPages, current + 1))}
              onSelectPage={setPage}
              onSelectPageSize={(size) => (setPageSize(size), setPage(1))}
              itemsName={t('Chat.conversations') || ''}
              className='!mb-0 !px-6'
            />
          ) : undefined
        }
      />
    </div>
  )
}

export default Chat
