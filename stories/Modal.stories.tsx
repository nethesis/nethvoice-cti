// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { createRef, RefObject } from 'react'
import { Meta, Story } from '@storybook/react'
import { Modal, ModalProps, Button, TextInput } from '../components/common'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

export const Danger: Story<ModalProps> = (): JSX.Element => {
  const [showMondal, setShowMondal] = useState(false)
  const cancelButtonRef: RefObject<HTMLButtonElement> = createRef()

  return (
    <>
      <Button onClick={() => setShowMondal(true)}>Show modal</Button>
      <Modal show={showMondal} focus={cancelButtonRef} onClose={() => setShowMondal(false)}>
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
              Delete account
            </h3>
            <div className='mt-2'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                The contact will be deleted from the phonebook.
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={() => setShowMondal(false)}>
            Delete
          </Button>
          <Button variant='white' onClick={() => setShowMondal(false)} ref={cancelButtonRef}>
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}

export const WithForm: Story<ModalProps> = (): JSX.Element => {
  const [showMondal, setShowMondal] = useState(false)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('submit', e.target)
    setShowMondal(false)
  }
  const nameInputRef: RefObject<HTMLInputElement> = createRef()

  return (
    <>
      <Button onClick={() => setShowMondal(true)}>Show modal</Button>
      <Modal show={showMondal} focus={nameInputRef} onClose={() => setShowMondal(false)}>
        <form onSubmit={handleSubmit}>
          <Modal.Content>
            <div className='mt-3 text-center sm:mt-0 sm:text-left w-full'>
              <h3 className='text-lg font-medium leading-6 text-center text-gray-900 dark:text-gray-100'>
                Add account
              </h3>
              <div className='mt-2'>
                <p className='text-sm text-center text-gray-500 dark:text-gray-400'>
                  The contact will be added to the phonebook and will be available publicly by
                  default.
                </p>
              </div>
              <div className='mt-3 flex flex-col gap-2'>
                <TextInput
                  label='Name'
                  placeholder='Enter the name'
                  name='name'
                  ref={nameInputRef}
                />
                <TextInput label='Surname' placeholder='Enter the surname' name='surname' />
                <TextInput label='Number' placeholder='Enter the number' name='number' />
              </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button variant='primary' onClick={() => setShowMondal(false)}>
              Save
            </Button>
            <Button variant='white' onClick={() => setShowMondal(false)}>
              Cancel
            </Button>
          </Modal.Actions>
        </form>
      </Modal>
    </>
  )
}
