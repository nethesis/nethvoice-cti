import { FC, useEffect, useRef, useState } from 'react'
import { t } from 'i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { Badge } from '../../common'
import { CustomThemedTooltip } from '../../common/CustomThemedTooltip'

interface CallSourceProps {
  call: any
  callType: string
  operators: any
  mainextension: string
  name: string
  openDrawerHistory: (
    name: string,
    company: string,
    number: string,
    callType: string,
    operators: any,
  ) => void
}

export const CallSource: FC<CallSourceProps> = ({
  call,
  callType,
  operators,
  mainextension,
  name,
  openDrawerHistory,
}) => {
  const [showQueueTooltip, setShowQueueTooltip] = useState(false)
  const queueLabelRef = useRef<HTMLDivElement | null>(null)
  const isQueueCall =
    !!call?.queue ||
    !!call?.queue_name ||
    (typeof call?.channel === 'string' && call.channel.includes('from-queue'))
  const queueId = call?.queue || ''
  const queueName = call?.queue_name || ''
  const queueLabelBase = queueName
    ? queueId
      ? `${queueName} ${queueId}`
      : queueName
    : queueId || t('QueueManager.Queue')
  const queueLabel = queueLabelBase

  useEffect(() => {
    if (!isQueueCall) {
      setShowQueueTooltip(false)
      return
    }

    const updateTooltipVisibility = () => {
      const element = queueLabelRef.current
      setShowQueueTooltip(!!element && element.scrollWidth > element.clientWidth)
    }

    updateTooltipVisibility()
    window.addEventListener('resize', updateTooltipVisibility)

    return () => {
      window.removeEventListener('resize', updateTooltipVisibility)
    }
  }, [isQueueCall, queueLabel])

  const renderQueueBadge = () => {
    if (!isQueueCall) {
      return null
    }

    return (
      <>
        <Badge
          size='small'
          variant='offline'
          rounded='full'
          className='mb-1 max-w-fit overflow-hidden'
          data-tooltip-id={showQueueTooltip ? `tooltip-queue-${call?.uniqueid}` : undefined}
          data-tooltip-content={showQueueTooltip ? queueLabel : undefined}
        >
          <FontAwesomeIcon icon={faUsers} className='h-4 w-4 mr-2 ml-1' aria-hidden='true' />
          <div ref={queueLabelRef} className='truncate max-w-20 xl:max-w-28 2xl:max-w-40 mr-1'>
            {queueLabel}
          </div>
        </Badge>
        {showQueueTooltip && (
          <CustomThemedTooltip id={`tooltip-queue-${call?.uniqueid}`} place='top' />
        )}
      </>
    )
  }

  // User call type
  if (callType === 'user') {
    return (
      <div
        onClick={() => {
          openDrawerHistory(call.cnam, call.ccompany, call.cnum || call.src, callType, operators)
        }}
      >
        {renderQueueBadge()}
        <div
          className={
            'truncate text-sm text-secondaryNeutral dark:text-secondaryNeutralDark' +
            (call.cnum !== '' ? ' text-sm cursor-pointer hover:underline' : '')
          }
        >
          {call.cnam !== '' && call.cnum !== mainextension && call.cnam !== name
            ? call.cnam
            : call.ccompany !== ''
            ? call.ccompany
            : call.cnum !== mainextension
            ? call.cnum
            : t('History.You')}
        </div>
        {call.cnum !== '' &&
          call.cnum !== mainextension &&
          (call.cnam !== '' || call.ccompany !== '') && (
            <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
              {call.src}
            </div>
          )}
      </div>
    )
  } else {
    // Check if a user does not have a name and add the name of the operator
    if (call.cnam === '') {
      let foundOperator: any = Object.values(operators).find((operator: any) =>
        operator.endpoints.extension.find(
          (device: any) => device.id === call.cnum || device.id === call.src,
        ),
      )

      if (foundOperator) {
        call.cnam = foundOperator.name
      }
    }

    // Switchboard call type
    return (
      <div
        onClick={() => {
          openDrawerHistory(call.cnam, call.ccompany, call.cnum || call.src, callType, operators)
        }}
      >
        {renderQueueBadge()}
        <div className='truncate text-sm cursor-pointer hover:underline text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {call.cnam !== '' ? call.cnam : call.ccompany !== '' ? call.ccompany : call.cnum || '-'}
        </div>
        {call.cnum !== '' && (
          <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
            {call.src}
          </div>
        )}
      </div>
    )
  }
}
