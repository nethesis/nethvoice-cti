// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faVideo,
  faCamera,
  faLock,
  faDownLeftAndUpRightToCenter,
  faBullhorn,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '../common'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { useTranslation } from 'react-i18next'
import { VideoSource } from '../../hooks/useVideoSources'
import { capitalizeFirstLetter } from '../../utils/stringUtils'
import { getISODateForFilename } from '../../lib/utils'

interface ExpandedVideoViewProps {
  source: VideoSource
  hasFailedImage: boolean
  onClose: () => void
  onImageError: (sourceId: string) => void
  onUnlockSource: (source: VideoSource) => void
  onCallSource: (source: VideoSource) => void
}

export const ExpandedVideoView: React.FC<ExpandedVideoViewProps> = ({
  source,
  hasFailedImage,
  onClose,
  onImageError,
  onUnlockSource,
  onCallSource,
}) => {
  const { t } = useTranslation()

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Add escape key handler
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
  }, [onClose])

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={handleOverlayClick}
    >
      <div
        className='relative bg-elevationL3 dark:bg-elevationL3Dark rounded-3xl shadow-lg max-w-5xl w-full mx-4 md:mx-0'
        style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className='py-2 px-6 flex justify-between items-center font-medium text-base text-secondaryNeutral dark:text-secondaryNeutralDark'>
          <span>{capitalizeFirstLetter(source?.description)}</span>
          <div className='flex items-center gap-1'>
            <FontAwesomeIcon icon={faPhone} className='w-4 h-4 mr-2' />
            <span>{source?.extension || source?.id}</span>
          </div>
        </div>

        {/* Image or Fallback */}
        <div className='flex-1 flex items-center justify-center bg-elevationL2Invert dark:bg-elevationL2InvertDark rounded-3xl overflow-hidden relative group min-h-[600px]'>
          {hasFailedImage ? (
            <div className='w-full h-full flex flex-col items-center justify-center text-secondaryNeutral dark:text-secondaryNeutralDark'>
              <FontAwesomeIcon icon={faVideo} className='w-16 h-16 mb-4' />
              <p className='text-lg'>{t('Streaming.video feed not available')}</p>
            </div>
          ) : (
            <img
              src={source.url}
              alt={source.description}
              className='w-full h-full object-contain'
              onError={() => onImageError(source.id)}
            />
          )}

          {/* Footer */}
          <div className='absolute bottom-0 left-0 right-0 bg-black/30 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-in-out flex justify-center gap-3'>
            <Button
              variant='call'
              aria-label='Call'
              size='full'
              data-tooltip-id='call-tooltip-expanded'
              data-tooltip-content={t('Tooltip.Call')}
              onClick={() => onCallSource(source)}
            >
              <FontAwesomeIcon icon={faPhone} className='w-6 h-6' />
            </Button>
            <CustomThemedTooltip id='call-tooltip-expanded' />
            <a
              href={source.url}
              download={
                source.description
                  ? `${capitalizeFirstLetter(source.description).replace(
                      /\s+/g,
                      '_',
                    )}_${getISODateForFilename()}_screenshot.jpg`
                  : `screenshot_${getISODateForFilename()}.jpg`
              }
              className={`inline-flex pi-flex pi-content-center pi-items-center pi-justify-center pi-tracking-wide pi-duration-200 pi-transform pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-40 disabled:pi-cursor-not-allowed pi-border pi-border-transparent focus:pi-ring-offset-white dark:focus:pi-ring-offset-black pi-text-sm pi-leading-4 pi-col-start-auto pi-transition-color pi-shrink-0 content-center items-center justify-center font-medium tracking-wide transition-colors duration-200 transform focus:outline-none focus:z-20 bg-phoneIslandActive dark:bg-phoneIslandActiveDark hover:bg-gray-500 dark:hover:bg-gray-50 focus:ring-emerald-500 dark:focus:ring-emerald-300 text-phoneIslandPrimaryInvert dark:text-phoneIslandPrimaryInvertDark h-12 w-12 rounded-full`}
              data-tooltip-id='screenshot-tooltip-expanded'
              data-tooltip-content={t('Common.Take a screenshot')}
              aria-label='Take screenshot'
            >
              <FontAwesomeIcon icon={faCamera} className='w-6 h-6' />
            </a>
            <CustomThemedTooltip id='screenshot-tooltip-expanded' />

            <Button
              variant='primaryPhoneIsland'
              aria-label='Open door'
              size='full'
              data-tooltip-id='secure-tooltip-expanded'
              data-tooltip-content={t('Common.Open door')}
              onClick={() => onUnlockSource(source)}
            >
              <FontAwesomeIcon icon={faLock} className='w-6 h-6' />
            </Button>
            <CustomThemedTooltip id='secure-tooltip-expanded' />

            <Button
              variant='primaryPhoneIsland'
              aria-label='Collapse'
              size='full'
              data-tooltip-id='collapse-tooltip-expanded'
              data-tooltip-content={t('Tooltip.Collapse')}
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} className='w-6 h-6' />
            </Button>
            <CustomThemedTooltip id='collapse-tooltip-expanded' />
          </div>
        </div>
      </div>
    </div>
  )
}
