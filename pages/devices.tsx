// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  faChevronRight,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import { faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'
import { openShowEditPhysicalPhone } from '../lib/devices'

const Devices: NextPage = () => {
  const { t } = useTranslation()
  const operators = useSelector((state: RootState) => state.operators.operators)
  const profile = useSelector((state: RootState) => state.user)

  console.log('this is profile', profile)

  const [phoneData, setPhoneData]: any = useState([])

  useEffect(() => {
    // filter phone and insert only physical phones
    if (profile?.endpoints) {
      let endpointsInformation = profile?.endpoints
      if (endpointsInformation?.extension) {
        setPhoneData(endpointsInformation?.extension.filter((phone) => phone?.type === 'physical'))
      }
    }
  }, [profile?.endpoints])

  return (
    <>
      <section aria-labelledby='clear-cache-heading'>
        <div className='sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            {/* Title */}
            <div>
              <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                {t('Settings.Devices')}
              </h2>
            </div>

            {/* TO DO - Move this section in a separate component */}
            {/* Web phone section */}
            <div>
              <div className='flex items-center space-x-2'>
                <FontAwesomeIcon
                  icon={faHeadset}
                  className='h-4 w-4 flex justify-center text-gray-700 dark:text-gray-500'
                />
                <span>{t('Devices.Web phone')}</span>
              </div>
            </div>

            <div className='mt-4 flow-root'>
              <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                  <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-300'>
                      <tbody className='divide-y divide-gray-200 bg-white'>
                        <tr>
                          <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                            {t('Devices.Web phone')}
                          </td>
                          <td className='whitespace-nowrap pl-3 py-4 text-sm text-gray-500'>
                            <div className='flex items-center space-x-2'>
                              <FontAwesomeIcon
                                icon={faHeadset}
                                className='h-4 w-4 flex justify-center text-gray-700 dark:text-gray-500'
                              />
                              <span>{t('Devices.Web phone')}</span>
                            </div>
                          </td>
                          <td className='whitespace-nowrap pr-2 py-4 text-sm text-gray-500'>
                            Main device
                          </td>
                          <td className='whitespace-nowrap py-4 pl-2 pr-5 text-sm text-transparent'>
                            Edit
                          </td>
                          <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                            
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Physical phones section */}
            <div className='pt-16'>
              <div className='flex items-center space-x-2'>
                <FontAwesomeIcon
                  icon={faOfficePhone}
                  className='h-4 w-4 flex justify-center text-gray-700 dark:text-gray-500'
                />
                <span>{t('Devices.Landline phone')}</span>
              </div>
            </div>

            {/* Physical phones table */}
            <div className='mt-4 flow-root'>
              <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                  <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-300'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th
                            scope='col'
                            className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'
                          >
                            {t('Devices.Device name')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
                          >
                            {t('Devices.Status')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-transparent '
                          >
                            {t('Devices.Main device')}
                          </th>
                          <th
                            scope='col'
                            className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sr-only'
                          >
                            {t('Devices.Edit')}
                          </th>

                          <th scope='col' className='relative py-3.5 text-gray-900 sm:pr-6'>
                            <span className='sr-only'>{t('Devices.Set as main device')}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200 bg-white'>
                        {phoneData.map((phone:any) => (
                          <tr key={phone.id}>
                            <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6'>
                              {phone.description}
                            </td>
                            <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                              {/* {phone.status} */} Status
                            </td>
                            <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                              {/* {phone.isMainDevice ? 'Yes' : 'No'} */}
                            </td>
                            <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500' onClick={() => openShowEditPhysicalPhone('')}>
                              Edit
                            </td>
                            <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6'>
                              <a href='#' className='text-indigo-600 hover:text-indigo-900'>
                                Edit<span className='sr-only'>, Edit menu</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
export default Devices
