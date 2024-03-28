// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import {
  faArrowUpFromBracket,
  faAward,
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
import { isEmpty } from 'lodash'

const Devices: NextPage = () => {
  const { t } = useTranslation()
  const operators: any = useSelector((state: RootState) => state.operators)
  const profile = useSelector((state: RootState) => state.user)

  const [phoneData, setPhoneData]: any = useState([])
  const [webrtcData, setWebrtcData]: any = useState([])
  const [phoneLinkData, setPhoneLinkDataData]: any = useState([])

  const dispatch = useDispatch<Dispatch>()

  useEffect(() => {
    // filter phone and insert only physical phones
    if (profile?.endpoints) {
      let endpointsInformation = profile?.endpoints
      if (endpointsInformation?.extension) {
        setPhoneData(endpointsInformation?.extension.filter((phone) => phone?.type === 'physical'))
        setWebrtcData(endpointsInformation?.extension.filter((phone) => phone?.type === 'webrtc'))
        setPhoneLinkDataData(
          endpointsInformation?.extension.filter((phone) => phone?.type === 'nethlink'),
        )
      }
    }
  }, [profile?.endpoints])

  let phoneLinkDownloadComponent = (isInDropwdown: boolean) => {
    const downloadLink = ''
    return (
      <div className='text-right'>
        <a
          href={downloadLink}
          download='phoneLink.bin'
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
          {t('Devices.Download PhoneLink')}
        </a>
      </div>
    )
  }

  const setMainDeviceMenu = (
    deviceId: any,
    type: string,
    selectedDeviceInfo: any,
    isPhoneLinkSection: boolean,
  ) => (
    <>
      {/* check if the device is already the main device */}
      {!isPhoneLinkSection && operators?.extensions[phoneLinkData?.id]?.status !== 'online' ? (
        <Dropdown.Item
          icon={faAward}
          onClick={() =>
            isPhoneLinkSection && isEmpty(phoneLinkTimestamp)
              ? ''
              : setSelectedAsMainDevice(deviceId, type, selectedDeviceInfo)
          }
        >
          {t('Devices.Set as main device')}
        </Dropdown.Item>
      ) : isPhoneLinkSection && phoneLinkData[0]?.id !== profile?.default_device?.id ? (
        <Dropdown.Item
          icon={faAward}
          onClick={() =>
            isPhoneLinkSection && isEmpty(phoneLinkTimestamp)
              ? ''
              : setSelectedAsMainDevice(deviceId, type, selectedDeviceInfo)
          }
        >
          {t('Devices.Set as main device')}
        </Dropdown.Item>
      ) : (
        <></>
      )}
      {isPhoneLinkSection && (
        <Dropdown.Item icon={faDownload}>{phoneLinkDownloadComponent(true)}</Dropdown.Item>
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
        if (deviceType === 'webrtc') {
          eventDispatch('phone-island-create', {})
          eventDispatch('phone-island-attach', { deviceInformationObject })
        } else {
          eventDispatch('phone-island-detach', { deviceInformationObject })
          eventDispatch('phone-island-destroy', {})
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

  const [phoneLinkFirstRender, setPhoneLinkFirstRender]: any = useState(true)
  const [phoneLinkTimeStampError, setPhoneLinkTimeStampError] = useState('')
  const [phoneLinkTimestamp, setPhoneLinkTimestamp]: any = useState({})
  const [phoneLinkTimestampLoaded, setPhoneLinkTimestampLoaded] = useState(false)

  useEffect(() => {
    if (phoneLinkFirstRender) {
      setPhoneLinkFirstRender(false)
      return
    }
    // and every time a reload is required
    // res is like this: { timestamp: '2024-03-21 10:23:44.087' }
    const getPhoneLinkValue = async () => {
      if (!phoneLinkTimestampLoaded && profile?.lkhash !== undefined) {
        try {
          setPhoneLinkTimeStampError('')
          const res = await getTimestamp()
          // Sort the speed dials and update the list
          setPhoneLinkTimestamp(res?.data)
          setPhoneLinkTimestampLoaded(true)
        } catch (error) {
          setPhoneLinkTimeStampError('Cannot retrieve timestamp information')
        }
      }
    }
    getPhoneLinkValue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneLinkFirstRender, phoneLinkTimestampLoaded, profile?.lkhash])

  const webphoneTable = () => {
    return (
      <>
        {/* title */}
        <div className='pt-6'>{titleTable('webrtc')}</div>

        <div className=''>
          <div className='mt-8 flow-root'>
            <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                    {tableHeader()}

                    <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                      <tr>
                        <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 w-[19rem]'>
                          <p className=''> {t('Devices.Web phone')}</p>
                        </td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm w-2'>
                          {/* {phone.status} */}{' '}
                          {operators?.extensions[webrtcData[0]?.id]?.exten ===
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
                                className='mr-2 h-4 w-4 text-gray-700 dark:text-gray-400'
                              />
                              <span className='text-gray-500 dark:text-gray-200'>
                                {t('Devices.Offline')}
                              </span>
                            </>
                          )}
                        </td>
                        <td className='whitespace-nowrap px-3 text-sm text-gray-500 relative text-right w-[14rem]'>
                          {webrtcData[0]?.id === profile?.default_device?.id ? (
                            <Badge size='small' variant='online' rounded='full'>
                              <span>{t('Devices.Main device')}</span>
                            </Badge>
                          ) : (
                            <span className='text-transparent cursor-default py-4 select-none'>
                              {t('Devices.Main device')}
                            </span>
                          )}
                        </td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer w-[16.8rem]'>
                          <div
                            className={`${
                              webrtcData[0]?.id !== profile?.default_device?.id ? '' : ''
                            } text-right`}
                            onClick={() => openShowSwitchAudioInput('')}
                          >
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                            />
                            {t('Devices.Audio settings')}
                          </div>
                        </td>
                        <td className='relative whitespace-nowrap py-4 pl-3 text-right text-sm font-medium pr-6'>
                          {webrtcData[0]?.id !== profile?.default_device?.id ? (
                            <Dropdown
                              items={setMainDeviceMenu(
                                webrtcData[0]?.id,
                                'webrtc',
                                webrtcData[0],
                                false,
                              )}
                              position='topCard'
                              className='text-right'
                            >
                              <FontAwesomeIcon
                                icon={faEllipsisVertical}
                                className='h-4 w-4 text-primary dark:text-primaryDark'
                              />
                            </Dropdown>
                          ) : (
                            ''
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  {
    /* PhoneLink table */
  }
  const phoneLinkTable = () => {
    return (
      <>
        {' '}
        {/* title */}
        <div className='pt-8'>{titleTable('phoneLink')}</div>
        <div className=''>
          <div className='mt-8 flow-root'>
            <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                    {tableHeader()}

                    <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                      <tr>
                        <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 w-[19rem]'>
                          <p className=''> {t('Devices.PhoneLink')}</p>
                        </td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm w-2'>
                          {/* Phone Link status */}
                          {operators?.extensions[phoneLinkData?.id]?.status === 'online' ? (
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
                                className='mr-2 h-4 w-4 text-gray-700 dark:text-gray-400'
                              />
                              <span className='text-gray-500 dark:text-gray-200'>
                                {t('Devices.Offline')}
                              </span>
                            </>
                          )}
                        </td>
                        <td className='whitespace-nowrap px-3 text-sm text-gray-500 relative text-right w-[14rem]'>
                          {phoneLinkData[0]?.id === profile?.default_device?.id ? (
                            <Badge size='small' variant='online' rounded='full'>
                              <span>{t('Devices.Main device')}</span>
                            </Badge>
                          ) : (
                            <span className='text-transparent cursor-default py-4 select-none'>
                              {t('Devices.Main device')}
                            </span>
                          )}
                        </td>
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer w-[16.8rem]'>
                          {!isEmpty(phoneLinkTimestamp) ? (
                            // if timestamp is not empty phone link settings is shown in table
                            <div
                              className={`${
                                phoneLinkData[0]?.id === profile?.default_device?.id ? '' : ''
                              } text-right`}
                            >
                              <a href='nethlink://open' target='_blank' rel='noreferrer' />
                              <FontAwesomeIcon
                                icon={faArrowUpFromBracket}
                                className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                              />
                              {t('Devices.PhoneLink settings')}
                            </div>
                          ) : (
                            // if timestamp is empty phone link download is shown in table
                            phoneLinkDownloadComponent(false)
                          )}
                        </td>
                        <td className='relative whitespace-nowrap py-4 pl-3 text-right text-sm font-medium pr-6'>
                          {!isEmpty(phoneLinkTimestamp) ? (
                            <Dropdown
                              items={
                                phoneLinkData[0]?.id === profile?.default_device?.id
                                  ? setMainDeviceMenu(
                                      phoneLinkData[0]?.id,
                                      'nethLink',
                                      phoneLinkData[0],
                                      true,
                                    )
                                  : setMainDeviceMenu(
                                      phoneLinkData[0]?.id,
                                      'nethLink',
                                      phoneLinkData[0],
                                      true,
                                    )
                              }
                              //if timestamp is empty phone link download is already shown in table
                              position={'topMultipleItem'}
                              className='text-right'
                            >
                              <FontAwesomeIcon
                                icon={faEllipsisVertical}
                                className='h-4 w-4 text-primary dark:text-primaryDark'
                              />
                            </Dropdown>
                          ) : (
                            ''
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const ipPhoneTable = () => {
    return (
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
              {phoneData?.lengtht > 1 ? t('Devices.Physical phones') : t('Devices.Physical phone')}
            </span>
          </div>
        </div>

        <div className=''>
          <div className='mt-8 flow-root'>
            <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                    {tableHeader()}

                    <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-white dark:bg-gray-700'>
                      {phoneData.map((phone: any) => (
                        <tr key={phone?.id}>
                          <td className='truncate whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 w-[19rem]'>
                            <p className='truncate'>
                              {phone?.description !== ''
                                ? phone?.description
                                : t('Devices.IP phone')}
                            </p>
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm w-2'>
                            {/* {phone.status} */}
                            {operators?.extensions[phone?.id]?.status === 'online' ? (
                              <>
                                <FontAwesomeIcon
                                  icon={faCircleCheck}
                                  className={`${
                                    phone?.id === profile?.default_device?.id ? '' : ''
                                  } mr-2 h-4 w-4 text-green-700 dark:text-green-600`}
                                />
                                {t('Devices.Online')}
                              </>
                            ) : (
                              <>
                                <FontAwesomeIcon
                                  icon={faCircleXmark}
                                  className={`${
                                    phone?.id === profile?.default_device?.id ? '' : ''
                                  } mr-2 h-4 w-4 text-gray-700 dark:text-gray-400`}
                                />
                                <span className='text-gray-500 dark:text-gray-200'>
                                  {t('Devices.Offline')}
                                </span>
                              </>
                            )}
                          </td>

                          <td className='whitespace-nowrap px-3 text-sm text-gray-500 relative text-right w-[14rem]'>
                            {phone?.id === profile?.default_device?.id ? (
                              <Badge size='small' variant='online' rounded='full'>
                                <span>{t('Devices.Main device')}</span>
                              </Badge>
                            ) : (
                              <span className='text-transparent cursor-default py-4 select-none'>
                                {t('Devices.Main device')}
                              </span>
                            )}
                          </td>
                          <td className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer w-[16.8rem]'>
                            {profile?.profile?.macro_permissions?.nethvoice_cti?.permissions
                              ?.phone_buttons?.value ? (
                              <div
                                className={`${
                                  phone?.id !== profile?.default_device?.id ? '' : ''
                                } text-right`}
                                onClick={() => openShowEditPhysicalPhone(phone, pinObject)}
                              >
                                <FontAwesomeIcon
                                  icon={faPenToSquare}
                                  className='mr-2 h-4 w-4 text-primary dark:text-primaryDark'
                                />
                                {t('Devices.Device settings')}
                              </div>
                            ) : (
                              <div></div>
                            )}
                          </td>
                          <td className='relative whitespace-nowrap py-4 pl-3 text-sm font-medium pr-6'>
                            {phone?.id !== profile?.default_device?.id ? (
                              <Dropdown
                                items={setMainDeviceMenu(phone?.id, 'physical', phone, false)}
                                position='topCard'
                                className='text-right'
                              >
                                <FontAwesomeIcon
                                  icon={faEllipsisVertical}
                                  className='h-4 w-4 text-primary dark:text-primaryDark'
                                />
                              </Dropdown>
                            ) : (
                              ''
                            )}
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
      </>
    )
  }

  return (
    <>
      <section aria-labelledby='clear-cache-heading'>
        <div className='sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            {/* webphone section */}
            {webphoneTable()}

            {/* PhoneLink section */}
            {/* check if user has lkhash permission */}
            {profile?.lkhash !== undefined && phoneLinkData?.length !== 0 && (
              <>{phoneLinkTable()}</>
            )}

            {/* Physical phones section */}
            {phoneData?.length > 0 && <>{ipPhoneTable()}</>}
          </div>
        </div>
      </section>
    </>
  )
}
export default Devices
