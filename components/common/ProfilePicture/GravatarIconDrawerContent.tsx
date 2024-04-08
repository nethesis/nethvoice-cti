// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { Button } from '../Button'
import { useState, useRef } from 'react'
import { closeSideDrawer } from '../../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faSave, faSearch } from '@fortawesome/free-solid-svg-icons'
import { SideDrawerCloseIcon } from '../SideDrawerCloseIcon'
import { t } from 'i18next'
import { TextInput } from '../TextInput'
import gravatar from 'gravatar'
import { Avatar } from '../Avatar'
import { uploadProfilePicture } from '../../../lib/profilePicture'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { retrieveAvatars } from '../../../lib/operators'
import { isEmpty } from 'lodash'
import { InlineNotification } from '../InlineNotification'
import { MD5 } from 'crypto-js'

export interface GravatarIconDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const GravatarIconDrawerContent = forwardRef<
  HTMLButtonElement,
  GravatarIconDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const [textFilter, setTextFilter] = useState('')
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [avatarBase64, setAvatarBase64]: any = useState({})
  const [errorEmptyFile, setErrorEmptyFile] = useState(false)
  const [errorUpload, setErrorUpload] = useState(false)

  // clear text filter
  const clearTextFilter = () => {
    setTextFilter('')
    textFilterRef.current.focus()
  }
  // text filter
  function changeTextFilter(event: any) {
    const newTextFilter = event.target.value
    setTextFilter(newTextFilter)
  }

  const authenticationStore = useSelector((state: RootState) => state.authentication)

  const [previewImage, setPreviewImage]: any = useState(null)

  const getGravatarImageUrl = (email: string) => {
    const hash = MD5(email.toLowerCase().trim())
    const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=identicon`

    return gravatarUrl
  }

  const convertGravatarToBase64 = async () => {
    const email = textFilter

    try {
      const response = await fetch(getGravatarImageUrl(email))
      const blob = await response.blob()
      const reader = new FileReader()

      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        const gravatarBase64 = reader.result as string
        setAvatarBase64({ avatar: gravatarBase64 })
        setPreviewImage(gravatarBase64)
      }
    } catch (error) {
      console.error('Error', error)
      setErrorUpload(true)
    }
  }

  const prepareEditContact = async () => {
    let userInformationObject: any = ''

    if (!isEmpty(avatarBase64)) {
      userInformationObject = avatarBase64

      try {
        await uploadProfilePicture(userInformationObject)
      } catch (error) {
        setErrorUpload(true)
        return
      }
    } else {
      setErrorEmptyFile(true)
    }

    localStorage.removeItem('caches-' + authenticationStore.username)
    retrieveAvatars(authenticationStore)
    closeSideDrawer()
  }

  return (
    <>
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Settings.Gravatar')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'px-5')} {...props}>
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        <div className='mb-6 flex flex-col'>
          {/* Upload error */}
          {errorUpload ||
            (errorEmptyFile && (
              <InlineNotification
                title={
                  errorEmptyFile
                    ? t('Settings.Upload image to continue')
                    : t('Settings.Wrong file type')
                }
                type='error'
                className='mt-2'
              ></InlineNotification>
            ))}
          {/* Email */}
          <label className='text-sm mb-2 font-medium text-gray-700 dark:text-gray-200'>
            {t('Settings.Email address')}
          </label>

          <div className='flex justify-between space-x-2'>
            <TextInput
              placeholder={t('Settings.Type to insert email address') || ''}
              className='max-w-lg'
              value={textFilter}
              onChange={changeTextFilter}
              ref={textFilterRef}
              icon={textFilter.length ? faCircleXmark : undefined}
              onIconClick={() => clearTextFilter()}
              trailingIcon={true}
            />
            <Button variant='white' onClick={() => convertGravatarToBase64()}>
              <FontAwesomeIcon icon={faSearch} className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <div className='mt-4 mb-8 text-left'>
          <h4 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            {t('Settings.Preview')}
          </h4>
          <Avatar
            size='extra_large'
            placeholderType='person'
            src={previewImage}
            deleteAvatar={false}
          ></Avatar>
        </div>
        {/* Divider */}
        <div className='relative pb-10 pt-6'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        <div className='flex items-center justify-end'>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='mb-4'>
            {t('Common.Cancel')}
          </Button>
          <Button
            variant='primary'
            type='submit'
            onClick={prepareEditContact}
            className='ml-4 mb-4'
            disabled={isEmpty(avatarBase64)}
          >
            <FontAwesomeIcon icon={faSave} className='mr-2 h-4 w-4' />
            {t('Settings.Save avatar')}
          </Button>
        </div>
      </div>
    </>
  )
})

GravatarIconDrawerContent.displayName = 'GravatarIconDrawerContent'
