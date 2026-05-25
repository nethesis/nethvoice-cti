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
    const effectiveDstCnam = getEffectiveCnam(call.dst_cnam, call.dst)

    const primaryLabel =
      effectiveDstCnam !== '' && call.dst !== mainextension && effectiveDstCnam !== name
        ? effectiveDstCnam
        : call.dst_ccompany !== ''
        ? call.dst_ccompany
        : call.dst !== mainextension
        ? t('Common.Unknown')
        : t('History.You')

    return (
      <div
        onClick={() =>
          openDrawerHistory(effectiveDstCnam, call.dst_ccompany, call.dst, callType, operators)
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
        {call.dst !== '' && call.dst !== mainextension && (
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
