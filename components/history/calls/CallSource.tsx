import { FC } from 'react'
import { t } from 'i18next'
import { getEffectiveCnam } from '../../../lib/history'

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
  const isIncoming = call.direction === 'in'
  // For outgoing calls cnum is the user's own extension ("You").
  // For incoming calls src is the actual calling party; cnum may be the transfer
  // initiator (Asterisk preserves it across attended transfers), not the real caller.
  const sourceNumber = isIncoming ? (call.src || call.cnum || '') : (call.cnum || call.src || '')
  // When incoming with a transfer in play (src ≠ cnum), cnam was set from cnum
  // (the transfer initiator) and would show the wrong person's name.
  const effectiveCnam =
    isIncoming && call.src && call.cnum && call.src !== call.cnum
      ? ''
      : getEffectiveCnam(call.cnam, sourceNumber)

  // User call type
  if (callType === 'user') {
    // Try operator lookup if no name resolved (same as switchboard)
    let resolvedName = effectiveCnam
    if (resolvedName === '') {
      const foundOperator: any = Object.values(operators).find((operator: any) =>
        operator.endpoints.extension.find((device: any) => device.id === sourceNumber),
      )
      if (foundOperator) resolvedName = foundOperator.name
    }

    const primaryLabel =
      resolvedName !== '' && sourceNumber !== mainextension && resolvedName !== name
        ? resolvedName
        : call.ccompany !== ''
        ? call.ccompany
        // Show "You" if the source is the user's main extension OR if it's an outgoing call
        // where cnam matches the user's name (handles mobile/secondary extensions like 9XXXX)
        : sourceNumber === mainextension || (!isIncoming && resolvedName === name)
        ? t('History.You')
        : sourceNumber

    const hasNameLabel =
      (resolvedName !== '' && sourceNumber !== mainextension && resolvedName !== name) ||
      call.ccompany !== ''

    return (
      <div
        onClick={() => {
          openDrawerHistory(resolvedName, call.ccompany, sourceNumber, callType, operators)
        }}
      >
        <div
          className={
            'truncate text-sm text-secondaryNeutral dark:text-secondaryNeutralDark' +
            (sourceNumber !== '' ? ' text-sm cursor-pointer hover:underline' : '')
          }
        >
          {primaryLabel}
        </div>
        {sourceNumber !== '' && sourceNumber !== mainextension && hasNameLabel && (
          <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
            {sourceNumber}
          </div>
        )}
      </div>
    )
  } else {
    // Check if a user does not have a name and add the name of the operator
    if (effectiveCnam === '') {
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
          openDrawerHistory(call.cnam, call.ccompany, sourceNumber, callType, operators)
        }}
      >
        <div className='truncate text-sm cursor-pointer hover:underline text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {call.cnam !== '' ? call.cnam : call.ccompany !== '' ? call.ccompany : sourceNumber || '-'}
        </div>
        {sourceNumber !== '' && (call.cnam !== '' || call.ccompany !== '') && (
          <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
            {sourceNumber}
          </div>
        )}
      </div>
    )
  }
}
