// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * It can be used to render a Avatar or User's profile image.
 *
 * @param rounded - Indicate the radius of the avatar.
 * @param status - Indicate the status of the status circle.
 * @param src - The path of the image.
 * @param initials - The initials to render if the image isn't present.
 * @param placeholder - The image to show as placeholder.
 * @param bordered - Adds a white border to the avatar.
 * @param altText - The alt text for required for usability.
 * @param size - The size of the avatar.
 * @param unoptimized - It is usefull when it's necessary to load images from an external domain.
 *
 */

import { ComponentProps, FC } from 'react'
import { useTheme } from '../../../theme/Context'
import classNames from 'classnames'
import Image from 'next/image'
import { AvatarGroup, AvatarGroupProps as GroupProps } from './AvatarGroup'
import type { StatusTypes } from '../../../theme/Types'

export type AvatarGroupProps = GroupProps

export interface AvatarProps extends Omit<ComponentProps<'div'>, 'className' | 'placeholder'> {
  rounded?: 'base' | 'full'
  status?: StatusTypes
  src?: string
  initials?: string
  placeholder?: FC<ComponentProps<'svg'>>
  bordered?: boolean
  altText?: string
  size?: 'extra_small' | 'small' | 'base' | 'large' | 'extra_large',
  unoptimized?: boolean
}

const AvatarComponent: FC<AvatarProps> = ({
  rounded = 'full',
  status,
  src,
  initials,
  placeholder: Placeholder,
  bordered,
  altText = 'Avatar image',
  size = 'base',
  unoptimized
}) => {
  const { avatar: theme, status: statuses } = useTheme().theme

  return (
    <div
      className={classNames(
        theme.base,
        theme.sizes[size],
        initials && theme.initials.background,
        Placeholder && theme.placeholder.background,
        theme.rounded[rounded],
        bordered && theme.bordered,
      )}
    >
      {src && (
        <Image
          className={classNames(theme.image, theme.rounded[rounded])}
          src={src}
          alt={altText}
          layout='fill'
          unoptimized={unoptimized}
        />
      )}
      {initials && <div className={theme.initials.base}>{initials}</div>}
      {Placeholder && <Placeholder className={theme.placeholder.base} />}
      {status && (
        <div
          className={classNames(
            theme.status.base,
            statuses[status].avatar.dot,
            rounded === 'base' ? theme.status.sizes.rounded[size] : theme.status.sizes.circular[size],
          )}
        ></div>
      )}
    </div>
  )
}

AvatarGroup.displayName = 'Avatar.Group'

export const Avatar = Object.assign(AvatarComponent, {
  Group: AvatarGroup,
})
