// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * It renders an input fields.
 *
 * @param label - The label to render.
 * @param placeholder - The placeholder to render.
 * @param icon - The icon to show.
 * @param iconRight - The position of the icon.
 * @param error - The position of the icon.
 * @param helper - The text of the helper.
 * @param size - The size of the input.
 * @param squared - The radius of the border.
 * @param onIconClick - The callback on icon click.
 *
 */

import { ComponentProps, FC, forwardRef } from 'react'
import { cleanClassName } from '../../lib/utils'
import { useTheme } from '../../theme/Context'
import classNames from 'classnames'

export interface TextInputProps
  extends Omit<ComponentProps<'input'>, 'ref' | 'color' | 'className' | 'size'> {
  label?: string
  placeholder: string
  icon?: FC<ComponentProps<'svg'>>
  trailingIcon?: boolean
  error?: boolean
  helper?: string
  size?: 'base' | 'large'
  rounded?: 'base' | 'full'
  squared?: 'left' | 'right' | 'top' | 'bottom'
  onIconClick?: () => void
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
      ...props
    },
    ref,
  ) => {
    const cleanProps = cleanClassName(props)
    const { input: theme } = useTheme().theme
    return (
      <div className='text-left w-full'>
        {label && (
          <label className={theme.label} htmlFor={id}>
            {label}
          </label>
        )}
        <div className='relative'>
          {Icon && (
            <div
              className={classNames(
                theme.icon.base,
                trailingIcon ? theme.icon.right : theme.icon.left,
              )}
            >
              <Icon
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
              Icon && !trailingIcon && 'pl-10',
              error ? theme.placeholder.error : theme.placeholder.base,
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
