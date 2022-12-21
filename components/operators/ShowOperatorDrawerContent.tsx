// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import classNames from 'classnames'
import { Avatar, Button, Dropdown, IconSwitch } from '../common'
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircle,
  faComment,
  faEllipsisVertical,
  faEnvelope,
  faHandPointUp,
  faMobileScreenButton,
  faPhone,
  faPhoneSlash,
  faStar,
  faTicket,
  faUserSecret,
  faVideo,
} from '@fortawesome/free-solid-svg-icons'
import { OperatorStatusBadge } from './OperatorStatusBadge'
import {
  addOperatorToFavorites,
  callOperator,
  isOperatorCallable,
  reloadOperators,
  removeOperatorFromFavorites,
} from '../../lib/operators'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { formatDuration } from '../../lib/dateTime'

export interface ShowOperatorDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowOperatorDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowOperatorDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const auth = useSelector((state: RootState) => state.authentication)
  const [isFavorite, setFavorite] = useState(false)

  useEffect(() => {
    setFavorite(config.favorite)
  }, [config])

  const toggleFavorite = () => {
    if (isFavorite) {
      removeOperatorFromFavorites(config.username, auth.username)
    } else {
      addOperatorToFavorites(config.username, auth.username)
    }
    setFavorite(!isFavorite)
    reloadOperators()
  }

  const getCallActionsMenu = () => (
    <>
      <Dropdown.Item icon={faTicket}>Book</Dropdown.Item>
      <Dropdown.Item icon={faPhoneSlash}>Hangup</Dropdown.Item>
      <Dropdown.Item icon={faUserSecret}>Spy</Dropdown.Item>
      <Dropdown.Item icon={faHandPointUp}>Intrude</Dropdown.Item>
      <Dropdown.Item icon={faCircle}>Record</Dropdown.Item>
    </>
  )

  return (
    <div className={classNames('p-1', className)} {...props}>
      <div className='flex min-w-0 flex-1 items-center justify-between'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 mr-4'>
            <Avatar
              size='extra_large'
              src={config.avatarBase64}
              placeholderType='person'
              bordered
            />
          </div>
          <div>
            <div>
              <h2 className='text-xl inline-block font-medium text-gray-700 dark:text-gray-200 mr-2'>
                {config.name}
              </h2>
              <IconSwitch
                on={isFavorite}
                size='large'
                icon={<FontAwesomeIcon icon={faStar} />}
                changed={() => toggleFavorite()}
              >
                <span className='sr-only'>Toggle favorite operator</span>
              </IconSwitch>
            </div>
            <OperatorStatusBadge
              operator={config}
              currentUsername={auth.username}
              callEnabled={false}
              size='small'
              className='mt-1'
            />
          </div>
        </div>
      </div>
      <div className='mt-8'>
        <Button
          variant='primary'
          onClick={() => callOperator(config)}
          disabled={!isOperatorCallable(config, auth.username)}
          className='mr-2'
        >
          <FontAwesomeIcon icon={faPhone} className='h-4 w-4 xl:mr-2' />
          <span className='hidden xl:inline-block'>Call</span>
          <span className='sr-only'>Call</span>
        </Button>
        <Button
          variant='white'
          disabled={!isOperatorCallable(config, auth.username)}
          className='mr-2'
        >
          <FontAwesomeIcon
            icon={faVideo}
            className='h-4 w-4 xl:mr-2 text-gray-500 dark:text-gray-400'
          />
          <span className='hidden xl:inline-block'>Videocall</span>
          <span className='sr-only'>Videocall</span>
        </Button>
        <Button variant='white' className='mr-2'>
          <FontAwesomeIcon
            icon={faComment}
            className='h-4 w-4 xl:mr-2 text-gray-500 dark:text-gray-400'
          />
          <span className='hidden xl:inline-block'>Chat</span>
          <span className='sr-only'>Chat</span>
        </Button>
      </div>
      <div className='mt-6 border-t border-gray-200 dark:border-gray-700'>
        <dl className='sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700'>
          {/* extension */}
          {config.endpoints?.mainextension[0]?.id && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Extension</dt>
              <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm text-primary dark:text-primary'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                  />
                  <span className='truncate cursor-pointer hover:underline'>
                    {config.endpoints.mainextension[0].id}
                  </span>
                </div>
              </dd>
            </div>
          )}
          {/* cellphone */}
          {config.endpoints?.cellphone[0]?.id && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Mobile</dt>
              <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm text-primary dark:text-primary'>
                  <FontAwesomeIcon
                    icon={faMobileScreenButton}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                  />
                  <span className='truncate cursor-pointer hover:underline'>
                    {config.endpoints.cellphone[0].id}
                  </span>
                </div>
              </dd>
            </div>
          )}
          {/* email */}
          {config.endpoints?.email[0]?.id && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Email</dt>
              <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm text-primary dark:text-primary'>
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                  />
                  <a
                    target='_blank'
                    rel='noreferrer'
                    href={`mailto: ${config.endpoints.email[0].id}`}
                    className='truncate hover:underline'
                  >
                    {config.endpoints.email[0].id}
                  </a>
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
      {/* ongoing call info */}
      {config.conversations?.length && (
        <div>
          <div className='mt-6 flex items-end justify-between'>
            <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>Current call</h4>
            {/* ongoing call menu */}
            <Dropdown items={getCallActionsMenu()} position='left'>
              <Button variant='ghost'>
                <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                <span className='sr-only'>Open call actions menu</span>
              </Button>
            </Dropdown>
          </div>
          <div className='mt-4 border-t border-gray-200 dark:border-gray-700'>
            <dl className='sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700'>
              {/*  interlocutor */}

              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Interlocutor
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  {config.conversations[0].counterpartName !==
                    config.conversations[0].counterpartNum && (
                    <div className='mb-1.5 flex items-center text-sm'>
                      <span className='truncate'>
                        {config.conversations[0].counterpartName || '-'}
                      </span>
                    </div>
                  )}
                  {/*  number */}
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <span className='truncate'>
                      {config.conversations[0].counterpartNum || '-'}
                    </span>
                  </div>
                </dd>
              </div>
              {/*  direction */}
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Direction</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <span className='truncate'>{config.conversations[0].direction}</span>
                  </div>
                </dd>
              </div>
              {/*  duration */}
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Duration</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <span className='truncate'>
                      {formatDuration(config.conversations[0].duration)}
                    </span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  )
})

ShowOperatorDrawerContent.displayName = 'ShowOperatorDrawerContent'
