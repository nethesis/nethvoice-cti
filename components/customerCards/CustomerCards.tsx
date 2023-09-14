// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faIdCard,
  faPhone,
  faMobileScreenButton,
  faEnvelope,
  faPen,
  faMapSigns,
} from '@fortawesome/free-solid-svg-icons'
import { LastCallsDrawerTable } from '../history/LastCallsDrawerTable'
import { startOfDay, subDays } from 'date-fns'
import { isEmpty } from 'lodash'
import { Avatar, EmptyState } from '../common'
import { getPhonebook, retrieveContact } from '../../lib/phonebook'
import { callPhoneNumber, openEmailClient } from '../../lib/utils'
import { Tooltip } from 'react-tooltip'

export interface CustomerCardsCustomerDataViewProps extends ComponentProps<'div'> {
  companyInformation: any
  companyExtension: any
  contactType: any
}

export const CustomerCardsCustomerData: FC<CustomerCardsCustomerDataViewProps> = ({
  className,
  companyInformation,
  companyExtension,
  contactType,
}): JSX.Element => {
  const { t } = useTranslation()

  const [companyContacts, setCompanyContacts] = useState<any[]>([])

  useEffect(() => {
    if (
      !isEmpty(companyInformation) &&
      isEmpty(companyContacts) &&
      contactType &&
      contactType === 'company'
    ) {
      let contactInformationUsers = JSON.parse(companyInformation?.contacts)

      const fetchContactDetails = async (contactId: any) => {
        try {
          const contactDetails = await retrieveContact(contactId)
          setCompanyContacts((prevCompanyContacts) => [...prevCompanyContacts, contactDetails])
        } catch (error) {
          console.error(error)
        }
      }

      contactInformationUsers.forEach((contact: any) => {
        fetchContactDetails(contact.id)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyInformation])

  const [companyCardInformation, setcompanyCardInformation] = useState<any>([])

  // Get Company card information from company name
  useEffect(() => {
    async function searchCompanyCardInformation() {
      if (
        isEmpty(companyCardInformation) &&
        contactType &&
        contactType === 'person' &&
        companyInformation &&
        companyInformation?.company
      ) {
        try {
          //Remove space and slash characters
          let noSlashCharactersCompanyInformation = companyInformation?.company?.replace(/\//g, '')
          const res = await getPhonebook(1, noSlashCharactersCompanyInformation, 'company', 'name')
          let companyAllInformation = res?.rows[0]
          setcompanyCardInformation(companyAllInformation)
        } catch (e) {
          console.error(e)
          return []
        }
      }
    }
    searchCompanyCardInformation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyInformation])

  return (
    <>
      <div className='py-2 relative mt-8'>
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
          {' '}
          {/* Middle left  */}
          <div>
            <div className='border-b border-gray-600 dark:border-gray-100 rounded-md bg-gray-700 dark:bg-gray-200 px-4 py-5 sm:px-6 flex-col h-[337px] overflow-auto'>
              {contactType === 'company' ? (
                <>
                  {/* Company name  */}
                  <h3 className='flex text-base font-semibold leading-6 text-gray-100 dark:text-gray-700'>
                    {t('CustomerCards.Business name')}
                  </h3>
                  <span className='flex pt-2 text-md font-medium text-primaryLight dark:text-primary'>
                    {companyInformation?.company || '-'}
                  </span>
                  {/* Company city address */}
                  <h3 className='flex text-base font-semibold leading-6 text-gray-100 dark:text-gray-700 pt-6'>
                    {t('CustomerCards.City')}
                  </h3>
                  <span className='flex pt-2 text-md font-normal text-gray-100 dark:text-primary'>
                    {companyInformation?.city || '-'}
                  </span>
                  {/* Company notes  */}
                  <h3 className='flex text-base font-semibold leading-6 text-gray-100 dark:text-gray-700 pt-6'>
                    {t('CustomerCards.Notes')}
                  </h3>
                  <span className='flex pt-2 text-md font-normal text-gray-100 dark:text-primary'>
                    {companyInformation?.notes || '-'}
                  </span>{' '}
                </>
              ) : (
                <>
                  {/* Contact name  */}
                  <h3 className='flex text-base font-semibold leading-6 text-gray-100 dark:text-gray-700'>
                    {t('CustomerCards.Contact name')}
                  </h3>
                  <span className='flex pt-2 text-md font-medium text-primaryLight dark:text-primary'>
                    {companyInformation?.name || '-'}
                  </span>
                  {/* Contact city address */}
                  <h3 className='flex text-base font-semibold leading-6 text-gray-100 dark:text-gray-700 pt-6'>
                    {t('CustomerCards.City')}
                  </h3>
                  <span className='flex pt-2 text-md font-normal text-gray-100 dark:text-primary'>
                    {companyInformation?.workcity || '-'}
                  </span>
                  {/* Contact email  */}
                  <h3 className='flex text-base font-semibold leading-6 text-gray-100 dark:text-gray-700 pt-6'>
                    {t('CustomerCards.Email')}
                  </h3>
                  <span className='flex pt-2 text-md font-normal text-gray-100 dark:text-primary'>
                    {companyInformation?.homeemail || companyInformation?.workemail || '-'}
                  </span>{' '}
                  {/* Contact notes  */}
                  <h3 className='flex text-base font-semibold leading-6 text-gray-100 dark:text-gray-700 pt-6'>
                    {t('CustomerCards.Notes')}
                  </h3>
                  <span className='flex pt-2 text-md font-normal text-gray-100 dark:text-primary'>
                    {companyInformation?.notes || '-'}
                  </span>{' '}
                </>
              )}
            </div>
          </div>
          {/* Middle right ( Operators ) */}
          <div className='sm:col-span-2'>
            <div className='border-b rounded-md border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-1 sm:px-6 h-full max-h-[337px] overflow-auto'>
              <LastCallsDrawerTable
                callType={'switchboard'}
                dateFrom={startOfDay(subDays(new Date(), 7))}
                dateTo={new Date()}
                phoneNumbers={[companyExtension]}
                limit={5}
                isCustomerCard={true}
                className=''
              />
            </div>
          </div>
        </div>

        {/* If contactType is equal to company show contact cards else show company informations */}
        <div className='pt-12'>
          {contactType === 'company' ? (
            <>
              {/* Company contact cards */}
              <h3 className='flex text-base font-semibold leading-6 text-gray-700 dark:text-gray-200'>
                {t('CustomerCards.Contacts')}
              </h3>

              <div className='pt-4 relative mt-4'>
                <div className='mx-auto text-center'>
                  {/* no search results */}
                  {isEmpty(companyContacts) && (
                    <EmptyState
                      title={t('CustomerCards.No contacts found')}
                      description={t('CustomerCards.This company has no contacts') || ''}
                      icon={
                        <FontAwesomeIcon
                          icon={faIdCard}
                          className='mx-auto h-12 w-12'
                          aria-hidden='true'
                        />
                      }
                    />
                  )}
                  <ul role='list' className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3'>
                    {companyContacts.map((contact, index) => {
                      return (
                        <li
                          key={index}
                          className='col-span-1 rounded-md shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'
                        >
                          {/* card header */}
                          <div className='flex flex-col pt-3 pb-5 px-5'>
                            <div className='flex w-full items-center justify-between space-x-6'>
                              <div className='flex-1 truncate'>
                                <div className='flex items-center space-x-2 py-2 text-gray-700 dark:text-gray-200'>
                                  <div className='flex items-center'>
                                    <div className='h-10 w-10 flex-shrink-0'>
                                      {' '}
                                      <Avatar
                                        className='cursor-pointer'
                                        placeholderType='person'
                                        // onClick={() => openShowContactDrawer(contact)}
                                      />
                                    </div>
                                    <div className='ml-4'>
                                      <div
                                        className='font-medium text-gray-700 dark:text-gray-100'
                                        // onClick={() => openShowContactDrawer(contact)}
                                      >
                                        {' '}
                                        <span className='cursor-pointer hover:underline'>
                                          {contact.name}
                                        </span>
                                      </div>
                                      {/* Contact notes */}
                                      {contact.notes && (
                                        <div className='mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                                          <span className='truncate text-dark-700 dark:text-dark-200 '>
                                            {contact.notes}
                                          </span>
                                        </div>
                                      )}
                                      <div className='text-gray-500'></div>
                                    </div>
                                  </div>
                                </div>

                                <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600 '>
                                  <tbody className='divide-y divide-gray-200 dark:divide-gray-500'>
                                    {/* Office number  */}
                                    <tr>
                                      <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                        {t('CustomerCards.Office')}
                                      </td>
                                      <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                        <FontAwesomeIcon
                                          icon={faPhone}
                                          className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                          aria-hidden='true'
                                        />
                                        <span
                                          className='truncate dark:text-primary cursor-pointer text-primary ml-2'
                                          onClick={() => callPhoneNumber(contact.workphone)}
                                        >
                                          {contact.workphone || '-'}
                                        </span>
                                      </td>
                                    </tr>

                                    <tr>
                                      {/* Mobile number  */}
                                      <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                        {t('CustomerCards.Mobile')}
                                      </td>
                                      <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                        <FontAwesomeIcon
                                          icon={faMobileScreenButton}
                                          className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                          aria-hidden='true'
                                        />
                                        <span
                                          className='truncate dark:text-primary cursor-pointer text-primary ml-2'
                                          onClick={() => callPhoneNumber(contact.cellphone)}
                                        >
                                          {contact.cellphone || '-'}
                                        </span>
                                      </td>
                                    </tr>

                                    <tr>
                                      {/* Email contact */}
                                      <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                        {t('CustomerCards.Email')}
                                      </td>
                                      <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                        <FontAwesomeIcon
                                          icon={faEnvelope}
                                          className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                          aria-hidden='true'
                                        />
                                        <span
                                          className='truncate dark:text-primary cursor-pointer text-primary ml-2'
                                          onClick={() =>
                                            openEmailClient(
                                              contact.workemail || contact.homeemail || '',
                                            )
                                          }
                                        >
                                          {contact.workemail || contact.homeemail || '-'}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Company contact cards */}
              <h3 className='flex text-base font-semibold leading-6 text-gray-700 dark:text-gray-200'>
                {t('CustomerCards.Company')}
              </h3>

              <div className='pt-4 relative mt-4'>
                <div className='mx-auto text-center'>
                  {/* no search results */}
                  {companyInformation?.company === '' ? (
                    <EmptyState
                      title={t('CustomerCards.No company found')}
                      description={t('CustomerCards.This user has no company informations') || ''}
                      icon={
                        <FontAwesomeIcon
                          icon={faIdCard}
                          className='mx-auto h-12 w-12'
                          aria-hidden='true'
                        />
                      }
                    />
                  ) : (
                    <ul
                      role='list'
                      className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3'
                    >
                      <li className='col-span-1 rounded-md shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                        {/* card header */}
                        <div className='flex flex-col pt-3 pb-5 px-5'>
                          <div className='flex w-full items-center justify-between space-x-6'>
                            <div className='flex-1 truncate'>
                              <div className='flex items-center space-x-2 py-2 text-gray-700 dark:text-gray-200'>
                                <div className='flex items-center'>
                                  <div className='h-10 w-10 flex-shrink-0'>
                                    {' '}
                                    <Avatar
                                      // className='cursor-pointer'
                                      placeholderType='company'
                                      // onClick={() => openShowContactDrawer(contact)}
                                    />
                                  </div>
                                  <div className='ml-4'>
                                    <div
                                      className='font-medium text-gray-700 dark:text-gray-100'
                                      // onClick={() => openShowContactDrawer(contact)}
                                    >
                                      {' '}
                                      <span
                                      // className='cursor-pointer hover:underline'
                                      >
                                        {companyCardInformation?.company}
                                      </span>
                                    </div>
                                    {/* Contact notes */}
                                    {companyInformation?.notes && (
                                      <div className='mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400'>
                                        <span className='truncate text-dark-700 dark:text-dark-200 '>
                                          {companyCardInformation?.notes}
                                        </span>
                                      </div>
                                    )}
                                    <div className='text-gray-500'></div>
                                  </div>
                                </div>
                              </div>

                              <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600 '>
                                <tbody className='divide-y divide-gray-200 dark:divide-gray-500'>
                                  <tr>
                                    <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                      {t('CustomerCards.Office')}
                                    </td>
                                    <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                      <FontAwesomeIcon
                                        icon={faPhone}
                                        className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                        aria-hidden='true'
                                      />
                                      <span
                                        className='truncate dark:text-primary cursor-pointer text-primary ml-2'
                                        onClick={() =>
                                          callPhoneNumber(companyCardInformation?.workphone)
                                        }
                                      >
                                        {companyCardInformation?.workphone || '-'}
                                      </span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                      {t('CustomerCards.Mobile')}
                                    </td>
                                    <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                      <FontAwesomeIcon
                                        icon={faMobileScreenButton}
                                        className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                        aria-hidden='true'
                                      />
                                      <span
                                        className='truncate dark:text-primary cursor-pointer text-primary ml-2'
                                        onClick={() =>
                                          callPhoneNumber(companyCardInformation?.cellphone)
                                        }
                                      >
                                        {companyCardInformation?.cellphone || '-'}
                                      </span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                      {t('CustomerCards.Email')}
                                    </td>
                                    <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                      <FontAwesomeIcon
                                        icon={faEnvelope}
                                        className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                        aria-hidden='true'
                                      />
                                      <span
                                        className='truncate dark:text-primary cursor-pointer text-primary ml-2'
                                        onClick={() =>
                                          openEmailClient(
                                            companyCardInformation?.workemail ||
                                              companyCardInformation?.homeemail ||
                                              '',
                                          )
                                        }
                                      >
                                        {companyCardInformation?.workemail ||
                                          companyCardInformation?.homeemail ||
                                          '-'}
                                      </span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                      {t('CustomerCards.Notes')}
                                    </td>
                                    <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                      <FontAwesomeIcon
                                        icon={faPen}
                                        className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                        aria-hidden='true'
                                      />
                                      <span className='truncate dark:text-gray-200 text-gray-700 w-56 tooltip-notes ml-2'>
                                        {companyCardInformation?.notes || '-'}
                                      </span>
                                      <Tooltip anchorSelect='.tooltip-notes'>
                                        {companyCardInformation?.notes || '-'}
                                      </Tooltip>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className='py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-200'>
                                      {t('CustomerCards.Address')}
                                    </td>
                                    <td className='flex items-center px-3 py-4 text-sm text-gray-500'>
                                      <FontAwesomeIcon
                                        icon={faMapSigns}
                                        className='h-4 w-4 mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                        aria-hidden='true'
                                      />
                                      <span className='truncate dark:text-gray-200 text-gray-700 w-56 tooltip-address ml-2'>
                                        {companyCardInformation?.workstreet || '-'}
                                      </span>
                                      <Tooltip anchorSelect='.tooltip-address'>
                                        {companyCardInformation?.workstreet || '-'}
                                      </Tooltip>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

CustomerCardsCustomerData.displayName = 'CustomerCardsCustomerData'