// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, MutableRefObject, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faArrowRotateLeft,
  faAngleDown,
  faAngleLeft,
  faAngleRight,
  faAngleUp,
  faCircleInfo,
  faCirclePlus,
  faCircleXmark,
  faFloppyDisk,
  faGripVertical,
  faMagnifyingGlass,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { useSelector } from 'react-redux'
import { isEmpty, isEqual } from 'lodash'
import { RootState } from '../../store'
import { Avatar, Button, EmptyState, InlineNotification, Modal, TextInput } from '../common'
import { CustomThemedTooltip } from '../common/CustomThemedTooltip'
import { KeyTypeSelect } from './KeyTypeSelect'
import { DeviceSectionOperatorSearch } from './DeviceSectionOperatorSearch'
import { getKeyTypeSearchText, PhysicalPhoneKeyBadge } from './PhysicalPhoneKeyBadge'
import { KeyPositionInput } from './KeyPositionInput'
import {
  getPhysicalDeviceButtonConfiguration,
  getPhoneModelData,
  openAddPhoneKeyDrawer,
  reloadPhysicalPhone,
  saveBtnsConfig,
  setPin,
} from '../../lib/devices'
import { customScrollbarClass, openToast } from '../../lib/utils'

export interface LineKeysSectionProps {
  deviceId: string
  phoneName: string
  pinValue: string
  pinEnabled: boolean
}

// uid keeps the identity of a key stable while positions change through moves and deletions
export interface PhoneKey {
  uid: number
  type: string
  value: string
  label: string
}

const KEYS_PER_PAGE = 10

const generateRandomPin = () =>
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('')

const TYPES_WITHOUT_VALUE = ['line', 'dnd', 'toggleQueue']

export const LineKeysSection: FC<LineKeysSectionProps> = ({
  deviceId,
  phoneName,
  pinValue,
  pinEnabled,
}) => {
  const operators: any = useSelector((state: RootState) => state.operators)

  const [macAddress, setMacAddress] = useState('')
  const [usableKeys, setUsableKeys] = useState(0)
  const [keys, setKeys] = useState<PhoneKey[]>([])
  const [originalKeys, setOriginalKeys] = useState<PhoneKey[]>([])
  const [keysLoaded, setKeysLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const nextUid = useRef(0)

  // the mac address is the key used by tancredi to read and write the phone configuration
  useEffect(() => {
    if (!isEmpty(operators?.extensions) && deviceId) {
      setMacAddress(operators?.extensions[deviceId]?.mac?.toUpperCase() || '')
    }
  }, [operators?.extensions, deviceId])

  useEffect(() => {
    if (!macAddress) {
      return
    }
    const loadConfiguration = async () => {
      try {
        setLoadError('')
        setKeysLoaded(false)
        const configuration = await getPhysicalDeviceButtonConfiguration(macAddress)
        if (isEmpty(configuration)) {
          setLoadError('Cannot retrieve configuration information')
          return
        }
        const modelData = await getPhoneModelData(configuration?.model)
        const keyCount = modelData?.variables?.cap_linekey_count ?? 0
        setUsableKeys(keyCount)

        const loadedKeys: PhoneKey[] = []
        for (let i = 1; i <= keyCount; i++) {
          loadedKeys.push({
            uid: i,
            type: configuration?.variables?.[`linekey_type_${i}`] ?? '',
            value: configuration?.variables?.[`linekey_value_${i}`] ?? '',
            label: configuration?.variables?.[`linekey_label_${i}`] ?? '',
          })
        }
        nextUid.current = keyCount + 1
        setKeys(loadedKeys)
        setOriginalKeys(loadedKeys)
        setKeysLoaded(true)
      } catch (error) {
        setLoadError('Cannot retrieve configuration information')
      }
    }
    loadConfiguration()
  }, [macAddress])

  // all the line key positions of the phone model are taken
  const areAllPositionsInUse = usableKeys > 0 && keys.length >= usableKeys

  const hasChanges = useMemo(
    () =>
      !isEqual(
        keys.map(({ type, value, label }) => ({ type, value, label })),
        originalKeys.map(({ type, value, label }) => ({ type, value, label })),
      ),
    [keys, originalKeys],
  )

  // search and pagination
  const [textFilter, setTextFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const textFilterRef = useRef() as MutableRefObject<HTMLInputElement>

  const clearTextFilter = () => {
    setTextFilter('')
    textFilterRef.current?.focus()
  }

  // positions are shown to the user, so they are computed on the full list before filtering
  const keysWithPosition = useMemo(
    () => keys.map((key, index) => ({ ...key, position: index + 1 })),
    [keys],
  )

  const filteredKeys = useMemo(() => {
    const filterText = textFilter.toLowerCase()
    if (!filterText) {
      return keysWithPosition
    }
    // name, number and key type are all searchable
    return keysWithPosition.filter((key) =>
      `${key.position} - ${key.label} (${key.value}) ${getKeyTypeSearchText(key.type)}`
        .toLowerCase()
        .includes(filterText),
    )
  }, [keysWithPosition, textFilter])

  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / KEYS_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pageKeys = useMemo(() => {
    const lastIndex = currentPage * KEYS_PER_PAGE
    return filteredKeys.slice(lastIndex - KEYS_PER_PAGE, lastIndex)
  }, [filteredKeys, currentPage])

  // inline editing: every change is applied to the list right away and persisted with Save
  const [expandedUid, setExpandedUid] = useState<number | null>(null)

  const toggleKeyRow = (uid: number) => {
    setExpandedUid(expandedUid === uid ? null : uid)
  }

  const defaultLabelForType = (type: string) => {
    switch (type) {
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

  const updateKey = (uid: number, changes: Partial<PhoneKey>) => {
    setKeys((previousKeys) =>
      previousKeys.map((key) => (key.uid === uid ? { ...key, ...changes } : key)),
    )
  }

  const changeKeyType = (uid: number, type: string) => {
    // types without a target reset value and label, the others keep the current selection
    if (TYPES_WITHOUT_VALUE.includes(type)) {
      updateKey(uid, { type, value: '', label: defaultLabelForType(type) })
    } else {
      updateKey(uid, { type })
    }
  }

  const changeKeyPosition = (uid: number, newPosition: number) => {
    if (newPosition < 1 || newPosition > keys.length) {
      return
    }
    const fromIndex = keys.findIndex((key) => key.uid === uid)
    if (fromIndex === -1 || fromIndex === newPosition - 1) {
      return
    }
    const updatedKeys = [...keys]
    const [moved] = updatedKeys.splice(fromIndex, 1)
    updatedKeys.splice(newPosition - 1, 0, moved)
    setKeys(updatedKeys)
    setCurrentPage(Math.ceil(newPosition / KEYS_PER_PAGE))
  }

  const deleteKey = (uid: number) => {
    setKeys((previousKeys) => previousKeys.filter((key) => key.uid !== uid))
    setExpandedUid(null)
  }

  // the new key is configured in a side drawer and inserted at the chosen position
  const addKey = () => {
    if (keys.length >= usableKeys) {
      return
    }
    openAddPhoneKeyDrawer({
      defaultPosition: keys.length + 1,
      maxPosition: Math.min(keys.length + 1, usableKeys),
      onAdd: ({ position, type, value, label }) => {
        const newKey: PhoneKey = { uid: nextUid.current++, type, value, label }
        setKeys((previousKeys) => {
          const updatedKeys = [...previousKeys]
          const targetIndex = Math.min(Math.max(position - 1, 0), updatedKeys.length)
          updatedKeys.splice(targetIndex, 0, newKey)
          return updatedKeys.slice(0, usableKeys)
        })
        setCurrentPage(Math.ceil(position / KEYS_PER_PAGE))
        setExpandedUid(null)
      },
    })
  }

  const discardChanges = () => {
    setKeys(originalKeys)
    setExpandedUid(null)
    setTextFilter('')
  }

  // drag and drop reordering
  const [draggedUid, setDraggedUid] = useState<number | null>(null)
  const [dragOverUid, setDragOverUid] = useState<number | null>(null)

  const handleDrop = (event: DragEvent<HTMLLIElement>, targetPosition: number) => {
    event.preventDefault()
    const droppedUid = Number(event.dataTransfer.getData('text/plain'))
    setDraggedUid(null)
    setDragOverUid(null)
    changeKeyPosition(droppedUid, targetPosition)
  }

  // assign a BLF key to every operator
  const [showAssignBlfModal, setShowAssignBlfModal] = useState(false)
  const cancelAssignBlfRef = useRef() as MutableRefObject<HTMLButtonElement>

  const assignBlfToAllOperators = () => {
    const blfKeys: PhoneKey[] = []
    Object.keys(operators?.extensions || {}).forEach((exten, index) => {
      if (index < usableKeys) {
        blfKeys.push({
          uid: nextUid.current++,
          type: 'blf',
          label: operators?.extensions[exten]?.name || '',
          value: exten,
        })
      }
    })
    const updatedKeys = [...keys]
    updatedKeys.splice(0, blfKeys.length, ...blfKeys)
    setKeys(updatedKeys)
    setShowAssignBlfModal(false)
    setExpandedUid(null)
  }

  const assignBlfExampleRows = () =>
    Object.keys(operators?.extensions || {})
      .slice(0, 2)
      .map((key, index) => {
        const exampleOperator = operators?.extensions[key]
        return (
          <div
            key={key}
            className='grid grid-cols-[8rem,2rem,3rem] whitespace-nowrap w-full items-center py-2'
          >
            <div className='flex space-x-2 items-center truncate'>
              <Avatar
                size='base'
                placeholderType='person'
                src={operators?.avatars[exampleOperator?.username]}
                status={operators?.operators[exampleOperator?.username]?.mainPresence}
              />
              <div className='max-w-sm truncate'>
                <span>{`${exampleOperator?.name}`}</span>
              </div>
            </div>
            <div className='mx-2'>
              <FontAwesomeIcon icon={faArrowRight} className='h-4 w-4' />
            </div>
            <div className='flex items-center ml-2'>
              <FontAwesomeIcon
                icon={faGripVertical}
                className='h-4 w-4 text-gray-700 dark:text-gray-400 mr-2'
              />
              <span className='ml-2 mr-2'>{index + 1} -</span>
              <div>
                <span>{`${exampleOperator?.name}`}</span>
              </div>
              <span className='ml-1'>({`${exampleOperator?.exten || '-'}`})</span>
            </div>
          </div>
        )
      })

  const [isSaving, setIsSaving] = useState(false)

  const saveKeys = async () => {
    const configuration: any = { variables: {} }
    // every position of the phone is written, so removed keys are cleared on the device too
    for (let i = 1; i <= usableKeys; i++) {
      const key = keys[i - 1]
      configuration.variables[`linekey_type_${i}`] = key?.type || ''
      configuration.variables[`linekey_value_${i}`] = key?.value || ''
      configuration.variables[`linekey_label_${i}`] = key?.label || ''
    }

    try {
      setIsSaving(true)
      setSaveError('')
      // the pin is patched together with the keys, as tancredi rewrites the whole configuration
      if (pinEnabled) {
        await setPin({
          extension: deviceId,
          enabled: pinValue !== '',
          pin: pinValue !== '' ? pinValue : generateRandomPin(),
        })
      }
      await saveBtnsConfig(macAddress, configuration)
      if (deviceId) {
        await reloadPhysicalPhone(deviceId)
      }
      setOriginalKeys(keys)
      setExpandedUid(null)
      openToast(
        'success',
        `${t('Devices.Phone configuration saved description', { name: phoneName })}`,
        `${t('Devices.Configuration saved')}`,
      )
    } catch (error) {
      setSaveError('Cannot save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='flex flex-col gap-8 flex-1 min-h-0'>
      {/* search and actions */}
      <div className='flex items-start justify-between gap-4'>
        <div className='w-80'>
          <TextInput
            placeholder={t('Devices.Search') || ''}
            value={textFilter}
            onChange={(event) => setTextFilter(event.target.value)}
            ref={textFilterRef}
            icon={textFilter?.length ? faCircleXmark : faMagnifyingGlass}
            onIconClick={textFilter?.length ? () => clearTextFilter() : undefined}
            trailingIcon={textFilter?.length ? true : false}
          />
        </div>
        <div className='flex items-center gap-6'>
          {/* the tooltip is on the wrapper because disabled buttons do not fire mouse events */}
          <span
            data-tooltip-id='tooltip-add-key-unavailable'
            data-tooltip-content={
              areAllPositionsInUse ? t('Devices.Add key unavailable tooltip') : ''
            }
          >
            <Button variant='ghost' onClick={addKey} disabled={!keysLoaded || areAllPositionsInUse}>
              <FontAwesomeIcon icon={faCirclePlus} className='mr-3 h-4 w-4' />
              <span>{t('Devices.Add key')}</span>
            </Button>
          </span>
          {/* the tooltip disappears as soon as a position becomes available */}
          {areAllPositionsInUse && (
            <CustomThemedTooltip
              id='tooltip-add-key-unavailable'
              place='top'
              className='whitespace-normal text-left'
              positionStrategy='fixed'
            />
          )}
          <Button
            variant='white'
            onClick={() => setShowAssignBlfModal(true)}
            disabled={!keysLoaded || isEmpty(operators?.extensions)}
          >
            <span>{t('Devices.Assign BLF to all operators')}</span>
          </Button>
        </div>
      </div>

      {hasChanges && (
        <InlineNotification type='info' title={t('Devices.Unsaved changes')}>
          <p>{t('Devices.Unsaved changes description')}</p>
        </InlineNotification>
      )}

      {(loadError || saveError) && (
        <InlineNotification type='error' title={t('Common.Error')}>
          <p>{t('Devices.Cannot retrieve configuration information')}</p>
        </InlineNotification>
      )}

      {/* keys list */}
      <div className={`flex-1 min-h-0 pr-4 ${customScrollbarClass}`}>
        <ul className='flex flex-col gap-3'>
          {/* skeleton */}
          {!keysLoaded &&
            !loadError &&
            Array.from(Array(6)).map((_, index) => (
              <li
                key={index}
                className='rounded-lg border-b border-layoutDivider dark:border-layoutDividerDark bg-elevationL2Invert dark:bg-elevationL2InvertDark p-4 shadow-sm'
              >
                <div className='animate-pulse h-6 w-1/3 rounded bg-gray-300 dark:bg-gray-700'></div>
              </li>
            ))}

          {keysLoaded && pageKeys.length === 0 && (
            <li className='flex justify-center p-2'>
              <EmptyState
                title={t('Devices.No results') || ''}
                description={t('Devices.Try changing your search query') || ''}
                icon={
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className='mx-auto h-14 w-14'
                    aria-hidden='true'
                  />
                }
              />
            </li>
          )}

          {pageKeys.map((key) => (
            <li
              key={key.uid}
              draggable
              onDragStart={(event: DragEvent<HTMLLIElement>) => {
                event.dataTransfer.setData('text/plain', String(key.uid))
                setDraggedUid(key.uid)
              }}
              onDragOver={(event: DragEvent<HTMLLIElement>) => {
                event.preventDefault()
                setDragOverUid(key.uid)
              }}
              onDragLeave={() => setDragOverUid(null)}
              onDrop={(event: DragEvent<HTMLLIElement>) => handleDrop(event, key.position)}
              className={`rounded-lg border-b border-layoutDivider dark:border-layoutDividerDark bg-elevationL2Invert dark:bg-elevationL2InvertDark shadow-sm ${
                dragOverUid === key.uid ? 'ring-2 ring-primary dark:ring-primaryDark' : ''
              } ${draggedUid === key.uid ? 'opacity-50' : ''}`}
            >
              {/* row header */}
              <div className='flex items-center justify-between p-4'>
                <div className='flex items-center gap-6 min-w-0'>
                  <FontAwesomeIcon
                    icon={faGripVertical}
                    className='h-4 w-4 shrink-0 cursor-grab text-secondaryNeutral dark:text-secondaryNeutralDark'
                  />
                  <span className='w-[30px] shrink-0 text-base font-medium text-secondaryNeutral dark:text-secondaryNeutralDark'>
                    {key.position}-
                  </span>
                  {key.type ? (
                    <div className='flex items-center gap-3 min-w-0'>
                      <PhysicalPhoneKeyBadge type={key.type} />
                      {!TYPES_WITHOUT_VALUE.includes(key.type) && (
                        <span className='truncate text-base font-medium text-secondaryNeutral dark:text-secondaryNeutralDark'>
                          {key.value ? `${key.value} - ${key.label}` : key.label}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className='text-base font-medium text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
                      {t('Devices.Not configured')}
                    </span>
                  )}
                </div>
                <Button variant='ghost' size='small' onClick={() => toggleKeyRow(key.uid)}>
                  <FontAwesomeIcon
                    icon={expandedUid === key.uid ? faAngleUp : faAngleDown}
                    className='h-4 w-4'
                  />
                </Button>
              </div>

              {/* expanded row: inline key configuration */}
              {expandedUid === key.uid && (
                <div className='flex flex-col gap-4 px-4 pb-4'>
                  <div>
                    <div className='flex items-center'>
                      <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
                        {t('Devices.Key position')}
                      </span>
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className='h-4 w-4 pl-2 text-primaryIndigo dark:text-primaryIndigoDark'
                        aria-hidden='true'
                        data-tooltip-id={`tooltip-key-position-${key.uid}`}
                        data-tooltip-content={t('Devices.Key position information tooltip') || ''}
                      />
                      <CustomThemedTooltip
                        id={`tooltip-key-position-${key.uid}`}
                        place='right'
                        className='whitespace-normal text-left'
                      />
                    </div>
                    <KeyPositionInput
                      value={key.position}
                      max={keys.length}
                      onChange={(newPosition) => changeKeyPosition(key.uid, newPosition)}
                      className='mt-2 w-56'
                    />
                  </div>

                  <KeyTypeSelect
                    defaultSelectedType={key.type}
                    updateSelectedTypeKey={(type: string) => changeKeyType(key.uid, type)}
                  />

                  {(key.type === 'blf' || key.type === 'speed_dial') && (
                    <div>
                      <div className='mb-2'>
                        <span className='text-sm font-medium leading-5 text-secondaryNeutral dark:text-secondaryNeutralDark'>
                          {key.type === 'blf'
                            ? t('Devices.Name or extension')
                            : t('Devices.Name or number')}
                        </span>
                      </div>
                      <DeviceSectionOperatorSearch
                        typeSelected={key.type}
                        updateSelectedUserNumber={(value: string) =>
                          updateKey(key.uid, {
                            value,
                            label: operators?.extensions[value]?.name || key.label,
                          })
                        }
                        defaultValue={key.label}
                        updatePhonebookContactInformation={() => {}}
                        updateSelectedUserName={(name: string) =>
                          name ? updateKey(key.uid, { label: name }) : undefined
                        }
                      />
                    </div>
                  )}

                  <div>
                    <Button variant='ghost' onClick={() => deleteKey(key.uid)}>
                      <FontAwesomeIcon icon={faTrash} className='mr-3 h-4 w-4' />
                      <span>{t('Devices.Delete key')}</span>
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* save, discard and pagination */}
      <div className='flex items-center justify-between gap-4 border-t border-layoutDivider dark:border-layoutDividerDark px-4 py-6'>
        <div className='flex items-center gap-6'>
          <Button variant='ghost' onClick={discardChanges} disabled={!hasChanges || isSaving}>
            <FontAwesomeIcon icon={faArrowRotateLeft} className='mr-3 h-4 w-4' />
            <span>{t('Devices.Discard changes')}</span>
          </Button>
          <Button variant='primary' onClick={saveKeys} disabled={!hasChanges || isSaving}>
            <FontAwesomeIcon icon={faFloppyDisk} className='mr-3 h-4 w-4' />
            <span>{t('Common.Save')}</span>
          </Button>
        </div>
        <div className='flex items-center gap-4'>
          <span className='text-sm leading-5 text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
            {t('Devices.Page of', { current: currentPage, total: totalPages })}
          </span>
          <Button
            variant='white'
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <FontAwesomeIcon icon={faAngleLeft} className='mr-3 h-4 w-4' />
            <span>{t('Devices.Previous page')}</span>
          </Button>
          <Button
            variant='white'
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <span>{t('Devices.Next page')}</span>
            <FontAwesomeIcon icon={faAngleRight} className='ml-3 h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* assign BLF to all operators modal */}
      <Modal
        show={showAssignBlfModal}
        focus={cancelAssignBlfRef}
        onClose={() => setShowAssignBlfModal(false)}
      >
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:mx-0 bg-blue-100 dark:bg-blue-900'>
            <FontAwesomeIcon
              icon={faCircleInfo}
              className='h-5 w-5 text-blue-700 dark:text-blue-200'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
              {t('Devices.Assign keys for all operators')}
            </h3>
            <div className='mt-3 mb-4'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('Devices.Assign key for all operators modal message')}.
              </p>
            </div>
            <span className='font-normal text-sm leading-5 text-gray-700 dark:text-gray-200'>
              {t('Common.Example')}
            </span>
            <div className='mt-2'>{assignBlfExampleRows()}</div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='primary' onClick={assignBlfToAllOperators}>
            {t('Devices.Assign keys')}
          </Button>
          <Button
            variant='ghost'
            onClick={() => setShowAssignBlfModal(false)}
            ref={cancelAssignBlfRef}
          >
            <span>{t('Common.Cancel')}</span>
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  )
}

LineKeysSection.displayName = 'LineKeysSection'
