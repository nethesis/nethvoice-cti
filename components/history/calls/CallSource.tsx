import { FC } from 'react'
import { t } from 'i18next'

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
  // User call type
  if (callType === 'user') {
    return (
      <div
        onClick={() => {
          openDrawerHistory(call.cnam, call.ccompany, call.cnum || call.src, callType, operators)
        }}
      >
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
