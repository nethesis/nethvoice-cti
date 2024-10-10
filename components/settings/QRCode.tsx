// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useRef, useState, ChangeEvent } from 'react'
import QRCodeStyling, {
  DrawType,
  TypeNumber,
  Mode,
  ErrorCorrectionLevel,
  DotType,
  CornerSquareType,
  CornerDotType,
  Options,
} from 'qr-code-styling'

import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { t } from 'i18next'

import { Button } from '../common'

interface QRCodeTypes {
  data: string
}

export default function QRCode({ data }: QRCodeTypes) {
  const [options, setOptions] = useState<Options>({
    width: 300,
    height: 300,
    type: 'svg' as DrawType,
    data: data,
    image: '/navbar_logo.svg',
    margin: 0,
    qrOptions: {
      typeNumber: 0 as TypeNumber,
      mode: 'Byte' as Mode,
      errorCorrectionLevel: 'Q' as ErrorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 20,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      color: '#222222',
      type: 'rounded' as DotType,
    },
    backgroundOptions: {
      color: 'white',
    },
    cornersSquareOptions: {
      color: '#222222',
      type: 'extra-rounded' as CornerSquareType,
    },
    cornersDotOptions: {
      color: '#222222',
      type: 'dot' as CornerDotType,
    },
  })
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options))
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current)
    }
  }, [qrCode, ref])

  useEffect(() => {
    if (!qrCode) return
    qrCode.update(options)
  }, [qrCode, options])

  useEffect(() => {
    setOptions((options) => ({
      ...options,
      data: data,
    }))
  }, [data])

  return (
    <div className='flex flex-col gap-5'>
      <div ref={ref} />
      <div>
        <Button variant='white' onClick={() => qrCode.download()}>
          <span>{t('Common.Download')}</span>
          <FontAwesomeIcon icon={faDownload} className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
