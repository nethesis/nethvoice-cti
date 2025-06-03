import { FC } from 'react'
import { t } from 'i18next'

interface CallDestinationProps {
  call: any
  callType: string
  operators: any
  mainextension: string
  name: string
  openDrawerHistory: (name: string, company: string, number: string, callType: string, operators: any) => void
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
    return (
      <div
        onClick={() => openDrawerHistory(call.dst_cnam, call.dst_ccompany, call.dst, callType, operators)}
      >
        <div
          className={
            'truncate text-gray-900 dark:text-gray-100 text-sm ' +
            (call.dst !== '' ? 'hover:underline cursor-pointer' : '')
          }
        >
          {call.dst_cnam !== '' && call.dst !== mainextension && call.dst_cnam !== name
            ? call.dst_cnam
            : call.dst_ccompany !== ''
            ? call.dst_ccompany
            : call.dst !== mainextension
            ? call.dst
            : t('History.You')}
        </div>
        {call.dst !== '' &&
          call.dst !== mainextension &&
          (call.dst_cnam !== '' || call.dst_ccompany !== '') && (
            <div className='truncate text-sm cursor-pointer hover:underline text-gray-500 dark:text-gray-500'>
              {call.dst}
            </div>
          )}
      </div>
    )
  } else {
    // Check if a user does not have a name and add the name of the operator
    if (call.dst_cnam === '') {
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
        onClick={() => openDrawerHistory(call.dst_cnam, call.dst_ccompany, call.dst, callType, operators)}
      >
        <div className='truncate text-sm cursor-pointer hover:underline text-gray-900 dark:text-gray-100'>
          {call.dst_cnam !== ''
            ? call.dst_cnam
            : call.dst_ccompany !== ''
            ? call.dst_ccompany
            : call.dst || '-'}{' '}
        </div>
        {(call.dst_cnam !== '' || call.dst_ccompany !== '') && (
          <div className='truncate text-sm cursor-pointer hover:underline text-gray-500 dark:text-gray-500'>
            {call.dst}
          </div>
        )}
      </div>
    )
  }
}
