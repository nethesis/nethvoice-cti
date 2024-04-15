// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { Button } from '../Button'
import { useState } from 'react'
import { closeSideDrawer, formatFileSize } from '../../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faXmark } from '@fortawesome/free-solid-svg-icons'
import { SideDrawerCloseIcon } from '../SideDrawerCloseIcon'
import { t } from 'i18next'
import { Avatar } from '../Avatar'
import { uploadProfilePicture } from '../../../lib/profilePicture'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { retrieveAvatars } from '../../../lib/operators'
import { isEmpty } from 'lodash'
import { InlineNotification } from '../InlineNotification'

export interface SelectProfilePictureDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const SelectProfilePictureDrawerContent = forwardRef<
  HTMLButtonElement,
  SelectProfilePictureDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const authenticationStore = useSelector((state: RootState) => state.authentication)

  const [previewImage, setPreviewImage]: any = useState(null)

  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [selectedFileBase64, setSelectedFileBase64] = useState<any>(null)

  const [errorUpload, setErrorUpload] = useState(false)
  const [errorEmptyFile, setErrorEmptyFile] = useState(false)

  const prepareUploadPicture = async () => {
    let userInformationObject: any = {}
    if (!isEmpty(selectedFileBase64)) {
      userInformationObject.avatar = selectedFileBase64

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

  function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()

    const file = event.dataTransfer.files && event.dataTransfer.files[0]

    if (file && isImageFile(file)) {
      setSelectedFile(file)
      const reader = new FileReader()

      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setSelectedFileBase64(reader.result)
        setPreviewImage(reader.result)
      }

      if (selectedFileBase64) {
        setPreviewImage(selectedFileBase64)
      }
      if (errorUpload) {
        setErrorUpload(false)
      }
    } else {
      setErrorUpload(true)
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault()
    const file = event.target.files && event.target.files[0]

    if (file && isImageFile(file)) {
      setSelectedFile(file)
      const reader = new FileReader()

      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setSelectedFileBase64(reader.result)
        setPreviewImage(reader.result)
      }

      if (errorUpload) {
        setErrorUpload(false)
      }
    } else {
      setErrorUpload(true)
    }
  }

  // Check if file is an image
  function isImageFile(file: File): boolean {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']

    return allowedImageTypes.includes(file.type)
  }

  function deleteUploadedAnnouncement() {
    setSelectedFile(null)
    setPreviewImage(null)
  }

  return (
    <>
      <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('Settings.Upload profile picture')}
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
        <>
          {/* Profile picture drawer section */}
          <div className='flex items-center justify-between mt-2'>
            <h4 className='text-base font-medium text-gray-700 dark:text-gray-200'>
              {t('Settings.Image')} (png, jpg, jpeg)
            </h4>
          </div>
          {/* Upload profile picture section */}
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
          {/* If the file hasn't been uploaded yet */}
          {!selectedFile ? (
            <>
              <div className='flex items-center justify-center w-full mt-2'>
                <label
                  htmlFor='dropzone-file'
                  className='flex flex-col items-center justify-center w-full py-2 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-emerald-50 dark:hover:bg-emerald-800 dark:bg-primaryDark hover:bg-emerald-100 dark:border-gray-400 dark:hover:border-gray-500 '
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <Avatar size='large' placeholderType='person' />

                    <p className='mt-2 text-base text-gray-900 dark:text-gray-100'>
                      <span className='font-normal'>{t('Settings.Select or drag image here')}</span>
                    </p>
                  </div>
                  <input
                    id='dropzone-file'
                    type='file'
                    className='hidden'
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <div className='py-3'>
                <div className='rounded-md border border-emerald-500'>
                  <div className='flex items-center justify-between py-4 pl-3 pr-4'>
                    <div className='flex w-0 flex-1 items-center pl-2'>
                      <div className='h-9 w-9 bg-emerald-50 dark:bg-emerald-200 flex items-center rounded-lg justify-center'>
                        <Avatar
                          size='extra_small'
                          placeholderType='person'
                          className='bg-primary'
                        />
                      </div>
                      <div className='text-base flex flex-col pl-3'>
                        <span className='font-semibold text-gray-900 dark:text-gray-100'>
                          {selectedFile.name}
                        </span>
                        <span className='text-sm'>{formatFileSize(selectedFile.size)}</span>
                      </div>
                    </div>
                    <div className='ml-4 flex-shrink-0'>
                      <Button variant='ghost' onClick={() => deleteUploadedAnnouncement()}>
                        <FontAwesomeIcon
                          icon={faXmark}
                          className='h-4 w-4 text-gray-500 dark:text-gray-500'
                          aria-hidden='true'
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>

        {previewImage && (
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
        )}
        {/* Divider */}
        <div className='relative pb-10 pt-6'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-gray-300 dark:border-gray-600' />
          </div>
        </div>
        <div className={`${previewImage ? '' : 'pt-8'} flex items-center justify-end`}>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='mb-4'>
            {t('Common.Cancel')}
          </Button>
          <Button
            variant='primary'
            type='submit'
            onClick={prepareUploadPicture}
            className='ml-4 mb-4'
            disabled={isEmpty(selectedFileBase64)}
          >
            {t('Settings.Upload')}
          </Button>
        </div>
      </div>
    </>
  )
})

SelectProfilePictureDrawerContent.displayName = 'SelectProfilePictureDrawerContent'
