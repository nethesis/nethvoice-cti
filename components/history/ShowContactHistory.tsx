// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { Avatar } from '../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone } from '@fortawesome/free-solid-svg-icons'

export interface ShowContactHistorytProps extends ComponentPropsWithRef<'div'> {
  config: any
}

// Source information 
function checkName(config: any) {
  if (config.cnam) {
    return (
      <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
        <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Name</dt>
        <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
          <div className='flex items-center text-sm text-primary dark:text-primary'>
            <span className='truncate cursor-pointer'>{config.cnam}</span>
          </div>
        </dd>
      </div>
    )
  }
}

function checkCompany(config: any) {
  if (config.ccompany) {
    return (
      <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
        <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Company</dt>
        <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
          <div className='flex items-center text-sm text-primary dark:text-primary'>
            <span className='truncate cursor-pointer'>{config.ccompany}</span>
          </div>
        </dd>
      </div>
    )
  }
}

function checkNumber(config: any) {
    if (config.cnum) {
      return (
        <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
          <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>Number</dt>
          <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
            <div className='flex items-center text-sm text-primary dark:text-primary'>
              <FontAwesomeIcon
                icon={faPhone}
                className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                aria-hidden='true'
              />
              <span className='truncate cursor-pointer'>{config.cnum}</span>
            </div>
          </dd>
        </div>
      )
    }
}

export const ShowContactHistory = forwardRef<HTMLButtonElement, ShowContactHistorytProps>(
  ({ config, className, ...props }, ref) => {
    const auth = useSelector((state: RootState) => state.authentication)

    return (
      <>
        {/* drawer content */}
        <div className={classNames(className)} {...props}>
          <div className='flex min-w-0 flex-1 items-center justify-between'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 mr-4'>
                <Avatar placeholderType='person' />
              </div>
              <h2 className='text-xl font-medium text-gray-900 dark:text-gray-100'>
                Source information
              </h2>
            </div>
          </div>
          <div className='mt-5 border-t border-gray-200 dark:border-gray-700'>
            <dl className='sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700'>
              {/* Call name */}
              {checkName(config)}
              {/* Call company */}
              {checkCompany(config)}
              {/* Call number */}
              {checkNumber(config)}
            </dl>
          </div>
        </div>
      </>
    )
  },
)

ShowContactHistory.displayName = 'ShowContactHistory'
