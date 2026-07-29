// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, MutableRefObject, useCallback, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleMinus, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { isEmpty } from 'lodash'
import { RootState } from '../../store'
import { Button, ConfirmationModal, InlineNotification } from '../common'
import { PhysicalPhoneKeyBadge } from './PhysicalPhoneKeyBadge'
import {
  getPhoneKeysConfiguration,
  openEditExpansionKeyDrawer,
  reloadPhysicalPhone,
  saveBtnsConfig,
} from '../../lib/devices'
import { customScrollbarClass, openToast } from '../../lib/utils'
import {
  isPhoneKeyTypeWithValue,
  notifyPhoneConfigurationSaved,
  PHONE_KEY_CARD_CLASSES,
  PHONE_KEY_SKELETON_CLASSES,
} from './phoneKeys'

export interface ExpansionModuleSectionProps {
  deviceId: string
  phoneName: string
  moduleIndex: number
  onRemoved: () => void
}

interface ExpansionKey {
  number: number
  globalIndex: number
  type: string
  value: string
  label: string
}

export const ExpansionModuleSection: FC<ExpansionModuleSectionProps> = ({
  deviceId,
  phoneName,
  moduleIndex,
  onRemoved,
}) => {
  const operators: any = useSelector((state: RootState) => state.operators)

  const [macAddress, setMacAddress] = useState('')
  const [keys, setKeys] = useState<ExpansionKey[]>([])
  const [keysLoaded, setKeysLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const cancelRemoveRef = useRef() as MutableRefObject<HTMLButtonElement>

  useEffect(() => {
    if (!isEmpty(operators?.extensions) && deviceId) {
      setMacAddress(operators?.extensions[deviceId]?.mac?.toUpperCase() || '')
    }
  }, [operators?.extensions, deviceId])

  const loadKeys = useCallback(async () => {
    if (!macAddress) {
      return
    }
    try {
      setLoadError(false)
      setKeysLoaded(false)
      const phoneKeys = await getPhoneKeysConfiguration(macAddress)
      if (!phoneKeys) {
        setLoadError(true)
        return
      }
      const { configuration, expansionKeysPerModule } = phoneKeys
      const moduleKeys: ExpansionKey[] = []
      for (let i = 1; i <= expansionKeysPerModule; i++) {
        const globalIndex = moduleIndex * expansionKeysPerModule + i
        moduleKeys.push({
          number: i,
          globalIndex,
          type: configuration?.variables?.[`expkey_type_${globalIndex}`] ?? '',
          value: configuration?.variables?.[`expkey_value_${globalIndex}`] ?? '',
          label: configuration?.variables?.[`expkey_label_${globalIndex}`] ?? '',
        })
      }
      setKeys(moduleKeys)
      setKeysLoaded(true)
    } catch (error) {
      setLoadError(true)
    }
  }, [macAddress, moduleIndex])

  useEffect(() => {
    loadKeys()
  }, [loadKeys])

  const saveExpansionKeys = async (variables: any) => {
    await saveBtnsConfig(macAddress, { variables })
    if (deviceId) {
      await reloadPhysicalPhone(deviceId)
    }
  }

  const editKey = (key: ExpansionKey) => {
    openEditExpansionKeyDrawer({
      keyNumber: key.number,
      type: key.type,
      value: key.value,
      label: key.label,
      onSave: async ({ type, value, label }) => {
        try {
          setSaveError(false)
          await saveExpansionKeys({
            [`expkey_type_${key.globalIndex}`]: type,
            [`expkey_value_${key.globalIndex}`]: value,
            [`expkey_label_${key.globalIndex}`]: label,
          })
          setKeys((previousKeys) =>
            previousKeys.map((item) =>
              item.globalIndex === key.globalIndex ? { ...item, type, value, label } : item,
            ),
          )
          notifyPhoneConfigurationSaved(phoneName)
        } catch (error) {
          setSaveError(true)
        }
      },
    })
  }

  const removeModule = async () => {
    try {
      setIsRemoving(true)
      setSaveError(false)
      const variables: any = {}
      keys.forEach((key) => {
        variables[`expkey_type_${key.globalIndex}`] = ''
        variables[`expkey_value_${key.globalIndex}`] = ''
        variables[`expkey_label_${key.globalIndex}`] = ''
      })
      await saveExpansionKeys(variables)
      setShowRemoveModal(false)
      openToast(
        'success',
        `${t('Devices.Expansion module removed description')}`,
        `${t('Devices.Expansion module removed')}`,
      )
      onRemoved()
    } catch (error) {
      setSaveError(true)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className='flex flex-col gap-6 flex-1 min-h-0 min-w-0'>
      <div className='flex items-center justify-between gap-4'>
        <p className='text-sm leading-5 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
          {t('Devices.Expansion module description')}
        </p>
        <Button variant='ghost' onClick={() => setShowRemoveModal(true)} disabled={!keysLoaded}>
          <FontAwesomeIcon icon={faCircleMinus} className='mr-3 h-4 w-4' />
          <span>{t('Devices.Remove module')}</span>
        </Button>
      </div>

      {(loadError || saveError) && (
        <InlineNotification type='error' title={t('Common.Error')}>
          <p>
            {saveError
              ? t('Devices.Cannot save configuration')
              : t('Devices.Cannot retrieve configuration information')}
          </p>
        </InlineNotification>
      )}

      <div className={`flex-1 min-h-0 pr-4 ${customScrollbarClass}`}>
        <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
          {!keysLoaded &&
            !loadError &&
            Array.from(Array(8)).map((_, index) => (
              <div key={index} className={`${PHONE_KEY_CARD_CLASSES} p-4`}>
                <div className={`${PHONE_KEY_SKELETON_CLASSES} h-8 w-1/2`}></div>
              </div>
            ))}

          {keysLoaded &&
            keys.map((key) => (
              <div
                key={key.globalIndex}
                className={`${PHONE_KEY_CARD_CLASSES} flex items-center justify-between gap-4 p-4`}
              >
                <div className='flex flex-col gap-1 min-w-0'>
                  <span className='text-xs font-medium leading-4 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                    {t('Devices.KEY', { number: key.number })}
                  </span>
                  {key.type ? (
                    <div className='flex items-center gap-3 min-w-0'>
                      <PhysicalPhoneKeyBadge type={key.type} />
                      {isPhoneKeyTypeWithValue(key.type) && (
                        <span className='truncate text-sm leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
                          {key.value ? `${key.value} - ${key.label}` : key.label}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className='text-sm leading-5 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      {t('Devices.Not configured')}
                    </span>
                  )}
                </div>
                <Button variant='ghost' onClick={() => editKey(key)}>
                  <FontAwesomeIcon icon={faPenToSquare} className='mr-3 h-4 w-4' />
                  <span>{t('Common.Edit')}</span>
                </Button>
              </div>
            ))}
        </div>
      </div>

      <ConfirmationModal
        show={showRemoveModal}
        focus={cancelRemoveRef}
        title={t('Devices.Remove module')}
        description={t('Devices.Remove expansion module modal message', {
          module: t('Devices.Expansion module', { number: moduleIndex + 1 }),
        })}
        confirmLabel={t('Common.Remove')}
        confirmVariant='primary'
        confirmDisabled={isRemoving}
        cancelDisabled={isRemoving}
        onConfirm={removeModule}
        onClose={() => setShowRemoveModal(false)}
      />
    </div>
  )
}

ExpansionModuleSection.displayName = 'ExpansionModuleSection'
