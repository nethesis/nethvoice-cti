import { FC } from 'react'

interface CallDurationProps {
  duration: number
}

export const CallDuration: FC<CallDurationProps> = ({ duration }) => {
  // Get the duration of the call in Human time
  function toDaysMinutesSeconds(totalSeconds: number) {
    const seconds = Math.floor(totalSeconds % 60)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
    const days = Math.floor(totalSeconds / (3600 * 24))

    const secondsStr = makeHumanReadable(seconds, 'second')
    const minutesStr = makeHumanReadable(minutes, 'minute')
    const hoursStr = makeHumanReadable(hours, 'hour')
    const daysStr = makeHumanReadable(days, 'day')

    return `${daysStr}${hoursStr}${minutesStr}${secondsStr}`.replace(/,\s*$/, '')
  }

  // Make the duration of the call in Human time
  function makeHumanReadable(num: number, singular: string) {
    return num > 0 ? num + (num === 1 ? ` ${singular}, ` : ` ${singular}s, `) : ''
  }

  return (
    <div className='text-sm text-gray-900 dark:text-gray-100'>
      {!duration ? '0 second' : toDaysMinutesSeconds(duration)}
    </div>
  )
}
