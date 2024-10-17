// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  ComponentPropsWithRef,
  useEffect,
  forwardRef,
  MutableRefObject,
  useRef,
  useState,
} from 'react'
import classNames from 'classnames'
import { Avatar, Button, Dropdown, Modal } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { callPhoneNumber, closeSideDrawer, transferCallToExtension } from '../../lib/utils'
import { startOfDay, subDays } from 'date-fns'
import {
  faEllipsisVertical,
  faPen,
  faPhone,
  faSuitcase,
  faTriangleExclamation,
  faEye,
  faEnvelope,
  faFileLines,
  faTrash,
  faUser,
  faClone,
} from '@fortawesome/free-solid-svg-icons'
import {} from '@fortawesome/free-regular-svg-icons'
import {
  deleteContact,
  fetchContact,
  getPhonebook,
  openEditContactDrawer,
  openShowContactDrawer,
  reloadPhonebook,
} from '../../lib/phonebook'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/router'
import { LastCallsDrawerTable } from '../history/LastCallsDrawerTable'
import CopyComponent from '../common/CopyComponent'

export interface ContactSummaryProps extends ComponentPropsWithRef<'div'> {
  contact: any
  isShownContactMenu: boolean
  isShownSideDrawerLink: boolean
  isGlobalSearch?: boolean
}

export const ContactSummary = forwardRef<HTMLButtonElement, ContactSummaryProps>(
  (
    {
      contact,
      isShownContactMenu,
      isShownSideDrawerLink = false,
      isGlobalSearch,
      className,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation()
    const auth = useSelector((state: RootState) => state.authentication)
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const [contactToDelete, setContactToDelete] = useState<any>(null)
    const cancelDeleteButtonRef = useRef() as MutableRefObject<HTMLButtonElement>
    const { profile } = useSelector((state: RootState) => state.user)

    const [copied, setCopied] = useState<boolean>(false)

    const operatorsStore = useSelector((state: RootState) => state.operators)

    //Get sideDrawer status from store
    const sideDrawer = useSelector((state: RootState) => state.sideDrawer)

    //Get global search status from store
    const globalSearchStore = useSelector((state: RootState) => state.globalSearch)

    const contactMenuItems = (
      <>
        <Dropdown.Item icon={faPen} onClick={() => openEditContactDrawer(contact)}>
          {t('Common.Edit')}
        </Dropdown.Item>
        <Dropdown.Item icon={faTrash} onClick={() => showDeleteContactModal(contact)}>
          {t('Common.Delete')}
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

    const maybeShowSideDrawer = (contact: any) => {
      if (!isShownSideDrawerLink) {
        return
      }
      // close global search
      openShowContactDrawer(contact)
      store.dispatch.globalSearch.setOpen(false)
      store.dispatch.globalSearch.setFocused(false)

      // To avoid blur effect when click on operator information
      store.dispatch.globalSearch.setRightSideTitleClicked(true)
    }

    const router = useRouter()

    function goToCCardCompany(companyExtension: any) {
      let phoneNumber
      // companyExtension.kind doesn't exist set person to default
      let contactType = companyExtension?.kind || 'person'

      // Priority: workphone -> cellphone -> homephone
      if (companyExtension.workphone) {
        phoneNumber = companyExtension.workphone
      } else if (companyExtension.cellphone) {
        phoneNumber = companyExtension.cellphone
      } else if (companyExtension.homephone) {
        phoneNumber = companyExtension.homephone
      }

      // If phoneNumber and contactType is defined, add to customercards path
      if (phoneNumber && contactType) {
        router.push(`/customercards#${phoneNumber}-${contactType}`)

        // Close side drawer after click open customer cards
        if (sideDrawer?.isShown) {
          store.dispatch.sideDrawer.setShown(false)
        }

        // Close global search after click open customer cards
        if (globalSearchStore?.isOpen) {
          store.dispatch.globalSearch.setOpen(false)
          store.dispatch.globalSearch.setCustomerCardsRedirect(true)
        }
      }
    }

    const [companyInformation, setCompanyInformation] = useState<any>([])

    // Get all company information
    useEffect(() => {
      async function searchCompanyInformation() {
        if (contact && contact?.kind === 'person' && contact?.company) {
          try {
            //Remove space and slash characters
            let noSlashCharactersCompanyInformation = contact?.company?.replace(/\//g, '')
            const res = await getPhonebook(
              1,
              noSlashCharactersCompanyInformation,
              'company',
              'name',
            )
            let companyAllInformation = res?.rows[0]
            setCompanyInformation(companyAllInformation)
          } catch (e) {
            console.error(e)
            return []
          }
        }
      }
      searchCompanyInformation()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contact])

    const companyInformationData = () => {
      return (
        <div className='pb-8'>
          <div className='border-gray-600 dark:border-gray-100 bg-gray-100 dark:bg-gray-800 rounded-md py-4 sm:px-5 flex-col'>
            {/* Company name  */}
            <h3 className='flex text-sm font-medium leading-5 text-gray-900 dark:text-gray-50'>
              {t('CustomerCards.Business name')}
            </h3>
            <span className='flex pt-2 text-base font-normal text-gray-600 dark:text-gray-300'>
              {companyInformation?.company || '-'}
            </span>

            {/* Company city address */}
            <h3 className='flex text-sm font-medium leading-5 text-gray-900 dark:text-gray-50 pt-8'>
              {t('CustomerCards.City')}
            </h3>
            <span className='flex pt-2 text-base font-normal text-gray-600 dark:text-gray-300'>
              {companyInformation?.workcity || '-'}
            </span>

            {/* Company notes  */}
            <h3 className='flex text-sm font-medium leading-5 text-gray-900 dark:text-gray-50 pt-8'>
              {t('CustomerCards.Notes')}
            </h3>
            <span className='flex pt-2 text-base font-normal text-gray-600 dark:text-gray-300'>
              {companyInformation?.notes || '-'}
            </span>
          </div>
        </div>
      )
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
                {t('Phonebook.Delete contact')}
              </h3>
              <div className='mt-3'>
                <p className='text-sm text-gray-500 dark:text-gray-400'>
                  {t('Phonebook.contactDeletionMessage', {
                    name: contactToDelete?.displayName || '-',
                  })}
                </p>
              </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button variant='danger' onClick={() => prepareDeleteContact()}>
              {t('Phonebook.Delete contact')}
            </Button>
            <Button
              variant='ghost'
              onClick={() => setShowDeleteModal(false)}
              ref={cancelDeleteButtonRef}
            >
              {t('Common.Cancel')}
            </Button>
          </Modal.Actions>
        </Modal>
        <div
          className={classNames('flex min-w-0 items-center justify-between', className)}
          {...props}
        >
          <div className='flex items-center'>
            <div className='flex-shrink-0 mr-4'>
              <Avatar
                placeholderType={contact.kind}
                onClick={() => maybeShowSideDrawer(contact)}
                className={classNames(isShownSideDrawerLink && 'cursor-pointer')}
              />
            </div>
            <h2
              className={classNames(
                'text-xl font-medium text-gray-900 dark:text-gray-100',
                isShownSideDrawerLink && 'cursor-pointer hover:underline',
              )}
              onClick={() => maybeShowSideDrawer(contact)}
            >
              {contact?.displayName !== '' && contact?.displayName !== ' '
                ? contact?.displayName
                : contact?.name !== '' && contact?.name !== ' '
                ? contact?.name
                : contact?.company && contact?.company !== '' && contact?.company !== ' '
                ? contact?.company
                : '-'}
            </h2>
          </div>

          {/* contact menu */}
          {isShownContactMenu &&
            (contact?.owner_id === auth?.username ||
              (!(contact?.owner_id === auth?.username) &&
                contact?.source === 'cti' &&
                profile?.macro_permissions?.phonebook?.permissions?.ad_phonebook?.value &&
                contact?.type === 'public')) && (
              <div>
                <Dropdown
                  items={contactMenuItems}
                  position='left'
                  divider={true}
                  className='mt-1 mr-2'
                >
                  <Button variant='ghost'>
                    <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                    <span className='sr-only'>{t('Phonebook.Open contact menu')}</span>
                  </Button>
                </Dropdown>
              </div>
            )}
        </div>
        <div className='mt-5 pb-5'>
          <dl>
            {/* company */}
            {contact.kind == 'person' && contact.company && (
              <div className='pb-4 sm:grid sm:grid-cols-3 sm:gap-4'>
                <dt className='text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Company')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faSuitcase}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                      aria-hidden='true'
                    />
                    <span>{contact?.company}</span>
                  </div>
                </dd>
              </div>
            )}
            {/* extension */}
            {contact.extension && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Extension')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm font-normal text-primary dark:text-primaryDark'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() =>
                        operatorsStore?.operators[auth.username]?.mainPresence === 'busy'
                          ? transferCallToExtension(contact?.extension)
                          : callPhoneNumber(contact?.extension)
                      }
                    >
                      {contact?.extension}
                    </span>
                    {/* copy component */}
                    <CopyComponent number={contact?.extension} id='extension' />
                  </div>
                </dd>
              </div>
            )}
            {/* work phone */}
            {contact.workphone && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Work phone')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primaryDark'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() =>
                        operatorsStore?.operators[auth.username]?.mainPresence === 'busy'
                          ? transferCallToExtension(contact?.workphone)
                          : callPhoneNumber(contact?.workphone)
                      }
                    >
                      {contact?.workphone}
                    </span>
                    {/* copy component */}
                    <CopyComponent number={contact?.workphone} id='workphone' />
                  </div>
                </dd>
              </div>
            )}
            {/* mobile phone */}
            {contact.cellphone && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Mobile phone')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primaryDark'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() =>
                        operatorsStore?.operators[auth.username]?.mainPresence === 'busy'
                          ? transferCallToExtension(contact?.cellphone)
                          : callPhoneNumber(contact?.cellphone)
                      }
                    >
                      {contact?.cellphone}
                    </span>
                    {/* copy component */}
                    <CopyComponent number={contact?.cellphone} id='mobile-phone' />
                  </div>
                </dd>
              </div>
            )}
            {/* home phone */}
            {contact.homephone && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='flex items-center text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Home phone')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm text-primary dark:text-primaryDark'>
                    <FontAwesomeIcon
                      icon={faPhone}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                      aria-hidden='true'
                    />
                    <span
                      className='truncate cursor-pointer hover:underline'
                      onClick={() =>
                        operatorsStore?.operators[auth.username]?.mainPresence === 'busy'
                          ? transferCallToExtension(contact?.homephone)
                          : callPhoneNumber(contact?.homephone)
                      }
                    >
                      {contact?.homephone}
                    </span>
                    {/* copy component */}
                    <CopyComponent number={contact?.homephone} id='home-phone' />
                  </div>
                </dd>
              </div>
            )}
            {/* work email */}
            {contact.workemail && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Email')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                      aria-hidden='true'
                    />
                    <a
                      target='_blank'
                      rel='noreferrer'
                      href={`mailto: ${contact?.workemail}`}
                      className='truncate hover:underline text-gray-900 dark:text-gray-100'
                    >
                      {contact?.workemail}
                    </a>
                  </div>
                </dd>
              </div>
            )}
            {/* notes */}
            {contact?.notes && (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Notes')}
                </dt>
                <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                  <div className='flex items-center text-sm'>
                    <FontAwesomeIcon
                      icon={faFileLines}
                      className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                      aria-hidden='true'
                    />
                    <div>{contact?.notes}</div>
                  </div>
                </dd>
              </div>
            )}
            {/* company contacts */}
            {contact?.contacts && contact?.contacts?.length ? (
              <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                <dt className='text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                  {t('Phonebook.Company contacts')}
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
                            className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                            aria-hidden='true'
                          />
                          <span
                            className='ml-2 w-0 flex-1 truncate text-primary dark:text-primaryDark cursor-pointer'
                            onClick={() => fetchContact(contact?.id, contact?.source)}
                          >
                            {contact?.name}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
            {/* visibility */}
            <div className='pt-4 pb-8 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5'>
              <dt className='text-sm font-medium text-gray-700 dark:text-gray-200 leading-5'>
                {' '}
                {t('Phonebook.Visibility')}
              </dt>
              <dd className='mt-1 text-sm font-normal text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                <div className='flex items-center text-sm'>
                  <FontAwesomeIcon
                    icon={faEye}
                    className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-300'
                    aria-hidden='true'
                  />
                  <span className='truncate'>
                    {contact?.type === 'private' && contact?.source === 'cti'
                      ? `${t('Phonebook.Only me')}`
                      : `${t('Phonebook.Public')}`}
                  </span>
                </div>
              </dd>
            </div>

            {contact?.kind === 'person' && (
              <div>
                {/* Avoid show company information if contact has no informations */}
                {(companyInformation?.company ||
                  companyInformation?.workcity ||
                  companyInformation?.notes) &&
                  companyInformationData()}

                {/* check if user has customer cards permission */}
                {profile?.macro_permissions?.customer_card?.value && (
                  <div className='flex'>
                    <Button
                      size='small'
                      variant='white'
                      className={`${
                        contact?.workphone || contact?.homephone || contact?.cellphone
                          ? ''
                          : 'hidden'
                      }`}
                      onClick={() => goToCCardCompany(contact)}
                    >
                      <span className='text-sm font-medium leading-5'>
                        {t('CustomerCards.Open customer card')}
                      </span>
                    </Button>
                  </div>
                )}

                {/* User last calls informations */}
                <div className='h-full'>
                  <LastCallsDrawerTable
                    callType={'switchboard'}
                    dateFrom={startOfDay(subDays(new Date(), 7))}
                    dateTo={new Date()}
                    phoneNumbers={[
                      contact?.extension ||
                        contact?.workphone ||
                        contact?.cellphone ||
                        contact?.homephone,
                    ]}
                    limit={10}
                    isCustomerCard={true}
                  />
                </div>
              </div>
            )}
          </dl>
        </div>
      </>
    )
  },
)

ContactSummary.displayName = 'ContactSummary'
