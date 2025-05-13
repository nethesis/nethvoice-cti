import { Avatar } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faPhone, faRightLeft, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { CallDuration } from './CallDuration'
import { Button } from '../common'
import { t } from 'i18next'
import { callOperator, openShowOperatorDrawer, hangup, pickup } from '../../lib/operators'
import TextScroll from '../common/TextScroll'
import { isEmpty } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { transferCall } from '../../lib/utils'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'

interface OperatorCardProps {
  operator: any
  authUsername: string
  mainUserIsBusy: boolean
  actionInformation?: any
}

export const OperatorCard = ({
  operator,
  authUsername,
  mainUserIsBusy,
  actionInformation,
}: OperatorCardProps) => {
  // Get profile information for pickup
  const profile = useSelector((state: RootState) => state.user)
  const operatorsStore = useSelector((state: RootState) => state.operators)

  // Permessi per pickup e hangup
  const hasPickupPermission =
    profile?.profile?.macro_permissions?.settings?.permissions?.pickup?.value
  const hasHangupPermission =
    profile?.profile?.macro_permissions?.presence_panel?.permissions?.hangup?.value

  // Get real-time operator state from the store
  const liveOperatorData = operatorsStore.operators[operator?.username] || operator

  // Check if operator is in conversation using real-time data
  const isInConversation =
    liveOperatorData?.conversations?.length > 0 &&
    (liveOperatorData?.conversations[0]?.connected ||
      liveOperatorData?.conversations[0]?.inConference ||
      liveOperatorData?.conversations[0]?.chDest?.inConference === true)

  // Check if operator is in ringing state
  const isRinging = liveOperatorData?.mainPresence === 'ringing'

  // Check if operator is busy
  const isBusy = liveOperatorData?.mainPresence === 'busy'

  // Check if operator is offline or dnd
  const isOfflineOrDnd =
    liveOperatorData?.mainPresence === 'offline' || liveOperatorData?.mainPresence === 'dnd'

  // Handle operator card click
  const handleOperatorClick = () => {
    openShowOperatorDrawer(liveOperatorData)
  }

  // Handle pickup call
  const handlePickupCall = async () => {
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
  }

  const handleRejectCall = async () => {
    if (liveOperatorData?.conversations?.[0]?.id && liveOperatorData?.conversations?.[0]?.owner) {
      const conversationId = liveOperatorData.conversations[0].id
      let numberToClose = liveOperatorData.conversations[0].owner

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
  }

  // If at least one of the two permissions is granted, show the buttons
  const hasAnyPermission = hasPickupPermission || hasHangupPermission

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
                className='cursor-pointer hover:underline block truncate text-sm font-medium text-primaryNeutral dark:text-primaryNeutralDark leading-5'
                onClick={handleOperatorClick}
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
              className='cursor-pointer hover:underline text-center text-sm not-italic font-medium leading-5 text-gray-900 dark:text-gray-100'
              onClick={handleOperatorClick}
            >
              {liveOperatorData?.name}
            </h3>
          )}
        </div>

        {/* Main extension or Ringing ( if user has at least one permission) */}
        {isRinging && hasAnyPermission ? (
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
          {/* Operator is in conversation*/}
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
              {hasAnyPermission ? (
                <div className='flex justify-center space-x-2'>
                  {hasPickupPermission && (
                    <Button
                      variant='white'
                      size='small'
                      className='px-3'
                      onClick={handlePickupCall}
                    >
                      <FontAwesomeIcon
                        icon={faMissed as IconDefinition}
                        className='inline-block text-center h-3 w-3 mr-2'
                      />
                      <span className='text-sm not-italic font-medium leading-5'>
                        {t('OperatorDrawer.Pickup')}
                      </span>
                    </Button>
                  )}
                  {hasHangupPermission && (
                    <Button
                      variant='whiteDanger'
                      size='small'
                      className='px-3'
                      onClick={handleRejectCall}
                    >
                      <FontAwesomeIcon
                        className='rotate-135 inline-block text-center h-3 w-3 mr-2'
                        icon={faPhone}
                      />
                      <span className='text-sm not-italic font-medium leading-5'>
                        {t('Common.Reject')}
                      </span>
                    </Button>
                  )}
                </div>
              ) : (
                // If user has no permission, show ringing status
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
                onClick={() => transferCall(liveOperatorData)}
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

          {/* Operator is not busy, not ringing, not in conversation - show call button (also when main user is busy) */}
          {!isInConversation &&
            !isRinging &&
            !isBusy &&
            (mainUserIsBusy ? (
              liveOperatorData?.mainPresence !== 'online' && (
                <Button
                  variant='dashboard'
                  disabled={true}
                  className='text-primary dark:text-primaryDark dark:disabled:text-gray-600 dark:disabled:hover:text-gray-600 disabled:text-gray-400'
                  onClick={() => callOperator(liveOperatorData)}
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
                    ? 'text-primary dark:text-primaryDark dark:disabled:text-gray-600 dark:disabled:hover:text-gray-600 disabled:text-gray-400'
                    : 'text-primary dark:text-primaryDark'
                }`}
                disabled={isOfflineOrDnd || liveOperatorData?.username === authUsername}
                onClick={() => callOperator(liveOperatorData)}
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
