// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useEffect, useState } from 'react'
import { t } from 'i18next'
import classNames from 'classnames'
import { useTheme } from '../../theme/Context'
import { PHONE_KEY_LABEL_CLASSES, PHONE_KEY_TYPES } from './phoneKeys'

interface keyTypeSelectProps {
  defaultSelectedType?: string
  updateSelectedTypeKey: Function
  inputMissing?: boolean
  helperText?: string
  label?: string
}

export const KeyTypeSelect: FC<keyTypeSelectProps> = ({
  defaultSelectedType,
  updateSelectedTypeKey,
  inputMissing,
  helperText,
  label,
}) => {
  const { input: inputTheme } = useTheme().theme
  const [selectedType, setSelectedType] = useState<string>(defaultSelectedType || '')

  useEffect(() => {
    setSelectedType(defaultSelectedType || '')
  }, [defaultSelectedType])

  const changeType = (event: any) => {
    const newType = event.target.value
    setSelectedType(newType)
    updateSelectedTypeKey(newType)
  }

  return (
    <div className='flex flex-col gap-2'>
      <span className={PHONE_KEY_LABEL_CLASSES}>{label || t('Devices.Key type')}</span>

      <select
        id='types'
        name='types'
        className={classNames(
          inputTheme.base,
          inputTheme.rounded.base,
          inputTheme.size.base,
          inputMissing ? inputTheme.colors.error : inputTheme.colors.gray,
          'border',
          !selectedType && 'text-placeHolderInputText dark:text-placeHolderInputTextDark',
        )}
        value={selectedType}
        onChange={changeType}
      >
        {!selectedType && (
          <option value='' disabled hidden>
            {t('Devices.Choose type')}
          </option>
        )}
        {PHONE_KEY_TYPES.map((keyType) => (
          <option key={keyType.value} value={keyType.value}>
            {t(keyType.label)}
          </option>
        ))}
      </select>
      {inputMissing && (
        <div className='text-sm text-rose-600 dark:text-rose-400'>
          {t('Devices.Type selection is required')}.
        </div>
      )}
      {helperText && (
        <p className='text-xs leading-4 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
          {helperText}
        </p>
      )}
    </div>
  )
}
