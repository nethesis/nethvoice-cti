// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { SpeedDialType } from '../../../services/types'
import { useState, useEffect, useRef, MutableRefObject } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faPlus,
  faTriangleExclamation,
  faEllipsisVertical,
  faPen,
  faBolt,
  faTrashCan,
  faFileImport,
  faFileArrowDown,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import { Button, Avatar, Modal, Dropdown, InlineNotification, EmptyState } from '../../common'
import {
  deleteSpeedDial,
  deleteAllSpeedDials,
  getSpeedDials,
  importCsvSpeedDial,
} from '../../../services/phonebook'
import {
  sortSpeedDials,
  openCreateSpeedDialDrawer,
  openEditSpeedDialDrawer,
  exportSpeedDial,
} from '../../../lib/speedDial'
import { t } from 'i18next'
import { callPhoneNumber, transferCallToExtension } from '../../../lib/utils'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

export const SpeedDialContent = () => {
  // The state for the delete modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  // The state for delete all speed dial modal
  const [showDeleteAllSpeedDialModal, setShowDeleteAllSpeedDialModal] = useState<boolean>(false)
  // The state for the speed dials list
  const [speedDials, setSpeedDials] = useState<SpeedDialType[]>([])
  // The state for current item selected for editing or deletion
  const [currentItem, setCurrentItem] = useState<SpeedDialType | null>(null)
  // The reference for the cancel button of the delete speed dial modal
  const cancelDeleteButtonRef = useRef() as MutableRefObject<HTMLButtonElement>
  // The state for the name to be deleted
  const [deletingName, setDeletingName] = useState<string | undefined>('')
  const [csvBase64, setCsvBase64] = useState('')
  const [showImportCsvModal, setShowImportCsvModal] = useState<boolean>(false)
  const [importCsvError, setImportCsvError] = useState('')

  const [isSpeedDialLoaded, setSpeedDialLoaded] = useState(false)
  const [deleteSpeedDialError, setDeleteSpeedDialError] = useState('')
  const [deleteAllSpeedDialError, setDeleteAllSpeedDialError] = useState('')
  const [getSpeedDialError, setGetSpeedDialError] = useState('')

  const { profile } = useSelector((state: RootState) => state.user)
  const operators: any = useSelector((state: RootState) => state.operators)

  const authStore = useSelector((state: RootState) => state.authentication)

  const [firstRender, setFirstRender] = useState(true)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    // Initialize the speed dial list the first time
    // and every time a reload is required
    const initSpeedDials = async () => {
      if (!isSpeedDialLoaded && profile?.macro_permissions?.phonebook?.value) {
        try {
          setGetSpeedDialError('')
          const speedDials: SpeedDialType[] | undefined = await getSpeedDials()
          // Sort the speed dials and update the list
          setSpeedDials(sortSpeedDials(speedDials))
          setSpeedDialLoaded(true)
        } catch (error) {
          setGetSpeedDialError('Cannot retrieve speed dial')
        }
      }
    }
    initSpeedDials()
  }, [firstRender, isSpeedDialLoaded, profile?.macro_permissions?.phonebook?.value])

  const speedDialStore = useSelector((state: RootState) => state.speedDial)

  useEffect(() => {
    // reload speed dial
    setSpeedDialLoaded(false)
  }, [speedDialStore])

  // Handle the delete action on item
  const confirmDeleteItem = (speedDial: any) => {
    setCurrentItem(speedDial)
    setDeletingName(speedDial.name)
    setDeleteSpeedDialError('')
    setShowDeleteModal(true)
  }

  // Handle the delete action on item
  const confirmDeleteAllItems = () => {
    setDeleteAllSpeedDialError('')
    setShowDeleteAllSpeedDialModal(true)
  }

  // Execute the service method to delete all items
  const handleDeleteAllItems = async () => {
    try {
      const deleted = await deleteAllSpeedDials()
    } catch (error) {
      setDeleteSpeedDialError(t('SpeedDial.Cannot delete speed dial') || '')
      return
    }
    setSpeedDialLoaded(false)
    setShowDeleteAllSpeedDialModal(false)
  }

  // Execute the service method to delete an item
  const handleDeleteItem = async () => {
    if (currentItem?.id) {
      // Use the id to perform actions
      try {
        const deleted = await deleteSpeedDial({
          id: currentItem.id.toString(),
        })
      } catch (error) {
        setDeleteSpeedDialError(t('SpeedDial.Cannot delete speed dial') || '')
        return
      }
      setSpeedDialLoaded(false)
      setShowDeleteModal(false)
      setCurrentItem(null)
    }
  }

  // Execute the service method to import speed dial
  const handleImportCsv = async () => {
    if (csvBase64) {
      try {
        const imported = await importCsvSpeedDial({
          file64: csvBase64.toString(),
        })
      } catch (error) {
        setImportCsvError(t('SpeedDial.Cannot import speed dial') || '')
        return
      }
      setSpeedDialLoaded(false)
      setShowImportCsvModal(false)
    }
  }

  const callSpeedDial = (speedDial: any) => {
    if (
      operators?.operators[authStore?.username]?.mainPresence &&
      operators?.operators[authStore?.username]?.mainPresence === 'busy'
    ) {
      transferCallToExtension(speedDial?.speeddial_num)
    } else if (
      operators?.operators[authStore?.username]?.endpoints?.mainextension[0]?.id !==
      speedDial?.speeddial_num
    ) {
      callPhoneNumber(speedDial?.speeddial_num)
    }
  }

  function importSpeedDial(selectedFile: any) {
    if (selectedFile?.target?.files && selectedFile.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (ev: any) => {
        setCsvBase64(ev.target?.result as string)
        if (selectedFile.target) {
          selectedFile.target.value = ''
        }
      }
      reader.readAsDataURL(selectedFile.target.files[0])
      // open modal to confirm the upload
      setShowImportCsvModal(true)
      setImportCsvError('')
    } else {
      setImportCsvError(t('SpeedDial.Upload failed') || '')
    }
  }

  // The dropdown items for every speed dial element
  const getItemsMenu = (speedDial: any) => (
    <>
      <Dropdown.Item icon={faPen} onClick={() => openEditSpeedDialDrawer(speedDial)}>
        {t('Common.Edit')}
      </Dropdown.Item>
      <Dropdown.Item icon={faTrashCan} onClick={() => confirmDeleteItem(speedDial)}>
        {t('Common.Delete')}
      </Dropdown.Item>
    </>
  )

  // The dropdown items for import or export speed dial element
  const getSpeedDialMenuTemplate = () => (
    <>
      <Dropdown.Item
        icon={faFileImport}
        onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.csv'
          input.onchange = (e) => {
            importSpeedDial(e)
          }
          input.click()
        }}
      >
        {t('SpeedDial.Import CSV')}
      </Dropdown.Item>
      {/* if the list of speed dial is not empty */}
      {speedDials.length > 0 && (
        <>
          <Dropdown.Item icon={faFileArrowDown} onClick={() => exportSpeedDial(speedDials)}>
            {t('SpeedDial.Export CSV')}
          </Dropdown.Item>
          <div className='relative pb-2'>
            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
              <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
            </div>
          </div>
          <Dropdown.Item icon={faTrashCan} onClick={() => confirmDeleteAllItems()}>
            {t('SpeedDial.Delete all')}
          </Dropdown.Item>
        </>
      )}
    </>
  )

  return (
    <>
      <div className='flex h-full flex-col bg-white dark:bg-gray-900'>
        <div className='py-6 px-5'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
              {t('SpeedDial.Speed dial')}
            </h2>
            <div className='flex gap-2 items-center'>
              {' '}
              {isSpeedDialLoaded && !!speedDials.length && (
                <div className='ml-3 h-7 flex items-center'>
                  <Button variant='white' onClick={() => openCreateSpeedDialDrawer()}>
                    <FontAwesomeIcon icon={faPlus} className='xl:mr-2 h-4 w-4' />
                    <span className='hidden xl:inline-block'>{t('SpeedDial.Create')}</span>
                    <span className='sr-only'>{t('SpeedDial.Create speed dial')}</span>
                  </Button>
                </div>
              )}
              <Dropdown items={getSpeedDialMenuTemplate()} position='left'>
                <Button variant='ghost'>
                  <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                  <span className='sr-only'>{t('SpeedDial.Open speed dial menu')}</span>
                </Button>
              </Dropdown>
            </div>
          </div>
        </div>
        <span className='border-b border-gray-200 dark:border-gray-700'></span>
        <ul
          role='list'
          className='flex-1 divide-y overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 divide-gray-200 dark:divide-gray-700'
        >
          {/* get speed dial error */}
          {getSpeedDialError && (
            <InlineNotification type='error' title={getSpeedDialError} className='my-6' />
          )}
          {/* skeleton */}
          {!isSpeedDialLoaded &&
            !getSpeedDialError &&
            Array.from(Array(4)).map((e, index) => (
              <li key={index}>
                <div className='flex items-center px-4 py-4 sm:px-6'>
                  {/* avatar skeleton */}
                  <div className='animate-pulse rounded-full h-12 w-12 bg-gray-300 dark:bg-gray-600'></div>
                  <div className='min-w-0 flex-1 px-4'>
                    <div className='flex flex-col justify-center'>
                      {/* line skeleton */}
                      <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          {/* empty state */}
          {isSpeedDialLoaded && !getSpeedDialError && !speedDials.length && (
            <EmptyState
              title={t('SpeedDial.No speed dials')}
              icon={
                <FontAwesomeIcon icon={faBolt} className='mx-auto h-12 w-12' aria-hidden='true' />
              }
            >
              <Button variant='white' onClick={() => openCreateSpeedDialDrawer()}>
                <FontAwesomeIcon icon={faPlus} className='mr-2 h-4 w-4' />
                <span>{t('SpeedDial.Create')}</span>
              </Button>
            </EmptyState>
          )}
          {/* Iterate through speed dial list */}
          {isSpeedDialLoaded &&
            speedDials.map((speedDial: any, key: any) => (
              <li key={key}>
                <div className='group relative flex items-center py-2 px-5'>
                  <div
                    className='absolute inset-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                    aria-hidden='true'
                  />
                  <div className='relative flex min-w-0 flex-1 items-center justify-between'>
                    <div className='flex items-center'>
                      <span className='text-gray-300 dark:text-gray-600'>
                        <Avatar
                          size='base'
                          src={
                            operators?.avatars[
                              operators?.extensions[speedDial?.speeddial_num]?.username
                            ]
                          }
                          status={
                            operators?.operators[
                              operators?.extensions[speedDial?.speeddial_num]?.username
                            ]?.mainPresence
                          }
                          placeholderType='operator'
                        />
                      </span>
                      <div className='ml-4 truncate'>
                        <p className='truncate text-sm font-medium text-gray-700 dark:text-gray-200'>
                          {speedDial?.name || speedDial?.company || '-'}
                        </p>
                        <div className='truncate text-sm mt-1 text-primary dark:text-primaryDark'>
                          <div className='flex items-center'>
                            <FontAwesomeIcon
                              icon={faPhone}
                              className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                              aria-hidden='true'
                            />
                            <span
                              className='cursor-pointer hover:underline'
                              onClick={() => callSpeedDial(speedDial)}
                            >
                              {speedDial.speeddial_num}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      {/* Actions */}
                      <Dropdown items={getItemsMenu(speedDial)} position='left'>
                        <Button variant='ghost'>
                          <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                          <span className='sr-only'>{t('SpeedDial.Open speed dial menu')}</span>
                        </Button>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
      {/* Delete speed dial modal */}
      <Modal
        show={showDeleteModal}
        focus={cancelDeleteButtonRef}
        onClose={() => setShowDeleteModal(false)}
        afterLeave={() => setDeletingName('')}
      >
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 bg-red-100 dark:bg-red-900'>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className='h-6 w-6 text-red-600 dark:text-red-200'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
              {t('SpeedDial.Delete speed dial')}
            </h3>
            <div className='mt-3'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('SpeedDial.Speed dial delete message', { deletingName })}
              </p>
            </div>
            {/* delete speed dial error */}
            {deleteSpeedDialError && (
              <InlineNotification type='error' title={deleteSpeedDialError} className='mt-4' />
            )}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={() => handleDeleteItem()}>
            {t('Common.Delete')}
          </Button>
          <Button
            variant='white'
            onClick={() => setShowDeleteModal(false)}
            ref={cancelDeleteButtonRef}
          >
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
      {/* Delete all speed dials modal */}
      <Modal
        show={showDeleteAllSpeedDialModal}
        focus={cancelDeleteButtonRef}
        onClose={() => setShowDeleteAllSpeedDialModal(false)}
      >
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 bg-red-100 dark:bg-red-900'>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className='h-6 w-6 text-red-600 dark:text-red-200'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
              {t('SpeedDial.Delete all speed dials')}
            </h3>
            <div className='mt-3'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('SpeedDial.Are you sure?')}
              </p>
            </div>
            {/* delete all speed dials error */}
            {deleteAllSpeedDialError && (
              <InlineNotification type='error' title={deleteAllSpeedDialError} className='mt-4' />
            )}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={() => handleDeleteAllItems()}>
            {t('Common.Delete')}
          </Button>
          <Button
            variant='white'
            onClick={() => setShowDeleteAllSpeedDialModal(false)}
            ref={cancelDeleteButtonRef}
          >
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
      {/* Upload speed dial from Csv*/}
      <Modal
        show={showImportCsvModal}
        focus={cancelDeleteButtonRef}
        onClose={() => setShowImportCsvModal(false)}
      >
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 bg-green-100 dark:bg-green-900'>
            <FontAwesomeIcon
              icon={faCheckCircle}
              className='h-6 w-6 text-green-600 dark:text-green-200'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
              {t('SpeedDial.Speed dial import')}
            </h3>
            <div className='mt-3'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t('SpeedDial.Start importing Speed Dial from csv file?')}
              </p>
            </div>
            {/* import csv error */}
            {importCsvError !== '' && (
              <InlineNotification type='error' title={importCsvError} className='mt-4' />
            )}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='primary' onClick={() => handleImportCsv()}>
            {t('SpeedDial.Import CSV')}
          </Button>
          <Button
            variant='white'
            onClick={() => setShowImportCsvModal(false)}
            ref={cancelDeleteButtonRef}
          >
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}
