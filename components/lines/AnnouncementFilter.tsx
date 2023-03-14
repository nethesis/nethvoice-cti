// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useRef } from 'react'
import classNames from 'classnames'
import { TextInput, Button } from '../common'
import { Fragment, useState } from 'react'
import { Dialog, Popover, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faXmark, faPlus } from '@nethesis/nethesis-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useTranslation } from 'react-i18next'
import { openShowTelephoneAnnouncementDrawer } from '../../lib/lines'

export interface AnnouncementFilterProps extends ComponentPropsWithRef<'div'> {
  updateTextFilter: Function
}

export const AnnouncementFilter = forwardRef<HTMLButtonElement, AnnouncementFilterProps>(
  ({ updateTextFilter, className, ...props }, ref) => {
    const { t } = useTranslation()
    const auth = useSelector((state: RootState) => state.authentication)
    const [textFilter, setTextFilter] = useState('')
    const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
    const [open, setOpen] = useState(false)

    function changeTextFilter(event: any) {
      const newTextFilter = event.target.value
      setTextFilter(newTextFilter)

      // notify parent component
      updateTextFilter(newTextFilter)
    }

    const resetFilters = () => {
      setTextFilter('')
      updateTextFilter('') // notify parent component
    }

    const clearTextFilter = () => {
      setTextFilter('')
      updateTextFilter('')
      textFilterRef.current.focus()
    }

    return (
      <div className={classNames(className)} {...props}>
        <div className=''>
          {/* TO DO CHECK ON MOBILE DEVICE  */}
          <div className='mx-auto text-center'>
            <section aria-labelledby='filter-heading' className='pb-6'>
              <h2 id='filter-heading' className='sr-only'>
                {t('Lines.Lines filters')}
              </h2>
              <div className='flex justify-between items-center'>
                <div className='items-center'>
                  <TextInput
                    placeholder={t('Lines.Filter announcement') || ''}
                    className='max-w-sm'
                    value={textFilter}
                    onChange={changeTextFilter}
                    ref={textFilterRef}
                    icon={textFilter.length ? faCircleXmark : undefined}
                    onIconClick={() => clearTextFilter()}
                    trailingIcon={true}
                  />
                </div>

                <Button
                  variant='primary'
                  className=''
                  onClick={openShowTelephoneAnnouncementDrawer}
                >
                  <FontAwesomeIcon
                    icon={faPlus}
                    className='h-4 w-4 mr-2 text-white dark:text-white'
                  />
                  <span>{t('Lines.Add announcement')}</span>
                </Button>
              </div>

              {/* Active filters */}
              <div>
                <div className='mx-auto pt-3 sm:flex sm:items-center'>
                  <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                    {t('Common.Active filters')}
                  </h3>
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px sm:ml-4 sm:block bg-gray-300 dark:bg-gray-600'
                  />

                  {/* separator */}
                  <div
                    aria-hidden='true'
                    className='hidden h-5 w-px sm:ml-4 sm:block bg-gray-300 dark:bg-gray-600'
                  />
                  {/* reset filters */}
                  <div className='mt-4 sm:mt-0 text-left sm:text-center ml-1 sm:ml-4'>
                    <button
                      type='button'
                      onClick={() => resetFilters()}
                      className='text-sm hover:underline text-gray-900 dark:text-gray-100'
                    >
                      {t('Common.Reset filters')}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    )
  },
)

AnnouncementFilter.displayName = 'AnnouncementFilter'
