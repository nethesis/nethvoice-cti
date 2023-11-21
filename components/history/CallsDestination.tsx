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

interface CallsDestinationProps {
  call: CallTypes
  hideName?: boolean
  hideNumber?: boolean
  highlightNumber?: boolean
  operators: any
  isExtensionNumberLastCalls?: boolean
}

export function getCallName(call: CallTypes): string {
  return call?.dst_cnam || call?.dst_ccompany || `${t('Common.Unknown')}`
}

export const CallsDestination: FC<CallsDestinationProps> = ({
  call,
  hideName,
  hideNumber,
  highlightNumber,
  operators,
  isExtensionNumberLastCalls,
}) => {

  const authStore = useSelector((state: RootState) => state.authentication)
  const operatorsStore = useSelector((state: RootState) => state.operators)

  //Check if a user does not have a name and add the name of the operator
  if (call?.dst_cnam === '') {
    const operatorFound: any = getOperatorByPhoneNumber(call?.dst, operators)

    if (operatorFound) {
      call.dst_cnam = operatorFound?.name
    }
  }

  const openLastCardUserDrawer = (userInformation: any) => {
    let updatedUserInformation: any = {}
    let createContactObject: any = {}

    if (userInformation?.dst_cnam || userInformation?.dst_ccompany) {
      updatedUserInformation.displayName =
        userInformation?.dst_cnam || userInformation?.dst_ccompany || '-'
      updatedUserInformation.kind = 'person'
      if (userInformation?.dst) {
        updatedUserInformation.extension = userInformation?.dst
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
    <div className='flex flex-col justify-center overflow-hidden truncate w-24'>
      {!isExtensionNumberLastCalls ? (
        <>
          {/* name */}
          {!hideNumber && (
            <div
              className={classNames(
                `tooltip-dest-${cleanString(getCallName(call) || '-')}`,
                'truncate text-gray-900 dark:text-gray-200 leading-4 font-medium text-sm whitespace-nowrap cursor-pointer hover:underline',
              )}
              onClick={() => openLastCardUserDrawer(call)}
            >
              {getCallName(call) || '-'}
            </div>
            //   {!call?.dst_cnam && !call?.dst_ccompany && <></>}
          )}
          <Tooltip anchorSelect={`.tooltip-dest-${cleanString(getCallName(call) || '-')}`}>
            {call?.dst_cnam || call?.dst_ccompany
              ? t('Phonebook.Show contact') + ': ' + getCallName(call) || '-'
              : t('Phonebook.Create contact')}
          </Tooltip>
          {/* phone number */}
          {!hideName && (call?.dst_cnam !== '' || call?.dst_ccompany !== '') && (
            <div className={`truncate ${highlightNumber ? 'text-primary' : 'text-gray-500'}`}>
              {call?.dst}
            </div>
          )}
        </>
      ) : (
        <>
          {call?.dst && (
            <div
              className='truncate text-primary'
              onClick={() =>
                operatorsStore?.operators[authStore?.username]?.mainPresence === 'busy'
                  ? transferCallToExtension(call?.dst)
                  : callPhoneNumber(call?.dst)
              }
            >
              {call?.dst}
            </div>
          )}
        </>
      )}
    </div>
  )
}
