// Copyright (C) 2024 Nethesis S.r.l.
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
  faDownload,
  faEllipsisVertical,
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
import { getTimestamp } from '../services/user'

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

  let nethLinkDownloadComponent = (isInDropwdown: boolean) => {
    const downloadLink = ''
    return (
      <a
        href={downloadLink}
        download='nethLink.bin'
        className={`${
          isInDropwdown ? '' : 'hover:underline dark:hover:text-primaryDark hover:text-primary'
        } `}
      >
        {!isInDropwdown && (
          <FontAwesomeIcon
            icon={faDownload}
            className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
          />
        )}
        {t('Devices.Download NethLink')}
      </a>
    )
  }

  const setMainDeviceMenu = (
    deviceId: any,
    type: string,
    selectedDeviceInfo: any,
    isNethLinkSection: boolean,
  ) => (
    <>
      {/* check if the device is already the main device */}
      {operators?.extensions[nethLinkData?.id]?.status !== 'online' && (
        <Dropdown.Item
          onClick={() => setSelectedAsMainDevice(deviceId, type, selectedDeviceInfo)}
          variantTop={true}
        >
          {t('Devices.Set as main device')}
        </Dropdown.Item>
      )}
      {isNethLinkSection && (
        <Dropdown.Item variantTop={true}>{nethLinkDownloadComponent(true)}</Dropdown.Item>
      )}
    </>
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

  const openNethLinkSettings = () => {
    // TO DO
  }

  const [nethLinkFirstRender, setNethLinkFirstRender]: any = useState(true)
  const [nethLinkTimeStampError, setNethLinkTimeStampError] = useState('')
  const [nethLinkTimestamp, setNethLinkTimestamp]: any = useState({})
  const [nethLinkTimestampLoaded, setNethLinkTimestampLoaded] = useState(false)

  useEffect(() => {
    if (nethLinkFirstRender) {
      setNethLinkFirstRender(false)
      return
    }
    // and every time a reload is required
    // res is like this: { timestamp: '2024-03-21 10:23:44.087' }
    const getNethLinkValue = async () => {
      if (!nethLinkTimestampLoaded && profile?.lkhash !== undefined) {
        try {
          setNethLinkTimeStampError('')
          const nethLinkTimeStampRes = await getTimestamp()
          // Sort the speed dials and update the list
          setNethLinkTimestamp(nethLinkTimeStampRes)
          setNethLinkTimestampLoaded(true)
        } catch (error) {
          setNethLinkTimeStampError('Cannot retrieve timestamp information')
        }
      }
    }
    getNethLinkValue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nethLinkFirstRender, nethLinkTimestampLoaded, profile?.lkhash])

  const nethLinkTable = () => {
    return (
      <>
        {/* title */}
        <div className='pt-8'>{titleTable('nethLink')}</div>

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
                        {operators?.extensions[nethLinkData?.id]?.status === 'online' ? (
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
                          <span className='hidden text-transparent cursor-default'>
                            {t('Devices.Main device')}
                          </span>
                        )}
                      </td>

                      {/* Show nethlink settings only if timestamp is not null or empty or if the device
                      is the main device */}
                      <td className='whitespace-nowrap py-4 text-sm text-primary dark:text-primaryDark cursor-pointer'>
                        {operators?.extensions[nethLinkData?.id]?.status === 'online' ||
                        nethLinkTimestamp?.timestamp !== null ||
                        nethLinkTimestamp?.timestamp !== '' ? (
                          <div
                            className={`${
                              nethLinkData[0]?.id === profile?.default_device?.id ? '' : ''
                            } pr-[0.5rem]`}
                            onClick={() => openNethLinkSettings()}
                          >
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                            />
                            {t('Devices.NethLink settings')}
                          </div>
                        ) : (
                          nethLinkDownloadComponent(false)
                        )}
                      </td>

                      {operators?.extensions[nethLinkData?.id]?.status !== 'online' ? (
                        <td className='relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 cursor-pointer'>
                          <Dropdown
                            items={setMainDeviceMenu(
                              nethLinkData[0]?.id,
                              'webrtc',
                              nethLinkData[0],
                              true,
                            )}
                            position='topMultipleItem'
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
                              <span className='text-transparent cursor-default hidden'>
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
                                  false,
                                )}
                                position='topMultipleItem'
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

            {/* Hidden at the moment */}
            {/* check if user has lkhash permission */}
            {profile?.lkhash !== undefined && nethLinkData?.length !== 0 && <>{nethLinkTable()}</>}

            {/* Physical phones section */}
            {phoneData?.length > 0 && (
              <>
                {/* title */}
                <div className='pt-8'>
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
                                <td className='truncate py-4 pl-4 pr-7 text-sm font-medium sm:pl-6 max-w-sm overflow-hidden overflow-ellipsis'>
                                  <p className='truncate w-36'>
                                    {phone?.description !== ''
                                      ? phone?.description
                                      : t('Devices.IP phone')}
                                  </p>
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
                                    <span className='text-transparent hidden'>
                                      {t('Devices.Main device')}
                                    </span>
                                  )}
                                </td>
                                {profile?.profile?.macro_permissions?.nethvoice_cti?.permissions
                                  ?.phone_buttons?.value ? (
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
                                      items={setMainDeviceMenu(phone?.id, 'physical', phone, false)}
                                      position='topMultipleItem'
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
