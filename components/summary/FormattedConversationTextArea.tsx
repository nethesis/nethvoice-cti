// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ChangeEvent, ComponentProps, FC, UIEvent, useRef } from 'react'
import classNames from 'classnames'
import { customScrollbarClass } from '../../lib/utils'

type FormattedContentType = 'transcript' | 'summary'

interface FormattedBlock {
  speaker?: string
  text: string
  isEmpty?: boolean
}

interface FormattedConversationTextAreaProps
  extends Omit<ComponentProps<'textarea'>, 'value' | 'onChange' | 'className'> {
  content: string
  className?: string
  textareaClassName?: string
  rows?: number
  contentType?: FormattedContentType
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void
}

const splitContent = (content: string, contentType: FormattedContentType): string[] => {
  if (contentType === 'summary') {
    return content
      .split(/\n+/)
      .map((block) => block.trim())
      .filter(Boolean)
  }

  return content
    .split(/\n\s*\n+/)
    .map((block) => block.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean)
}

const parseContent = (content: string, contentType: FormattedContentType): FormattedBlock[] => {
  return content.split('\n').map((block) => {
    if (block === '') {
      return { text: '', isEmpty: true }
    }

    const match = block.match(/^([^:\n]{1,120}:)(\s*[\s\S]*)$/)

    if (!match) {
      return { text: block }
    }

    return {
      speaker: match[1],
      text: match[2],
    }
  })
}

export const FormattedConversationTextArea: FC<FormattedConversationTextAreaProps> = ({
  content,
  className,
  textareaClassName,
  rows = 8,
  contentType = 'transcript',
  onChange,
  readOnly = true,
  ...props
}) => {
  const overlayContentRef = useRef<HTMLDivElement>(null)
  const blocks = parseContent(content, contentType)

  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (!overlayContentRef.current) {
      return
    }

    overlayContentRef.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`
  }

  return (
    <div className={classNames('relative w-full', className)}>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 overflow-hidden rounded-lg border border-gray-200 bg-surfaceBackgroundInput dark:border-gray-600 dark:bg-surfaceBackgroundInputDark'
      >
        <div
          ref={overlayContentRef}
          className='px-4 py-3 text-[15px] leading-7'
          style={{ willChange: 'transform' }}
        >
          {blocks.map((block, index) => (
            <div
              key={`${block.speaker || 'block'}-${index}`}
              className='break-words whitespace-pre-wrap min-h-[1.75rem]'
            >
              {block.isEmpty ? '\u00A0' : null}
              {block.speaker && (
                <span className='font-medium text-primaryNeutral dark:text-primaryNeutralDark'>
                  {block?.speaker}
                </span>
              )}
              <span className='font-normal text-transparent'>{block?.text}</span>
            </div>
          ))}
        </div>
      </div>
      <textarea
        readOnly={readOnly}
        value={content}
        rows={rows}
        onChange={onChange}
        onScroll={handleScroll}
        {...props}
        className={classNames(
          'relative z-10 block w-full resize-y rounded-lg border border-gray-200 bg-transparent px-4 py-3',
          'text-[15px] leading-7 text-secondaryNeutral dark:text-secondaryNeutralDark shadow-none focus:z-[8]',
          readOnly ? 'caret-transparent' : 'caret-primary dark:caret-primaryDark',
          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
          'focus:border-primaryLight focus:ring-primaryLight dark:border-gray-600 dark:focus:border-primaryDark dark:focus:ring-primaryDark',
          customScrollbarClass,
          textareaClassName,
        )}
        spellCheck={false}
      />
    </div>
  )
}
