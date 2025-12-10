import React, { useMemo } from 'react'
import { Avatar, Button } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faAngleRight,
  faEarListen,
  faHandPointUp,
  faPhone,
  faRecordVinyl,
  faRightLeft,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons'
import { CallDuration } from './CallDuration'
import { t } from 'i18next'
import TextScroll from '../common/TextScroll'
import { faPhoneArrowDownLeft } from '@nethesis/nethesis-solid-svg-icons'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { useOperatorStates } from '../../hooks/useOperatorStates'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

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

  const operatorsStore = useSelector((state: RootState) => state.operators)
  let currentUserIsInConversation = operatorsStore?.operators[authUsername].mainPresence != 'online'

  return (
    <div className='group flex w-full items-center justify-between rounded-lg py-2 px-3 h-16 gap-3 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cardBackgroud dark:bg-cardBackgroudDark focus:ring-primary dark:focus:ring-primary'>
      
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
          star={operator?.favorite}
          card='compact'
          isRinging={isRinging}
        />
      </span>

      {/* Middle section: Name and extension */}
      <div className='flex-1 min-w-0 overflow-hidden'>
        <div className={`flex items-center space-x-2 min-w-0`}>
          <span
            className='block truncate text-sm leading-5 font-medium text-primaryNeutral dark:text-primaryNeutralDark cursor-pointer hover:underline'
            onClick={handleOpenDrawer}
          >
            {operator?.name}
          </span>
          <span className='text-sm leading-4 font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'>
            {mainExtension}
          </span>
        </div>

        {/* Operator status indicators */}
        {isInConversation && hasValidConversation && (
          <div
            className={`tooltip-operator-information-${index} mt-1`}
            data-tooltip-id={`tooltip-operator-information-${index}`}
            data-tooltip-content={operator?.conversations[0]?.counterpartName || '-'}
          >
            <div className='flex items-center text-red-600 dark:text-red-500 overflow-hidden'>
              <div
                data-tooltip-id={`tooltip-textscroll-${index}`}
                data-tooltip-content={operator?.conversations[0]?.counterpartName || ''}
              >
                <TextScroll text={operator?.conversations[0]?.counterpartName || ''} />
              </div>
              <span className='mx-1 text-sm font-medium leading-5'>-</span>
              {operator?.conversations[0]?.startTime && (
                <>
                  <CallDuration
                    startTime={operator?.conversations[0]?.startTime}
                    className='text-sm font-medium leading-5 whitespace-nowrap'
                  />
                </>
              )}

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
            <CustomThemedTooltip id={`tooltip-textscroll-${index}`} />
          </div>
        )}

        {/* If operator is ringing and user has no permissions or is calling this operator */}
        {isRinging && (
          <div className='flex items-center text-textStatusBusy dark:text-textStatusBusyDark min-w-0 overflow-hidden mt-1'>
            {operator?.conversations?.[0]?.counterpartName && (
              <>
                <div className='min-w-0 flex-1 overflow-hidden'>
                  <div
                    data-tooltip-id={`tooltip-textscroll-${index}`}
                    data-tooltip-content={operator?.conversations[0]?.counterpartName || ''}
                  >
                    <TextScroll text={operator?.conversations[0]?.counterpartName || ''} />
                  </div>
                </div>
              </>
            )}
            <CustomThemedTooltip id={`tooltip-textscroll-${index}`} />
          </div>
        )}

        {/* If operator is busy but not in conversation */}
        {isBusy && !isInConversation && !isRinging && (
          <span className='text-sm font-medium text-textStatusBusy dark:text-textStatusBusyDark mt-1 block'>
            {t('Operators.Busy')}
          </span>
        )}
      </div>

      {/* Right section: Action buttons */}
      <div className='flex items-center space-x-2'>
        {/* Call button: mostrato solo quando la riga è "neutra" */}
        {!isInConversation && !isRinging && !isBusy && (
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

        {/* Transfer button: mostrato solo quando l'operatore è già in conversazione */}
        {isInConversation && hasValidConversation && mainUserIsBusy && isOnline && (
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
        )}

        {/* Pickup and Reject buttons */}
        {/* If operator is ringing and user has permissions */}
        {isRinging &&
          permissions?.hasAny &&
          !isCalledByCurrentUser &&
          !currentUserIsInConversation && (
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

        {/* Details button */}
        <Button variant='ghost' onClick={handleOpenDrawer} className='flex-shrink-0'>
          <FontAwesomeIcon
            icon={faAngleRight}
            className='h-4 w-4 text-cardIcon dark:text-cardIconDark cursor-pointer'
            aria-hidden='true'
          />
        </Button>
      </div>
    </div>
  )
}

export default React.memo(CompactOperatorCard)

CompactOperatorCard.displayName = 'CompactOperatorCard'
