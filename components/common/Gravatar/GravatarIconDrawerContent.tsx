// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { Button } from '../Button'
import { useState, useRef } from 'react'
import { closeSideDrawer } from '../../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faSave } from '@fortawesome/free-solid-svg-icons'
import { SideDrawerCloseIcon } from '../SideDrawerCloseIcon'
import { t } from 'i18next'
import { TextInput } from '../TextInput'
import Gravatar from 'react-gravatar'

export interface GravatarIconDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const GravatarIconDrawerContent = forwardRef<
  HTMLButtonElement,
  GravatarIconDrawerContentProps
>(({ config, className, ...props }, ref) => {

  const [textFilter, setTextFilter] = useState('')
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [avatar, setAvatar]: any = useState({})
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
          <Gravatar email={textFilter} className='rounded-full mt-4' size={100} />
        </div>
        <div className='flex'>
          <Button
            variant='primary'
            type='submit'
            // onClick={prepareEditContact}
            className='mb-4'
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
