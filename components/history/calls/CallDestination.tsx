import { FC } from 'react'
import { t } from 'i18next'
import { getEffectiveCnam } from '../../../lib/history'

interface CallDestinationProps {
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

export const CallDestination: FC<CallDestinationProps> = ({
  call,
  callType,
  operators,
  mainextension,
  name,
  openDrawerHistory,
}) => {
  // User call type
  if (callType === 'user') {
    const isIncoming = call.direction === 'in'
    const effectiveDstCnam = getEffectiveCnam(call.dst_cnam, call.dst)

    // Try operator lookup to resolve internal extension names
    let resolvedName = effectiveDstCnam
    let isKnownInternal = false
    const foundOperator: any = Object.values(operators).find((operator: any) =>
      operator.endpoints.extension.find((device: any) => device.id === call.dst),
    )
    if (foundOperator) {
      resolvedName = foundOperator.name
      isKnownInternal = true
    }

    // Queues are not in the operators list but should not be shown as "Unknown"
    const isQueue = call.lastapp === 'Queue' || (call.dcontext && call.dcontext.includes('queue'))

    // Determine if destination is the user themselves (main ext or mobile/secondary ext on incoming)
    const isUserSelf = call.dst === mainextension || (isIncoming && resolvedName === name)

    const primaryLabel =
      call.dst === ''
        ? '-'
        : isUserSelf
        ? t('History.You')
        : resolvedName !== '' && resolvedName !== name
        ? resolvedName
        : call.dst_ccompany !== ''
        ? call.dst_ccompany
        : isKnownInternal || isQueue
        ? call.dst // internal/queue with no resolved name → show number alone
        : t('Common.Unknown') // external destination with no name → Unknown

    // Show secondary number for: named parties + external unknown (always show number for externals)
    const hasNameLabel =
      call.dst !== '' &&
      !isUserSelf &&
      ((resolvedName !== '' && resolvedName !== name) ||
        call.dst_ccompany !== '' ||
        (!isKnownInternal && !isQueue))

    return (
      <div
        onClick={() =>
          openDrawerHistory(resolvedName, call.dst_ccompany, call.dst, callType, operators)
        }
      >
        <div
          className={
            'truncate text-secondaryNeutral dark:text-secondaryNeutralDark text-sm' +
            (call.dst !== '' ? 'hover:underline cursor-pointer' : '')
          }
        >
          {primaryLabel}
        </div>
        {call.dst !== '' && call.dst !== mainextension && hasNameLabel && (
          <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
            {call.dst}
          </div>
        )}
      </div>
    )
  } else {
    // Switchboard call type — same internal/external detection as user callType
    const effectiveDstCnam = getEffectiveCnam(call.dst_cnam, call.dst)
    let displayDstCnam = effectiveDstCnam
    let isKnownInternal = false
    const foundOperator: any = Object.values(operators).find((operator: any) =>
      operator.endpoints.extension.find((device: any) => device.id === call.dst),
    )
    if (foundOperator) {
      displayDstCnam = foundOperator.name
      isKnownInternal = true
    }

    const isQueue = call.lastapp === 'Queue' || (call.dcontext && call.dcontext.includes('queue'))

    const primaryLabel =
      call.dst === ''
        ? '-'
        : displayDstCnam !== ''
        ? displayDstCnam
        : call.dst_ccompany !== ''
        ? call.dst_ccompany
        : isKnownInternal || isQueue
        ? call.dst // internal/queue with no name → show number alone
        : t('Common.Unknown') // external with no name → Unknown

    const hasSecondary =
      call.dst !== '' &&
      ((displayDstCnam !== '' && displayDstCnam !== call.dst) ||
        call.dst_ccompany !== '' ||
        (!isKnownInternal && !isQueue))

    return (
      <div
        onClick={() =>
          openDrawerHistory(displayDstCnam, call.dst_ccompany, call.dst, callType, operators)
        }
      >
        <div className='truncate text-sm cursor-pointer hover:underline text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {primaryLabel}
        </div>
        {hasSecondary && (
          <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
            {call.dst}
          </div>
        )}
      </div>
    )
  }
}
