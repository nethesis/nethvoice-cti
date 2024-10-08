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
import { getApiEndpoint, getApiVoiceEndpoint } from '../lib/utils'
import { getApiScheme } from '../lib/utils'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const Applications: NextPage = () => {
  const { t } = useTranslation()
  const apiVoiceEnpoint = getApiVoiceEndpoint()
  const apiScheme = getApiScheme()
  const pbxReportUrl = apiScheme + apiVoiceEnpoint + '/pbx-report/'
  const { profile } = useSelector((state: RootState) => state.user)

  const headerContent = (icon: any, title: string) => {
    return (
      <div className='bg-emerald-50 dark:bg-emerald-100 flex flex-col rounded-t-2xl justify-center items-center'>
        <span className='h-10 w-10 overflow-hiddenflex relative'>
          <FontAwesomeIcon
            icon={icon}
            className='h-6 w-6 mt-4 text-gray-700 dark:text-gray-950'
            aria-hidden='true'
          />
        </span>
        <div className='pb-2 pt-2'>
          <h5 className='flex mb-2 font-medium text-gray-700 text-lg dark:text-gray-900 leading-7'>
            {t(`Applications.${title}`)}
          </h5>
        </div>
      </div>
    )
  }

  const bodyContent = (description: string, type: string) => {
    return (
      <div className='bg-cardBackgroud dark:bg-cardBackgroudDark rounded-b-2xl p-5 px-12 flex flex-col justify-center'>
        <p className='mb-4 font-normal justify-center items-center text-center text-sm text-gray-600 dark:text-gray-300 cursor-default leading-5'>
          {t(`Applications.${description}`)}
        </p>
        {type === 'coming-soon' ? (
          <div className='flex items-center justify-center mb-8 text-center text-sm text-gray-600 dark:text-gray-300 cursor-default leading-5'>
            {t('Common.Coming soon')}...
          </div>
        ) : type === 'pbx' ? (
          <div className='flex items-center justify-center mb-8'>
            <Button size='small' variant='white'>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className='mr-2 h-5 w-4' />{' '}
              <a href={pbxReportUrl} target='_blank' rel='noreferrer'>
                {t('Applications.Open PBX Report')}
              </a>
            </Button>
          </div>
        ) : (
          <div className='flex items-center justify-center mb-8'>
            <Link href={'/lines'}>
              <div className='flex justify-center items-center text-primary dark:text-primaryDark text-sm	 leading-5 font-medium'>
                <span>{t('Applications.Go to Phone lines and announcements')}</span>
                <FontAwesomeIcon icon={faArrowRight} className='h-4 w-4 m-3 rounded-lg' />
              </div>
            </Link>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div>
        <h1 className='text-2xl font-semibold mb-6 text-title dark:text-titleDark'>
          {t('Applications.Applications')}
        </h1>

        {/* Internal applications */}
        {(profile?.macro_permissions?.off_hour?.value ||
          profile?.macro_permissions?.streaming?.value ||
          profile?.macro_permissions?.settings?.permissions?.video_conference?.value) && (
          <div>
            <span className='text-base font-medium mb-4 text-gray-700 dark:text-gray-200 leading-6'>
              {t('Applications.Internal')}
            </span>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
              {/* Check if the user has offhour permission enabled */}

              {/* off hour */}
              {profile?.macro_permissions?.off_hour?.value && (
                <div className='mt-5 bg-white border-gray-100 rounded-2xl dark:bg-gray-900 dark:border-gray-700 shadow'>
                  {headerContent(faPhoneVolume, 'Phone lines and announcements')}
                  {bodyContent(
                    'Manage your phone lines, activate announcements, voicemail or forward calls',
                    'lines',
                  )}
                </div>
              )}

              {/* streaming */}
              {profile?.macro_permissions?.streaming?.value && (
                <div className='mt-5 bg-cardBackgroud dark:bg-cardBackgroudDark border-gray-200 rounded-2xl shadow dark:border-gray-700'>
                  {headerContent(faCameraSecurity, 'Video sources')}
                  {bodyContent(
                    'Manage your phone lines, activate announcements, voicemail or forward calls',
                    'coming-soon',
                  )}
                </div>
              )}

              {/* video conference */}
              {profile?.macro_permissions?.settings?.permissions?.video_conference?.value && (
                <div className='mt-5 bg-cardBackgroud dark:bg-cardBackgroudDark border-gray-200 rounded-2xl shadow dark:border-gray-700'>
                  {headerContent(faVideo, 'Video conference')}
                  {bodyContent(
                    'Start a conference with the ability to share audio, video or your screen with multiple contacts',
                    'coming-soon',
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* External applications */}

        {/* pbx report */}
        <div className='pt-8'>
          <span className='text-base font-medium mb-4 text-gray-700 dark:text-gray-200 leading-6'>
            {t('Applications.External')}
          </span>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
            <div className='mt-5 bg-cardBackgroud dark:bg-cardBackgroudDark rounded-2xl shadow border-gray-200 dark:border-gray-700'>
              {headerContent(faChartSimple, 'PBX Report')}
              {bodyContent('Access the complete tool for consulting reports', 'pbx')}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Applications
