import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faXmark, faBuilding } from '@fortawesome/free-solid-svg-icons'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import {
  getAnsweredIconColorClass,
  getAnsweredTranslationKey,
  isCallAnswered,
  isAnsweredElsewhereDisposition,
  getNormalizedDisposition,
} from '../../../lib/history'
import { RootState } from '../../../store'
import { CustomThemedTooltip } from '../../common/CustomThemedTooltip'

interface CallStatusProps {
  call: any
  callType: string
}

export const CallStatus: FC<CallStatusProps> = ({ call, callType }) => {
  const { operators } = useSelector((state: RootState) => state.operators)
  const { profile } = useSelector((state: RootState) => state.user)
  const isAnswered = isCallAnswered(call)
  const isAnsweredElsewhere = isAnsweredElsewhereDisposition(getNormalizedDisposition(call))

  const getAnsweredByLabel = () => {
    const answeredByNum = call?.answered_by_num

    if (!answeredByNum) {
      return ''
    }

    const operator = Object.values(operators || {}).find((candidate: any) =>
      candidate?.endpoints?.extension?.some((extension: any) => extension?.id === answeredByNum),
    ) as any

    if (operator?.name) {
      return `${operator.name} (${answeredByNum})`
    }

    return answeredByNum
  }

  const answeredByLabel = getAnsweredByLabel()
  const answeredElsewhereTooltipId = `tooltip-answered-elsewhere-${call?.uniqueid || call?.linkedid || 'call'}`

  const canShowAnsweredBy =
    callType === 'switchboard'
      ? !!profile?.macro_permissions?.cdr?.permissions?.ad_cdr?.value
      : callType === 'group' || callType === 'groups'
        ? !!profile?.macro_permissions?.cdr?.permissions?.group_cdr?.value
        : !!profile?.macro_permissions?.cdr?.value

  const answeredElsewhereTooltipContent =
    canShowAnsweredBy && answeredByLabel
      ? `${t('History.Answered by')} ${answeredByLabel}`
      : t('History.Answered by another operator')

  const renderAnsweredElsewhereText = (translationKey: string) => {
    const translatedLabel = t(translationKey)
    const match = translatedLabel.match(/^(.*?)(\belsewhere\b)(.*)$/i)

    if (!match) {
      return (
        <span
          className='cursor-help underline underline-offset-2'
          data-tooltip-id={answeredElsewhereTooltipId}
          data-tooltip-content={answeredElsewhereTooltipContent}
        >
          {translatedLabel}
        </span>
      )
    }

    return (
      <>
        {match[1]}
        <span
          className='cursor-help underline underline-offset-2'
          data-tooltip-id={answeredElsewhereTooltipId}
          data-tooltip-content={answeredElsewhereTooltipContent}
        >
          {match[2]}
        </span>
        {match[3]}
      </>
    )
  }

  const renderAnsweredLabel = (direction: 'Incoming' | 'Outgoing' | 'Internal') => {
    const translationKey = getAnsweredTranslationKey(direction, call.disposition)

    if (!isAnsweredElsewhere) {
      return (
        <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {t(translationKey)}
        </span>
      )
    }

    return (
      <>
        <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
          {renderAnsweredElsewhereText(translationKey)}
        </span>
        <CustomThemedTooltip id={answeredElsewhereTooltipId} place='top' />
      </>
    )
  }

  if (callType === 'user') {
    return (
      <div className='mt-1 text-sm'>
        <div>
          {call.direction === 'in' ? (
            <div>
              {isAnswered ? (
                <>
                  <div className='flex flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className={`mr-2 h-4 w-4 -rotate-45 z-0 ${getAnsweredIconColorClass(call.disposition)}`}
                      aria-hidden='true'
                    />
                    {renderAnsweredLabel('Incoming')}
                  </div>
                </>
              ) : (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faMissed as IconDefinition}
                    className='mr-2 h-4 w-4 text-textStatusBusy dark:text-textStatusBusyDark'
                    aria-hidden='true'
                  />
                  <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
                    {t('History.Incoming missed')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              {isAnswered ? (
                <>
                  <div className='flex flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className={`mr-2 h-4 w-4 rotate-[135deg] z-0 ${getAnsweredIconColorClass(call.disposition)}`}
                      aria-hidden='true'
                    />
                    {renderAnsweredLabel('Outgoing')}
                  </div>
                </>
              ) : (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faXmark}
                    className='mr-2 h-4 w-4 text-textStatusBusy dark:text-textStatusBusyDark'
                    aria-hidden='true'
                  />
                  <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
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
              {isAnswered ? (
                <>
                  <div className='flex flex-nowrap items-center'>
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className={`mr-2 h-4 w-4 flex-shrink-0 ${getAnsweredIconColorClass(call.disposition)}`}
                      aria-hidden='true'
                    />
                    {renderAnsweredLabel('Internal')}
                  </div>
                </>
              ) : (
                <div className='flex flex-nowrap items-center'>
                  <FontAwesomeIcon
                    icon={faBuilding}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-textStatusBusy dark:text-textStatusBusyDark'
                    aria-hidden='true'
                  />
                  <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
                    {t('History.Internal missed')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div>
              {call.type === 'in' ? (
                <div>
                  {isAnswered ? (
                    <>
                      <div className='flex flex-nowrap items-center'>
                        <FontAwesomeIcon
                          icon={faArrowLeft}
                          className={`mr-2 h-4 w-4 -rotate-45 z-0 ${getAnsweredIconColorClass(call.disposition)}`}
                          aria-hidden='true'
                        />
                        {renderAnsweredLabel('Incoming')}
                      </div>
                    </>
                  ) : (
                    <div className='flex flex-nowrap items-center'>
                      <FontAwesomeIcon
                        icon={faMissed as IconDefinition}
                        className='mr-2 h-4 w-4 text-textStatusBusy dark:text-textStatusBusyDark'
                        aria-hidden='true'
                      />
                      <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
                        {t('History.Incoming missed')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {isAnswered ? (
                    <>
                      <div className='flex flex-nowrap items-center'>
                        <FontAwesomeIcon
                          icon={faArrowLeft}
                          className={`mr-2 h-4 w-4 rotate-[135deg] z-0 ${getAnsweredIconColorClass(call.disposition)}`}
                          aria-hidden='true'
                        />
                        {renderAnsweredLabel('Outgoing')}
                      </div>
                    </>
                  ) : (
                    <div className='flex flex-nowrap items-center'>
                      <FontAwesomeIcon
                        icon={faXmark}
                        className='mr-2 h-4 w-4 text-textStatusBusy dark:text-textStatusBusyDark'
                        aria-hidden='true'
                      />
                      <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
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
