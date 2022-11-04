// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { TextInput } from '../common'
import { useState } from 'react'

export interface CreateContactDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const CreateContactDrawerContent = forwardRef<
  HTMLButtonElement,
  CreateContactDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const contactTypeOptions = [
    {
      id: 'person',
      title: 'Person',
    },
    {
      id: 'company',
      title: 'Company',
    },
  ]

  const contactVisibilityOptions = [
    {
      id: 'public',
      title: 'Everybody',
    },
    {
      id: 'private',
      title: 'Only me',
    },
  ]

  const [contactType, setContactType]: any = useState('person')
  const onContactTypeChanged = (e: any) => {
    setContactType(e.target.id)
  }

  const [contactVisibility, setContactVisibility]: any = useState('public')
  const onContactVisibilityChanged = (e: any) => {
    setContactVisibility(e.target.id)
  }

  const [contactName, setContactName] = useState('')
  const [contactCompany, setContactCompany] = useState('')
  const [contactExtension, setContactExtension] = useState('')
  const [contactWorkPhone, setContactWorkPhone] = useState('')
  const [contactMobilePhone, setContactMobilePhone] = useState('')
  const [contactHomePhone, setContactHomePhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactNotes, setContactNotes] = useState('')
  const [contactFax, setContactFax] = useState('')
  const [contactJob, setContactJob] = useState('')

  return (
    <div className={classNames(className, 'm-1')} {...props}>
      {/* contact visibility */}
      <div className='mb-6'>
        <label className='text-sm font-medium text-gray-700'>Who can see this contact?</label>
        <fieldset className='mt-2'>
          <legend className='sr-only'>Contact visibility</legend>
          <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
            {contactVisibilityOptions.map((option) => (
              <div key={option.id} className='flex items-center'>
                <input
                  id={option.id}
                  name='contact-visibility'
                  type='radio'
                  checked={option.id === contactVisibility}
                  onChange={onContactVisibilityChanged}
                  className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                />
                <label htmlFor={option.id} className='ml-3 block text-sm font-medium text-gray-700'>
                  {option.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
      {/* contact type */}
      <div className='mb-6'>
        <label className='text-sm font-medium text-gray-700'>Contact type</label>
        <fieldset className='mt-2'>
          <legend className='sr-only'>Contact type</legend>
          <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
            {contactTypeOptions.map((option) => (
              <div key={option.id} className='flex items-center'>
                <input
                  id={option.id}
                  name='contact-type'
                  type='radio'
                  checked={option.id === contactType}
                  onChange={onContactTypeChanged}
                  className='h-4 w-4 border-gray-300 text-sky-600 focus:ring-sky-500'
                />
                <label htmlFor={option.id} className='ml-3 block text-sm font-medium text-gray-700'>
                  {option.title}
                </label>
              </div>
            ))}
          </div>
        </fieldset>
      </div>

      {contactType !== 'company' && <TextInput label='Name' name='name' className='mb-4' />}
      <TextInput label='Company' name='company' className='mb-4' />
      <TextInput label='Extension' name='extension' className='mb-4' />
    </div>
  )
})

CreateContactDrawerContent.displayName = 'CreateContactDrawerContent'
