import { FC } from 'react'
import { CallTypes } from '../../lib/history'
import { Tooltip } from 'react-tooltip'
import { getOperatorByPhoneNumber } from '../../lib/operators'
import classNames from 'classnames'
import { cleanString } from '../../lib/utils'

interface CallsDestinationProps {
  call: CallTypes
  hideName?: boolean
  hideNumber?: boolean
  highlightNumber?: boolean
  operators: any
}

export function getCallName(call: CallTypes): string {
  return call.dst_cnam || call.dst_ccompany || call.dst || ''
}

export const CallsDestination: FC<CallsDestinationProps> = ({
  call,
  hideName,
  hideNumber,
  highlightNumber,
  operators,
}) => {
  //Check if a user does not have a name and add the name of the operator
  if (call.dst_cnam === '') {
    const operatorFound: any = getOperatorByPhoneNumber(call.dst, operators)

    if (operatorFound) {
      call.dst_cnam = operatorFound.name
    }
  }

  return (
    <div className='flex flex-col justify-center overflow-hidden'>
      {/* name */}
      {!hideNumber && (
        <div
          className={classNames(
            `tooltip-dest-${cleanString(getCallName(call) || '-')}`,
            'truncate text-gray-900 dark:text-gray-200 leading-4 font-medium text-sm w-28 whitespace-nowrap',
          )}
        >
          {getCallName(call) || '-'}
        </div>
      )}
      <Tooltip anchorSelect={`.tooltip-dest-${cleanString(getCallName(call) || '-')}`}>
        {getCallName(call) || '-'}
      </Tooltip>
      {/* phone number */}
      {!hideName && (call.dst_cnam !== '' || call.dst_ccompany !== '') && (
        <div className={`truncate ${highlightNumber ? 'text-primary' : 'text-gray-500'}`}>
          {call.dst}
        </div>
      )}
    </div>
  )
}
