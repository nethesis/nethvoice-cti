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
    // Try operator lookup to resolve internal extension names
    let resolvedName = effectiveCnam
    let isKnownInternal = false
    const foundOperator: any = Object.values(operators).find((operator: any) =>
      operator.endpoints.extension.find((device: any) => device.id === sourceNumber),
    )
    if (foundOperator) {
      resolvedName = foundOperator.name
      isKnownInternal = true
    }

    // Determine if this is the user themselves (main ext or mobile/secondary ext on outgoing)
    const isUserSelf = sourceNumber === mainextension || (!isIncoming && resolvedName === name)

    const primaryLabel = isUserSelf
      ? t('History.You')
      : resolvedName !== '' && resolvedName !== name
      ? resolvedName
      : call.ccompany !== ''
      ? call.ccompany
      : isKnownInternal
      ? sourceNumber // internal extension with no resolved name → show extension alone
      : t('Common.Unknown') // external caller with no name → Unknown

    // Show secondary number for: named callers + external unknown (always show number for externals)
    const hasNameLabel =
      !isUserSelf &&
      ((resolvedName !== '' && resolvedName !== name) ||
        call.ccompany !== '' ||
        !isKnownInternal)

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
    // Switchboard call type — same internal/external detection as user callType
    let displayCnam = effectiveCnam
    let isKnownInternal = false
    const foundOperator: any = Object.values(operators).find((operator: any) =>
      operator.endpoints.extension.find(
        (device: any) => device.id === call.cnum || device.id === call.src,
      ),
    )
    if (foundOperator) {
      displayCnam = foundOperator.name
      isKnownInternal = true
    }

    const primaryLabel =
      displayCnam !== ''
        ? displayCnam
        : call.ccompany !== ''
        ? call.ccompany
        : isKnownInternal
        ? sourceNumber // internal with no name → show number alone
        : t('Common.Unknown') // external with no name → Unknown

    const hasSecondary =
      sourceNumber !== '' &&
      ((displayCnam !== '' && displayCnam !== sourceNumber) ||
        call.ccompany !== '' ||
        !isKnownInternal)

    return (
      <div
        onClick={() => {
          openDrawerHistory(displayCnam, call.ccompany, sourceNumber, callType, operators)
        }}
      >
        <div className='truncate text-sm cursor-pointer hover:underline text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {primaryLabel}
        </div>
        {hasSecondary && (
          <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
            {sourceNumber}
          </div>
        )}
      </div>
    )
  }
}
