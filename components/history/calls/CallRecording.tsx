import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Button, Dropdown } from '../../common'

interface CallRecordingProps {
  call: any
  playSelectedAudioFile: (callId: string) => void
  getRecordingActions: (callId: string) => JSX.Element
}

export const CallRecording: FC<CallRecordingProps> = ({
  call,
  playSelectedAudioFile,
  getRecordingActions,
}) => {
  return call?.recordingfile ? (
    <div className='flex space-x-1 items-center'>
      <Button variant='white' onClick={() => playSelectedAudioFile(call.uniqueid)}>
        <FontAwesomeIcon
          icon={faPlay}
          className='h-4 w-4 mr-2 text-primary dark:text-gray-100'
          aria-hidden='true'
        />
        {t('History.Play')}
      </Button>
      <Dropdown items={getRecordingActions(call?.uniqueid)} position='leftUpTwoItems'>
        <Button variant='ghost'>
          <FontAwesomeIcon
            icon={faEllipsisVertical}
            className='h-4 w-4 text-primary dark:text-gray-100'
          />
          <span className='sr-only'>{t('History.Open recording action modal')}</span>
        </Button>
      </Dropdown>
    </div>
  ) : (
    <div className='flex text-gray-500 dark:text-gray-600'>-</div>
  )
}
