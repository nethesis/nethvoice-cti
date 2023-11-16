import { FC } from 'react'
import { CallTypes } from '../../lib/history'
import { Tooltip } from 'react-tooltip'
import { getOperatorByPhoneNumber } from '../../lib/operators'
import classNames from 'classnames'
import { callPhoneNumber, cleanString } from '../../lib/utils'
import { t } from 'i18next'
import { openCreateLastCallContact, openShowContactDrawer } from '../../lib/phonebook'

interface CallsSourceProps {
  call: CallTypes
  hideName?: boolean
  hideNumber?: boolean
  highlightNumber?: boolean
  operators: any
  isExtensionNumberLastCalls?: boolean
  maybeUnknownSource?: boolean
}

export function getCallName(call: CallTypes): string {
  return call.cnam || call.ccompany || `${t('Common.Unknown')}`
}

export const CallsSource: FC<CallsSourceProps> = ({
  call,
  hideName,
  hideNumber,
  highlightNumber,
  operators,
  isExtensionNumberLastCalls,
}) => {
  //Check if a user does not have a name and add the name of the operator
  if (call.cnam === '') {
    const operatorFound: any = getOperatorByPhoneNumber(call?.cnum, operators)

    if (operatorFound) {
      call.cnam = operatorFound?.name
    }
  }

  const openLastCardUserDrawer = (userInformation: any) => {
    let updatedUserInformation: any = {}
    let createContactObject: any = {}

    if (userInformation?.cnam || userInformation?.ccompany) {
      updatedUserInformation.displayName = userInformation?.cnam || userInformation?.ccompany || '-'
      updatedUserInformation.kind = 'person'
      if (userInformation?.src) {
        updatedUserInformation.extension = userInformation?.src
      }
      if (updatedUserInformation) {
        openShowContactDrawer(updatedUserInformation)
      }
    } else {
      if (userInformation?.dst) {
        createContactObject.extension = userInformation?.dst
        openCreateLastCallContact(createContactObject)
      }
    }
  }

  return (
    <div className='flex flex-col justify-center overflow-hidden truncate w-16'>
      {!isExtensionNumberLastCalls ? (
        <>
          {/* name */}
          {!hideNumber && (
            <div
              className={classNames(
                `tooltip-source-${cleanString(getCallName(call) || '-')}`,
                'truncate text-gray-900 dark:text-gray-200 leading-4 font-medium text-sm whitespace-nowrap cursor-pointer hover:underline',
              )}
              onClick={() => openLastCardUserDrawer(call)}
            >
              {getCallName(call) || '-'}
            </div>
          )}
          <Tooltip anchorSelect={`.tooltip-source-${cleanString(getCallName(call) || '-')}`}>
            {call?.cnam || call?.ccompany
              ? t('Phonebook.Show contact') + ': ' + getCallName(call) || '-'
              : t('Phonebook.Create contact')}
          </Tooltip>
          {/* phone number */}
          {!hideName && call?.cnum !== '' && (
            <div className={`truncate ${highlightNumber ? 'text-primary' : 'text-gray-500'}`}>
              {call?.src}
            </div>
          )}
        </>
      ) : (
        <>
          {call?.cnum && (
            <div className='truncate text-primary' onClick={() => callPhoneNumber(call?.cnum)}>
              {call?.cnum}
            </div>
          )}
        </>
      )}
    </div>
  )
}
