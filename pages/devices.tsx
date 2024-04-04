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
  faCircleArrowDown,
  faCircleCheck,
  faCircleXmark,
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
  getDownloadLink,
} from '../lib/devices'
import { Badge, Button, Dropdown } from '../components/common'
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

  const [updatedDownloadLink, setUpdatedDownloadLink]: any = useState()
  const [currentOS, setCurrentOS] = useState('')

  const [firstRenderDownload, setFirstRenderDownload] = useState(true)
  const [getDownloadUrlError, setGetDownloadUrlError] = useState('')

  useEffect(() => {
    if (firstRenderDownload) {
      setFirstRenderDownload(false)
      return
    }
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) {
      setCurrentOS('windows')
    } else if (userAgent.includes('mac')) {
      setCurrentOS('mac')
    } else if (userAgent.includes('linux')) {
      setCurrentOS('linux')
    }

    const initUrlDownload = async () => {
      if (profile?.lkhash !== undefined && phoneLinkData?.length !== 0) {
        try {
          setGetDownloadUrlError('')
          const response = await getDownloadLink()
          const downloadUrls = response.assets
            .filter(
              (asset: any) =>
                asset?.content_type === 'application/octet-stream' &&
                !asset.browser_download_url.endsWith('.blockmap'),
            )
            .map((asset: any) => {
              const url = asset.browser_download_url
              if (url.includes('setup.exe')) {
                return { windowsUrl: url }
              } else if (url.includes('.AppImage')) {
                return { linuxUrl: url }
              } else if (url.includes('.dmg')) {
                return { macUrl: url }
              } else {
                return null
              }
            })
            .filter((download: any) => download !== null)

          if (downloadUrls?.length > 0) {
            setUpdatedDownloadLink(downloadUrls)
          }
        } catch (error) {
          setGetDownloadUrlError('Cannot retrieve download url')
        }
      }
    }
    initUrlDownload()
  }, [firstRenderDownload, profile?.lkhash, phoneLinkData])

  const handleDownload = (url: any) => {
    window.open(url?.linuxUrl || url?.macUrl || url?.windowsUrl, '_blank')
  }

  const [selectedLink, setSelectedLink] = useState('')
  useEffect(() => {
    if (
      updatedDownloadLink &&
      currentOS &&
      profile?.lkhash !== undefined &&
      phoneLinkData?.length !== 0
    ) {
      setSelectedLink(
        updatedDownloadLink?.find((link: any) => link.hasOwnProperty(currentOS + 'Url')),
      )
    }
  }, [updatedDownloadLink, currentOS, phoneLinkData, profile?.lkhash])

  let phoneLinkDownloadComponent = (isInDropwdown: boolean) => {
    return (
      <div className='text-right'>
        {!isInDropwdown ? (
          <Button variant='ghost' onClick={() => handleDownload(selectedLink)}>
            <FontAwesomeIcon icon={faCircleArrowDown} className='mr-2 h-4 w-4' />
            {t('Devices.Download App')}
          </Button>
        ) : (
          <a
            href='#'
            target='_blank'
            rel='noreferrer'
            onClick={(e) => {
              e.preventDefault()
              handleDownload(selectedLink)
            }}
          >
            {t('Devices.Download App')}
          </a>
        )}
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
        <Dropdown.Item icon={faCircleArrowDown}>{phoneLinkDownloadComponent(true)}</Dropdown.Item>
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
          <div className='mt-4 flow-root'>
            <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 border-[1px] border-solid dark:border-gray-600 rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                    {tableHeader()}
                    <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-transparent'>
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
                        <td className='whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer w-[16.8rem] text-right'>
                          <Button
                            variant='ghost'
                            onClick={() => openShowSwitchAudioInput('')}
                            className='text-right'
                          >
                            <FontAwesomeIcon icon={faPenToSquare} className='mr-2 h-4 w-4' />
                            {t('Devices.Audio settings')}
                          </Button>
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
        <div className='pt-16'>{titleTable('phoneLink')}</div>
        <div className=''>
          <div className='mt-4 flow-root'>
            <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
              <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 border-[1px] border-solid dark:border-gray-600 rounded-lg'>
                  <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                    {tableHeader()}
                    <tbody className='divide-y divide-gray-200 dark:divide-gray-500 bg-transparent'>
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
        <div className='pt-16'>
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

        <div className='mt-4 flow-root'>
          <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
              <div className='overflow-hidden shadow ring-1 md:rounded-lg ring-opacity-5 dark:ring-opacity-5 ring-gray-900 dark:ring-gray-100 border-[1px] border-solid rounded-xl dark:border-gray-600'>
                <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-500'>
                  {tableHeader()}
                  <tbody className='bg-white dark:bg-gray-950'>
                    {phoneData.map((phone: any, index: number) => (
                      <tr key={phone?.id}>
                        <td className='truncate whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6 w-[19rem] relative'>
                          <p className='truncate'>
                            {phone?.description !== '' ? phone?.description : t('Devices.IP phone')}
                          </p>
                          {/* row divider  */}
                          {index !== 0 ? (
                            <div className='absolute -top-[0.03rem] left-6 right-0 h-px bg-gray-300 dark:bg-gray-600' />
                          ) : null}
                        </td>
                        <td
                          className={`${
                            index === 0 ? '' : 'border-t border-gray-300 dark:border-gray-600'
                          } whitespace-nowrap px-3 py-4 text-sm w-2 relative`}
                        >
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

                        <td
                          className={`${
                            index === 0 ? '' : 'border-t border-gray-300 dark:border-gray-600'
                          } whitespace-nowrap px-3 text-sm text-gray-500 relative text-right w-[14rem]`}
                        >
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
                        <td
                          className={`${
                            index === 0 ? '' : 'border-t border-gray-300 dark:border-gray-600'
                          } whitespace-nowrap px-3 py-4 text-sm text-primary dark:text-primaryDark cursor-pointer w-[16.8rem] relative text-right`}
                        >
                          {profile?.profile?.macro_permissions?.nethvoice_cti?.permissions
                            ?.phone_buttons?.value ? (
                            <Button
                              variant='ghost'
                              onClick={() => openShowEditPhysicalPhone(phone, pinObject)}
                            >
                              <FontAwesomeIcon icon={faPenToSquare} className='mr-2 h-4 w-4' />
                              {t('Devices.Device settings')}
                            </Button>
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
                          {index !== 0 ? (
                            <div className='absolute -top-[0.03rem] left-0 right-6 h-px bg-gray-300 dark:bg-gray-600' />
                          ) : null}
                        </td>
                      </tr>
                    ))}
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
        <div className='sm:overflow-hidden w-full'>
          <div className='py-6 px-4 sm:p-6 w-full'>
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
