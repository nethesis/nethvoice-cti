import { FC } from 'react'
import { CallTypes } from '../../lib/history'
import { exactDistanceToNowLoc, formatDateLoc } from '../../lib/dateTime'
import { getCallTimeToDisplay } from '../../lib/dateTime'
import { t } from 'i18next'
import { utcToZonedTime } from 'date-fns-tz'
import { formatDistanceToNow, intervalToDuration } from 'date-fns'

interface CallsDateProps {
  call: any
  spaced?: boolean
}

const customFormatDistance = (date: any) => {
  const duration: any = intervalToDuration({
    start: date,
    end: new Date(),
  })

  if (duration.months > 0) {
    return `${duration.months} m ${duration.days} d ${t('Common.ago')}`
  } else if (duration.days > 0) {
    return `${duration.days} d ${duration.hours} h ${t('Common.ago')}`
  } else if (duration.hours > 0) {
    return `${duration.hours} h ${duration.minutes} min ${t('Common.ago')}`
  } else {
    return `${duration.minutes} min ${t('Common.ago')}`
  }
}

const getCallDistanceToNowTemplate = (callTime: any) => {
  const callDate = utcToZonedTime(new Date(callTime), 'UTC')
  const timeDistance = formatDistanceToNow(callDate, { addSuffix: true, includeSeconds: false })

  if (timeDistance !== '') {
    return customFormatDistance(callDate)
  } else {
    return t('Common.0 minutes ago')
  }
}

export const CallsDate: FC<CallsDateProps> = ({ call, spaced }) => {
  return (
    <div className={`flex flex-col justify-center flex-shrink-0 ${spaced ? 'gap-1.5' : ''}`}>
      <div className='text-sm font-medium text-gray-600 dark:text-gray-100 leading-5	'>
        {getCallDistanceToNowTemplate(call.time * 1000)}
      </div>
      <div className='text-sm text-gray-600 dark:text-gray-100 font-normal leading-5	'>
        ({formatDateLoc(call.time * 1000, 'PP')} {getCallTimeToDisplay(call.time * 1000)})
      </div>
    </div>
  )
}
