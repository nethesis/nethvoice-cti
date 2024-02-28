import { FC, useEffect, useState } from 'react'
import { formatDistance, formatDistanceToNow, intervalToDuration } from 'date-fns'
import { format } from 'date-fns-tz'
import { utcToZonedTime } from 'date-fns-tz'
import { t } from 'i18next'
import { enGB, it } from 'date-fns/locale'
import {
  formatDateLocIsAnnouncement,
  getCallTimeToDisplayIsAnnouncement,
  getTimeDifference,
} from '../../lib/dateTime'
import i18next from 'i18next'

interface CallsDateProps {
  call: any
  spaced?: boolean
  isInQueue?: boolean
  isInAnnouncement?: boolean
}

export const CallsDate: FC<CallsDateProps> = ({ call, spaced, isInQueue, isInAnnouncement }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('')

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

  // get the local timezone offset in the format +hhmm or -hhmm
  const getLocalTimezoneOffset = () => {
    let localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const now = new Date()
    const offset = format(now, 'xx', { timeZone: localTimezone })
    return offset
  }

  // get the difference between the local timezone and the timezone of the server
  const getDifferenceBetweenTimezone = () => {
    let differenceValueBetweenTimezone = getTimeDifference()
    let diffValueEditedFormat = diffValueConversation(differenceValueBetweenTimezone)
    return diffValueEditedFormat
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

  const getHeader = (call: any) => {
    let localTimeZone = getLocalTimezoneOffset()
    let differenceBetweenTimezone = getDifferenceBetweenTimezone()
    return (
      <div className='text-sm font-medium text-gray-600 dark:text-gray-100 leading-5'>
        {formatDistance(
          utcToZonedTime(call?.time * 1000, differenceBetweenTimezone),
          utcToZonedTime(new Date(), localTimeZone),
          { addSuffix: true, includeSeconds: true, locale: selectedLanguage === 'it' ? it : enGB },
        )}
      </div>
    )
  }

  const getBody = (call: any) => {
    let differenceBetweenTimezone = getDifferenceBetweenTimezone()
    return (
      <div className='text-sm text-gray-600 dark:text-gray-100 font-normal leading-5'>
        ({format(utcToZonedTime(call?.time * 1000, differenceBetweenTimezone), 'd MMM yyyy HH:mm')})
      </div>
    )
  }

  // check browser language and set the selected language
  useEffect(() => {
    if (i18next?.languages[0] !== '') {
      setSelectedLanguage(i18next?.languages[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18next?.languages[0]])

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
          {getHeader(call)}
          {getBody(call)}
        </div>
      )}
    </>
  )
}
