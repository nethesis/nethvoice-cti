// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faVideo, faCamera, faLock, faExpand } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../common'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { useTranslation } from 'react-i18next'
import { VideoSource } from '../../hooks/useVideoSources'
import { downloadScreenshot } from '../../utils/streamingUtils'
import { capitalizeFirstLetter } from '../../utils/stringUtils'

interface VideoSourceCardProps {
  source: VideoSource
  hasFailedImage: boolean
  onImageError: (sourceId: string) => void
  onUnlockSource: (source: VideoSource) => void
  onCallSource: (source: VideoSource) => void
  onExpand: (sourceId: string) => void
}

export const VideoSourceCard: React.FC<VideoSourceCardProps> = ({
  source,
  hasFailedImage,
  onImageError,
  onUnlockSource,
  onCallSource,
  onExpand,
}) => {
  const { t } = useTranslation()

  const handleScreenshot = () => {
    if (hasFailedImage || !source.url) return
    downloadScreenshot(source?.url, source?.description)
  }

  return (
    <div className='overflow-hidden bg-elevationL3 dark:bg-elevationL3Dark rounded-3xl shadow group relative transition-all duration-200'>
      {/* Header */}
      <div className='py-2 px-4 flex justify-between items-center font-medium text-base text-primaryNeutral dark:text-primaryNeutralDark'>
        <span>{capitalizeFirstLetter(source?.description)}</span>
        <div className='flex items-center gap-1'>
          <FontAwesomeIcon icon={faPhone} className='w-4 h-4 mr-2' />
          <span>{source?.extension || source?.id}</span>
        </div>
      </div>

      {/* Image or Fallback */}
      <div className='overflow-hidden rounded-t-3xl'>
        <div className='aspect-video bg-elevationL2Invert dark:bg-elevationL2InvertDark relative'>
          {hasFailedImage ? (
            <div className='w-full h-full flex flex-col items-center justify-center text-sm font-medium text-secondaryNeutral dark:text-secondaryNeutralDark'>
              <FontAwesomeIcon icon={faVideo} className='w-8 h-8 mb-3' />
              <p>{t('Streaming.video feed not available')}</p>
            </div>
          ) : (
            <img
              src={source.url}
              alt={source.description}
              className='w-full h-full object-cover'
              onError={() => onImageError(source.id)}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='absolute bottom-0 left-0 right-0 bg-black/30 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-in-out flex justify-center gap-3'>
        <Button
          variant='call'
          aria-label='Call'
          size='full'
          data-tooltip-id={`call-tooltip-${source.id}`}
          data-tooltip-content={t('Tooltip.Call')}
          onClick={() => onCallSource(source)}
        >
          <FontAwesomeIcon icon={faPhone} className='w-6 h-6' />
        </Button>
        <CustomThemedTooltip id={`call-tooltip-${source.id}`} />

        <Button
          variant='primaryPhoneIsland'
          aria-label='Take screenshot'
          size='full'
          data-tooltip-id={`screenshot-tooltip-${source.id}`}
          data-tooltip-content={t('Common.Take a screenshot')}
          onClick={handleScreenshot}
        >
          <FontAwesomeIcon icon={faCamera} className='w-6 h-6' />
        </Button>
        <CustomThemedTooltip id={`screenshot-tooltip-${source.id}`} />

        <Button
          variant='primaryPhoneIsland'
          aria-label='Open door'
          size='full'
          data-tooltip-id={`secure-tooltip-${source.id}`}
          data-tooltip-content={t('Common.Open door')}
          onClick={() => onUnlockSource(source)}
        >
          <FontAwesomeIcon icon={faLock} className='w-6 h-6' />
        </Button>
        <CustomThemedTooltip id={`secure-tooltip-${source.id}`} />

        <Button
          variant='primaryPhoneIsland'
          aria-label='Fullscreen'
          size='full'
          data-tooltip-id={`expand-tooltip-${source.id}`}
          data-tooltip-content={t('Tooltip.Expand')}
          onClick={(e) => {
            e.stopPropagation()
            onExpand(source.id)
          }}
        >
          <FontAwesomeIcon icon={faExpand} className='w-6 h-6' />
        </Button>
        <CustomThemedTooltip id={`expand-tooltip-${source.id}`} />
      </div>
    </div>
  )
}
