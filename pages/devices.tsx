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
import {
  getDevicesPin,
  openShowEditPhysicalPhone,
  setMainDevice,
  openShowSwitchAudioInput,
  tableHeader,
  titleTable,
} from '../lib/devices'
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
  const [nethLinkData, setNethLinkData]: any = useState([])

  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    // filter phone and insert only physical phones
    if (profile?.endpoints) {
      let endpointsInformation = profile?.endpoints
      if (endpointsInformation?.extension) {
        setPhoneData(endpointsInformation?.extension.filter((phone) => phone?.type === 'physical'))
        setWebrtcData(endpointsInformation?.extension.filter((phone) => phone?.type === 'webrtc'))
        setNethLinkData(
          endpointsInformation?.extension.filter((phone) => phone?.type === 'nethlink'),
        )
      }
    }
  }, [profile?.endpoints])

  const setMainDeviceMenu = (deviceId: any, type: string, selectedDeviceInfo: any) => (
    <Dropdown.Item
      onClick={() => setSelectedAsMainDevice(deviceId, type, selectedDeviceInfo)}
      variantTop={true}
    >
      {t('Devices.Set as main device')}
    </Dropdown.Item>
  )

  const setSelectedAsMainDevice = async (
    deviceId: string,
    deviceType: string,
    deviceInformationObject: any,
  ) => {
    let deviceIdInfo: any = {}
    if (deviceId) {
      deviceIdInfo.id = deviceId
      try {
        await setMainDevice(deviceIdInfo)
        dispatch.user.updateDefaultDevice(deviceIdInfo)
        if (deviceType !== '' && deviceType === 'physical') {
          eventDispatch('phone-island-detach', { deviceInformationObject })
          eventDispatch('phone-island-destroy', {})
        } else {
          eventDispatch('phone-island-create', {})
          eventDispatch('phone-island-attach', { deviceInformationObject })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const [firstRender, setFirstRender] = useState(true)
  const [getPinError, setGetPinError] = useState('')
  const [pinObject, setPinObject] = useState<any>({})

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    const retrievePinStatus = async () => {
      try {
        setGetPinError('')
        const pin = await getDevicesPin()
        setPinObject(pin)
      } catch (error) {
        setGetPinError('Cannot retrieve pin information')
      }
    }
    retrievePinStatus()
  }, [firstRender])

  const nethLinkTable = () => {
    return (
      <>
        {/* title */}
        <div className='pt-6'>{titleTable('nethLink')}</div>

        {/* NethLink table */}
        <div className='mt-4 flow-root'>
          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
              <div className='overflow-hidden shadow ring-1 ring-black dark:ring-gray-500 ring-opacity-5 sm:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                  {tableHeader()}
                  <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                    <tr>
                      <td className='truncate py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 max-w-sm overflow-hidden overflow-ellipsis'>
                        <p className='truncate w-36'> {t('Devices.NethLink')}</p>
                      </td>
                      <td className='whitespace-nowrap px-3 py-4 text-sm'>
                        {/* NethLink status */}
                        {operators?.extensions[nethLinkData[0]?.id]?.exten ===
                        profile?.default_device?.id ? (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleCheck}
                              className='mr-2 h-4 w-4 text-green-700 dark:text-green-600'
                            />
                            {t('Devices.Online')}
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon
                              icon={faCircleXmark}
                              className='mr-2 ml-[0.5rem] h-4 w-4 text-gray-700 dark:text-gray-400'
                            />
                            <span className='text-gray-500 dark:text-gray-200'>
                              {t('Devices.Offline')}
                            </span>
                          </>
                        )}
                      </td>
                      <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500'>
                        {nethLinkData[0]?.id === profile?.default_device?.id ? (
                          <Badge size='small' variant='online' rounded='full'>
                            <span>{t('Devices.Main device')}</span>
                          </Badge>
                        ) : (
                          <span className='text-transparent cursor-default'>
                            {t('Devices.Main device')}
                          </span>
                        )}
                      </td>

                      <td
                        className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer'
                        onClick={() => openShowSwitchAudioInput('')}
                      >
                        <div
                          className={`${
                            nethLinkData[0]?.id !== profile?.default_device?.id ? '' : 'mr-[1.6rem]'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                          />
                          {t('Devices.NethLink settings')}
                        </div>
                      </td>

                      {nethLinkData[0]?.id !== profile?.default_device?.id ? (
                        <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 cursor-pointer'>
                          <Dropdown
                            items={setMainDeviceMenu(webrtcData[0]?.id, 'webrtc', webrtcData[0])}
                            position='top'
                          >
                            <FontAwesomeIcon
                              icon={faEllipsisVertical}
                              className='h-4 w-4 text-primary dark:text-primaryDark'
                            />
                          </Dropdown>
                        </td>
                      ) : (
                        <td></td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const nethLinkGetBinary = () => {
    const downloadLink = ''

    return (
      <>
        {/* title */}
        <div className='pt-6'>{titleTable('nethLink')}</div>
        {/* Download link */}
        <div className='pt-2'>
          <span>{t('Devices.Click here to start download')}: </span>
          <a
            href={downloadLink}
            download='nethLink.bin'
            className='underline dark:hover:text-primaryDark hover:text-primary'
          >
            {t('Common.Download')}
          </a>
        </div>
      </>
    )
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
            {/* title  */}
            <div className='pt-6'>{titleTable('webrtc')}</div>

            {/* Web phone table */}
            <div className='mt-4 flow-root'>
              <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                  <div className='overflow-hidden shadow ring-1 ring-black dark:ring-gray-500 ring-opacity-5 sm:rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                      {tableHeader()}
                      <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                        <tr>
                          <td className='truncate py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 max-w-sm overflow-hidden overflow-ellipsis'>
                            <p className='truncate w-36'> {t('Devices.Web phone')}</p>
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm'>
                            {/* {phone.status} */}{' '}
                            {operators?.extensions[webrtcData[0]?.id]?.exten ===
                            profile?.default_device?.id ? (
                              <>
                                <FontAwesomeIcon
                                  icon={faCircleCheck}
                                  className='mr-2 ml-2 h-4 w-4 text-green-700 dark:text-green-600'
                                />
                                {t('Devices.Online')}
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faCircleXmark}
                                  className='mr-2 ml-[0.6rem] h-4 w-4 text-gray-700 dark:text-gray-400'
                                />
                                <span className='text-gray-500 dark:text-gray-200'>
                                  {t('Devices.Offline')}
                                </span>
                              </>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500'>
                            {webrtcData[0]?.id === profile?.default_device?.id ? (
                              <Badge size='small' variant='online' rounded='full'>
                                <span>{t('Devices.Main device')}</span>
                              </Badge>
                            ) : (
                              <span className='text-transparent cursor-default'>
                                {t('Devices.Main device')}
                              </span>
                            )}
                          </td>

                          <td
                            className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer'
                            onClick={() => openShowSwitchAudioInput('')}
                          >
                            <div
                              className={`${
                                webrtcData[0]?.id !== profile?.default_device?.id
                                  ? ''
                                  : 'mr-[1.6rem]'
                              }`}
                            >
                              <FontAwesomeIcon
                                icon={faPenToSquare}
                                className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                              />
                              {t('Devices.Audio settings')}
                            </div>
                          </td>

                          {webrtcData[0]?.id !== profile?.default_device?.id ? (
                            <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 cursor-pointer'>
                              <Dropdown
                                items={setMainDeviceMenu(
                                  webrtcData[0]?.id,
                                  'webrtc',
                                  webrtcData[0],
                                )}
                                position='top'
                              >
                                <FontAwesomeIcon
                                  icon={faEllipsisVertical}
                                  className='h-4 w-4 text-primary dark:text-primaryDark'
                                />
                              </Dropdown>
                            </td>
                          ) : (
                            <td></td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* nethLink section */}
            {nethLinkData?.lenght > 0 ? nethLinkTable() : nethLinkGetBinary()}

            {/* Physical phones section */}
            {phoneData?.length > 0 && (
              <>
                {/* title */}
                <div className='pt-16'>
                  <div className='flex items-center space-x-2'>
                    <FontAwesomeIcon
                      icon={faOfficePhone}
                      className='h-4 w-4 flex justify-center text-gray-700 dark:text-gray-500'
                    />
                    {/* Check if physical is more than one   */}
                    <span>
                      {phoneData?.lengtht > 1
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
                          {tableHeader()}
                          <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                            {phoneData.map((phone: any) => (
                              <tr key={phone?.id} className=''>
                                <td className='truncate py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 max-w-sm overflow-hidden overflow-ellipsis'>
                                  <p className='truncate w-36'>{phone?.description}</p>
                                </td>
                                <td className='whitespace-nowrap px-3 py-4 text-sm'>
                                  {/* {phone.status} */}{' '}
                                  {operators?.extensions[phone?.id]?.status === 'online' ? (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCircleCheck}
                                        className={`${
                                          phone?.id === profile?.default_device?.id
                                            ? 'ml-2'
                                            : 'ml-2'
                                        } mr-2 h-4 w-4 text-green-700 dark:text-green-600`}
                                      />
                                      {t('Devices.Online')}
                                    </>
                                  ) : (
                                    <>
                                      <FontAwesomeIcon
                                        icon={faCircleXmark}
                                        className={`${
                                          phone?.id === profile?.default_device?.id
                                            ? 'ml-2'
                                            : 'ml-2'
                                        } mr-2 h-4 w-4 text-gray-700 dark:text-gray-400`}
                                      />
                                      <span className='text-gray-500 dark:text-gray-200'>
                                        {t('Devices.Offline')}
                                      </span>
                                    </>
                                  )}
                                </td>
                                <td className='whitespace-nowrap px-3 py-2 text-sm text-gray-500'>
                                  {phone?.id === profile?.default_device?.id ? (
                                    <Badge size='small' variant='online' rounded='full'>
                                      <span>{t('Devices.Main device')}</span>
                                    </Badge>
                                  ) : (
                                    <span className='text-transparent'>
                                      {t('Devices.Main device')}
                                    </span>
                                  )}
                                </td>
                                {profile?.profile?.macro_permissions?.nethvoice_cti?.permissions
                                  .phone_buttons.value ? (
                                  <td
                                    className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer'
                                    onClick={() => openShowEditPhysicalPhone(phone, pinObject)}
                                  >
                                    <div
                                      className={`${
                                        phone?.id !== profile?.default_device?.id
                                          ? ''
                                          : 'mr-[1.6rem]'
                                      }`}
                                    >
                                      <FontAwesomeIcon
                                        icon={faPenToSquare}
                                        className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                                      />
                                      {t('Devices.Device settings')}
                                    </div>
                                  </td>
                                ) : (
                                  <td></td>
                                )}

                                {phone?.id !== profile?.default_device?.id ? (
                                  <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 cursor-pointer'>
                                    <Dropdown
                                      items={setMainDeviceMenu(phone?.id, 'physical', phone)}
                                      position='top'
                                    >
                                      <FontAwesomeIcon
                                        icon={faEllipsisVertical}
                                        className='h-4 w-4 text-primary dark:text-primaryDark'
                                      />
                                    </Dropdown>
                                  </td>
                                ) : (
                                  <td></td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
export default Devices
