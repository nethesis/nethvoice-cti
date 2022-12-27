// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { RefObject, createRef, useState } from 'react'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const ClearCache = () => {
  return (
    <>
      {/* The Integration section */}
      <section aria-labelledby='phone-configuration-heading'>
        <div className='shadow sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            <div>
              <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                Clear cache
              </h2>
            </div>
            <div>
              <h4
                id='phone-configuration-heading'
                className='text-sm font-medium leading-6 text-gray-900 dark:text-gray-100'
              >
                Click the button below to clear the cache of the web application.
              </h4>
              <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                This will force the web application to reload all the data from the server.
              </p>
              <div className='mt-6'>
                <button
                  type='button'
                  className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  onClick={() => {
                    caches.keys().then((names) => {
                      for (let name of names) caches.delete(name)
                    })
                  }}
                >
                  Clear cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
