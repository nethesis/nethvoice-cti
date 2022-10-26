// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The SideBar component
 *
 */

import { MdApartment, MdOutlineAdd, MdPhone, MdMoreVert } from 'react-icons/md'
import { Button, Avatar, Modal, TextInput } from '../common/'
import { RefObject, createRef, useState } from 'react'

type SideBarProps = {}

const speedDials = [
  {
    name: 'Wonka Industries Inc.',
    handle: '201',
  },
  {
    name: 'Wonka Industries Inc.',
    handle: '202',
  },
  {
    name: 'Wonka Industries Inc.',
    handle: '203',
  },
  {
    name: 'Wonka Industries Inc.',
    handle: '204',
  },
  {
    name: 'Wonka Industries Inc.',
    handle: '205',
  },
  {
    name: 'Wonka Industries Inc.',
    handle: '206',
  }
]

export const SideBar = (props: SideBarProps) => {
  const [showMondal, setShowMondal] = useState(false)
  const cancelButtonRef: RefObject<HTMLButtonElement> = createRef()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('submit', e.target)
    setShowMondal(false)
  }

  const newSpeedDial = (
    <Modal show={showMondal} focus={cancelButtonRef} onClose={() => setShowMondal(false)}>
      <form onSubmit={handleSubmit}>
        <Modal.Content>
          <div className='mt-3 text-center sm:mt-0 sm:text-left w-full'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 text-center'>
              Add speed dial
            </h3>
            <div className='mt-2'>
              <p className='text-sm text-gray-500 text-center'>
                The contact will be add to the side list.
              </p>
            </div>
            <div className='mt-3 flex flex-col gap-2'>
              <TextInput label='Name' placeholder='Enter the name' name='name' />
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
  )

  return (
    <>
      {/* Secondary column (hidden on smaller screens) */}
      <aside className='hidden w-96 border-l border-gray-200 bg-white lg:block h-full '>
        <div className='flex h-full flex-col bg-white'>
          <div className='p-6'>
            <div className='flex items-start justify-between'>
              <h2 className='text-lg font-medium text-gray-900'>Speed Dial</h2>
              <div className='ml-3 flex h-7 items-center'>
                <Button variant='white' onClick={() => setShowMondal(true)}>
                  <MdOutlineAdd className='h-4 w-4' />
                  <span className='sr-only'>New speed dial</span>
                </Button>
                {newSpeedDial}
              </div>
            </div>
          </div>
          <span className='border-b border-gray-200'></span>
          <ul role='list' className='flex-1 divide-y divide-gray-200 overflow-y-auto'>
            {speedDials.map((person) => (
              <li key={person.handle}>
                <div className='group relative flex items-center py-6 px-5'>
                  <div className='absolute inset-0 group-hover:bg-gray-50' aria-hidden='true' />
                  <div className='relative flex min-w-0 flex-1 items-center justify-between'>
                    <div className='flex'>
                      <span className='text-gray-300 '>
                        <Avatar size='base' placeholder={MdApartment} />
                      </span>
                      <div className='ml-4 truncate'>
                        <p className='truncate text-sm font-medium text-gray-900'>{person.name}</p>
                        <p className='truncate text-sm text-gray-500'>{person.handle}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <Button variant='white'>
                        <MdPhone className='h-4 w-4' />
                        <span className='sr-only'>New speed dial</span>
                      </Button>
                      <Button variant='white'>
                        <MdMoreVert className='h-4 w-4' />
                        <span className='sr-only'>New speed dial</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}
