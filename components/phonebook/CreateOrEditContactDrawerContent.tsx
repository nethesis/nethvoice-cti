// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { TextInput, Button, InlineNotification, SideDrawerCloseIcon } from '../common'
import { useState, useRef, useEffect } from 'react'
import { createContact, editContact, reloadPhonebook, fetchContact } from '../../lib/phonebook'
import { closeSideDrawer } from '../../lib/utils'
import { t } from 'i18next'
import { openToast } from '../../lib/utils'

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
      title: t('Phonebook.Person'),
    },
    {
      id: 'company',
      title: t('Phonebook.Company'),
    },
  ]

  const contactVisibilityOptions = [
    {
      id: 'public',
      title: t('Phonebook.Public'),
    },
    {
      id: 'private',
      title: t('Phonebook.Only me'),
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
  const [firstRender, setFirstRender] = useState(true)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    if (config?.isEdit) {
      // editing contact
      if (config.contact.kind) {
        setContactType(config.contact.kind)
      } else {
        if (config.contact.name) {
          setContactType('person')
        } else {
          setContactType('company')
        }
      }
      setContactVisibility(config.contact.type)
      nameRef.current.value = config.contact.name || ''
      companyRef.current.value = config.contact.company || ''

      if (!config.contact.phone) {
        // User is editing a contact
        extensionRef.current.value = config.contact.extension || ''
        workPhoneRef.current.value = config.contact.workphone || ''
        mobilePhoneRef.current.value = config.contact.cellphone || ''
      } else {
        // User is adding a number to a contact
        if (!config.contact.workphone) {
          workPhoneRef.current.value = config.contact.phone
          mobilePhoneRef.current.value = config.contact.cellphone || ''
          extensionRef.current.value = config.contact.extension || ''
          workPhoneRef.current.focus()
        } else if (!config.contact.cellphone) {
          workPhoneRef.current.value = config.contact.workphone || ''
          mobilePhoneRef.current.value = config.contact.phone
          extensionRef.current.value = config.contact.extension || ''
          mobilePhoneRef.current.focus()
        } else if (!config.contact.extension) {
          workPhoneRef.current.value = config.contact.workphone || ''
          mobilePhoneRef.current.value = config.contact.cellphone || ''
          extensionRef.current.value = config.contact.phone
          extensionRef.current.focus()
        } else {
          workPhoneRef.current.value = config.contact.workphone || ''
          mobilePhoneRef.current.value = config.contact.cellphone || ''
          extensionRef.current.value = config.contact.extension || ''
        }
      }
      emailRef.current.value = config.contact.workemail || ''
      notesRef.current.value = config.contact.notes || ''
    } else if (config?.isCreateContactUserLastCalls) {
      setContactType('person')
      setContactVisibility('public')

      nameRef.current.value = ''
      companyRef.current.value = ''
      extensionRef.current.value = config?.contact?.extension || ''
      workPhoneRef.current.value = ''
      mobilePhoneRef.current.value = ''
      emailRef.current.value = ''
      notesRef.current.value = ''
    } else {
      // creating contact
      setContactType('person')
      setContactVisibility('public')
      nameRef.current.value = ''
      companyRef.current.value = ''
      extensionRef.current.value = ''
      if (config.contact) {
        workPhoneRef.current.value = config.contact
      } else {
        workPhoneRef.current.value = ''
      }
      mobilePhoneRef.current.value = ''
      emailRef.current.value = ''
      notesRef.current.value = ''
    }
  }, [firstRender, config])

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
    if (
      contactType === 'person' &&
      !nameRef?.current?.value?.trim() &&
      !companyRef?.current?.value?.trim()
    ) {
      setNameError('Required')

      if (isValidationOk) {
        nameRef?.current?.focus()
        isValidationOk = false
      }
    }

    // company
    if (contactType === 'company' && !companyRef?.current?.value?.trim()) {
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

    if (contactType === 'person' && nameRef?.current?.value) {
      contactData.name = nameRef?.current?.value
    } else if (
      contactType === 'company' &&
      !nameRef?.current?.value &&
      companyRef?.current?.value
    ) {
      contactData.name = '-'
    }

    if (companyRef.current.value) {
      contactData.company = companyRef?.current?.value
    }

    if (extensionRef.current.value) {
      contactData.extension = extensionRef?.current?.value
    }

    if (workPhoneRef.current.value) {
      contactData.workphone = workPhoneRef?.current?.value
    }

    if (mobilePhoneRef.current.value) {
      contactData.cellphone = mobilePhoneRef?.current?.value
    }

    if (emailRef.current.value) {
      contactData.workemail = emailRef?.current?.value
    }

    if (notesRef.current.value) {
      contactData.notes = notesRef?.current?.value
    }

    try {
      await createContact(contactData)
    } catch (error) {
      setCreateContactError('Cannot create contact')
      return
    }
    // show toast message
    showToastCreationContact()
    reloadPhonebook()
    closeSideDrawer()
  }

  const prepareEditContact = async () => {
    if (!validateCreateOrEditContact()) {
      return
    }

    let contactData: any = {
      id: config?.contact?.id?.toString(),
      owner_id: config?.contact?.owner_id,
      source: config?.contact?.source,
      speeddial_num: config?.contact?.speeddial_num,
      name: null,
      privacy: contactVisibility,
      favorite: false,
      selectedPrefNum: config?.contact?.selectedPrefNum,
      type: contactVisibility,
      company: companyRef?.current?.value || null,
      extension: extensionRef?.current?.value || null,
      workphone: workPhoneRef?.current?.value || '',
      cellphone: mobilePhoneRef?.current?.value || null,
      workemail: emailRef?.current?.value || null,
      notes: notesRef?.current?.value || null,
      homeemail: config?.contact?.homeemail,
      homephone: config?.contact?.homephone,
      fax: config?.contact?.fax,
      title: config?.contact?.title,
      homestreet: config?.contact?.homestreet,
      homepob: config?.contact?.homepob,
      homecity: config?.contact?.homecity,
      homeprovince: config?.contact?.homeprovince,
      homepostalcode: config?.contact?.homepostalcode,
      homecountry: config?.contact?.homecountry,
      workstreet: config?.contact?.workstreet,
      workpob: config?.contact?.workpob,
      workcity: config?.contact?.workcity,
      workprovince: config?.contact?.workprovince,
      workpostalcode: config?.contact?.workpostalcode,
      workcountry: config?.contact?.workcountry,
      url: config?.contact?.url,
    }

    if (contactType === 'person' && nameRef.current.value) {
      contactData.name = nameRef?.current?.value
    }

    try {
      await editContact(contactData)
    } catch (error) {
      setEditContactError('Cannot edit contact')
      return
    }
    // show toast message
    showToastEditContact()
    reloadPhonebook()
    fetchContact(config?.contact?.id, config?.contact?.source)
  }

  const showToastEditContact = () => {
    openToast(
      'success',
      `${t('Phonebook.Contact edit message')}`,
      `${t('Phonebook.Contact edited')}`,
    )
  }

  const showToastCreationContact = () => {
    openToast(
      'success',
      `${t('Phonebook.Contact creation message')}`,
      `${t('Phonebook.Contact created')}`,
    )
  }

  return (
    <>
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {config?.isEdit
              ? config?.contact?.phone
                ? t('Phonebook.Add phone number') + ': ' + config?.contact?.phone
                : t('Phonebook.Edit contact')
              : t('Phonebook.Create contact')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'px-5')} {...props}>
        {/* Divider */}
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        {/* contact visibility */}
        <div className='mb-6'>
          <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
            {t('Phonebook.Visibility')}
          </label>
          <fieldset className='mt-2'>
            <legend className='sr-only'>{t('Phonebook.Visibility')}</legend>
            <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
              {contactVisibilityOptions.map((option) => (
                <div key={option?.id} className='flex items-center'>
                  <input
                    id={option?.id}
                    name='contact-visibility'
                    type='radio'
                    checked={option.id === contactVisibility}
                    onChange={onContactVisibilityChanged}
                    className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                  />
                  <label
                    htmlFor={option?.id}
                    className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                  >
                    {option?.title}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
        {/* contact type */}
        <div className='mb-6'>
          <label className='text-sm font-medium text-gray-700 dark:text-gray-200'>
            {t('Phonebook.Type')}
          </label>
          <fieldset className='mt-2'>
            <legend className='sr-only'>{t('Phonebook.Type')}</legend>
            <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
              {contactTypeOptions.map((option) => (
                <div key={option?.id} className='flex items-center'>
                  <input
                    id={option?.id}
                    name='contact-type'
                    type='radio'
                    checked={option.id === contactType}
                    onChange={onContactTypeChanged}
                    className='h-4 w-4 border-gray-300 text-primary focus:ring-primaryLight dark:border-gray-600 dark:text-primaryDark dark:focus:ring-primaryDark'
                  />
                  <label
                    htmlFor={option?.id}
                    className='ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200'
                  >
                    {option?.title}
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
          label={t('Phonebook.Company') || ''}
          name='company'
          ref={companyRef}
          className='mb-4'
          error={!!companyError}
          helper={companyError}
        />
        <TextInput
          label={t('Phonebook.Extension') || ''}
          name='extension'
          ref={extensionRef}
          className='mb-4'
        />
        <TextInput
          label={t('Phonebook.Work phone') || ''}
          name='workPhone'
          ref={workPhoneRef}
          className='mb-4'
        />
        <TextInput
          label={t('Phonebook.Mobile phone') || ''}
          name='mobilePhone'
          ref={mobilePhoneRef}
          className='mb-4'
        />
        <TextInput
          label={t('Phonebook.Email') || ''}
          name='email'
          ref={emailRef}
          className='mb-4'
        />
        <TextInput
          label={t('Phonebook.Notes') || ''}
          name='notes'
          ref={notesRef}
          className='mb-6'
        />
        {/* create contact error */}
        {createContactError && (
          <InlineNotification type='error' title={createContactError} className='mb-4' />
        )}
        {/* edit contact error */}
        {editContactError && (
          <InlineNotification type='error' title={editContactError} className='mb-4' />
        )}
        {/* Divider */}
        <div className='relative pb-10 pt-6'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        <div className='flex items-center justify-end'>
          <Button variant='ghost' type='submit' onClick={closeSideDrawer} className='mb-4'>
            {t('Common.Cancel')}
          </Button>
          {config?.isEdit ? (
            <Button
              variant='primary'
              type='submit'
              onClick={prepareEditContact}
              className='ml-4 mb-4'
            >
              {t('Phonebook.Save contact')}
            </Button>
          ) : (
            <Button
              variant='primary'
              type='submit'
              onClick={prepareCreateContact}
              className='ml-4 mb-4'
            >
              {t('Phonebook.Create contact')}
            </Button>
          )}
        </div>
      </div>
    </>
  )
})

CreateOrEditContactDrawerContent.displayName = 'CreateOrEditContactDrawerContent'
