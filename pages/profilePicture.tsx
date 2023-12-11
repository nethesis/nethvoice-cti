// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { RefObject, createRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Button, Modal, Switch } from '../components/common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
// import first from '../public/defaultAvatars/standard1.svg'
// import second from '../public/defaultAvatars/standard2.svg'
// import third from '../public/defaultAvatars/standard3.svg'
// import fourth from '../public/defaultAvatars/standard4.svg'
// import fifth from '../public/defaultAvatars/standard5.svg'
// import sixth from '../public/defaultAvatars/standard6.svg'
// import seventh from '../public/defaultAvatars/standard7.svg'
// import eighth from '../public/defaultAvatars/standard8.svg'
import { openShowGravatarDrawer } from '../lib/profilePicture'
import { faUpload, faUserAstronaut } from '@fortawesome/free-solid-svg-icons'
import React from 'react'

const Profile: NextPage = () => {
  const { t } = useTranslation()
  const operators = useSelector((state: RootState) => state.operators.operators)
  const profile = useSelector((state: RootState) => state.user)
  // Upload avatar section
  const [showUploadAvatarModal, setShowUploadAvatarModal] = React.useState(false)
  function showModalUploadAvatar() {
    setShowUploadAvatarModal(true)
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowUploadAvatarModal(false)
  }
  const uploadAvatarRef: RefObject<HTMLInputElement> = createRef()
  const closedModalSaved = () => {
    setShowUploadAvatarModal(false)
  }
  const [presetVisible, setPresetVisible] = useState(false)
  const [previewImage, setPreviewImage]: any = useState(null)
  const handleImageChange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  const handleDragOver = (e: any) => {
    e.preventDefault()
  }
  const handleDrop = (e: any) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  return (
    <>
      <section aria-labelledby='clear-cache-heading'>
        <div className='sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            <div>
              <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                {t('Settings.Profile picture')}
              </h2>
            </div>
            <div className='flex items-center space-x-4'>
              {/* User main avatar */}
              <Avatar
                size='extra_large'
                placeholderType='person'
                src={operators[profile?.username]?.avatarBase64}
                deleteAvatar={true}
              />
              <Button variant='white' onClick={() => showModalUploadAvatar()}>
                <FontAwesomeIcon icon={faUpload} className='mr-2' />
                {t('Settings.Upload')}
              </Button>
              <Button variant='white' onClick={() => openShowGravatarDrawer('')}>
                <FontAwesomeIcon icon={faUserAstronaut} className='mr-2' />
                {t('Settings.Gravatar')}
              </Button>
              <div className='flex'>
                <Switch
                  on={presetVisible}
                  changed={() => setPresetVisible(!presetVisible)}
                ></Switch>
                <span className='ml-2'>{t('Settings.Preset')}</span>
              </div>
            </div>
            {presetVisible && (
              <>
                {/* Divider */}
                <div className='relative pt-8'>
                  <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                    <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
                  </div>
                </div>
                <div className='grid grid-cols-1 xl:grid-cols-4 gap-4'>
                  {/* Preset avatars */}
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={first}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={second}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={third}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={fourth}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={fifth}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={sixth}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={seventh}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    // src={eighth}
                    deleteAvatar={false}
                    className='cursor-pointer'
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <Modal
          show={showUploadAvatarModal}
          focus={uploadAvatarRef}
          onClose={() => setShowUploadAvatarModal(false)}
          size='large'
        >
          <form onSubmit={handleSubmit}>
            <Modal.Content>
              <div className='mt-3 text-center sm:mt-0 sm:text-left w-full'>
                <h3 className='text-lg font-medium leading-6 text-center text-gray-900 dark:text-gray-100'>
                  {t('Settings.Upload profile image')}
                </h3>
                <div className='mt-3 flex flex-col sm:flex-row gap-8 items-center'>
                  {/* Manually select image from folder */}
                  <label
                    htmlFor='profileImage'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:underline'
                  >
                    {t('Settings.Select image')}
                    <input
                      type='file'
                      accept='.jpg, .jpeg'
                      id='profileImage'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                  </label>
                  <div>{t('Common.or')}</div>
                  {/* Drag and drop profile image */}
                  <div
                    className='flex-1 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-center'
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {t('Settings.Drag here')}
                  </div>
                </div>
                <div className='mt-4 text-center'>
                  <h4 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {t('Settings.Preview')}
                  </h4>
                  <Avatar
                    size='extra_large'
                    placeholderType='person'
                    src={previewImage}
                    deleteAvatar={false}
                    className='mx-auto'
                  ></Avatar>
                </div>
              </div>
            </Modal.Content>
            <Modal.Actions>
              <Button variant='primary' onClick={() => closedModalSaved()}>
                {t('Common.Save')}
              </Button>
              <Button variant='white' onClick={() => setShowUploadAvatarModal(false)}>
                {t('Common.Cancel')}
              </Button>
            </Modal.Actions>
          </form>
        </Modal>
      </section>
    </>
  )
}
export default Profile
