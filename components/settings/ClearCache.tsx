// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Button } from '../common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { getProductName } from '../../lib/utils'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export const ClearCache = () => {
  const productName = getProductName()

  //Find the credentials of the user saved in the store
  const authenticationStore = useSelector((state: RootState) => state.authentication)
  const { username } = authenticationStore
  //Create the variable that will be used to clear the cache
  const cacheEntry: any = 'caches-' + username

  return (
    <>
      {/* The Integration section */}
      <section aria-labelledby='clear-cache-heading'>
        <div className='shadow sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            <div>
              <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                Cache
              </h2>
            </div>
            <div>
              <h4
                id='clear-cache-heading'
                className='text-sm font-medium leading-6 text-gray-900 dark:text-gray-100'
              >
                Clear cache
              </h4>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                This will force {productName} to reload all cached data from the server
              </p>
              <div className='mt-6'>
                <Button
                  variant='danger'
                  onClick={() => {
                    localStorage.removeItem(cacheEntry)
                  }}
                >
                  <span>Clear cache</span>
                  <FontAwesomeIcon icon={faTrash} className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
