// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, Fragment, useEffect, useState } from 'react'
import { t } from 'i18next'
import { Listbox, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faGripVertical, faXmark } from '@fortawesome/free-solid-svg-icons'

import { DeviceSectionOperatorSearch } from './DeviceSectionOperatorSearch'
import ComboboxNumber from '../common/ComboboxNumber'
import { Tooltip } from 'react-tooltip'
import { Button, InlineNotification } from '../common'
import { KeyTypeSelect } from './KeyTypeSelect'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface ExtraRowKeyProps {
  usableKeys: number
  updateExtraRowVisbility: Function
  onAddNewButton: Function
}

export const ExtraRowKey: FC<ExtraRowKeyProps> = ({
  usableKeys,
  updateExtraRowVisbility,
  onAddNewButton,
}) => {
  const hideExtraRow = () => {
    updateExtraRowVisbility(false)
  }

  const [keysTypeSelected, setKeysTypeSelected]: any = useState<string | null>(null)
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)

  const updateSelectedTypeKey = (newTypeKey: string) => {
    setKeysTypeSelected(newTypeKey)
  }

  const [newKeyLabel, setNewKeyLabel] = useState<string>('')
  const [newKeyValue, setNewKeyValue] = useState<string>('')
  const [indexError, setIndexError] = useState<boolean>(false)
  const [missingInputError, setMissingInputError] = useState<boolean>(false)
  const operators: any = useSelector((state: RootState) => state.operators)

  const confirmAddRow = () => {
    if (selectedRowIndex !== null && keysTypeSelected !== null) {
      const newKey = {
        id: selectedRowIndex + 1,
        type: keysTypeSelected,
        value: selectedUserInformation,
        label: operators?.extensions[selectedUserInformation]?.name || '-',
      }

      onAddNewButton(newKey)

      hideExtraRow()
    } else {
      setMissingInputError(true)
    }
  }

  let errorAlert = missingInputError ? (
    <div className='relative w-full'>
      <div className='w-full'>
        <InlineNotification type='error' title={t('Common.Warning')}>
          <p>{t('Devices.Fill in all the fields to continue')}</p>
        </InlineNotification>
      </div>
    </div>
  ) : indexError ? (
    <div className='relative w-full'>
      <div className='w-full'>
        <InlineNotification type='error' title={t('Devices.Index not allowed')}>
          <p>
            {t('Devices.Insert index from 1 to', {
              usableKeys,
            })}
          </p>
        </InlineNotification>
      </div>
    </div>
  ) : (
    <></>
  )

  const [selectedUserInformation, setSelectedUserNumber] = useState<any>(null)

  const updateSelectedUserInformation = (newUserInformation: string) => {
    setSelectedUserNumber(newUserInformation)
  }

  return (
    <>
      <div className='bg-gray-100 grid items-center py-4 px-2 grid-cols-2'>
        <div className='flex items-center'>
          <FontAwesomeIcon
            icon={faGripVertical}
            className='h-4 w-4 text-primary dark:text-primaryDark mr-2'
          />
          <span>{t('Devices.New key')}</span>
        </div>
        <div className='flex items-end justify-end'>
          <Button
            variant='ghost'
            onClick={() => {
              hideExtraRow()
            }}
          >
            <FontAwesomeIcon
              icon={faXmark}
              className='h-4 w-4 text-primary dark:text-primaryDark cursor-pointer'
            />
          </Button>
        </div>
      </div>

      <div className='px-4'>
        <div className='flex items-center mt-4'>
          <span>{t('Devices.Key position')}</span>
          <FontAwesomeIcon
            icon={faCircleInfo}
            className='h-4 w-4 pl-2 text-primary dark:text-primaryDark flex items-center tooltip-configure-key-position-information'
            aria-hidden='true'
          />
          {/* Pin information tooltip */}
          <Tooltip anchorSelect='.tooltip-configure-key-position-information' place='right'>
            {t('Devices.Pin information tooltip') || ''}
          </Tooltip>
        </div>
        <ComboboxNumber
          maxNumber={usableKeys}
          onSelect={(selectedNumber) => setSelectedRowIndex(selectedNumber - 1)}
        />

        <div className='mb-2'>
          <KeyTypeSelect updateSelectedTypeKey={updateSelectedTypeKey}></KeyTypeSelect>

          {(keysTypeSelected === 'blf' || keysTypeSelected === 'speedCall') && (
            <>
              <div className='mb-2'>
                <span> {t('Devices.Name or number')}</span>
              </div>
              <DeviceSectionOperatorSearch
                typeSelected={keysTypeSelected}
                updateSelectedUserInformation={updateSelectedUserInformation}
              ></DeviceSectionOperatorSearch>
            </>
          )}

          {/* Confirm button */}
          <div className='flex items-center mb-6'>
            <Button
              variant='primary'
              onClick={() => {
                confirmAddRow()
              }}
            >
              <span className='text-sm font-medium leading-5'>{t('Common.Confirm')}</span>
            </Button>
          </div>
          {errorAlert}
        </div>
      </div>
    </>
  )
}
