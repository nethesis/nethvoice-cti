// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC } from 'react'
import { CallTypes } from '../../lib/history'
import { Tooltip } from 'react-tooltip'
import { getOperatorByPhoneNumber } from '../../lib/operators'
import classNames from 'classnames'
import { callPhoneNumber, cleanString, transferCallToExtension } from '../../lib/utils'
import { t } from 'i18next'
import { openCreateLastCallContact, openShowContactDrawer } from '../../lib/phonebook'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface CallDetailsProps {
  call: CallTypes
  hideName?: boolean
  hideNumber?: boolean
  highlightNumber?: boolean
  operators: any
  isExtensionNumberLastCalls?: boolean
  fromHistory?: boolean
  isQueueBadgeAvailable?: boolean
  direction: 'in' | 'out'
}

export function getCallName(call: CallTypes, direction: 'in' | 'out'): string {
  return direction === 'in'
    ? call.cnam || call.ccompany || t('Common.Unknown')
    : call.dst_cnam || call.dst_ccompany || t('Common.Unknown')
}

export const CallDetails: FC<CallDetailsProps> = ({
  call,
  hideName,
  hideNumber,
  highlightNumber,
  operators,
  isExtensionNumberLastCalls,
  fromHistory,
  isQueueBadgeAvailable,
  direction,
}) => {
  const authStore = useSelector((state: RootState) => state.authentication)
  const operatorsStore = useSelector((state: RootState) => state.operators)

  if ((direction === 'in' && call.cnam === '') || (direction === 'out' && call.dst_cnam === '')) {
    const phoneNumber = direction === 'in' ? call.cnum : call.dst
    const operatorFound: any = getOperatorByPhoneNumber(phoneNumber, operators)
    if (operatorFound) {
      direction === 'in' ? (call.cnam = operatorFound.name) : (call.dst_cnam = operatorFound.name)
    }
  }

  const openLastCardUserDrawer = (userInformation: any) => {
    let updatedUserInformation: any = {}
    let createContactObject: any = {}

    if (direction === 'in') {
      if (userInformation?.cnam || userInformation?.ccompany) {
        updatedUserInformation.displayName = userInformation.cnam || userInformation.ccompany || '-'
        updatedUserInformation.kind = 'person'
        if (userInformation.src) updatedUserInformation.extension = userInformation.src
        openShowContactDrawer(updatedUserInformation)
      } else if (userInformation.src) {
        createContactObject.extension = userInformation.src
        openCreateLastCallContact(createContactObject)
      }
    } else {
      if (userInformation?.dst_cnam || userInformation?.dst_ccompany) {
        updatedUserInformation.displayName =
          userInformation.dst_cnam || userInformation.dst_ccompany || '-'
        updatedUserInformation.kind = 'person'
        if (userInformation.dst) updatedUserInformation.extension = userInformation.dst
        openShowContactDrawer(updatedUserInformation)
      } else if (userInformation.dst) {
        createContactObject.extension = userInformation.dst
        openCreateLastCallContact(createContactObject)
      }
    }
  }

  return (
    <div
      className={`flex flex-col justify-center overflow-hidden truncate${
        fromHistory || (!fromHistory && isQueueBadgeAvailable) ? ' truncate w-24' : ' w-64'
      }`}
    >
      {!isExtensionNumberLastCalls ? (
        <>
          {/* name */}
          {!hideNumber && (
            <div
              className={classNames(
                `tooltip-${direction === 'in' ? 'dest' : 'source'}-${cleanString(
                  getCallName(call, direction) || '-',
                )}`,
                'truncate text-gray-900 dark:text-gray-200 leading-4 font-medium text-sm whitespace-nowrap cursor-pointer hover:underline',
              )}
              onClick={() => openLastCardUserDrawer(call)}
              data-tooltip-id={`tooltip-${cleanString(getCallName(call, direction) || '-')}`}
              data-tooltip-content={
                getCallName(call, direction)
                  ? `${t('Phonebook.Show contact')}: ${getCallName(call, direction)}`
                  : t('Phonebook.Create contact')
              }
            >
              {getCallName(call, direction) || '-'}
            </div>
          )}

          <Tooltip
            id={`tooltip-${cleanString(getCallName(call, direction) || '-')}`}
            className='pi-z-20'
          />

          {/* phone number */}
          {!hideName &&
            ((direction === 'in' && call.cnum) || (direction === 'out' && call.dst)) && (
              <div
                className={`${
                  highlightNumber
                    ? 'text-primary dark:text-primaryDark'
                    : 'text-gray-500 dark:text-gray-200'
                } ${fromHistory || (!fromHistory && isQueueBadgeAvailable) ? 'truncate' : ''}`}
              >
                {direction === 'in' ? call.src : call.dst}
              </div>
            )}
        </>
      ) : (
        <>
          {(direction === 'in' ? call.cnum : call.dst) && (
            <div
              className='truncate text-primary dark:text-primaryDark'
              onClick={() =>
                operatorsStore?.operators[authStore?.username]?.mainPresence === 'busy'
                  ? transferCallToExtension(direction === 'in' ? call.cnum : call.dst)
                  : callPhoneNumber(direction === 'in' ? call.cnum : call.dst)
              }
            >
              {direction === 'in' ? call.cnum : call.dst}
            </div>
          )}
        </>
      )}
    </div>
  )
}
