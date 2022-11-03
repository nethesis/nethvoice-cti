// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * Return the create/edit modal for the speed dials
 *
 * @param show - It shows or hides the modal
 * @param reload - The callback that reloads the list of speed dials
 * @param onClose - The callback for the close event
 * @param defaultName - The default value for the name input
 * @param defaultNumber - The default number tor the number input
 * @param isEditing - The editing property
 * @param hidden - The callback on completely hidden event
 */

import { FC, createRef, RefObject, useRef, MutableRefObject, FormEvent, useCallback } from 'react'
import { Modal } from '../../common'
import { createSpeedDial, editSpeedDial } from '../../../services/phonebook'
import { TextInput, Button } from '../../common'
import type { SpeedDialType } from '../../../services/types'

interface CreateModal {
  show: boolean
  reload: () => void
  onClose: () => void
  defaultName: string | undefined
  defaultNumber: string | undefined
  isEditing: boolean
  hidden: () => void
  current: SpeedDialType
}

export const CreateModal: FC<CreateModal> = ({
  show,
  reload,
  onClose,
  defaultName,
  defaultNumber,
  isEditing,
  hidden,
  current,
}) => {
  // The reference for the cancel button of the new speed dial modal
  const cancelNewButtonRef: RefObject<HTMLButtonElement> = createRef()

  // Handle for the new speed dial form submission
  const handleSpeedDial = async (e: FormEvent) => {
    e.preventDefault()
    const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]')
    const numberInput = document.querySelector<HTMLInputElement>('input[name="number"]')
    if (nameInput?.value && numberInput?.value) {
      // Create a new speed dial or edit it and reload the list
      if (isEditing) {
        const edit = await editSpeedDial(
          {
            name: nameInput.value,
            speeddial_num: numberInput.value,
          },
          current,
        )
        if (edit) {
          reload()
        }
      } else {
        const created = await createSpeedDial({
          name: nameInput.value,
          speeddial_num: numberInput.value,
        })
        if (created) {
          reload()
        }
      }
    }
  }

  // Handle name ref is ready
  const handleNameRef = useCallback(
    (ref: any) => {
      if (ref && isEditing) {
        ref.value = defaultName
      }
    },
    [defaultName, isEditing],
  )

  // Handle number ref is ready
  const handleNumberRef = useCallback(
    (ref: any) => {
      if (ref && isEditing) {
        ref.value = defaultNumber
      }
    },
    [defaultNumber, isEditing],
  )

  return (
    <Modal show={show} focus={cancelNewButtonRef} onClose={onClose} afterLeave={hidden}>
      <form onSubmit={handleSpeedDial}>
        <Modal.Content>
          <div className='mt-3 text-center sm:mt-0 sm:text-left w-full'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 text-center'>
              {`${isEditing ? 'Edit' : 'Add'} speed dial`}
            </h3>
            <div className='mt-2'>
              <p className='text-sm text-gray-500 text-center'>
                {isEditing
                  ? 'The contact will be updated.'
                  : 'The contact will be add to the side list.'}
              </p>
            </div>
            <div className='mt-3 flex flex-col gap-2'>
              <TextInput
                label='Name'
                placeholder='Enter the name'
                name='name'
                ref={handleNameRef}
                required
              />
              <TextInput
                label='Number'
                placeholder='Enter the number'
                name='number'
                ref={handleNumberRef}
                required
              />
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button type='submit' variant='primary' onClick={onClose}>
            Save
          </Button>
          <Button type='button' variant='white' onClick={onClose}>
            Cancel
          </Button>
        </Modal.Actions>
      </form>
    </Modal>
  )
}
