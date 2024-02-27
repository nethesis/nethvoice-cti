import { FC } from 'react'
import { formatDistanceToNow, intervalToDuration } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
import { t } from 'i18next'
import {
  formatDateLoc,
  formatDateLocIsDifferentTimezone,
  formatDateLocIsAnnouncement,
  getCallTimeToDisplayIsDifferentTimezone,
  getCallTimeToDisplayIsAnnouncement,
  formatInTimeZoneLoc,
  getTimeDifference,
} from '../../lib/dateTime'
import { getCallTimeToDisplay } from '../../lib/dateTime'
import { getTimezoneOffset } from 'date-fns-tz'
import { getTimezone } from '../../lib/utils'
import { zonedTimeToUtc } from 'date-fns-tz'
import { differenceInHours } from 'date-fns'

interface CallsDateProps {
  call: any
  spaced?: boolean
  isInQueue?: boolean
  isInAnnouncement?: boolean
}

const customFormatDistance = (date: any) => {
  const duration: any = intervalToDuration({
    start: date,
    end: new Date(),
  })

  if (duration?.months > 0) {
    return `${duration?.months} m ${duration?.days} d ${t('Common.ago')}`
  } else if (duration?.days > 0) {
    return `${duration?.days} d ${duration?.hours} h ${t('Common.ago')}`
  } else if (duration?.hours > 0) {
    return `${duration?.hours} h ${duration?.minutes} min ${t('Common.ago')}`
  } else {
    return `${duration?.minutes} min ${t('Common.ago')}`
  }
}

let browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

// trasform the diff value to the format +hhmm or -hhmm
const diffValueConversation = (diffValueOriginal: any) => {
  // determine the sign
  const sign = diffValueOriginal >= 0 ? '+' : '-'

  // convert hours to string and pad with leading zeros if necessary
  const hours = Math.abs(diffValueOriginal).toString().padStart(2, '0')

  // minutes are always '00'
  const minutes = '00'
  return `${sign}${hours}${minutes}`
}

const getCallDistanceToNowTemplate = (callTime: any, isHeader: boolean) => {
  const serverTimeZone: any = getTimezone() || 'UTC'

  let differenceValueBetweenTimezone = getTimeDifference()
  let diffValueEditedFormat = diffValueConversation(differenceValueBetweenTimezone)

  let callDate: any = {}
  if (isHeader) {

    callDate = utcToZonedTime(new Date(callTime), diffValueEditedFormat)

    const timeDistance = formatDistanceToNow(callDate, { addSuffix: true, includeSeconds: false })

    if (timeDistance !== '') {
      return customFormatDistance(callDate)
    } else {
      return t('Common.0 minutes ago')
    }
  } else {
    return formatInTimeZoneLoc(new Date(callTime), 'HH:mm', serverTimeZone)
  }
}

const getCallDistanceToNowTemplateIsAnnouncement = (date: any) => {
  const dateParts = date?.date_creation.split('/')
  const timeParts = date?.time_creation.split(':')

  if (dateParts.length !== 3 || timeParts.length !== 3) {
    return 'Invalid date or time format'
  }

  const year = parseInt(dateParts[2], 10)
  const month = parseInt(dateParts[1], 10) - 1
  const day = parseInt(dateParts[0], 10)
  const hour = parseInt(timeParts[0], 10)
  const minute = parseInt(timeParts[1], 10)
  const second = parseInt(timeParts[2], 10)

  const dateHour = new Date(year, month, day, hour, minute, second)
  const callDate = utcToZonedTime(dateHour, browserTimeZone)
  const timeDistance = formatDistanceToNow(callDate, { addSuffix: true, includeSeconds: false })

  if (timeDistance !== '') {
    return customFormatDistance(callDate)
  } else {
    return t('Common.0 minutes ago')
  }
}

export const CallsDate: FC<CallsDateProps> = ({ call, spaced, isInQueue, isInAnnouncement }) => {
  return (
    <>
      {isInAnnouncement ? (
        <div className={`flex flex-col justify-center flex-shrink-0 ${spaced ? 'gap-1.5' : ''}`}>
          <div className='text-sm font-medium text-gray-600 dark:text-gray-100 leading-5'>
            {getCallDistanceToNowTemplateIsAnnouncement(call)}{' '}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-100 font-normal leading-5'>
            ({formatDateLocIsAnnouncement(call)} {getCallTimeToDisplayIsAnnouncement(call)})
          </div>
        </div>
      ) : (
        <div className={`flex flex-col justify-center flex-shrink-0 ${spaced ? 'gap-1.5' : ''}`}>
          <div className='text-sm font-medium text-gray-600 dark:text-gray-100 leading-5	'>
            {getCallDistanceToNowTemplate(call?.time * 1000, true)}
          </div>
          <div className='text-sm text-gray-600 dark:text-gray-100 font-normal leading-5'>
            ({formatDateLoc(call?.time * 1000, 'PP')}{' '}
            {getCallDistanceToNowTemplate(call?.time * 1000, false)})
          </div>
        </div>
      )}
    </>
  )
}
