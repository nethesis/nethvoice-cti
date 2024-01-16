import { FC, Fragment, useState } from 'react'
import { t } from 'i18next'
import { Listbox, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faGripVertical, faXmark } from '@fortawesome/free-solid-svg-icons'

import { DeviceSectionOperatorSearch } from './DeviceSectionOperatorSearch'
import ComboboxNumber from '../common/ComboboxNumber'
import { Tooltip } from 'react-tooltip'
import { Button } from '../common'
import { KeyTypeSelect } from './KeyTypeSelect'

interface ExtraRowKeyProps {
  usableKeys: number
  updateExtraRowVisbility: Function
}

export const ExtraRowKey: FC<ExtraRowKeyProps> = ({ usableKeys, updateExtraRowVisbility }) => {
  const hideExtraRow = () => {
    updateExtraRowVisbility(false)
  }

  const [keysTypeSelected, setKeysTypeSelected]: any = useState<string | null>(null)

  const updateSelectedTypeKey = (newTypeKey: string) => {
    setKeysTypeSelected(newTypeKey)
  }

  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null)

  const updateSelectedRowIndex = (newIndex: number) => {
    setSelectedRowIndex(newIndex)
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
              ></DeviceSectionOperatorSearch>
            </>
          )}
        </div>
      </div>
    </>
  )
}
