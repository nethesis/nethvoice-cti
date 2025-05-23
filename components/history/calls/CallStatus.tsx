import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faVoicemail, faXmark, faBuilding } from '@fortawesome/free-solid-svg-icons'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { t } from 'i18next'
import { Tooltip } from 'react-tooltip'

interface CallStatusProps {
  call: any
  callType: string
}

export const CallStatus: FC<CallStatusProps> = ({ call, callType }) => {
  if (callType === 'user') {
    return (
      <div className='mt-1 text-sm'>
        <div>
          {call.direction === 'in' ? (
            <div>
              {call.disposition === 'ANSWERED' ? (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className='mr-2 h-5 w-3.5 -rotate-45 text-green-600 dark:text-green-500 z-0'
                    aria-hidden='true'
                  />
                  <span className='text-gray-900 dark:text-gray-100'>
                    {t('History.Incoming answered')}
                  </span>
                  {call?.lastapp === 'VoiceMail' && (
                    <>
                      <FontAwesomeIcon
                        icon={faVoicemail}
                        className='ml-2 h-4 w-4 text-green-600 dark:text-green-500 tooltip-user-internal-answered-voicemail'
                        aria-hidden='true'
                      />
                      <Tooltip
                        anchorSelect='.tooltip-user-internal-answered-voicemail'
                        place='top'
                      >
                        {t('History.Call in Voicemail') || ''}
                      </Tooltip>
                    </>
                  )}
                </div>
              ) : (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faMissed as IconDefinition}
                    className='mr-2 h-5 w-4 text-red-400'
                    aria-hidden='true'
                  />
                  <span className='text-gray-900 dark:text-gray-100'>
                    {t('History.Incoming missed')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              {call.disposition === 'ANSWERED' ? (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className='mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500 z-0'
                    aria-hidden='true'
                  />
                  <span className='text-gray-900 dark:text-gray-100'>
                    {t('History.Outgoing answered')}
                  </span>
                </div>
              ) : (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faXmark}
                    className='mr-2 h-5 w-3.5 text-red-400'
                    aria-hidden='true'
                  />
                  <span className='text-gray-900 dark:text-gray-100'>
                    {t('History.Outgoing missed')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  } else {
    // Switchboard call type
    return (
      <div className='mt-1 text-sm'>
        <div>
          {call.type === 'internal' ? (
            <div>
              {call.disposition === 'ANSWERED' ? (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500'
                    aria-hidden='true'
                  />
                  <span className='text-gray-900 dark:text-gray-100'>
                    {t('History.Internal answered')}
                  </span>
                  {call.lastapp === 'VoiceMail' && (
                    <>
                      <FontAwesomeIcon
                        icon={faVoicemail}
                        className='ml-2 h-4 w-4 text-green-600 dark:text-green-500 tooltip-switchboard-internal-answered-voicemail'
                        aria-hidden='true'
                      />
                      <Tooltip
                        anchorSelect='.tooltip-switchboard-internal-answered-voicemail'
                        place='top'
                      >
                        {t('History.Call in Voicemail') || ''}
                      </Tooltip>
                    </>
                  )}
                </div>
              ) : (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-red-400'
                    aria-hidden='true'
                  />
                  <span className='text-gray-900 dark:text-gray-100'>
                    {t('History.Internal missed')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              {call.type === 'in' ? (
                <div>
                  {call.disposition === 'ANSWERED' ? (
                    <div className='flex flex-nowrap items-center'>
                      <FontAwesomeIcon
                        icon={faArrowLeft}
                        className='mr-2 h-5 w-3.5 -rotate-45 text-green-600 dark:text-green-500 z-0'
                        aria-hidden='true'
                      />
                      <span className='text-gray-900 dark:text-gray-100'>
                        {t('History.Incoming answered')}
                      </span>
                      {call.lastapp === 'VoiceMail' && (
                        <>
                          <FontAwesomeIcon
                            icon={faVoicemail}
                            className='ml-2 h-4 w-4 text-green-600 dark:text-green-500 tooltip-switchboard-not-internal-answered-voicemail'
                            aria-hidden='true'
                          />
                          <Tooltip
                            anchorSelect='.tooltip-switchboard-not-internal-answered-voicemail'
                            place='top'
                          >
                            {t('History.Call in Voicemail') || ''}
                          </Tooltip>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className='flex flex-nowrap items-center'>
                      <FontAwesomeIcon
                        icon={faMissed as IconDefinition}
                        className='mr-2 h-5 w-4 text-red-400'
                        aria-hidden='true'
                      />
                      <span className='text-gray-900 dark:text-gray-100'>
                        {t('History.Incoming missed')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {call.disposition === 'ANSWERED' ? (
                    <div className='flex flex-nowrap items-center'>
                      <FontAwesomeIcon
                        icon={faArrowLeft}
                        className='mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500 z-0'
                        aria-hidden='true'
                      />
                      <span className='text-gray-900 dark:text-gray-100'>
                        {t('History.Outgoing answered')}
                      </span>
                    </div>
                  ) : (
                    <div className='flex flex-nowrap items-center'>
                      <FontAwesomeIcon
                        icon={faXmark}
                        className='mr-2 h-5 w-3.5 text-red-400'
                        aria-hidden='true'
                      />
                      <span className='text-gray-900 dark:text-gray-100'>
                        {t('History.Outgoing missed')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
}
