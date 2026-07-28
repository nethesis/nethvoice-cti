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

export interface AddPhoneKeyDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: {
    // first free position of the phone, used as default value
    defaultPosition: number
    maxPosition: number
    onAdd: (key: { position: number; type: string; value: string; label: string }) => void
  }
}

const KEY_TYPES = [
  { value: 'blf', label: 'Devices.Busy lamp field (BLF)' },
  { value: 'line', label: 'Devices.Line' },
  { value: 'dnd', label: 'Devices.Do not disturb (DND)' },
  { value: 'speed_dial', label: 'Devices.Speed call' },
  { value: 'toggleQueue', label: 'Devices.Toggle login/logout queue' },
]

const TYPES_WITHOUT_VALUE = ['line', 'dnd', 'toggleQueue']

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

        {/* key position */}
        <div>
          <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
            {t('Devices.Key position')}
          </span>
          <input
            type='number'
            min={1}
            max={config?.maxPosition}
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
            className='mt-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-1.5 text-sm leading-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primaryDark'
          />
        </div>

        {/* key type */}
        <div className='pt-8'>
          <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
            {t('Devices.Key type')}
          </span>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value)
              setValue('')
              setContactName('')
            }}
            className='mt-2 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-1.5 text-sm leading-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primaryDark'
          >
            <option value=''>{t('Devices.Choose type')}</option>
            {KEY_TYPES.map((keyType) => (
              <option key={keyType.value} value={keyType.value}>
                {t(keyType.label)}
              </option>
            ))}
          </select>
          <p className='mt-2 text-xs leading-4 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
            {t('Devices.Choose the action assigned to this key')}
          </p>
        </div>

        {/* target of the key, only for the types that need one */}
        {needsValue && (
          <div className='pt-8'>
            <div className='mb-2'>
              <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
                {type === 'blf' ? t('Devices.Extension') : t('Devices.Name or number')}
              </span>
            </div>
            <DeviceSectionOperatorSearch
              typeSelected={type}
              updateSelectedUserNumber={(newValue: string) => setValue(newValue)}
              defaultValue={''}
              updatePhonebookContactInformation={() => {}}
              updateSelectedUserName={(name: string) => setContactName(name)}
            />
          </div>
        )}

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
