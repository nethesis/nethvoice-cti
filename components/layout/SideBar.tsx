// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * The SideBar component
 *
 * @return The fixed right bar with speed dials as the default
 */

import type { SpeedDialType } from '../../services/types'
import { useState, useEffect, useRef, MutableRefObject } from 'react'
import { Button, Avatar, Modal, Dropdown, InlineNotification, EmptyState } from '../common/'
import { deleteSpeedDial, getSpeedDials } from '../../services/phonebook'
import {
  sortSpeedDials,
  openCreateSpeedDialDrawer,
  openEditSpeedDialDrawer,
} from '../../lib/speedDial'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhone,
  faPlus,
  faTriangleExclamation,
  faEllipsisVertical,
  faPen,
  faTrash,
  faBolt,
} from '@fortawesome/free-solid-svg-icons'

export const SideBar = () => {
  // The state for the delete modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  // The state for the speed dials list
  const [speedDials, setSpeedDials] = useState<SpeedDialType[]>([])
  // The state for current item selected for editing or deletion
  const [currentItem, setCurrentItem] = useState<SpeedDialType | null>(null)
  // The reference for the cancel button of the delete speed dial modal
  const cancelDeleteButtonRef = useRef() as MutableRefObject<HTMLButtonElement>
  // The state for the name to be deleted
  const [deletingName, setDeletingName] = useState<string | undefined>('')

  const [isSpeedDialLoaded, setSpeedDialLoaded] = useState(false)
  const [deleteSpeedDialError, setDeleteSpeedDialError] = useState('')
  const [getSpeedDialError, setGetSpeedDialError] = useState('')

  useEffect(() => {
    // Initialize the speed dial list the first time
    // and every time a reload is required
    const initSpeedDials = async () => {
      if (!isSpeedDialLoaded) {
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
  }, [isSpeedDialLoaded])

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

  // Execute the service method to delete an item
  const handleDeleteItem = async () => {
    if (currentItem?.id) {
      // Use the id to perform actions
      try {
        const deleted = await deleteSpeedDial({
          id: currentItem.id.toString(),
        })
      } catch (error) {
        setDeleteSpeedDialError('Cannot delete speed dial')
        return
      }
      setSpeedDialLoaded(false)
      setShowDeleteModal(false)
      setCurrentItem(null)
    }
  }

  // The dropdown items for every speed dial element
  const getItemsMenu = (speedDial: any) => (
    <>
      <Dropdown.Item icon={faPen} onClick={() => openEditSpeedDialDrawer(speedDial)}>
        Edit
      </Dropdown.Item>
      <Dropdown.Item icon={faTrash} onClick={() => confirmDeleteItem(speedDial)}>
        Delete
      </Dropdown.Item>
    </>
  )

  return (
    <>
      {/* Secondary column (hidden on smaller screens) */}
      <aside className='hidden w-96 border-l lg:block h-full border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
        <div className='flex h-full flex-col bg-white dark:bg-gray-900'>
          <div className='py-6 px-5'>
            <div className='flex items-start justify-between'>
              <h2 className='text-lg font-medium text-gray-900 dark:text-gray-100'>Speed Dial</h2>
              <div className='ml-3 flex h-7 items-center gap-2'>
                {isSpeedDialLoaded && !!speedDials.length && (
                  <Button variant='primary' onClick={() => openCreateSpeedDialDrawer()}>
                    <FontAwesomeIcon icon={faPlus} className='mr-2 h-4 w-4' />
                    Create
                    <span className='sr-only'>Create speed dial</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          <span className='border-b border-gray-200 dark:border-gray-700'></span>
          <ul
            role='list'
            className='flex-1 divide-y overflow-y-auto divide-gray-200 dark:divide-gray-700'
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
                title='No speed dial'
                icon={
                  <FontAwesomeIcon icon={faBolt} className='mx-auto h-12 w-12' aria-hidden='true' />
                }
              >
                <Button variant='primary' onClick={() => openCreateSpeedDialDrawer()}>
                  <FontAwesomeIcon icon={faPlus} className='mr-2 h-4 w-4' />
                  <span>Create</span>
                </Button>
              </EmptyState>
            )}
            {/* Iterate through speed dial list */}
            {isSpeedDialLoaded &&
              speedDials.map((speedDial, key) => (
                <li key={key}>
                  <div className='group relative flex items-center py-6 px-5'>
                    <div
                      className='absolute inset-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-800'
                      aria-hidden='true'
                    />
                    <div className='relative flex min-w-0 flex-1 items-center justify-between'>
                      <div className='flex items-center'>
                        <span className='text-gray-300 dark:text-gray-600'>
                          <Avatar size='base' placeholderType='person' />
                        </span>
                        <div className='ml-4 truncate'>
                          <p className='truncate text-sm font-medium text-gray-900 dark:text-gray-100'>
                            {speedDial.name}
                          </p>
                          <div className='truncate text-sm cursor-pointer mt-1 text-primary dark:text-primary'>
                            <div className='flex items-center'>
                              <FontAwesomeIcon
                                icon={faPhone}
                                className='mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                aria-hidden='true'
                              />
                              <span className='hover:underline'>{speedDial.speeddial_num}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        {/* Actions */}
                        <Dropdown items={getItemsMenu(speedDial)} position='left'>
                          <Button variant='white'>
                            <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                            <span className='sr-only'>Open speed dial menu</span>
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
                Delete speed dial
              </h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Speed dial <strong>{deletingName || ''}</strong> will be deleted.
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
              Delete
            </Button>
            <Button
              variant='white'
              onClick={() => setShowDeleteModal(false)}
              ref={cancelDeleteButtonRef}
            >
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </aside>
    </>
  )
}
