/**
 *
 * It can be used to render a label with an icon.
 *
 * @param children - The children/s to render.
 * @param size - The button size.
 * @param variant - The variant of the button to render.
 *
 */

import { ComponentPropsWithRef, forwardRef, ReactNode } from 'react'
import classNames from 'classnames'
import { useTheme } from '../../theme/Context'

export interface ButtonProps
  extends Omit<ComponentPropsWithRef<'button'>, 'className' | 'color' | 'style'> {
  children: ReactNode
  size?: 'small' | 'base' | 'large' | 'full'
  variant?: 'primary' | 'secondary' | 'white' | 'danger'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, size = 'base', variant = 'primary', ...props },
    ref,
  ): JSX.Element => {
    const { button: theme } = useTheme().theme
    return (
      <button
        className={classNames(
          theme.base,
          theme[variant],
          size && theme.sizes[size],
          size === 'small' ? theme.rounded.small : theme.rounded.base
        )}
        ref={ref}
        {...props}
      >
        {typeof children !== 'undefined' && children}
      </button>
    )
  },
)

Button.displayName = 'Button'
