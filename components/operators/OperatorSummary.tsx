// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import classNames from 'classnames'
import { Avatar, Button, IconSwitch } from '../common'
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment, faEnvelope } from '@nethesis/nethesis-regular-svg-icons'
import { OperatorStatusBadge } from './OperatorStatusBadge'
import {
  addOperatorToFavorites,
  callOperator,
  isOperatorCallable,
  openShowOperatorDrawer,
  reloadOperators,
  removeOperatorFromFavorites,
} from '../../lib/operators'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { callPhoneNumber } from '../../lib/utils'
import {
  faMobileScreenButton,
  faPhone,
  faStar as faStarSolid,
  faVideo,
} from '@nethesis/nethesis-solid-svg-icons'
import { faStar as faStarLight } from '@nethesis/nethesis-light-svg-icons'

export interface OperatorSummaryProps extends ComponentPropsWithRef<'div'> {
  operator: any
  isShownFavorite: boolean
  isShownSideDrawerLink: boolean
}

export const OperatorSummary = forwardRef<HTMLButtonElement, OperatorSummaryProps>(
  ({ operator, isShownFavorite, isShownSideDrawerLink = false, className, ...props }, ref) => {
    const auth = useSelector((state: RootState) => state.authentication)
    const [isFavorite, setFavorite] = useState(false)

    useEffect(() => {
      setFavorite(operator.favorite)
    }, [operator])

    const toggleFavorite = () => {
      if (isFavorite) {
        removeOperatorFromFavorites(operator.username, auth.username)
      } else {
        addOperatorToFavorites(operator.username, auth.username)
      }
      setFavorite(!isFavorite)
      reloadOperators()
    }

    const maybeShowSideDrawer = (operator: any) => {
      if (!isShownSideDrawerLink) {
        return
      }
      // close global search
      openShowOperatorDrawer(operator)
      store.dispatch.globalSearch.setOpen(false)
      store.dispatch.globalSearch.setFocused(false)
    }

    return (
      <>
        <div
          className={classNames('flex min-w-0 items-center justify-between', className)}
          {...props}
        >
          <div className='flex items-center'>
            <div className='flex-shrink-0 mr-4'>
              <Avatar
                size='extra_large'
                src={operator.avatarBase64}
                placeholderType='operator'
                onClick={() => maybeShowSideDrawer(operator)}
                className={classNames(isShownSideDrawerLink && 'cursor-pointer')}
              />
            </div>
            <div>
              <div>
                <h2
                  className={classNames(
                    'text-xl inline-block font-medium text-gray-700 dark:text-gray-200 mr-2',
                    isShownSideDrawerLink && 'cursor-pointer hover:underline',
                  )}
                  onClick={() => maybeShowSideDrawer(operator)}
                >
                  {operator.name}
                </h2>
                {isShownFavorite && (
                  <IconSwitch
                    on={isFavorite}
                    size='large'
                    onIcon={<FontAwesomeIcon icon={faStarSolid} />}
                    offIcon={<FontAwesomeIcon icon={faStarLight} />}
                    changed={() => toggleFavorite()}
                    className={'mr-5'}
                  >
                    <span className='sr-only'>Toggle favorite operator</span>
                  </IconSwitch>
                )}
              </div>
              <OperatorStatusBadge
                operator={operator}
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
            onClick={() => callOperator(operator)}
            disabled={!isOperatorCallable(operator, auth.username)}
            className='mr-2'
          >
            <FontAwesomeIcon icon={faPhone} className='h-4 w-4 xl:mr-2' />
            <span className='hidden xl:inline-block'>Call</span>
            <span className='sr-only'>Call</span>
          </Button>

          {/* HIDDEN AT THE MOMENT */}
          {/* <Button
            variant='white'
            disabled={!isOperatorCallable(operator, auth.username)}
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
          </Button> */}
        </div>
        <div className='mt-6 border-t border-gray-200 dark:border-gray-700'>
          <dl>
            {/* extension */}
            {operator.endpoints?.mainextension[0]?.id && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Extension</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primary'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() => callPhoneNumber(operator.endpoints.mainextension[0].id)}
                    >
                      {operator.endpoints.mainextension[0].id}
                    </span>
                  </div>
                </dd>
              </div>
            )}
            {/* cellphone */}
            {operator.endpoints?.cellphone[0]?.id && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Mobile</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primary'>
                    <FontAwesomeIcon
                      icon={faMobileScreenButton}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() => callPhoneNumber(operator.endpoints.cellphone[0].id)}
                    >
                      {operator.endpoints.cellphone[0].id}
                    </span>
                  </div>
                </dd>
              </div>
            )}
            {/* email */}
            {operator.endpoints?.email[0]?.id && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Email</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <a
                      target='_blank'
                      rel='noreferrer'
                      href={`mailto: ${operator.endpoints.email[0].id}`}
                      className='truncate hover:underline text-gray-700 dark:text-gray-200'
                    >
                      {operator.endpoints.email[0].id}
                    </a>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </>
    )
  },
)

OperatorSummary.displayName = 'OperatorSummary'
