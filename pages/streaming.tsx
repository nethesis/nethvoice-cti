// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faVideoSlash } from '@fortawesome/free-solid-svg-icons'
import { TextInput } from '../components/common'
import Link from 'next/link'
import { EmptyState } from '../components/common/EmptyState'
import { InlineNotification } from '../components/common/InlineNotification'
import { useVideoSources } from '../hooks/useVideoSources'
import { VideoSourcesGrid } from '../components/streaming/VideoSourcesGrid'
import { VideoSourceSkeleton } from '../components/streaming/VideoSourceSkeleton'
import { ExpandedVideoView } from '../components/streaming/ExpandedVideoView'
import { Breadcrumb } from '../components/common/Breadcrumb'

const Streaming: NextPage = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const {
    videoSources,
    isLoaded,
    error: streamingError,
    failedImages,
    handleImageError,
    handleUnlockSource,
    handleCallSource,
  } = useVideoSources()

  const filteredSources = videoSources.filter((source) =>
    source.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const expandedSource = expandedId ? videoSources.find((source) => source.id === expandedId) : null

  return (
    <>
      <div className='p-4'>
        <Breadcrumb
          previousLink={{
            path: '/applications',
            label: t('Applications.Applications'),
          }}
          currentPage={t('Applications.Video sources')}
        />

        <h1 className='text-2xl font-semibold mb-6 text-primaryNeutral dark:text-primaryNeutralDark'>
          {t('Applications.Video sources')}
        </h1>

        {/* Search field */}
        <div className='mb-8'>
          <TextInput
            placeholder={t('Streaming.Filter sources') || ''}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={faMagnifyingGlass}
            className='max-w-xs'
          />
        </div>

        {/* Error notification */}
        {streamingError && (
          <div className='mb-6'>
            <InlineNotification type='error' title={t('Common.Error')}>
              {streamingError}
            </InlineNotification>
          </div>
        )}

        {/* Video sources grid with skeleton, empty state, or content */}
        {!isLoaded ? (
          // Skeleton loading state
          <VideoSourceSkeleton />
        ) : videoSources.length === 0 ? (
          // Empty state
          <EmptyState
            title={t('Streaming.No video sources available')}
            description={t('Streaming.No video sources have been configured') || ''}
            icon={<FontAwesomeIcon icon={faVideoSlash} className='h-12 w-12' />}
          >
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              {t('Streaming.Contact your administrator to configure video sources')}
            </p>
          </EmptyState>
        ) : (
          // Loaded content
          <VideoSourcesGrid
            sources={filteredSources}
            failedImages={failedImages}
            onImageError={handleImageError}
            onUnlockSource={handleUnlockSource}
            onCallSource={handleCallSource}
            onExpand={setExpandedId}
          />
        )}
      </div>

      {/* Overlay expanded */}
      {expandedSource && (
        <ExpandedVideoView
          source={expandedSource}
          hasFailedImage={failedImages[expandedSource.id]}
          onClose={() => setExpandedId(null)}
          onImageError={handleImageError}
          onUnlockSource={handleUnlockSource}
          onCallSource={handleCallSource}
        />
      )}
    </>
  )
}

export default Streaming
