// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCameraSecurity } from '@nethesis/nethesis-solid-svg-icons'
import {
  faVideo,
  faChartSimple,
  faPhoneVolume,
  faArrowRight,
  faArrowUpRightFromSquare,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '../components/common'
import { getApiEndpoint } from '../lib/utils'
import { getApiScheme } from '../lib/utils'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const Applications: NextPage = () => {
  const { t } = useTranslation()
  const apiEnpoint = getApiEndpoint()
  const apiScheme = getApiScheme()
  const pbxReportUrl = apiScheme + apiEnpoint + '/pbx-report/'
  const { profile } = useSelector((state: RootState) => state.user)

  return (
    <>
      <div>
        <h1 className='text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100'>
          {t('Applications.Applications')}
        </h1>

        {/* Internal applications */}
        { (profile?.macro_permissions?.off_hour?.value ||
          profile?.macro_permissions?.streaming?.value ||
          profile?.macro_permissions?.settings?.permissions?.video_conference?.value) && (
            <div>
              <span className='text-base font-normal mb-4 text-gray-600 dark:text-gray-100'>
                {t('Applications.Internal')}
              </span>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
                {/* Check if the user has offhour permission enabled */}
                {profile?.macro_permissions?.off_hour?.value && (
                  <div className='mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900 dark:border-gray-700'>
                    <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                      <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                        <FontAwesomeIcon
                          icon={faPhoneVolume}
                          className='h-4 w-4 m-3 rounded-lg text-white'
                          aria-hidden='true'
                        />
                      </span>
                      <div className='pb-1 rounded-lg'>
                        <h5 className='flex mb-2 font-medium  text-gray-700 dark:text-gray-800'>
                          {t('Applications.Phone lines and announcements')}
                        </h5>
                      </div>
                    </div>
                    <div className='bg-white dark:bg-gray-900 p-5 px-12 rounded-lg flex flex-col justify-center'>
                      <div className='mb-8 font-normal text-xs justify-center items-center text-gray-600 dark:text-gray-400'>
                        <p className='text-center'>
                          {t(
                            'Applications.Manage your phone lines, activate announcements, voicemail or forward calls',
                          )}
                        </p>
                      </div>
                      <div className='text-gray-900 dark:text-gray-100 text-sm flex items-center justify-center'>
                        <Link href={'/lines'}>
                          <a className='flex justify-center items-center'>
                            <span className='font-semibold text-gray-900 dark:text-gray-100'>
                              {t('Applications.Go to Phone lines and announcements')}
                            </span>
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className='h-4 w-4 m-3 rounded-lg text-gray-900 dark:text-gray-100'
                            />
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                {profile?.macro_permissions?.streaming?.value && (
                  <div className='mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900 dark:border-gray-700'>
                    <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                      <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                        <FontAwesomeIcon
                          icon={faCameraSecurity}
                          className='h-4 w-4 m-3 rounded-lg text-white'
                          aria-hidden='true'
                        />
                      </span>
                      <div className='pb-1 rounded-lg'>
                        <h5 className='flex mb-2 font-medium  text-gray-700 dark:text-gray-800'>
                          {t('Applications.Video sources')}
                        </h5>
                      </div>
                    </div>
                    <div className='bg-white dark:bg-gray-900 p-5 px-12 rounded-lg flex flex-col justify-center'>
                      <div className='mb-8 font-normal text-xs justify-center items-center text-gray-600 dark:text-gray-400'>
                        <p className='text-center'>
                          {t(
                            'Applications.View streams from different sources such as IP video cameras or video intercoms',
                          )}
                        </p>
                      </div>
                      <div className='text-gray-900 dark:text-gray-100 text-sm flex items-center justify-center'>
                        <span className='font-semibold text-gray-500'>
                          {t('Common.Coming soon')}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {profile?.macro_permissions?.settings?.permissions?.video_conference?.value && (
                  <div className='mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900 dark:border-gray-700'>
                    <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                      <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                        <FontAwesomeIcon
                          icon={faVideo}
                          className='h-4 w-4 m-3 rounded-lg text-white'
                          aria-hidden='true'
                        />
                      </span>
                      <div className='pb-1 rounded-lg'>
                        <h5 className='flex mb-2 font-medium  text-gray-700 dark:text-gray-800'>
                          {t('Applications.Video conference')}
                        </h5>
                      </div>
                    </div>
                    <div className='bg-white dark:bg-gray-900 p-5 px-12 rounded-lg flex flex-col justify-center'>
                      <div className='mb-8 font-normal text-xs justify-center items-center text-gray-600 dark:text-gray-400'>
                        <p className='text-center'>
                          {t(
                            'Applications.Start a conference with the ability to share audio, video or your screen with multiple contacts',
                          )}
                        </p>
                      </div>
                      <div className='text-gray-900 dark:text-gray-100 text-sm flex items-center justify-center'>
                        <span className='font-semibold text-gray-500'>
                          {t('Common.Coming soon')}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* External applications */}
        <div className='pt-8'>
          <span className='text-base font-normal mb-4  text-gray-600 dark:text-gray-100'>
            {t('Applications.External')}
          </span>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
            <div className='mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900 dark:border-gray-700'>
              <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                  <FontAwesomeIcon
                    icon={faChartSimple}
                    className='h-4 w-4 m-3 rounded-lg text-white'
                    aria-hidden='true'
                  />
                </span>
                <div className='pb-1 rounded-lg'>
                  <h5 className='flex mb-2 font-medium text-gray-700 dark:text-gray-800'>
                    PBX Report
                  </h5>
                </div>
              </div>
              <div className='bg-white dark:bg-gray-900 p-5 px-12 rounded-lg flex flex-col justify-center'>
                <div className='mb-8 font-normal text-xs justify-center items-center text-gray-600 dark:text-gray-400'>
                  <p className='text-center'>
                    {t('Applications.Access the complete tool for consulting reports')}
                  </p>
                </div>
                <div className='text-gray-900 dark:text-gray-100 text-sm flex items-center justify-center'>
                  <Button size='small' variant='white'>
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className='mr-2 h-4 w-4 text-gray-500 dark:text-gray-500'
                    />{' '}
                    <a href={pbxReportUrl} target='_blank' rel='noreferrer'>
                      {t('Applications.Open PBX Report')}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Applications
