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
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '../common'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { useTranslation } from 'react-i18next'
import { VideoSource } from '../../hooks/useVideoSources'

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
        <div className='py-3 px-6 flex justify-between items-center font-medium text-lg text-secondaryNeutral dark:text-secondaryNeutralDark'>
          <span>{source.description}</span>
          <div className='flex items-center gap-2'>
            <span className='ml-2'>{t('Tooltip.Collapse')}</span>
            <FontAwesomeIcon
              icon={faDownLeftAndUpRightToCenter}
              className='w-4 h-4 cursor-pointer'
              onClick={onClose}
              data-tooltip-id='collapse-tooltip'
              data-tooltip-content={t('Tooltip.Collapse')}
            />
          </div>
          <CustomThemedTooltip id='collapse-tooltip' />
        </div>

        {/* Image or Fallback */}
        <div className='flex-1 flex items-center justify-center bg-black rounded-3xl overflow-hidden relative group'>
          {hasFailedImage ? (
            <div className='w-full h-full flex flex-col items-center justify-center text-white'>
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

            <Button
              variant='primaryPhoneIsland'
              aria-label='Take screenshot'
              size='full'
              data-tooltip-id='screenshot-tooltip-expanded'
              data-tooltip-content={t('Common.Take a screenshot')}
            >
              <FontAwesomeIcon icon={faCamera} className='w-6 h-6' />
            </Button>
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
          </div>
        </div>
      </div>
    </div>
  )
}
