/**
 * It can be used to render a Avatar or User's profile image.
 *
 * @param size - Indicate the size of the avatar
 * @param rounded - Indicate if the avatar must be rounded or less
 * @param src - The source for the image inside the avatar
 * @param placeholder -The placeholder inside the avatar
 *
 */

import { ComponentProps, FC, ReactNode } from 'react'
import { useTheme } from '../../theme/Context'
import classNames from 'classnames'

export interface AvatarProps extends Omit<ComponentProps<'div'>, 'className' | 'placeholder'> {
  rounded?: 'full'
  src: string
  size?: 'small' | 'base' | 'large' | 'extra_large'
  placeholder?: ReactNode
}

export const Avatar: FC<AvatarProps> = ({ size, rounded, src, placeholder }): JSX.Element => {
  const { avatar: theme } = useTheme().theme
  return (
    <div
      className={classNames(
        theme.base,
        placeholder && theme.placeholder.background,
        size && theme.sizes[size],
        size === 'small' ? theme.sizes.small : theme.sizes.base,
      )}
    >
      {src && (
        <img
          className={classNames(theme.image, rounded ? theme.rounded[rounded] : theme.rounded.full)}
          src={src}
        />
      )}
      {placeholder && <div>{placeholder}</div>}
    </div>
  )
}
