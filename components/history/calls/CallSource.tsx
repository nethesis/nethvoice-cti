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
  const sourceNumber = call.cnum || call.src || ''
  const effectiveCnam = getEffectiveCnam(call.cnam, sourceNumber)

  // User call type
  if (callType === 'user') {
    const primaryLabel =
      effectiveCnam !== '' && sourceNumber !== mainextension && effectiveCnam !== name
        ? effectiveCnam
        : call.ccompany !== ''
        ? call.ccompany
        : sourceNumber !== mainextension
        ? t('Common.Unknown')
        : t('History.You')

    return (
      <div
        onClick={() => {
          openDrawerHistory(effectiveCnam, call.ccompany, sourceNumber, callType, operators)
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
        {sourceNumber !== '' && sourceNumber !== mainextension && (
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
