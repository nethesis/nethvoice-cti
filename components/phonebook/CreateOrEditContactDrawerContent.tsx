// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { TextInput, Button, InlineNotification } from '../common'
import { useState, useRef, useEffect } from 'react'
import { MdAdd, MdEdit } from 'react-icons/md'
import { createContact, editContact, reloadPhonebook, fetchContact } from '../../lib/phonebook'
import { closeSideDrawer } from '../../lib/utils'

export interface CreateOrEditContactDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const CreateOrEditContactDrawerContent = forwardRef<
  HTMLButtonElement,
  CreateOrEditContactDrawerContentProps
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

  const nameRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const companyRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const extensionRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const workPhoneRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const mobilePhoneRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const emailRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const notesRef = useRef() as React.MutableRefObject<HTMLInputElement>

  useEffect(() => {
    if (config.isEdit) {
      // editing contact
      setContactType(config.contact.kind)
      setContactVisibility(config.contact.type)
      nameRef.current.value = config.contact.name || ''
      companyRef.current.value = config.contact.company || ''
      extensionRef.current.value = config.contact.extension || ''
      workPhoneRef.current.value = config.contact.workphone || ''
      mobilePhoneRef.current.value = config.contact.cellphone || ''
      emailRef.current.value = config.contact.workemail || ''
      notesRef.current.value = config.contact.notes || ''
    } else {
      // creating contact
      setContactType('person')
      setContactVisibility('public')
      nameRef.current.value = ''
      companyRef.current.value = ''
      extensionRef.current.value = ''
      workPhoneRef.current.value = ''
      mobilePhoneRef.current.value = ''
      emailRef.current.value = ''
      notesRef.current.value = ''
    }
  }, [config])

  const [nameError, setNameError] = useState('')
  const [companyError, setCompanyError] = useState('')
  const [createContactError, setCreateContactError] = useState('')
  const [editContactError, setEditContactError] = useState('')

  const validateCreateOrEditContact = () => {
    // clear errors
    setNameError('')
    setCompanyError('')
    setCreateContactError('')
    setEditContactError('')

    let isValidationOk = true

    // name
    if (contactType === 'person' && !nameRef.current.value) {
      setNameError('Required')

      if (isValidationOk) {
        nameRef.current.focus()
        isValidationOk = false
      }
    }

    // company
    if (contactType === 'company' && !companyRef.current.value) {
      setCompanyError('Required')

      if (isValidationOk) {
        companyRef.current.focus()
        isValidationOk = false
      }
    }
    return isValidationOk
  }

  const prepareCreateContact = async () => {
    if (!validateCreateOrEditContact()) {
      return
    }

    let contactData: any = {
      name: '',
      workphone: '',
      privacy: contactVisibility,
      favorite: false,
      selectedPrefNum: 'extension',
      type: contactVisibility,
    }

    if (contactType === 'person' && nameRef.current.value) {
      contactData.name = nameRef.current.value
    }

    if (companyRef.current.value) {
      contactData.company = companyRef.current.value
    }

    if (extensionRef.current.value) {
      contactData.extension = extensionRef.current.value
    }

    if (workPhoneRef.current.value) {
      contactData.workphone = workPhoneRef.current.value
    }

    if (mobilePhoneRef.current.value) {
      contactData.cellphone = mobilePhoneRef.current.value
    }

    if (emailRef.current.value) {
      contactData.workemail = emailRef.current.value
    }

    if (notesRef.current.value) {
      contactData.notes = notesRef.current.value
    }

    try {
      await createContact(contactData)
    } catch (error) {
      setCreateContactError('Cannot create contact')
      return
    }

    //// TODO: show toast notification success or show contact in drawer

    reloadPhonebook()
    closeSideDrawer()
  }

  const prepareEditContact = async () => {
    if (!validateCreateOrEditContact()) {
      return
    }

    let contactData: any = {
      id: config.contact.id.toString(),
      owner_id: config.contact.owner_id,
      source: config.contact.source,
      speeddial_num: config.contact.speeddial_num,
      name: null,
      privacy: contactVisibility,
      favorite: false,
      selectedPrefNum: config.contact.selectedPrefNum,
      type: contactVisibility,
      company: companyRef.current.value || null,
      extension: extensionRef.current.value || null,
      workphone: workPhoneRef.current.value || '',
      cellphone: mobilePhoneRef.current.value || null,
      workemail: emailRef.current.value || null,
      notes: notesRef.current.value || null,
      homeemail: config.contact.homeemail,
      homephone: config.contact.homephone,
      fax: config.contact.fax,
      title: config.contact.title,
      homestreet: config.contact.homestreet,
      homepob: config.contact.homepob,
      homecity: config.contact.homecity,
      homeprovince: config.contact.homeprovince,
      homepostalcode: config.contact.homepostalcode,
      homecountry: config.contact.homecountry,
      workstreet: config.contact.workstreet,
      workpob: config.contact.workpob,
      workcity: config.contact.workcity,
      workprovince: config.contact.workprovince,
      workpostalcode: config.contact.workpostalcode,
      workcountry: config.contact.workcountry,
      url: config.contact.url,
    }

    if (contactType === 'person' && nameRef.current.value) {
      contactData.name = nameRef.current.value
    }

    try {
      await editContact(contactData)
    } catch (error) {
      setEditContactError('Cannot edit contact')
      return
    }

    //// TODO: show toast notification success

    reloadPhonebook()
    fetchContact(config.contact.id, config.contact.source)
  }

  return (
    <div className={classNames(className, 'm-1')} {...props}>
      {/* title */}
      <h2 className='text-lg font-medium text-gray-700 mb-4'>
        {config.isEdit ? 'Edit contact' : 'Create contact'}
      </h2>
      {/* contact visibility */}
      <div className='mb-6'>
        <label className='text-sm font-medium text-gray-700'>Visibility</label>
        <fieldset className='mt-2'>
          <legend className='sr-only'>Visibility</legend>
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
        <label className='text-sm font-medium text-gray-700'>Type</label>
        <fieldset className='mt-2'>
          <legend className='sr-only'>Type</legend>
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
      {/* contact fields */}
      {contactType !== 'company' && (
        <TextInput
          label='Name'
          name='name'
          ref={nameRef}
          className='mb-4'
          error={!!nameError}
          helper={nameError}
        />
      )}
      <TextInput
        label='Company'
        name='company'
        ref={companyRef}
        className='mb-4'
        error={!!companyError}
        helper={companyError}
      />
      <TextInput label='Extension' name='extension' ref={extensionRef} className='mb-4' />
      <TextInput label='Work phone' name='workPhone' ref={workPhoneRef} className='mb-4' />
      <TextInput label='Mobile phone' name='mobilePhone' ref={mobilePhoneRef} className='mb-4' />
      <TextInput label='Email' name='email' ref={emailRef} className='mb-4' />
      <TextInput label='Notes' name='notes' ref={notesRef} className='mb-6' />
      {/* create contact error */}
      {createContactError && (
        <InlineNotification type='error' title={createContactError} className='mb-4' />
      )}
      {/* edit contact error */}
      {editContactError && (
        <InlineNotification type='error' title={editContactError} className='mb-4' />
      )}
      {config.isEdit ? (
        <Button variant='primary' type='submit' onClick={prepareEditContact} className='mb-4'>
          <MdEdit className='-ml-1 mr-2 h-5 w-5' />
          Edit contact
        </Button>
      ) : (
        <Button variant='primary' type='submit' onClick={prepareCreateContact} className='mb-4'>
          <MdAdd className='-ml-1 mr-2 h-5 w-5' />
          Create contact
        </Button>
      )}
    </div>
  )
})

CreateOrEditContactDrawerContent.displayName = 'CreateOrEditContactDrawerContent'
