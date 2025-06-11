import React, { useMemo } from 'react'
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
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { CallDuration } from './CallDuration'
import { t } from 'i18next'
import TextScroll from '../common/TextScroll'
import { faHangup, faPhoneArrowDownLeft } from '@nethesis/nethesis-solid-svg-icons'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { useOperatorStates } from '../../hooks/useOperatorStates'

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
  const {
    permissions,
    operatorStates,
    handlers: {
      handleOpenDrawer,
      handleTransferCall,
      handleCallOperator,
      handlePickupCall,
      handleRejectCall,
    },
  } = useOperatorStates(operator, authUsername)

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
          onClick={handleOpenDrawer}
          className='mx-auto cursor-pointer'
          status={operator?.mainPresence}
        />
      </span>

      {/* Middle section: Name and extension */}
      <div className='flex-1 min-w-0 ml-3'>
        <div className='flex items-center space-x-2'>
          <span
            className='block truncate text-sm leading-5 font-medium text-primaryNeutral dark:text-primaryNeutralDark cursor-pointer hover:underline'
            onClick={handleOpenDrawer}
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
            <span className='ringing-animation h-2.5 w-2.5 mr-4'></span>
            <span>{t('Operators.Ringing')}</span>
            {operator?.conversations?.[0]?.counterpartName && (
              <>
                <span className='mx-1'>-</span>
                <div
                  data-tooltip-id={`tooltip-ringing-counterpart-${index}`}
                  data-tooltip-content={operator.conversations[0].counterpartName || ''}
                >
                  <TextScroll text={operator.conversations[0].counterpartName} />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className='text-sm font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'>
            {isRinging &&
            !isCalledByCurrentUser &&
            (operator?.conversations?.[0]?.counterpartName ||
              operator?.conversations?.[0]?.counterpartNum) ? (
              <div className='text-textStatusBusy dark:text-textStatusBusyDark text-sm leading-5 font-medium flex items-center'>
                <span className='ringing-animation h-2.5 w-2.5 mr-2'></span>
                <div
                  data-tooltip-id={`tooltip-extension-ringing-name-${index}`}
                  data-tooltip-content={
                    operator.conversations[0].counterpartName ||
                    operator.conversations[0].counterpartNum ||
                    ''
                  }
                >
                  <TextScroll
                    text={
                      operator.conversations[0].counterpartName ||
                      operator.conversations[0].counterpartNum
                    }
                  />
                </div>
              </div>
            ) : (
              mainExtension
            )}
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
              <div className='max-w-[80px]'>
                <div
                  data-tooltip-id={`tooltip-textscroll-${index}`}
                  data-tooltip-content={operator?.conversations[0]?.counterpartName || ''}
                >
                  <TextScroll text={operator?.conversations[0]?.counterpartName || ''} />
                </div>
              </div>

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
              <Button
                variant='white'
                size='small'
                onClick={handlePickupCall}
                data-tooltip-id={`tooltip-pickup-operator-${index}`}
                data-tooltip-content={t('OperatorDrawer.Pickup')}
              >
                <FontAwesomeIcon
                  icon={faPhoneArrowDownLeft as any}
                  className='inline-block text-center h-4 w-4 lg:h-3 lg:w-3'
                />
              </Button>
            )}
            {permissions?.hangup && (
              <Button
                variant='whiteDanger'
                size='small'
                onClick={() => handleRejectCall(operator?.endpoints?.mainextension?.[0]?.id)}
                data-tooltip-id={`tooltip-reject-operator-${index}`}
                data-tooltip-content={t('Common.Reject')}
              >
                <FontAwesomeIcon
                  style={{ transform: 'rotate(135deg)' }}
                  className='inline-block text-center h-4 w-4 lg:h-3 lg:w-3'
                  icon={faPhone as IconDefinition}
                />
              </Button>
            )}
            {/* Show tooltips on all screen sizes */}
            <CustomThemedTooltip id={`tooltip-pickup-operator-${index}`} />
            <CustomThemedTooltip id={`tooltip-reject-operator-${index}`} />
          </div>
        )}

        {/* If operator is ringing and user has no permissions or is calling this operator */}
        {isRinging && (!permissions?.hasAny || isCalledByCurrentUser) && (
          <div className='flex items-center text-textStatusBusy dark:text-textStatusBusyDark'>
            <span className='ringing-animation mr-2 h-4 w-4' />
            <span className='text-sm font-medium'>{t('Operators.Ringing')}</span>
            {operator?.conversations?.[0]?.counterpartName && (
              <>
                <span className='mx-1'>-</span>
                <div
                  data-tooltip-id={`tooltip-no-permission-ringing-${index}`}
                  data-tooltip-content={operator.conversations[0].counterpartName || ''}
                >
                  <TextScroll text={operator.conversations[0].counterpartName} />
                </div>
              </>
            )}
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
      <Button variant='ghost' onClick={handleOpenDrawer} className='flex-shrink-0 ml-2'>
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
