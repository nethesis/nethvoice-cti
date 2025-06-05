// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { capitalizeFirstLetter } from './stringUtils'

/**
 * Downloads an image from a URL as a screenshot
 * @param url - The URL of the image to download
 * @param description - Optional description to use in the filename
 */
export const downloadScreenshot = (url: string, description?: string): void => {
  if (!url) return

  try {
    const link = document.createElement('a')

    link.href = url

    const fileName = description
      ? `${capitalizeFirstLetter(description).replace(/\s+/g, '_')}_screenshot.jpg`
      : 'video_screenshot.jpg'

    link.download = fileName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Error downloading screenshot:', error)
  }
}
