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
  const operators = useSelector((state: RootState) => state.operators.operators)

  const [previewImage, setPreviewImage]: any = useState(null)

  const convertGravatarToBase64 = () => {
    const email = textFilter

    const gravatarUrl = gravatar.url(email, { protocol: 'https', s: '200' })

    const gravatarImage = new Image()

    gravatarImage.crossOrigin = 'Anonymous'

    gravatarImage.onload = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      canvas.width = gravatarImage.width
      canvas.height = gravatarImage.height

      context?.drawImage(gravatarImage, 0, 0)

      const avatar = canvas.toDataURL('image/png')

      setAvatarBase64({ avatar })
    }

    gravatarImage.src = gravatarUrl
    setPreviewImage(gravatarImage?.src)
  }

  const prepareEditContact = async () => {
    let userInformationObject: any = ''

    if (!isEmpty(avatarBase64)) {
      userInformationObject = avatarBase64

      try {
        await uploadProfilePicture(userInformationObject)
      } catch (error) {
        // setEditContactError('Cannot edit contact')
        return
      }
    } else {
    }

    localStorage.removeItem('caches-' + authenticationStore.username)
    retrieveAvatars(authenticationStore)
    closeSideDrawer()
  }

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Settings.Gravatar')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'm-1 p-5')} {...props}>
        <div className='mb-6 flex flex-col'>
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
        <div className='flex'>
          <Button
            variant='primary'
            type='submit'
            onClick={prepareEditContact}
            className='mb-4'
            disabled={isEmpty(avatarBase64)}
          >
            <FontAwesomeIcon icon={faSave} className='mr-2 h-4 w-4' />
            {t('Settings.Save avatar')}
          </Button>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='ml-4 mb-4'>
            {t('Common.Cancel')}
          </Button>
        </div>
      </div>
    </>
  )
})

GravatarIconDrawerContent.displayName = 'GravatarIconDrawerContent'
