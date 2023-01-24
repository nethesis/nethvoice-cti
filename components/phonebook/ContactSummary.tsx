// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, MutableRefObject, useRef, useState } from 'react'
import classNames from 'classnames'
import { Avatar, Button, Dropdown, Modal } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { callPhoneNumber, closeSideDrawer } from '../../lib/utils'
import {
  faEllipsisVertical,
  faPen,
  faPhone,
  faSuitcase,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import {
  faEnvelope,
  faEye,
  faFileLines,
  faTrashCan,
  faUser,
} from '@fortawesome/free-regular-svg-icons'
import {
  deleteContact,
  fetchContact,
  openEditContactDrawer,
  reloadPhonebook,
} from '../../lib/phonebook'

export interface ContactSummaryProps extends ComponentPropsWithRef<'div'> {
  contact: any
  isShownContactMenu: boolean
}

export const ContactSummary = forwardRef<HTMLButtonElement, ContactSummaryProps>(
  ({ contact, isShownContactMenu, className, ...props }, ref) => {
    const auth = useSelector((state: RootState) => state.authentication)
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const [contactToDelete, setContactToDelete] = useState<any>(null)
    const cancelDeleteButtonRef = useRef() as MutableRefObject<HTMLButtonElement>

    const contactMenuItems = (
      <>
        <Dropdown.Item icon={faPen} onClick={() => openEditContactDrawer(contact)}>
          Edit
        </Dropdown.Item>
        <Dropdown.Item icon={faTrashCan} onClick={() => showDeleteContactModal(contact)}>
          Delete
        </Dropdown.Item>
      </>
    )

    const showDeleteContactModal = (contact: any) => {
      setContactToDelete(contact)
      setShowDeleteModal(true)
    }

    const prepareDeleteContact = async () => {
      if (contactToDelete.id) {
        deleteContact(contactToDelete.id.toString())

        //// TODO show toast notification

        reloadPhonebook()
        setShowDeleteModal(false)
        setContactToDelete(null)
        closeSideDrawer()
      }
    }

    return (
      <>
        {/* delete contact modal */}
        <Modal
          show={showDeleteModal}
          focus={cancelDeleteButtonRef}
          onClose={() => setShowDeleteModal(false)}
          afterLeave={() => setContactToDelete(null)}
        >
          <Modal.Content>
            <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 bg-red-100 dark:bg-red-900'>
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className='h-6 w-6 text-red-600 dark:text-red-200'
                aria-hidden='true'
              />
            </div>
            <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100'>
                Delete contact
              </h3>
              <div className='mt-2'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  Contact <strong>{contactToDelete?.displayName || ''}</strong> will be permanently
                  deleted.
                </p>
              </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button variant='danger' onClick={() => prepareDeleteContact()}>
              Delete contact
            </Button>
            <Button
              variant='white'
              onClick={() => setShowDeleteModal(false)}
              ref={cancelDeleteButtonRef}
            >
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
        <div
          className={classNames('flex min-w-0 items-center justify-between', className)}
          {...props}
        >
          <div className='flex items-center'>
            <div className='flex-shrink-0 mr-4'>
              {contact.kind == 'person' ? (
                <Avatar placeholderType='person' />
              ) : (
                <Avatar placeholderType='company' />
              )}
            </div>
            <h2 className='text-xl font-medium text-gray-900 dark:text-gray-100'>
              {contact.displayName}
            </h2>
          </div>
          {/* contact menu */}
          {isShownContactMenu && contact.owner_id === auth.username && (
            <div>
              <Dropdown
                items={contactMenuItems}
                position='left'
                divider={true}
                className='mt-1'
              >
                <Button variant='ghost'>
                  <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                  <span className='sr-only'>Open contact menu</span>
                </Button>
              </Dropdown>
            </div>
          )}
        </div>
        <div className='mt-5 border-t border-gray-200 dark:border-gray-700'>
          <dl>
            {/* company */}
            {contact.kind == 'person' && contact.company && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Company</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faSuitcase}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <span>{contact.company}</span>
                  </div>
                </dd>
              </div>
            )}
            {/* extension */}
            {contact.extension && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Extension</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primary'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() => callPhoneNumber(contact.extension)}
                    >
                      {contact.extension}
                    </span>
                  </div>
                </dd>
              </div>
            )}
            {/* work phone */}
            {contact.workphone && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Work</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primary'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() => callPhoneNumber(contact.workphone)}
                    >
                      {contact.workphone}
                    </span>
                  </div>
                </dd>
              </div>
            )}
            {/* mobile phone */}
            {contact.cellphone && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Mobile phone
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primary'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() => callPhoneNumber(contact.cellphone)}
                    >
                      {contact.cellphone}
                    </span>
                  </div>
                </dd>
              </div>
            )}
            {/* work email */}
            {contact.workemail && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Email</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <a
                      target='_blank'
                      rel='noreferrer'
                      href={`mailto: ${contact.workemail}`}
                      className='truncate hover:underline text-gray-900 dark:text-gray-100'
                    >
                      {contact.workemail}
                    </a>
                  </div>
                </dd>
              </div>
            )}
            {/* notes */}
            {contact.notes && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Notes</dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faFileLines}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                      aria-hidden='true'
                    />
                    <div>{contact.notes}</div>
                  </div>
                </dd>
              </div>
            )}
            {/* company contacts */}
            {contact.contacts && contact.contacts.length ? (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                  Company contacts
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <ul role='list'>
                    {contact.contacts.map((contact: any, index: number) => (
                      <li
                        key={index}
                        className='flex items-center justify-between pb-3 pr-4 text-sm'
                      >
                        <div className='flex w-0 flex-1 items-center'>
                          <FontAwesomeIcon
                            icon={faUser}
                            className='h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                            aria-hidden='true'
                          />
                          <span
                            className='ml-2 w-0 flex-1 truncate text-primary dark:text-primary cursor-pointer'
                            onClick={() => fetchContact(contact.id, contact.source)}
                          >
                            {contact.name}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {/* visibility */}
            <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
              <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Visibility</dt>
              <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm'>
                  <FontAwesomeIcon
                    icon={faEye}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                    aria-hidden='true'
                  />
                  <span className='truncate'>
                    {contact.type === 'private' && contact.source === 'cti' ? 'Only me' : 'Public'}
                  </span>
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </>
    )
  },
)

ContactSummary.displayName = 'ContactSummary'
