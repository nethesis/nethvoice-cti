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
import { KeyPositionInput } from './KeyPositionInput'
import { KeyTypeSelect } from './KeyTypeSelect'

export interface AddPhoneKeyDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: {
    // first free position of the phone, used as default value
    defaultPosition: number
    maxPosition: number
    onAdd: (key: { position: number; type: string; value: string; label: string }) => void
  }
}

const TYPES_WITHOUT_VALUE = ['line', 'dnd', 'toggleQueue']

const LABEL_CLASSES =
  'text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'

export const AddPhoneKeyDrawerContent = forwardRef<
  HTMLButtonElement,
  AddPhoneKeyDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const operators: any = useSelector((state: RootState) => state.operators)

  const [position, setPosition] = useState<number>(config?.defaultPosition || 1)
  const [type, setType] = useState<string>('')
  const [value, setValue] = useState<string>('')
  const [contactName, setContactName] = useState<string>('')

  const defaultLabelForType = (keyType: string) => {
    switch (keyType) {
      case 'line':
        return t('Devices.Line')
      case 'dnd':
        return t('Devices.Do not disturb (DND)')
      case 'toggleQueue':
        return t('Devices.Toggle login/logout queue')
      default:
        return ''
    }
  }

  const needsValue = type !== '' && !TYPES_WITHOUT_VALUE.includes(type)
  const isAddDisabled = type === '' || (needsValue && value === '')

  const addKey = () => {
    if (isAddDisabled) {
      return
    }
    const label = TYPES_WITHOUT_VALUE.includes(type)
      ? defaultLabelForType(type)
      : contactName || operators?.extensions[value]?.name || ''
    config?.onAdd({ position, type, value: TYPES_WITHOUT_VALUE.includes(type) ? '' : value, label })
    closeSideDrawer()
  }

  return (
    <>
      <DrawerHeader title={t('Devices.Add key')} onClose={closeSideDrawer} />
      <div className='px-6 pb-6'>
        <Divider paddingY='pb-12' />

        <div className='flex flex-col gap-8'>
          {/* key position */}
          <div className='flex flex-col gap-2'>
            <span className={LABEL_CLASSES}>{t('Devices.Key position')}</span>
            <KeyPositionInput
              value={position}
              max={config?.maxPosition || 1}
              onChange={setPosition}
            />
          </div>

          {/* key type */}
          <KeyTypeSelect
            updateSelectedTypeKey={(newType: string) => {
              setType(newType)
              setValue('')
              setContactName('')
            }}
            helperText={t('Devices.Choose the action assigned to this key') || ''}
          />

          {/* target of the key, only for the types that need one */}
          {needsValue && (
            <div className='flex flex-col gap-2'>
              <span className={LABEL_CLASSES}>
                {type === 'blf' ? t('Devices.Extension') : t('Devices.Name or number')}
              </span>
              <DeviceSectionOperatorSearch
                typeSelected={type}
                updateSelectedUserNumber={(newValue: string) => setValue(newValue)}
                defaultValue={''}
                updatePhonebookContactInformation={() => {}}
                updateSelectedUserName={(name: string) => setContactName(name)}
              />
            </div>
          )}
        </div>

        <Divider paddingY='pt-8 pb-6' />

        <div className='flex justify-end gap-6'>
          <Button variant='ghost' onClick={closeSideDrawer}>
            {t('Common.Cancel')}
          </Button>
          <Button variant='primary' onClick={addKey} disabled={isAddDisabled}>
            {t('Common.Add')}
          </Button>
        </div>
      </div>
    </>
  )
})

AddPhoneKeyDrawerContent.displayName = 'AddPhoneKeyDrawerContent'
