import React, { useMemo, useCallback } from 'react'
import { Avatar } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faPhone, faRightLeft, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { CallDuration } from './CallDuration'
import { Button } from '../common'
import { t } from 'i18next'
import {
  callOperator,
  openShowOperatorDrawer,
  pickup,
  hangupMainExt,
} from '../../lib/operators'
import { isEmpty } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { transferCall } from '../../lib/utils'
import { faPhoneArrowDownLeft } from '@nethesis/nethesis-solid-svg-icons'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'

interface OperatorCardProps {
  operator: any
  authUsername: string
  mainUserIsBusy: boolean
  actionInformation?: any
}

const OperatorCard = ({
  operator,
  authUsername,
  mainUserIsBusy,
  actionInformation,
}: OperatorCardProps) => {
  const profile = useSelector((state: RootState) => state.user)
  const liveOperatorData = useSelector(
    (state: RootState) => state.operators.operators[operator?.username] || operator,
  )

  const pickupPermission = useSelector(
    (state: RootState) =>
      state.user?.profile?.macro_permissions?.settings?.permissions?.pickup?.value,
  )
  const hangupPermission = useSelector(
    (state: RootState) =>
      state.user?.profile?.macro_permissions?.presence_panel?.permissions?.hangup?.value,
  )

  const permissions = useMemo(
    () => ({
      pickup: pickupPermission,
      hangup: hangupPermission,
    }),
    [pickupPermission, hangupPermission],
  )

  const operatorStates = useMemo(() => {
    const isInConversation =
      liveOperatorData?.conversations?.length > 0 &&
      (liveOperatorData?.conversations[0]?.connected ||
        liveOperatorData?.conversations[0]?.inConference ||
        liveOperatorData?.conversations[0]?.chDest?.inConference === true)

    const isRinging = liveOperatorData?.mainPresence === 'ringing'
    const isBusy = liveOperatorData?.mainPresence === 'busy'
    const isOfflineOrDnd =
      liveOperatorData?.mainPresence === 'offline' || liveOperatorData?.mainPresence === 'dnd'

    const hasAnyPermission = permissions.pickup || permissions.hangup

    const currentUserMainExtension =
      profile?.mainextension || profile?.endpoints?.mainextension?.[0]?.id

    const isCalledByCurrentUser =
      isRinging &&
      liveOperatorData?.conversations?.length > 0 &&
      (liveOperatorData?.conversations[0]?.counterpartNum === authUsername ||
        liveOperatorData?.conversations[0]?.caller === authUsername ||
        liveOperatorData?.conversations[0]?.counterpartNum === currentUserMainExtension ||
        liveOperatorData?.conversations[0]?.bridgedNum === currentUserMainExtension ||
        liveOperatorData?.conversations[0]?.chSource?.callerNum === currentUserMainExtension ||
        liveOperatorData?.conversations[0]?.chSource?.bridgedNum === currentUserMainExtension ||
        (liveOperatorData?.conversations[0]?.direction === 'out' &&
          liveOperatorData?.conversations[0]?.counterpartName?.includes(profile?.name)))

    return {
      isInConversation,
      isRinging,
      isBusy,
      isOfflineOrDnd,
      hasAnyPermission,
      isCalledByCurrentUser,
    }
  }, [liveOperatorData, permissions, authUsername, profile])

  const handleOperatorClick = useCallback(() => {
    openShowOperatorDrawer(liveOperatorData)
  }, [liveOperatorData])

  const handlePickupCall = useCallback(async () => {
    if (
      liveOperatorData?.conversations?.[0]?.id &&
      profile?.default_device?.id &&
      liveOperatorData?.endpoints?.mainextension?.[0]?.id
    ) {
      let conversationId = liveOperatorData.conversations[0].id
      let endpoint = liveOperatorData.endpoints.mainextension[0].id
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
  }, [liveOperatorData, profile])

  const handleRejectCall = useCallback(
    async (userMainExtension: any) => {
      if (liveOperatorData?.conversations?.[0]?.id && liveOperatorData?.conversations?.[0]?.owner) {
        if (userMainExtension) {
          const hangupInformations = {
            exten: userMainExtension?.toString(),
          }

          if (!isEmpty(hangupInformations)) {
            try {
              await hangupMainExt(hangupInformations)
            } catch (e) {
              console.error(e)
            }
          }
        }
      }
    },
    [liveOperatorData],
  )

  const handleTransferCall = useCallback(() => {
    transferCall(liveOperatorData)
  }, [liveOperatorData])

  const handleCallOperator = useCallback(() => {
    callOperator(liveOperatorData)
  }, [liveOperatorData])

  const {
    isInConversation,
    isRinging,
    isBusy,
    isOfflineOrDnd,
    hasAnyPermission,
    isCalledByCurrentUser,
  } = operatorStates

  return (
    <div className='space-y-4'>
      {/* Operator avatar */}
      <Avatar
        src={liveOperatorData?.avatarBase64}
        placeholderType='operator'
        size='extra_large'
        bordered
        onClick={handleOperatorClick}
        className='mx-auto cursor-pointer'
        status={liveOperatorData?.mainPresence}
      />

      <div className='space-y-1'>
        <div className='text-xs font-medium lg:text-sm'>
          {liveOperatorData?.favorite ? (
            <div className='flex items-center space-x-2 justify-center'>
              <h3
                className='cursor-pointer hover:underline block truncate text-sm font-medium text-primaryNeutral dark:text-primaryNeutralDark leading-5 max-w-[120px]'
                onClick={handleOperatorClick}
                title={liveOperatorData?.name}
              >
                {liveOperatorData?.name}
              </h3>
              <FontAwesomeIcon
                icon={faStar}
                className='inline-block text-center h-4 w-4 text-primary dark:text-primaryDark'
              />
            </div>
          ) : (
            <h3
              className='cursor-pointer hover:underline text-center text-sm not-italic font-medium leading-5 text-gray-900 dark:text-gray-100 truncate max-w-[150px] mx-auto'
              onClick={handleOperatorClick}
              title={liveOperatorData?.name}
            >
              {liveOperatorData?.name}
            </h3>
          )}
        </div>

        {/* Main extension or Ringing (if user has at least one permission) */}
        {isRinging && hasAnyPermission && !isCalledByCurrentUser ? (
          <div className='text-center text-red-600 dark:text-red-500 text-sm font-medium leading-5 pt-2 flex items-center justify-center'>
            <span className='ringing-animation h-2.5 w-2.5 mr-2'></span>
            {t('Operators.Ringing')}
          </div>
        ) : (
          <div className='text-center text-secondaryNeutral dark:text-secondaryNeutralDark text-sm font-normal leading-5 pt-2'>
            {liveOperatorData?.endpoints?.mainextension[0]?.id}
          </div>
        )}
      </div>

      <div>
        <span className='block mt-1 text-sm font-medium text-gray-500 dark:text-gray-500'>
          {/* Operator is in conversation */}
          {isInConversation && (
            <div className='py-2 px-3 text-center'>
              <div className='inline-flex items-center text-cardTextBusy dark:text-cardTextBusy max-w-full'>
                <CallDuration
                  startTime={liveOperatorData?.conversations[0]?.startTime}
                  className='font-mono mr-1 whitespace-nowrap'
                />
                <span className='mx-1'>-</span>
                <span className='truncate max-w-[100px] inline-block'>
                  {liveOperatorData?.conversations[0]?.counterpartName || ''}
                </span>
              </div>
            </div>
          )}

          {/* Operator is ringing - show buttons based on permissions */}
          {isRinging && (
            <>
              {hasAnyPermission && !isCalledByCurrentUser ? (
                <div className='flex justify-center space-x-2'>
                  {permissions.pickup && (
                    <Button
                      variant='white'
                      size='small'
                      onClick={handlePickupCall}
                      data-tooltip-id={`tooltip-pickup-operator-${
                        liveOperatorData?.username || 'op'
                      }`}
                      data-tooltip-content={t('OperatorDrawer.Pickup')}
                    >
                      <FontAwesomeIcon
                        icon={faPhoneArrowDownLeft as IconDefinition}
                        className='inline-block text-center h-4 w-4 lg:h-3 lg:w-3 lg:mr-2'
                      />
                      <span className='text-sm not-italic font-medium leading-5 lg:inline hidden'>
                        {t('OperatorDrawer.Pickup')}
                      </span>
                    </Button>
                  )}
                  {permissions?.hangup && (
                    <Button
                      variant='whiteDanger'
                      size='small'
                      onClick={() =>
                        handleRejectCall(liveOperatorData?.endpoints?.mainextension[0]?.id)
                      }
                      data-tooltip-id={`tooltip-reject-operator-${
                        liveOperatorData?.username || 'op'
                      }`}
                      data-tooltip-content={t('Common.Reject')}
                    >
                      <FontAwesomeIcon
                        style={{ transform: 'rotate(135deg)' }}
                        className='inline-block text-center h-4 w-4 lg:h-3 lg:w-3 lg:mr-2'
                        icon={faPhone as IconDefinition}
                      />
                      <span className='text-sm not-italic font-medium leading-5 lg:inline hidden'>
                        {t('Common.Reject')}
                      </span>
                    </Button>
                  )}
                  {/* Show tooltips only on small screens when text is hidden */}
                  <div className='md:hidden'>
                    <CustomThemedTooltip
                      id={`tooltip-pickup-operator-${liveOperatorData?.username || 'op'}`}
                    />
                    <CustomThemedTooltip
                      id={`tooltip-reject-operator-${liveOperatorData?.username || 'op'}`}
                    />
                  </div>
                </div>
              ) : (
                <div className='py-2 px-3 flex justify-center'>
                  <div className='flex items-center text-cardTextBusy dark:text-cardTextBusy'>
                    <span className='ringing-animation mr-2 h-4 w-4'></span>
                    <span className='text-sm not-italic font-medium leading-5'>
                      {t('Operators.Ringing')}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Main user is busy and operator is online - show transfer button */}
          {mainUserIsBusy &&
            liveOperatorData?.mainPresence === 'online' &&
            !isRinging &&
            !isInConversation && (
              <Button
                variant='dashboard'
                onClick={handleTransferCall}
                className='text-primary dark:text-primaryDark dark:disabled:text-gray-700 dark:disabled:hover:text-gray-700 disabled:text-gray-400'
              >
                <FontAwesomeIcon
                  icon={faRightLeft}
                  className='inline-block text-center h-3.5 w-3.5 mr-1.5 rotate-90'
                />
                <span className='text-sm not-italic font-medium leading-5'>
                  {t('Operators.Transfer')}
                </span>
              </Button>
            )}

          {/* Operator is busy but not in conversation */}
          {isBusy && !isInConversation && (
            <div className='py-2 px-3 flex justify-center'>
              <span className='text-sm not-italic font-medium leading-5 text-cardTextBusy dark:text-cardTextBusy'>
                {t('Operators.Busy')}
              </span>
            </div>
          )}

          {/* Operator is not busy, not ringing, not in conversation - show call button */}
          {!isInConversation &&
            !isRinging &&
            !isBusy &&
            (mainUserIsBusy ? (
              liveOperatorData?.mainPresence !== 'online' && (
                <Button
                  variant='dashboard'
                  disabled={true}
                  className='text-primary dark:text-primaryDark dark:disabled:text-gray-600 dark:disabled:hover:text-gray-600 disabled:text-gray-400'
                  onClick={handleCallOperator}
                >
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='inline-block text-center h-4 w-4 mr-2'
                  />
                  <span className='text-sm not-italic font-medium leading-5'>
                    {t('Operators.Call')}
                  </span>
                </Button>
              )
            ) : (
              // Normal Call
              <Button
                variant='dashboard'
                className={`${
                  isOfflineOrDnd
                    ? 'text-primaryActive dark:text-primaryActiveDark dark:disabled:text-gray-600 dark:disabled:hover:text-gray-600 disabled:text-gray-400'
                    : 'text-primaryActive dark:text-primaryActiveDark'
                }`}
                disabled={isOfflineOrDnd || liveOperatorData?.username === authUsername}
                onClick={handleCallOperator}
              >
                <FontAwesomeIcon icon={faPhone} className='inline-block text-center h-4 w-4 mr-2' />
                <span className='text-sm not-italic font-medium leading-5'>
                  {t('Operators.Call')}
                </span>
              </Button>
            ))}
        </span>
      </div>
    </div>
  )
}

export default React.memo(OperatorCard)

OperatorCard.displayName = 'OperatorCard'
