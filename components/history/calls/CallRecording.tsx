import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Button, Dropdown } from '../../common'

interface CallRecordingProps {
  call: any
  playSelectedAudioFile: (callId: string) => void
  getRecordingActions: (callId: string) => JSX.Element
  getCallActions?: (call: any) => JSX.Element
  summaryStatus?: any
}

export const CallRecording: FC<CallRecordingProps> = ({
  call,
  playSelectedAudioFile,
  getRecordingActions,
  getCallActions,
  summaryStatus,
}) => {
  const hasRecording = call?.recordingfile
  const hasSummaryOrTranscription =
    summaryStatus?.state === 'done' &&
    (summaryStatus?.has_summary || summaryStatus?.has_transcription)
  const showDropdown = hasRecording || hasSummaryOrTranscription

  return showDropdown ? (
    <div className='flex justify-end space-x-1 items-center'>
      {hasRecording && (
        <Button variant='ghost' onClick={() => playSelectedAudioFile(call.uniqueid)}>
          <FontAwesomeIcon icon={faPlay} className='h-4 w-4 mr-2' aria-hidden='true' />
          {t('History.Play')}
        </Button>
      )}
      {getCallActions ? (
        <Dropdown items={getCallActions(call)} position='leftUpTwoItems'>
          <Button variant='ghost'>
            <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
            <span className='sr-only'>{t('History.Open recording action modal')}</span>
          </Button>
        </Dropdown>
      ) : (
        <Dropdown items={getRecordingActions(call?.uniqueid)} position='leftUpTwoItems'>
          <Button variant='ghost'>
            <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
            <span className='sr-only'>{t('History.Open recording action modal')}</span>
          </Button>
        </Dropdown>
      )}
    </div>
  ) : (
    <div className='flex' />
  )
}
