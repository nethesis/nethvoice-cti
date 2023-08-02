import { FC } from 'react'
import { CallTypes } from '../../lib/history'
import { formatDateLoc } from '../../lib/dateTime'
import { getCallTimeToDisplay } from '../../lib/dateTime'

interface CallsDateProps {
  call: CallTypes
  spaced?: boolean
}

export const CallsDate: FC<CallsDateProps> = ({ call, spaced }) => {
  return (
    <div className={`flex flex-col justify-center flex-shrink-0 ${spaced ? 'gap-1.5' : ''}`}>
        <div className='text-sm text-gray-900 dark:text-gray-100'>
          {formatDateLoc(call.time * 1000, 'PP')}
        </div>
        <div className='text-sm text-gray-500'>{getCallTimeToDisplay(call.time * 1000)}</div>
    </div>
  )
}
