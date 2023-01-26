// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { TextInput, Button, InlineNotification, SideDrawerCloseIcon } from '../../common'
import { useState, useRef, useEffect } from 'react'
import { createSpeedDial, editSpeedDial } from '../../../services/phonebook'
import { reloadSpeedDial } from '../../../lib/speedDial'
import { closeSideDrawer } from '../../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons'

export interface CreateOrEditSpeedDialDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const CreateOrEditSpeedDialDrawerContent = forwardRef<
  HTMLButtonElement,
  CreateOrEditSpeedDialDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const nameRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const phoneNumberRef = useRef() as React.MutableRefObject<HTMLInputElement>

  useEffect(() => {
    if (config.isEdit) {
      // editing speed dial
      nameRef.current.value = config.speedDial.name || ''
      phoneNumberRef.current.value = config.speedDial.speeddial_num || ''
    } else {
      // creating speed dial
      nameRef.current.value = ''
      phoneNumberRef.current.value = ''
    }
  }, [config])

  const [nameError, setNameError] = useState('')
  const [phoneNumberError, setPhoneNumberError] = useState('')
  const [createSpeedDialError, setCreateSpeedDialError] = useState('')
  const [editSpeedDialError, setEditSpeedDialError] = useState('')

  const validateCreateOrEditSpeedDial = () => {
    // clear errors
    setNameError('')
    setPhoneNumberError('')
    setCreateSpeedDialError('')
    setEditSpeedDialError('')

    let isValidationOk = true

    // name
    if (!nameRef.current.value.trim()) {
      setNameError('Required')

      if (isValidationOk) {
        nameRef.current.focus()
        isValidationOk = false
      }
    }

    // phone number
    if (!phoneNumberRef.current.value.trim()) {
      setPhoneNumberError('Required')

      if (isValidationOk) {
        phoneNumberRef.current.focus()
        isValidationOk = false
      }
    }
    return isValidationOk
  }

  const prepareCreateSpeedDial = async () => {
    if (!validateCreateOrEditSpeedDial()) {
      return
    }

    try {
      const created = await createSpeedDial({
        name: nameRef.current.value,
        speeddial_num: phoneNumberRef.current.value,
      })
    } catch (error) {
      setCreateSpeedDialError('Cannot create speed dial')
      return
    }

    //// TODO: show toast notification success

    reloadSpeedDial()
    closeSideDrawer()
  }

  const prepareEditSpeedDial = async () => {
    if (!validateCreateOrEditSpeedDial()) {
      return
    }

    try {
      const edit = await editSpeedDial(
        {
          name: nameRef.current.value,
          speeddial_num: phoneNumberRef.current.value,
        },
        config.speedDial,
      )
    } catch (error) {
      setEditSpeedDialError('Cannot edit speed dial')
      return
    }

    //// TODO: show toast notification success

    reloadSpeedDial()
    closeSideDrawer()
  }

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {config.isEdit ? 'Edit speed dial' : 'Create speed dial'}
          </div>
          <div className='flex items-center h-7'>
          <SideDrawerCloseIcon className='p-0.5' />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'm-1 p-5')} {...props}>
        {/* name */}
        <TextInput
          label='Name'
          name='name'
          ref={nameRef}
          className='mb-4'
          error={!!nameError}
          helper={nameError}
        />
        {/* phone number */}
        <TextInput
          label='Phone number'
          name='phoneNumber'
          ref={phoneNumberRef}
          className='mb-6'
          error={!!phoneNumberError}
          helper={phoneNumberError}
        />
        {/* create speed dial error */}
        {createSpeedDialError && (
          <InlineNotification type='error' title={createSpeedDialError} className='mb-6' />
        )}
        {/* edit speed dial error */}
        {editSpeedDialError && (
          <InlineNotification type='error' title={editSpeedDialError} className='mb-6' />
        )}
        {config.isEdit ? (
          <Button variant='primary' type='submit' onClick={prepareEditSpeedDial} className='mb-4'>
            <FontAwesomeIcon icon={faPen} className='mr-2 h-4 w-4' />
            Edit speed dial
          </Button>
        ) : (
          <Button variant='primary' type='submit' onClick={prepareCreateSpeedDial} className='mb-4'>
            <FontAwesomeIcon icon={faPlus} className='mr-2 h-4 w-4' />
            Create speed dial
          </Button>
        )}
      </div>
    </>
  )
})

CreateOrEditSpeedDialDrawerContent.displayName = 'CreateOrEditSpeedDialDrawerContent'
