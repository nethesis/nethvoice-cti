/**
 * The switch can be used to manage boolean values.
 *
 * @param on - To render the button on.
 * @param changed - The callback when changed.
 * @param disabled - To render the button disabled.
 * @param label - The label to show.
 *
 */

import { FC, useState, useEffect } from 'react'
import classNames from 'classnames'
import { useTheme } from '../../theme/Context'
import { Switch as HeadlessSwitch } from '@headlessui/react'

export interface SwitchProps {
  on?: boolean
  changed?: (enabled: boolean) => void
  disabled?: boolean
  label?: string
}

export const Switch: FC<SwitchProps> = ({ changed, on, disabled, label }): JSX.Element => {
  const [enabled, setEnabled] = useState(on || false)
  const { switch: switchTheme } = useTheme().theme
  const backgroundOn = disabled ? switchTheme.off.indigo : switchTheme.on.indigo
  const backgroundOff = disabled ? switchTheme.off.gray : switchTheme.on.gray

  useEffect(() => {
    changed && changed(enabled)
  }, [changed, enabled])

  return (
    <HeadlessSwitch.Group>
      <div className='flex items-center'>
        {label && <HeadlessSwitch.Label className='mr-4'>{label}</HeadlessSwitch.Label>}
        <HeadlessSwitch
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
          disabled={disabled}
          className={classNames(enabled ? backgroundOn : backgroundOff, switchTheme.background)}
        >
          <span
            className={classNames(
              switchTheme.circle,
              enabled ? switchTheme.on.translate : switchTheme.off.translate,
            )}
          />
        </HeadlessSwitch>
      </div>
    </HeadlessSwitch.Group>
  )
}
