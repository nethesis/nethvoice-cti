import { FC } from 'react'
import { CallTypes } from '../../lib/history'
import { exactDistanceToNowLoc, formatDateLoc } from '../../lib/dateTime'
import { getCallTimeToDisplay } from '../../lib/dateTime'
import { t } from 'i18next'
import { utcToZonedTime } from 'date-fns-tz'

interface CallsDateProps {
  call: CallTypes
  spaced?: boolean
}

const getCallDistanceToNowTemplate = (callTime: any) => {
  const timeDistance = exactDistanceToNowLoc(utcToZonedTime(new Date(callTime), 'UTC'), {
    addSuffix: true,
    hideSeconds: true,
  })
  if (timeDistance != '') {
    return t('Common.time_distance_ago', { timeDistance })
  } else {
    return t('Common.0 minutes ago')
  }
}

export const CallsDate: FC<CallsDateProps> = ({ call, spaced }) => {
  return (
    <div className={`flex flex-col justify-center flex-shrink-0 ${spaced ? 'gap-1.5' : ''}`}>
      <div className='text-sm text-gray-900 dark:text-gray-100'>
        {formatDateLoc(call.time * 1000, 'PP')}
      </div>
      <div className='text-sm text-gray-500'>
        {getCallTimeToDisplay(call.time * 1000)} &nbsp;(
        {getCallDistanceToNowTemplate(call.time * 1000)})
      </div>
    </div>
  )
}
