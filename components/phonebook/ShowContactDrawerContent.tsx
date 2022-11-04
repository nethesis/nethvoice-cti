// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { Avatar, Button, Dropdown } from '../common'
import {
  MdEmail,
  MdPhone,
  MdPhoneAndroid,
  MdOutlineWork,
  MdPeople,
  MdMoreVert,
  MdEdit,
  MdDelete,
} from 'react-icons/md'
import { getContact, mapContact, showContact } from '../../lib/phonebook'

export interface ShowContactDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowContactDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowContactDrawerContentProps
>(({ config, className, ...props }, ref) => {
  async function fetchContact(contactId: number) {
    const res = await getContact(contactId)
    const contact = mapContact(res)
    showContact(contact)
  }

  const contactMenuItems = (
    <>
      <Dropdown.Item icon={MdEdit}>Edit</Dropdown.Item>
      <Dropdown.Item icon={MdDelete}>Delete</Dropdown.Item>
    </>
  )

  return (
    <div className={classNames(className)} {...props}>
      <div className='flex min-w-0 flex-1 items-center justify-between'>
        <div className='flex items-center'>
          <div className='flex-shrink-0 mr-4'>
            {config.kind == 'person' ? (
              <Avatar placeholderType='person' />
            ) : (
              <Avatar placeholderType='company' />
            )}
          </div>
          <h2 className='text-xl font-medium text-gray-900'>{config.displayName}</h2>
        </div>
        <div>
          <Dropdown items={contactMenuItems} position='left' divider={true} className='mr-1 mt-1'>
            <Button variant='white'>
              <MdMoreVert className='h-4 w-4' />
              <span className='sr-only'>Open contact menu</span>
            </Button>
          </Dropdown>
        </div>
      </div>
      <div className='mt-5 border-t border-gray-200'>
        <dl className='sm:divide-y sm:divide-gray-200'>
          {config.kind == 'person' && config.company && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500'>Company</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm'>
                  <MdOutlineWork
                    className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                    aria-hidden='true'
                  />
                  <span>{config.company}</span>
                </div>
              </dd>
            </div>
          )}
          {/* work phone */}
          {config.workphone && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500'>Work phone</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm text-sky-600'>
                  <MdPhone
                    className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                    aria-hidden='true'
                  />
                  <span className='truncate cursor-pointer'>{config.workphone}</span>
                </div>
              </dd>
            </div>
          )}
          {/* mobile phone */}
          {config.cellphone && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500'>Mobile phone</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm text-sky-600'>
                  <MdPhoneAndroid
                    className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                    aria-hidden='true'
                  />
                  <span className='truncate cursor-pointer'>{config.cellphone}</span>
                </div>
              </dd>
            </div>
          )}
          {/* work email */}
          {config.workemail && (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500'>Work email</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm text-sky-600'>
                  <MdEmail
                    className='mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400'
                    aria-hidden='true'
                  />
                  <a
                    target='_blank'
                    rel='noreferrer'
                    href={`mailto: ${config.workemail}`}
                    className='truncate'
                  >
                    {config.workemail}
                  </a>
                </div>
              </dd>
            </div>
          )}
          {/* company contacts */}
          {config.contacts && config.contacts.length ? (
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500'>Company contacts</dt>
              <dd className='mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0'>
                <ul role='list'>
                  {config.contacts.map((config: any, index: number) => (
                    <li key={index} className='flex items-center justify-between pb-3 pr-4 text-sm'>
                      <div className='flex w-0 flex-1 items-center'>
                        <MdPeople
                          className='h-5 w-5 flex-shrink-0 text-gray-400'
                          aria-hidden='true'
                        />
                        <span
                          className='ml-2 w-0 flex-1 truncate text-sky-600 cursor-pointer'
                          onClick={() => fetchContact(config.id)}
                        >
                          {config.name}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ) : null}
        </dl>
      </div>
    </div>
  )
})

ShowContactDrawerContent.displayName = 'ShowContactDrawerContent'
