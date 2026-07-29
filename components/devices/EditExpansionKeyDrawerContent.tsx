// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { Button } from '../common'
import { DrawerHeader } from '../common/DrawerHeader'
import { Divider } from '../common/Divider'
import { closeSideDrawer } from '../../lib/utils'
import { RootState } from '../../store'
import { DeviceSectionOperatorSearch } from './DeviceSectionOperatorSearch'
import { KeyTypeSelect } from './KeyTypeSelect'
import {
  getDefaultPhoneKeyLabel,
  isPhoneKeyTypeWithValue,
  PHONE_KEY_LABEL_CLASSES,
} from './phoneKeys'

export interface EditExpansionKeyDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: {
    keyNumber: number
    type: string
    value: string
    label: string
    onSave: (key: { type: string; value: string; label: string }) => void
  }
}

export const EditExpansionKeyDrawerContent = forwardRef<
  HTMLButtonElement,
  EditExpansionKeyDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const operators: any = useSelector((state: RootState) => state.operators)

  const [type, setType] = useState<string>(config?.type || '')
  const [value, setValue] = useState<string>(config?.value || '')
  const [keyLabel, setKeyLabel] = useState<string>(config?.label || '')

  const needsValue = isPhoneKeyTypeWithValue(type)
  const isSaveDisabled = type === '' || (needsValue && value === '')

  const saveKey = () => {
    if (isSaveDisabled) {
      return
    }
    if (!needsValue) {
      config?.onSave({ type, value: '', label: getDefaultPhoneKeyLabel(type) })
    } else {
      config?.onSave({
        type,
        value,
        label: keyLabel || operators?.extensions[value]?.name || value,
      })
    }
    closeSideDrawer()
  }

  return (
    <>
      <DrawerHeader
        title={`${t('Devices.Edit expansion key', { number: config?.keyNumber })}`}
        onClose={closeSideDrawer}
      />
      <div className='px-6 pb-6'>
        <Divider paddingY='pb-12' />

        <div className='flex flex-col gap-8'>
          <KeyTypeSelect
            defaultSelectedType={config?.type}
            label={t('Devices.Line key type') || ''}
            updateSelectedTypeKey={(newType: string) => {
              setType(newType)
              setValue('')
              setKeyLabel('')
            }}
            helperText={t('Devices.Choose the action assigned to this key') || ''}
          />

          {needsValue && (
            <div className='flex flex-col gap-2'>
              <span className={PHONE_KEY_LABEL_CLASSES}>
                {type === 'blf' ? t('Devices.Extension') : t('Devices.Name or number')}
              </span>
              <DeviceSectionOperatorSearch
                typeSelected={type}
                value={value}
                label={keyLabel}
                onChange={(key) => {
                  setValue(key.value)
                  setKeyLabel(key.label)
                }}
              />
            </div>
          )}
        </div>

        <Divider paddingY='pt-8 pb-6' />

        <div className='flex justify-end gap-6'>
          <Button variant='ghost' onClick={closeSideDrawer}>
            {t('Common.Cancel')}
          </Button>
          <Button variant='primary' onClick={saveKey} disabled={isSaveDisabled}>
            {t('Common.Edit')}
          </Button>
        </div>
      </div>
    </>
  )
})

EditExpansionKeyDrawerContent.displayName = 'EditExpansionKeyDrawerContent'
