import React, { useMemo, useCallback } from 'react'
import { Avatar, Button } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleRight,
  faEarListen,
  faHandPointUp,
  faPhone,
  faPhoneSlash,
  faRecordVinyl,
  faRightLeft,
  faStar,
} from '@fortawesome/free-solid-svg-icons'
import { CallDuration } from './CallDuration'
import { t } from 'i18next'
import { callOperator, openShowOperatorDrawer, hangup, pickup } from '../../lib/operators'
import TextScroll from '../common/TextScroll'
import { transferCall } from '../../lib/utils'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import { isEmpty } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'

interface CompactOperatorCardProps {
  operator: any
  authUsername: string
  mainUserIsBusy: boolean
  actionInformation: any
  index: number | string
}

const CompactOperatorCard = ({
  operator,
  authUsername,
  mainUserIsBusy,
  actionInformation,
  index,
}: CompactOperatorCardProps) => {
  const pickupPermission = useSelector(
    (state: RootState) =>
      state.user?.profile?.macro_permissions?.settings?.permissions?.pickup?.value,
  )
  const hangupPermission = useSelector(
    (state: RootState) =>
      state.user?.profile?.macro_permissions?.presence_panel?.permissions?.hangup?.value,
  )

  const profile = useSelector((state: RootState) => state.user)

  const permissions = useMemo(
    () => ({
      pickup: pickupPermission,
      hangup: hangupPermission,
      hasAny: pickupPermission || hangupPermission,
    }),
    [pickupPermission, hangupPermission],
  )

  const operatorStates = useMemo(() => {
    const hasValidConversation =
      operator?.conversations?.length > 0 &&
      operator?.conversations[0]?.startTime &&
      operator?.conversations[0]?.id

    const isInConversation =
      hasValidConversation &&
      (operator?.conversations[0]?.connected ||
        operator?.conversations[0]?.inConference ||
        operator?.conversations[0]?.chDest?.inConference === true)

    const isRinging = operator?.mainPresence === 'ringing'
    const isBusy = operator?.mainPresence === 'busy'
    const isOfflineOrDnd = operator?.mainPresence === 'offline' || operator?.mainPresence === 'dnd'
    const isOnline = operator?.mainPresence === 'online'

    const currentUserMainExtension =
      profile?.mainextension || profile?.endpoints?.mainextension?.[0]?.id

    const isCalledByCurrentUser =
      isRinging &&
      operator?.conversations?.length > 0 &&
      (operator?.conversations[0]?.counterpartNum === authUsername ||
        operator?.conversations[0]?.caller === authUsername ||
        operator?.conversations[0]?.counterpartNum === currentUserMainExtension ||
        operator?.conversations[0]?.bridgedNum === currentUserMainExtension ||
        operator?.conversations[0]?.chSource?.callerNum === currentUserMainExtension ||
        operator?.conversations[0]?.chSource?.bridgedNum === currentUserMainExtension ||
        (operator?.conversations[0]?.direction === 'out' &&
          operator?.conversations[0]?.counterpartName?.includes(profile?.name)))

    return {
      isInConversation,
      isRinging,
      isBusy,
      isOfflineOrDnd,
      isOnline,
      hasValidConversation,
      isCalledByCurrentUser,
    }
  }, [operator, authUsername, profile])

  const openDrawerOperator = useCallback(() => {
    openShowOperatorDrawer(operator)
  }, [operator])

  const handleTransferCall = useCallback(() => {
    transferCall(operator)
  }, [operator])

  const handleCallOperator = useCallback(() => {
    callOperator(operator)
  }, [operator])

  const handlePickupCall = useCallback(async () => {
    if (
      operator?.conversations?.[0]?.id &&
      profile?.default_device?.id &&
      operator?.endpoints?.mainextension?.[0]?.id
    ) {
      let conversationId = operator.conversations[0].id
      let endpoint = operator.endpoints.mainextension[0].id
      let destination = profile.default_device.id

      const pickupInformations = {
        convid: conversationId,
        endpointId: endpoint,
        destId: destination,
      }

      if (!isEmpty(pickupInformations)) {
        try {
          await pickup(pickupInformations)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }, [operator, profile])

  const handleRejectCall = useCallback(async () => {
    if (operator?.conversations?.[0]?.id && operator?.conversations?.[0]?.owner) {
      const conversationId = operator.conversations[0].id
      let numberToClose = operator.conversations[0].owner

      if (conversationId && numberToClose) {
        const hangupInformations = {
          convid: conversationId.toString(),
          endpointId: numberToClose.toString(),
        }

        if (!isEmpty(hangupInformations)) {
          try {
            await hangup(hangupInformations)
          } catch (e) {
            console.error(e)
          }
        }
      }
    }
  }, [operator])

  const {
    isInConversation,
    isRinging,
    isBusy,
    isOfflineOrDnd,
    isOnline,
    hasValidConversation,
    isCalledByCurrentUser,
  } = operatorStates

  const mainExtension = useMemo(() => operator?.endpoints?.mainextension?.[0]?.id || '', [operator])

  return (
    <div className='group flex w-full items-center justify-between space-x-3 rounded-lg py-2 pr-2 pl-6 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cardBackgroud dark:bg-cardBackgroudDark focus:ring-primary dark:focus:ring-primary'>
      {/* Left section: Avatar */}
      <span className='flex-shrink-0'>
        <Avatar
          src={operator?.avatarBase64}
          placeholderType='operator'
          size='large'
          bordered
          onClick={openDrawerOperator}
          className='mx-auto cursor-pointer'
          status={operator?.mainPresence}
        />
      </span>

      {/* Middle section: Name and extension */}
      <div className='flex-1 min-w-0 ml-3'>
        <div className='flex items-center space-x-2'>
          <span
            className='block truncate text-sm leading-5 font-medium text-primaryNeutral dark:text-primaryNeutralDark cursor-pointer hover:underline'
            onClick={openDrawerOperator}
          >
            {operator?.name}
          </span>
          {operator?.favorite && (
            <FontAwesomeIcon
              icon={faStar}
              className='inline-block text-center h-4 w-4 text-primaryActive dark:text-primaryActiveDark'
            />
          )}
        </div>
        {isRinging && permissions.hasAny && !isCalledByCurrentUser ? (
          <div className='text-textStatusBusy dark:text-textStatusBusyDark text-sm leading-5 font-medium flex items-center'>
            <span className='ringing-animation h-2.5 w-2.5 mr-2'></span>
            {t('Operators.Ringing')}
          </div>
        ) : (
          <div className='text-sm font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'>
            {mainExtension}
          </div>
        )}
      </div>

      {/* Right section: Call status, buttons, or actions */}
      <div className='flex items-center space-x-2'>
        {isInConversation && hasValidConversation && (
          <div
            className={`tooltip-operator-information-${index}`}
            data-tooltip-id={`tooltip-operator-information-${index}`}
            data-tooltip-content={operator?.conversations[0]?.counterpartName || '-'}
          >
            <div className='flex items-center text-textStatusBusy dark:text-textStatusBusyDark'>
              {operator?.conversations[0]?.startTime && (
                <>
                  <CallDuration
                    startTime={operator?.conversations[0]?.startTime}
                    className='font-mono mr-1 whitespace-nowrap'
                  />
                  <span className='mx-1'>-</span>
                </>
              )}
              <span className='truncate max-w-[80px] inline-block'>
                {operator?.conversations[0]?.counterpartName || ''}
              </span>

              {/* Recording indicator */}
              {operator?.conversations[0]?.recording === 'true' && (
                <FontAwesomeIcon icon={faRecordVinyl} className='ml-1.5 h-4 w-4' />
              )}

              {/* Listening indicator */}
              {operator?.conversations[0]?.id ===
                actionInformation?.listeningInfo?.listening_id && (
                <FontAwesomeIcon icon={faEarListen} className='ml-1.5 h-4 w-4' />
              )}

              {/* Intrude indicator */}
              {operator?.conversations[0]?.id === actionInformation?.intrudeInfo?.intrude_id && (
                <FontAwesomeIcon icon={faHandPointUp} className='ml-1.5 h-4 w-4' />
              )}
            </div>
            <CustomThemedTooltip id={`tooltip-operator-information-${index}`} />
          </div>
        )}

        {/* If operator is ringing and user has permissions */}
        {isRinging && permissions?.hasAny && !isCalledByCurrentUser && (
          <div className='flex items-center space-x-2'>
            {permissions?.pickup && (
              <Button variant='white' size='small' onClick={handlePickupCall} className='px-2'>
                <FontAwesomeIcon
                  icon={faMissed as any}
                  className='inline-block text-center h-3 w-3'
                />
                <span className='text-xs ml-1'>{t('OperatorDrawer.Pickup')}</span>
              </Button>
            )}
            {permissions?.hangup && (
              <Button
                variant='whiteDanger'
                size='small'
                onClick={handleRejectCall}
                className='px-2'
              >
                <FontAwesomeIcon icon={faPhoneSlash} className='inline-block text-center h-3 w-3' />
                <span className='text-xs ml-1'>{t('Common.Reject')}</span>
              </Button>
            )}
          </div>
        )}

        {/* If operator is ringing and user has no permissions or is calling this operator */}
        {isRinging && (!permissions?.hasAny || isCalledByCurrentUser) && (
          <div className='flex items-center text-textStatusBusy dark:text-textStatusBusyDark'>
            <span className='ringing-animation mr-2 h-4 w-4' />
            <span className='text-sm font-medium'>{t('Operators.Ringing')}</span>
          </div>
        )}

        {/* If operator is busy but not in conversation */}
        {isBusy && !isInConversation && !isRinging && (
          <span className='text-sm font-medium text-textStatusBusy dark:text-textStatusBusyDark'>
            {t('Operators.Busy')}
          </span>
        )}

        {!isInConversation && !isRinging && !isBusy && (
          <>
            {/* Transfer button - only show when main user is busy AND operator is online */}
            {mainUserIsBusy && isOnline ? (
              <Button
                variant='ghost'
                onClick={handleTransferCall}
                className='text-primaryActive dark:text-primaryActiveDark'
                size='small'
              >
                <FontAwesomeIcon
                  icon={faRightLeft}
                  className='inline-block text-center h-3.5 w-3.5 mr-1 rotate-90'
                />
                <span className='text-xs'>{t('Operators.Transfer')}</span>
              </Button>
            ) : (
              /* Call button - show when main user is NOT busy, OR when operator is NOT online */
              <Button
                variant='ghost'
                size='base'
                className='text-primaryActive dark:text-primaryActiveDark disabled:opacity-50'
                disabled={isOfflineOrDnd || mainUserIsBusy || operator?.username === authUsername}
                onClick={handleCallOperator}
              >
                <FontAwesomeIcon
                  icon={faPhone}
                  className='inline-block text-center font-medium h-4 w-4 mr-3 leading-5'
                />
                <span className='text-xs'>{t('Operators.Call')}</span>
              </Button>
            )}
          </>
        )}
      </div>

      {/* Details button */}
      <Button variant='ghost' onClick={openDrawerOperator} className='flex-shrink-0 ml-2'>
        <FontAwesomeIcon
          icon={faAngleRight}
          className='h-4 w-4 text-cardIcon dark:text-cardIconDark cursor-pointer'
          aria-hidden='true'
        />
      </Button>
    </div>
  )
}

export default React.memo(CompactOperatorCard)

CompactOperatorCard.displayName = 'CompactOperatorCard'
