// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { useState, useEffect } from 'react'

interface TextScrollProps {
  text: string
}

const TextScroll: React.FC<TextScrollProps> = ({ text }) => {
  const [scrollText, setScrollText] = useState(false)

  useEffect(() => {
    if (text.length > 30) {
        setScrollText(true)
    } else {
        setScrollText(false)
    }
  }, [text])

  return (
    <>
      {scrollText ? (
        <div className='text-container'>
          <div className='text-wrapper text-sm not-italic font-medium leading-5 text-cardTextBusy dark:text-cardTextBusy'>
            <span>{text}</span>
            <span className='ml-2'>{text}</span>
          </div>
        </div>
      ) : (
        <div className='text-sm not-italic font-medium leading-5 text-cardTextBusy dark:text-cardTextBusy'>
          <span>{text}</span>
        </div>
      )}
    </>
  )
}

export default TextScroll
