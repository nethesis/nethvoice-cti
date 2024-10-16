// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useRef, useState } from 'react'
import classNames from 'classnames'
import { ActionCall, Avatar, Button, ButtonDropdown, IconSwitch } from '../common'
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  addOperatorToFavorites,
  openShowOperatorDrawer,
  reloadOperators,
  removeOperatorFromFavorites,
} from '../../lib/operators'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { faStar as faStarSolid, faVideo, faComment } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarLight } from '@nethesis/nethesis-light-svg-icons'
import { t } from 'i18next'
import { isEmpty } from 'lodash'
import { Tooltip } from 'react-tooltip'

export interface OperatorSummaryProps extends ComponentPropsWithRef<'div'> {
  operator: any
  isShownFavorite: boolean
  isShownSideDrawerLink: boolean
}

export const OperatorSummary = forwardRef<HTMLButtonElement, OperatorSummaryProps>(
  ({ operator, isShownFavorite, isShownSideDrawerLink = false, className, ...props }, ref) => {
    const auth = useSelector((state: RootState) => state.authentication)
    // Get selected operator information from operators store
    const operatorsStore = useSelector((state: RootState) => state.operators)
    const currentOperatorInformations = operatorsStore?.operators[operator?.username]
    const authStore = useSelector((state: RootState) => state.authentication)
    const [isFavorite, setFavorite] = useState(false)

    useEffect(() => {
      setFavorite(operator?.favorite)
    }, [operator])

    const toggleFavorite = () => {
      if (isFavorite) {
        removeOperatorFromFavorites(
          operator?.username,
          auth?.username,
          operatorsStore?.favorites,
          operatorsStore?.favoritesObject[operator?.username],
        )
      } else {
        addOperatorToFavorites(
          operator?.username,
          operator?.endpoints?.mainextension[0]?.id,
          operator?.name,
        )
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
      store?.dispatch?.globalSearch?.setOpen(false)
      store?.dispatch?.globalSearch?.setFocused(false)

      // To avoid blur effect when click on operator information
      store?.dispatch?.globalSearch?.setRightSideTitleClicked(true)
    }

    const [operatorDevices, setOperatorDevices]: any = useState({})

    useEffect(() => {
      if (operator && operator?.endpoints) {
        const mainExtension = operator?.endpoints?.mainextension[0]?.id || null
        const cellphone = operator?.endpoints?.cellphone[0]?.id || null

        setOperatorDevices({
          mainExtension,
          cellphone,
        })
      }
    }, [operator])

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
                src={operator?.avatarBase64}
                placeholderType='operator'
                onClick={() => maybeShowSideDrawer(operator)}
                className={classNames(isShownSideDrawerLink && 'cursor-pointer')}
                status={currentOperatorInformations?.mainPresence}
              />
            </div>
            <div>
              <div className='ml-2'>
                <h2
                  className={classNames(
                    'text-xl inline-block font-medium text-gray-700 dark:text-gray-200 mr-2',
                    isShownSideDrawerLink && 'cursor-pointer hover:underline',
                  )}
                  onClick={() => maybeShowSideDrawer(operator)}
                >
                  {operator?.name}
                </h2>
                {isShownFavorite && (
                  <>
                    <IconSwitch
                      on={isFavorite}
                      size='large'
                      onIcon={<FontAwesomeIcon icon={faStarSolid} />}
                      offIcon={<FontAwesomeIcon icon={faStarLight} />}
                      changed={() => toggleFavorite()}
                      className={'mr-5'}
                      data-tooltip-id={'tooltip-toggle-favorite'}
                      data-tooltip-content={
                        isFavorite
                          ? t('OperatorDrawer.Set favorite operator') || ''
                          : t('OperatorDrawer.Remove favorite operator') || ''
                      }
                    >
                      <span className='sr-only'>
                        {t('OperatorDrawer.Toggle favorite operator')}
                      </span>
                    </IconSwitch>
                    {/* Tooltip for favorite operators toggle */}
                    <Tooltip className='pi-z-20' id={'tooltip-toggle-favorite'} place='left' />
                  </>
                )}
              </div>

              <span className='text-md font-medium leading-5 text-gray-500 dark:text-gray-300 ml-2'>
                {operator?.endpoints?.mainextension[0]?.id}
              </span>
            </div>
          </div>
        </div>
        <div className='mt-8'>
          {operatorsStore?.operators[authStore?.username]?.mainPresence === 'busy' &&
          operator?.mainPresence === 'online' ? (
            <ButtonDropdown
              operatorDevices={operatorDevices}
              operator={operator}
              isTransfer={true}
            ></ButtonDropdown>
          ) : (
            <ButtonDropdown operatorDevices={operatorDevices} operator={operator}></ButtonDropdown>
          )}

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
        {/* ongoing call info */}
        {!!operatorsStore?.operators[operator?.username]?.conversations?.length &&
          (operatorsStore?.operators[operator?.username]?.conversations[0]?.connected ||
            operatorsStore?.operators[operator?.username]?.conversations[0]?.inConference ||
            operatorsStore?.operators[operator?.username]?.conversations[0]?.chDest?.inConference ==
              true ||
            !isEmpty(operatorsStore?.operators[operator?.username]?.conversations[0])) && (
            <ActionCall config={operator}></ActionCall>
          )}
      </>
    )
  },
)

OperatorSummary.displayName = 'OperatorSummary'
