// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * It renders an input field.
 *
 * @param label - The label to render.
 * @param placeholder - The placeholder to render.
 * @param icon - The icon to show.
 * @param trailingIcon - Whether the icon is trailing.
 * @param error - Whether the input has an error.
 * @param helper - The text of the helper.
 * @param size - The size of the input.
 * @param rounded - The border radius of the input.
 * @param squared - The squared corners of the input.
 * @param onIconClick - The callback on icon click.
 * @param showSearchIcon - Whether to show a search icon in the placeholder.
 *
 */

import { ComponentProps, FC, forwardRef } from 'react'
import { cleanClassName } from '../../lib/utils'
import { useTheme } from '../../theme/Context'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export interface TextInputProps extends Omit<ComponentProps<'input'>, 'ref' | 'color' | 'size'> {
  label?: string
  placeholder?: string
  icon?: IconDefinition
  trailingIcon?: boolean
  error?: boolean
  helper?: string
  size?: 'base' | 'large'
  rounded?: 'base' | 'full'
  squared?: 'left' | 'right' | 'top' | 'bottom'
  onIconClick?: () => void
  showSearchIcon?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      placeholder,
      icon: Icon,
      trailingIcon,
      type = 'text',
      error,
      helper,
      size,
      rounded,
      squared,
      onIconClick,
      id,
      className,
      showSearchIcon,
      ...props
    },
    ref,
  ) => {
    const cleanProps = cleanClassName(props)
    const { input: theme } = useTheme().theme
    return (
      <div className={classNames('text-left', 'w-full', className)}>
        {label && (
          <label className={theme.label} htmlFor={id}>
            {label}
          </label>
        )}
        <div className='relative'>
          {showSearchIcon && (
            <div className={classNames(theme.icon.base, theme.icon.left)}>
              <FontAwesomeIcon
                icon={faSearch}
                className='text-gray-900 h-4 w-4 dark:text-gray-200'
              />
            </div>
          )}
          {Icon && (
            <div
              className={classNames(
                theme.icon.base,
                trailingIcon ? theme.icon.right : theme.icon.left,
              )}
            >
              <FontAwesomeIcon
                icon={Icon}
                className={classNames(
                  size === 'large' ? theme.icon.size.large : theme.icon.size.base,
                  error ? theme.icon.red : theme.icon.gray,
                  onIconClick && 'cursor-pointer',
                )}
                onClick={() => onIconClick && onIconClick()}
              />
            </div>
          )}
          <input
            type={type}
            id={id}
            placeholder={placeholder}
            className={classNames(
              theme.base,
              label && 'mt-1',
              rounded === 'full' ? theme.rounded.full : theme.rounded.base,
              squared ? theme.squared[squared] : '',
              size && size === 'large' ? theme.size.large : theme.size.base,
              !error ? theme.colors.gray : theme.colors.error,
              (Icon && !trailingIcon) || showSearchIcon ? 'pl-10' : '',
              error ? theme.placeholder.error : theme.placeholder.base,
              'text-gray-900',
            )}
            {...cleanProps}
            ref={ref}
          />
        </div>
        {helper && (
          <p
            className={classNames(
              theme.helper.base,
              error ? theme.helper.color.error : theme.helper.color.base,
            )}
          >
            {helper}
          </p>
        )}
      </div>
    )
  },
)

TextInput.displayName = 'TextInput'
