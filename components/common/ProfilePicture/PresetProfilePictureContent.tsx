// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import { Avatar } from '../Avatar'
import { isEmpty } from 'lodash'
import { uploadProfilePicture } from '../../../lib/profilePicture'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { retrieveAvatars } from '../../../lib/operators'
// import first from '../public/defaultAvatars/standard1.svg'
// import second from '../public/defaultAvatars/standard2.svg'
// import third from '../public/defaultAvatars/standard3.svg'
// import fourth from '../public/defaultAvatars/standard4.svg'
// import fifth from '../public/defaultAvatars/standard5.svg'
// import sixth from '../public/defaultAvatars/standard6.svg'
// import seventh from '../public/defaultAvatars/standard7.svg'
// import eighth from '../public/defaultAvatars/standard8.svg'

export interface PresetProfilePictureContentProps extends ComponentPropsWithRef<'div'> {}

export const PresetProfilePictureContent = forwardRef<
  HTMLButtonElement,
  PresetProfilePictureContentProps
>(({ className, ...props }, ref) => {
  const [errorUpload, setErrorUpload] = useState(false)

  const authenticationStore = useSelector((state: RootState) => state.authentication)

  const prepareUploadPicture = async (selectedFileBase64: any) => {
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
    }

    localStorage.removeItem('caches-' + authenticationStore.username)
    retrieveAvatars(authenticationStore)
  }

  return (
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
          onClick={() => prepareUploadPicture('')}
        />
        <Avatar
          size='extra_large'
          placeholderType='person'
          // src={second}
          deleteAvatar={false}
          className='cursor-pointer'
          onClick={() => prepareUploadPicture('')}
        />
        <Avatar
          size='extra_large'
          placeholderType='person'
          // src={third}
          deleteAvatar={false}
          className='cursor-pointer'
          onClick={() => prepareUploadPicture('')}
        />
        <Avatar
          size='extra_large'
          placeholderType='person'
          // src={fourth}
          deleteAvatar={false}
          className='cursor-pointer'
          onClick={() => prepareUploadPicture('')}
        />
        <Avatar
          size='extra_large'
          placeholderType='person'
          // src={fifth}
          deleteAvatar={false}
          className='cursor-pointer'
          onClick={() => prepareUploadPicture('')}
        />
        <Avatar
          size='extra_large'
          placeholderType='person'
          // src={sixth}
          deleteAvatar={false}
          className='cursor-pointer'
          onClick={() => prepareUploadPicture('')}
        />
        <Avatar
          size='extra_large'
          placeholderType='person'
          // src={seventh}
          deleteAvatar={false}
          className='cursor-pointer'
          onClick={() => prepareUploadPicture('')}
        />
        <Avatar
          size='extra_large'
          placeholderType='person'
          // src={eighth}
          deleteAvatar={false}
          className='cursor-pointer'
          onClick={() => prepareUploadPicture('')}
        />
      </div>
    </>
  )
})

PresetProfilePictureContent.displayName = 'PresetProfilePictureContent'
