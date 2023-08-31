import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import { faXmark, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tooltip'
import { useTranslation } from 'react-i18next'
import { CallTypes } from '../../lib/history'

interface UserCallStatusIconProps {
  call: CallTypes
}

//Check the icon for the status column
export const UserCallStatusIcon: FC<UserCallStatusIconProps> = ({ call }) => {
  const { t } = useTranslation()

  return (
    <div className='mt-1 text-sm md:mt-0 flex'>
      <div>
        {call.direction === 'in' && (
          <div>
            {call.disposition === 'ANSWERED' ? (
              <>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className='tooltip-incoming-answered mr-2 -rotate-45 h-5 w-3.5 text-green-600 dark:text-green-500'
                  aria-hidden='true'
                />
                <Tooltip anchorSelect='.tooltip-incoming-answered' place='left'>
                  {t('History.Incoming answered') || ''}
                </Tooltip>
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faMissed}
                  className='tooltip-incoming-missed mr-2 h-5 w-4 text-red-400'
                  aria-hidden='true'
                />
                <Tooltip anchorSelect='.tooltip-incoming-missed' place='left'>
                  {t('History.Incoming missed') || ''}
                </Tooltip>
              </>
            )}
          </div>
        )}
        {call.direction === 'out' && (
          <div>
            {call.disposition === 'ANSWERED' ? (
              <>
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className='tooltip-outgoing-answered mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500'
                  aria-hidden='true'
                />
                <Tooltip anchorSelect='.tooltip-outgoing-answered' place='left'>
                  {t('History.Outgoing answered') || ''}
                </Tooltip>
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faXmark}
                  className='tooltip-outgoing-missed mr-2 h-5 w-3.5 text-red-400'
                  aria-hidden='true'
                />
                <Tooltip anchorSelect='.tooltip-outgoing-missed' place='left'>
                  {t('History.Outgoing missed') || ''}
                </Tooltip>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
