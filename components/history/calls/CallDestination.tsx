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

    // Try operator lookup if no name resolved (same as switchboard)
    let resolvedName = effectiveDstCnam
    if (resolvedName === '') {
      const foundOperator: any = Object.values(operators).find((operator: any) =>
        operator.endpoints.extension.find((device: any) => device.id === call.dst),
      )
      if (foundOperator) resolvedName = foundOperator.name
    }

    const primaryLabel =
      resolvedName !== '' && call.dst !== mainextension && resolvedName !== name
        ? resolvedName
        : call.dst_ccompany !== ''
        ? call.dst_ccompany
        // Show "You" if the destination is the user's main extension OR if it's an incoming call
        // where dst_cnam matches the user's name (handles mobile/secondary extensions like 9XXXX)
        : call.dst === mainextension || (isIncoming && resolvedName === name)
        ? t('History.You')
        : call.dst

    const hasNameLabel =
      (resolvedName !== '' && call.dst !== mainextension && resolvedName !== name) ||
      call.dst_ccompany !== ''

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
    // Check if a user does not have a name and add the name of the operator
    const effectiveDstCnam = getEffectiveCnam(call.dst_cnam, call.dst)
    if (effectiveDstCnam === '') {
      let foundOperator: any = Object.values(operators).find((operator: any) =>
        operator.endpoints.extension.find((device: any) => device.id === call.dst),
      )

      if (foundOperator) {
        call.dst_cnam = foundOperator.name
      }
    }

    // Switchboard call type
    return (
      <div
        onClick={() =>
          openDrawerHistory(call.dst_cnam, call.dst_ccompany, call.dst, callType, operators)
        }
      >
        <div className='truncate text-sm cursor-pointer hover:underline text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {call.dst_cnam !== ''
            ? call.dst_cnam
            : call.dst_ccompany !== ''
            ? call.dst_ccompany
            : call.dst || '-'}{' '}
        </div>
        {(call.dst_cnam !== '' || call.dst_ccompany !== '') && (
          <div className='truncate text-sm cursor-pointer hover:underline text-textPlaceholder dark:text-textPlaceholderDark'>
            {call.dst}
          </div>
        )}
      </div>
    )
  }
}
