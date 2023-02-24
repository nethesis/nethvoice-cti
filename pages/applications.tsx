// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faPhoneVolume,
  faCameraSecurity,
  faVideo,
  faChartSimple,
  faArrowUpRightFromSquare,
} from '@nethesis/nethesis-solid-svg-icons'
import { Button } from '../components/common'
import { faPhone } from '@fortawesome/free-solid-svg-icons'
import { getApiEndpoint } from '../lib/utils'
import { getApiScheme } from '../lib/utils'

const Applications: NextPage = () => {
  const { t } = useTranslation()
  const pathCompany = getApiEndpoint()
  const apiScheme = getApiScheme()
  const linkNethvoiceReport = apiScheme + pathCompany + '/pbx-report/'

  return (
    <>
      <div>
        <h1 className='text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100'>
          {t('Applications.Applications')}
        </h1>
        <div>
          <span className='text-md font-normal mb-4 text-gray-600 dark:text-gray-100'>
            {t('Applications.Internal')}
          </span>
          <div className='flex flex-wrap gap-5'>
            <div className='max-w-sm mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900'>
              <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                  <FontAwesomeIcon
                    icon={faPhoneVolume}
                    className='h-4 w-4 m-3 rounded-lg text-white'
                    aria-hidden='true'
                  />
                </span>
                <div className='pb-1 rounded-lg'>
                  <h5 className='flex mb-2 font-medium  text-gray-700'>
                    {t('Applications.Telephone lines and announcements')}
                  </h5>
                </div>
              </div>
              <div className='bg-white dark:bg-gray-900 p-5 px-12 rounded-lg flex flex-col justify-center'>
                <p className='text-center mb-8 font-normal text-xs justify-center items-center text-gray-600 dark:text-gray-400'>
                  {t(
                    'Applications.Manage your phone lines, activate announcements, voicemail or forward calls',
                  )}
                </p>
                <div className='text-gray-900 dark:text-gray-100 text-sm flex items-center justify-center'>
                  <span className='font-semibold'>Coming soon..</span>
                  {/* <FontAwesomeIcon
                icon={faArrowRight}
                className='h-4 w-4 ml-1 content-center'
                aria-hidden='true'
              /> */}
                </div>
              </div>
            </div>
            <div className='max-w-sm mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900'>
              <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                  <FontAwesomeIcon
                    icon={faCameraSecurity}
                    className='h-4 w-4 m-3 rounded-lg text-white'
                    aria-hidden='true'
                  />
                </span>
                <div className='pb-1 rounded-lg'>
                  <h5 className='flex mb-2 font-medium  text-gray-700'>
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
                  <span className='font-semibold'>Coming soon..</span>
                  {/* <FontAwesomeIcon
                icon={faArrowRight}
                className='h-4 w-4 ml-1 content-center'
                aria-hidden='true'
              /> */}
                </div>
              </div>
            </div>
            <div className='max-w-sm mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900'>
              <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                  <FontAwesomeIcon
                    icon={faVideo}
                    className='h-4 w-4 m-3 rounded-lg text-white'
                    aria-hidden='true'
                  />
                </span>
                <div className='pb-1 rounded-lg'>
                  <h5 className='flex mb-2 font-medium  text-gray-700'>
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
                  <span className='font-semibold'>Coming soon..</span>
                  {/* <FontAwesomeIcon
                icon={faArrowRight}
                className='h-4 w-4 ml-1 content-center'
                aria-hidden='true'
              /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='pt-8'>
          <span className='text-md font-normal mb-4  text-gray-600 dark:text-gray-100'>
            {t('Applications.External')}
          </span>
          <div className='flex flex-wrap gap-5'>
            <div className='max-w-sm mt-5 bg-white border-gray-200 rounded-lg shadow dark:bg-gray-900'>
              <div className='bg-emerald-50 rounded-lg flex flex-col justify-center items-center'>
                <span className='h-10 w-10 overflow-hidden rounded-full bg-emerald-600 dark:bg-emerald-500 flex relative top-[-1.25rem]'>
                  <FontAwesomeIcon
                    icon={faChartSimple}
                    className='h-4 w-4 m-3 rounded-lg text-white'
                    aria-hidden='true'
                  />
                </span>
                <div className='pb-1 rounded-lg'>
                  <h5 className='flex mb-2 font-medium text-gray-700'>Nethvoice Report</h5>
                </div>
              </div>
              <div className='bg-white dark:bg-gray-900 p-5 px-12 rounded-lg flex flex-col justify-center'>
                <p className='text-center mb-8 font-normal text-xs justify-center items-center text-gray-600 dark:text-gray-400'>
                  {t('Applications.Access the complete tool for consulting reports')}
                </p>
                <div className='text-sm flex items-center justify-center'>
                  <Button size='small' variant='white'>
                    <FontAwesomeIcon
                      icon={faArrowUpRightFromSquare}
                      className='mr-2 h-4 w-4 text-gray-500 dark:text-gray-100'
                    />{' '}
                    <a
                      className='text-gray-700 dark:text-gray-100'
                      href={linkNethvoiceReport}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {t('Applications.Open Nethvoice Report')}
                    </a>
                  </Button>
                  {/* <span className='font-semibold'>Coming soon..</span> */}
                  {/* <FontAwesomeIcon
                icon={faArrowRight}
                className='h-4 w-4 ml-1 content-center'
                aria-hidden='true'
              /> */}
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
