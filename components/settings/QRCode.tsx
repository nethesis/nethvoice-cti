// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useRef } from 'react'
import qrcode from 'qrcode'

import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { t } from 'i18next'

import { Button } from '../common'

interface QRCodeTypes {
  data: string
}

export default function QRCode({ data }: QRCodeTypes) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (ref.current) {
      qrcode.toCanvas(ref.current, data, function (error) {
        if (error) console.error(error)
      })
    }
  }, [data])

  return (
    <div className='flex flex-col gap-5'>
      <canvas ref={ref} />
      <div>
        <Button variant='white' onClick={() => downloadQRCode(data)}>
          <span>{t('Common.Download')}</span>
          <FontAwesomeIcon icon={faDownload} className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  )

  function downloadQRCode(data: string) {
    const canvas = ref.current
    if (canvas) {
      const link = document.createElement('a')
      canvas.toBlob((blob) => {
        if (blob) {
          link.href = URL.createObjectURL(blob)
          link.download = 'qrcode.png'
          link.click()
        }
      })
    }
  }
}
