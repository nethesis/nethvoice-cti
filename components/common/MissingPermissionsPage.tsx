// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faBan } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import Link from 'next/link'

export const MissingPermission = ({}): JSX.Element => {
  return (
    <div className='flex items-center justify-center h-[46rem] overflow-y-hidden'>
      <div className='text-center'>
        <FontAwesomeIcon
          icon={faBan}
          className='text-emerald-600 text-6xl mb-4 w-[6rem] h-[6rem]'
        />
        <p className='text-2xl text-gray-900 dark:text-gray-300 pt-8 font-semibold	'>
          {t('Common.Permission error')}
        </p>
        <p className='text-2xl text-gray-600 dark:text-gray-300 pt-[1rem] font-medium'>
          {t('Common.Permission error message content')}
        </p>
        <p className='text-2xl text-gray-600 dark:text-gray-300 pt-0.5 pb-[1rem] font-medium'>
          {t('Common.Permission error message content link')}
        </p>
        <div className='text-gray-900 dark:text-gray-100 text-sm flex items-center justify-center'>
          <Link href={'/operators'}>
            <a className='flex justify-center items-center '>
              <span className='font-semibold text-gray-900 dark:text-gray-100 hover:text-primary hover:dark:text-primaryDark hover:underline'>
                {t('Common.Main page')}
              </span>
              <FontAwesomeIcon
                icon={faArrowRight}
                className='h-4 w-4 m-3 rounded-lg text-gray-900 dark:text-gray-100 hover:text-primary hover:dark:text-primaryDark'
              />
            </a>
          </Link>
        </div>
      </div>
    </div>
  )
}
