import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import { faXmark, faArrowLeft, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { Tooltip } from 'react-tooltip'
import { useTranslation } from 'react-i18next'
import { CallTypes } from '../../lib/history'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'

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
                  data-tooltip-id='tooltip-incoming-answered'
                  data-tooltip-content={t('History.Incoming answered') || ''}
                />

                <CustomThemedTooltip id='tooltip-incoming-answered' place='left' />
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faMissed as IconDefinition}
                  className='tooltip-incoming-missed mr-2 h-5 w-4 text-red-400'
                  aria-hidden='true'
                  data-tooltip-id='tooltip-incoming-missed'
                  data-tooltip-content={t('History.Incoming missed') || ''}
                />

                <CustomThemedTooltip id='tooltip-incoming-missed' place='left' />
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
                  data-tooltip-id='tooltip-outgoing-answered'
                  data-tooltip-content={t('History.Outgoing answered') || ''}
                />

                <CustomThemedTooltip id='tooltip-outgoing-answered' place='left'/>
              </>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faXmark}
                  className='tooltip-outgoing-missed mr-2 h-5 w-3.5 text-red-400'
                  aria-hidden='true'
                  data-tooltip-id='tooltip-outgoing-missed'
                  data-tooltip-content={t('History.Outgoing missed') || ''}
                />

                <CustomThemedTooltip id='tooltip-outgoing-missed' place='left'/>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
