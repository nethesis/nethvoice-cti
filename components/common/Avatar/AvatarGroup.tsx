/**
 *
 * The content wrapper for the avatar group.
 *
 * @param children - The contant of the avatar group.
 *
 */

import type { FC, PropsWithChildren, ComponentProps } from 'react'
import { useTheme } from '../../../theme/Context'
import { cleanClassName } from '../../../lib/utils'
import classNames from 'classnames'

export interface AvatarGroupProps
  extends PropsWithChildren<Omit<ComponentProps<'div'>, 'className'>> {
  reversed?: boolean
}

export const AvatarGroup: FC<AvatarGroupProps> = ({ children, reversed, ...props }) => {
  const { avatar: theme } = useTheme().theme
  const cleanProps = cleanClassName(props)

  return (
    <div className={classNames(theme.group, reversed && theme.reverse)} {...cleanProps}>
      {children}
    </div>
  )
}
