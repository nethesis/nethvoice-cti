// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * The SideBar component
 *
 * @return The fixed right bar with speed dials as the default
 */

import type { SpeedDialType } from '../../services/types'
import { useState, useEffect, useRef, MutableRefObject } from 'react'
import {
  MdOutlineAdd,
  MdPhone,
  MdMoreVert,
  MdOutlineEdit,
  MdDeleteOutline,
  MdWarningAmber,
} from 'react-icons/md'
import { Button, Avatar, Modal, Dropdown } from '../common/'
import { deleteSpeedDial, getSpeedDials } from '../../services/phonebook'
import { sortSpeedDials } from '../../lib/layout'
import { CreateModal } from './speed_dial'

export const SideBar = () => {
  // The state for the new modal
  const [showNewModal, setShowNewModal] = useState<boolean>(false)
  // The state for the delete modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  // The state for reloading the speed dial list
  const [reloadSpeedDials, setReloadSpeedDials] = useState<boolean>(false)
  // The state for the speed dials list
  const [speedDials, setSpeedDials] = useState<SpeedDialType[]>([])
  // The state for current item selected for editing or deletion
  const [currentItem, setCurrentItem] = useState<SpeedDialType | null>(null)
  // The reference for the cancel button of the delete speed dial modal
  const cancelDeleteButtonRef = useRef() as MutableRefObject<HTMLButtonElement>
  // The state for editing property
  const [editing, setEditing] = useState<boolean>(false)
  // The state for the name to be deleted
  const [deletingName, setDeletingName] = useState<string | undefined>('')

  useEffect(() => {
    // Initialize the speed dial list the first time
    // and every time a reload is required
    const initSpeedDials = async () => {
      const speedDials: SpeedDialType[] | undefined = await getSpeedDials()
      // Sort the speed dials and update the list
      setSpeedDials(sortSpeedDials(speedDials))
    }
    initSpeedDials()
  }, [reloadSpeedDials])

  // Handle the delete action on item
  const confirmDeleteItem = (key: number) => {
    setCurrentItem(speedDials[key])
    setDeletingName(speedDials[key].name)
    setShowDeleteModal(true)
  }

  // Execute the service method to delete an item
  const handleDeleteItem = async () => {
    if (currentItem?.id) {
      // Use the id to perform actions
      const deleted = await deleteSpeedDial({
        id: currentItem.id.toString(),
      })
      if (deleted) {
        setReloadSpeedDials(!reloadSpeedDials)
        setShowDeleteModal(false)
        setCurrentItem(null)
      }
    }
  }

  // Handle the edit action of a speed dial
  const handleEditItem = (key: number) => {
    setCurrentItem(speedDials[key])
    setEditing(true)
    setShowNewModal(true)
  }

  // The dropdown items for every element of the list
  const getItemsMenu = (key: number) => (
    <>
      <Dropdown.Item icon={MdOutlineEdit} onClick={() => handleEditItem(key)}>
        Edit
      </Dropdown.Item>
      <Dropdown.Item icon={MdDeleteOutline} onClick={() => confirmDeleteItem(key)}>
        Delete
      </Dropdown.Item>
    </>
  )

  return (
    <>
      {/* Secondary column (hidden on smaller screens) */}
      <aside className='hidden w-96 border-l border-gray-200 bg-white lg:block h-full '>
        <div className='flex h-full flex-col bg-white'>
          <div className='py-6 px-5'>
            <div className='flex items-start justify-between'>
              <h2 className='text-lg font-medium text-gray-900'>Speed Dial</h2>
              <div className='ml-3 flex h-7 items-center gap-2'>
                <Button variant='white' onClick={() => setShowNewModal(true)}>
                  <MdOutlineAdd className='h-4 w-4' />
                  <span className='sr-only'>New speed dial</span>
                </Button>
              </div>
            </div>
          </div>
          <span className='border-b border-gray-200'></span>
          <ul role='list' className='flex-1 divide-y divide-gray-200 overflow-y-auto'>
            {/* Iterate through speed dial list */}
            {speedDials.map((person, key) => (
              <li key={key}>
                <div className='group relative flex items-center py-6 px-5'>
                  <div className='absolute inset-0 group-hover:bg-gray-50' aria-hidden='true' />
                  <div className='relative flex min-w-0 flex-1 items-center justify-between'>
                    <div className='flex'>
                      <span className='text-gray-300 '>
                        <Avatar size='base' placeholderType='company' />
                      </span>
                      <div className='ml-4 truncate'>
                        <p className='truncate text-sm font-medium text-gray-900'>{person.name}</p>
                        <p className='truncate text-sm text-gray-500'>{person.speeddial_num}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      {/* Actions */}
                      <Button variant='white'>
                        <MdPhone className='h-4 w-4' />
                        <span className='sr-only'>New speed dial</span>
                      </Button>
                      <Dropdown items={getItemsMenu(key)} position='left'>
                        <Button variant='white'>
                          <MdMoreVert className='h-4 w-4' />
                          <span className='sr-only'>New speed dial</span>
                        </Button>
                      </Dropdown>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* New speed dial modal */}
        <CreateModal
          show={showNewModal}
          reload={() => setReloadSpeedDials(!reloadSpeedDials)}
          onClose={() => setShowNewModal(false)}
          defaultName={currentItem?.name}
          defaultNumber={currentItem?.speeddial_num}
          isEditing={editing}
          hidden={() => setEditing(false)}
          current={currentItem || {}}
        />
        {/* Delete speed dial modal */}
        <Modal
          show={showDeleteModal}
          focus={cancelDeleteButtonRef}
          onClose={() => setShowDeleteModal(false)}
          afterLeave={() => setDeletingName('')}
        >
          <Modal.Content>
            <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0'>
              <MdWarningAmber className='h-6 w-6 text-red-600' aria-hidden='true' />
            </div>
            <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Delete speed dial contact
              </h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500'>
                  {`The contact ${deletingName || ''} will be deleted definitively from the list.`}
                </p>
              </div>
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
