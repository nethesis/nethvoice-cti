// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { capitalizeFirstLetter } from './stringUtils'

/**
 * Downloads an image from a URL as a screenshot
 * @param url - The URL of the image to download
 * @param description - Optional description to use in the filename
 */
export const downloadScreenshot = async (url: string, description?: string): Promise<void> => {
  if (!url) return

  try {
    const response = await fetch(url)
    const blob = await response.blob()

    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl

    const fileName = description
      ? `${capitalizeFirstLetter(description).replace(/\s+/g, '_')}_screenshot.jpg`
      : 'video_screenshot.jpg'
    link.download = fileName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 100)
  } catch (error) {
    console.error('Error downloading screenshot:', error)
  }
}
