// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useEffect, useState } from 'react'
import { t } from 'i18next'
import classNames from 'classnames'

interface keyTypeSelectProps {
  defaultSelectedType?: string
  updateSelectedTypeKey: Function
  inputMissing?: boolean
  helperText?: string
}

export const KeyTypeSelect: FC<keyTypeSelectProps> = ({
  defaultSelectedType,
  updateSelectedTypeKey,
  inputMissing,
  helperText,
}) => {
  const [keysTypeSelected, setKeysTypeSelected]: any = useState<string | null>(
    defaultSelectedType || null,
  )

  const typesList = [
    { id: 1, description: 'blf', label: `${t('Devices.Busy lamp field (BLF)')}` },
    { id: 2, description: 'line', label: `${t('Devices.Line')}` },
    { id: 3, description: 'dnd', label: `${t('Devices.Do not disturb (DND)')}` },
    { id: 4, description: 'speed_dial', label: `${t('Devices.Speed call')}` },
    { id: 5, description: 'toggleQueue', label: `${t('Devices.Toggle login/logout queue')}` },
  ]

  const [announcementSelected, setAnnouncementSelected] = useState<any>(null)

  function changeAnnouncementSelect(event: any) {
    const listAnnouncementValue = event.target.value

    const selectedAnnouncement = typesList.find(
      (announcementItem: any) => announcementItem.id === parseInt(listAnnouncementValue),
    )

    if (selectedAnnouncement) {
      setKeysTypeSelected(selectedAnnouncement)
      updateSelectedTypeKey(selectedAnnouncement?.description)
      setAnnouncementSelected(listAnnouncementValue)
    }
  }

  useEffect(() => {
    if (defaultSelectedType && announcementSelected === null) {
      const selectedAnnouncement = typesList.find(
        (announcementItem: any) => announcementItem.description === defaultSelectedType,
      )
      setKeysTypeSelected(selectedAnnouncement)
      setAnnouncementSelected(selectedAnnouncement?.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelectedType])

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
        {t('Devices.Key type')}
      </span>

      <select
        id='types'
        name='types'
        className={classNames(
          inputMissing
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-400'
            : 'border-gray-300 focus:border-primaryLight focus:ring-primaryLight dark:border-gray-600 dark:focus:border-primaryDark dark:focus:ring-primaryDark',
          'block w-full rounded-md border bg-bgInput dark:bg-bgInputDark px-3 py-2 text-sm',
          announcementSelected
            ? 'text-secondaryNeutral dark:text-secondaryNeutralDark'
            : 'text-gray-400 dark:text-gray-500',
        )}
        value={announcementSelected || ''}
        onChange={changeAnnouncementSelect}
      >
        {!announcementSelected && <option value=''>{t('Devices.Choose type')}</option>}
        {Object.keys(typesList).map((key: any) => (
          <option key={key} value={typesList[key].id}>
            {typesList[key].label}
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
