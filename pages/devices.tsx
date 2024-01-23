// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  faCircleCheck,
  faCircleXmark,
  faEllipsisVertical,
  faHeadset,
  faPenToSquare,
} from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import { faOfficePhone } from '@nethesis/nethesis-solid-svg-icons'
import { openShowEditPhysicalPhone, setMainDevice } from '../lib/devices'
import { Badge, Dropdown } from '../components/common'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../store'
import { eventDispatch } from '../lib/hooks/eventDispatch'

const Devices: NextPage = () => {
  const { t } = useTranslation()
  const operators: any = useSelector((state: RootState) => state.operators)
  const profile = useSelector((state: RootState) => state.user)

  const [phoneData, setPhoneData]: any = useState([])
  const [webrtcData, setWebrtcData]: any = useState([])

  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    // filter phone and insert only physical phones
    if (profile?.endpoints) {
      let endpointsInformation = profile?.endpoints
      if (endpointsInformation?.extension) {
        setPhoneData(endpointsInformation?.extension.filter((phone) => phone?.type === 'physical'))
        setWebrtcData(endpointsInformation?.extension.filter((phone) => phone?.type === 'webrtc'))
      }
    }
  }, [profile?.endpoints])

  const setMainDeviceMenu = (deviceId: any, type: string) => (
    <Dropdown.Item onClick={() => setSelectedAsMainDevice(deviceId, type)} variantTop={true}>
      {t('Devices.Set as main device')}
    </Dropdown.Item>
  )

  const setSelectedAsMainDevice = async (deviceId: string, devideType: string) => {
    let deviceIdInfo: any = {}
    if (deviceId) {
      deviceIdInfo.id = deviceId
      try {
        await setMainDevice(deviceIdInfo)
        dispatch.user.updateDefaultDevice(deviceIdInfo)
        if (devideType !== '' && devideType === 'physical') {
          eventDispatch('phone-island-janus-detach', {})
          eventDispatch('phone-island-janus-destroy', {})
        } else {
          eventDispatch('phone-island-janus-create', {})
          eventDispatch('phone-island-janus-attach', {})
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

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
                  <div className='overflow-hidden shadow ring-1 ring-black dark:ring-gray-500 ring-opacity-5 sm:rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-600 dark:divide-gray-500'>
                      <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                        <tr>
                          <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6'>
                            {t('Devices.Web phone')}
                          </td>
                          <td className='whitespace-nowrap pl-[3.8rem] py-4 text-sm sm:pl-[2.8rem]'>
                            {operators?.extensions[webrtcData[0]?.id]?.exten ===
                            profile?.default_device?.id ? (
                              <>
                                <FontAwesomeIcon
                                  icon={faCircleCheck}
                                  className='mr-2 ml-[2rem] h-4 w-4 text-green-700'
                                />
                                {t('Devices.Online')}
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faCircleXmark}
                                  className='mr-2 ml-[2.1rem] h-4 w-4 text-gray-700 dark:text-gray-400'
                                />
                                <span className='text-gray-500 dark:text-gray-200'>
                                  {t('Devices.Offline')}
                                </span>
                              </>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-2 py-4 text-sm text-gray-500'>
                            {webrtcData[0]?.id === profile?.default_device?.id ? (
                              <Badge size='small' variant='online' rounded='full'>
                                <span>{t('Devices.Main device')}</span>
                              </Badge>
                            ) : (
                              <span className='text-transparent'>{t('Devices.Main device')}</span>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer text-transparent'>
                            <FontAwesomeIcon icon={faPenToSquare} className='mr-2 h-4 w-4' />
                            {t('Devices.Edit')}
                          </td>
                          <td className='relative whitespace-nowrap py-4 pr-4 text-right text-sm font-medium sm:pr-6 cursor-pointer'>
                            <Dropdown
                              items={setMainDeviceMenu(webrtcData[0]?.id, 'webrtc')}
                              position='top'
                            >
                              <FontAwesomeIcon
                                icon={faEllipsisVertical}
                                className='h-4 w-4 ml-[0.7rem] text-primary dark:text-primaryDark'
                              />
                            </Dropdown>
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
                {/* Check if physical is more than one   */}
                <span>
                  {phoneData.lengtht > 1
                    ? t('Devices.Physical phones')
                    : t('Devices.Physical phone')}
                </span>
              </div>
            </div>

            {/* Physical phones table */}
            <div className='mt-4 flow-root'>
              <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                  <div className='overflow-hidden shadow ring-1 ring-black dark:ring-gray-500 ring-opacity-5 sm:rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                      <thead className='bg-gray-50 dark:bg-gray-800'>
                        <tr className=''>
                          <th
                            scope='col'
                            className='py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6'
                          >
                            {t('Devices.Device name')}
                          </th>
                          <th scope='col' className='px-3 py-3.5 text-left text-sm font-semibold'>
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
                            className='px-3 py-3.5 text-left text-sm font-semibold sr-only'
                          >
                            {t('Devices.Edit')}
                          </th>

                          <th scope='col' className='relative py-3.5 sm:pr-6'>
                            <span className='sr-only'>{t('Devices.Set as main device')}</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                        {phoneData.map((phone: any) => (
                          <tr key={phone?.id} className=''>
                            <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 max-w-[3rem] overflow-hidden overflow-ellipsis'>
                              {phone?.description}
                            </td>
                            <td className='whitespace-nowrap px-3 py-4 text-sm'>
                              {/* {phone.status} */}{' '}
                              {operators?.extensions[phone?.id]?.status === 'online' ? (
                                <>
                                  <FontAwesomeIcon
                                    icon={faCircleCheck}
                                    className='mr-2 h-4 w-4 text-green-700'
                                  />
                                  {t('Devices.Online')}
                                </>
                              ) : (
                                <>
                                  <FontAwesomeIcon
                                    icon={faCircleXmark}
                                    className='mr-2 h-4 w-4 text-gray-700 dark:text-gray-400'
                                  />
                                  <span className='text-gray-500 dark:text-gray-200'>
                                    {t('Devices.Offline')}
                                  </span>
                                </>
                              )}
                            </td>
                            <td className='whitespace-nowrap px-3 py-4 text-sm text-gray-500'>
                              {phone?.id === profile?.default_device?.id ? (
                                <Badge size='small' variant='online' rounded='full'>
                                  <span>{t('Devices.Main device')}</span>
                                </Badge>
                              ) : (
                                <span className='text-transparent'>{t('Devices.Main device')}</span>
                              )}
                            </td>
                            <td
                              className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer'
                              onClick={() => openShowEditPhysicalPhone(phone)}
                            >
                              <FontAwesomeIcon
                                icon={faPenToSquare}
                                className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                              />
                              {t('Devices.Edit')}
                            </td>
                            <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 cursor-pointer'>
                              <Dropdown
                                items={setMainDeviceMenu(phone?.id, 'physical')}
                                position='top'
                              >
                                <FontAwesomeIcon
                                  icon={faEllipsisVertical}
                                  className='h-4 w-4 text-primary dark:text-primaryDark'
                                />
                              </Dropdown>
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
