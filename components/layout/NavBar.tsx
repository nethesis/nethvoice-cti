// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The Sidebar component
 *
 * @param items - The array with the navigation info
 *
 */

import { FC } from 'react'
import classNames from 'classnames'
import type { NavItemsProps } from '../../config/routes'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface NavBarProps {
  items: NavItemsProps[]
}

export const NavBar: FC<NavBarProps> = ({ items }) => {
  return (
    <div className='hidden w-20 overflow-y-auto md:block border-l-4 border-primary bg-gray-600 dark:bg-gray-700'>
      <div className='flex w-full flex-col items-center py-2 h-full'>
        <div className='flex flex-shrink-0 items-center'>
          <Link href='/operators'>
            <div>
              {/* Nextjs <Image> is not suitable for rebranding: it always uses the aspect ratio of the original logo  */}
              <img
                className='px-2.5 w-auto cursor-pointer object-contain object-top'
                src='/navbar_logo.png'
                alt='logo'
              />
            </div>
          </Link>
        </div>
        <div className='mt-6 w-full h-full flex flex-col space-y-5 px-2.5 justify-center'>
          {items.map((item, index: number) => (
            <div key={index}>
              {item.icon.iconName === 'gear' && (
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                    <div className='w-full border-t m-3 p-2.5 border-gray-400 dark:border-gray-500' />
                  </div>
                </div>
              )}
              <Link href={item.href}>
                <a
                  className={classNames(
                    item.current
                      ? 'text-white bg-gray-700 dark:bg-gray-500'
                      : 'text-gray-100 hover:text-white hover:bg-gray-700 dark:hover:bg-gray-500',
                    'group rounded-md flex flex-col items-center text-xs font-medium h-14 w-14 justify-center',
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <FontAwesomeIcon
                    icon={item.current ? item.iconActive : item.icon}
                    className={classNames(
                      item.current ? 'text-white' : `text-gray-100 group-hover:text-white`,
                      'h-6 w-6',
                    )}
                    aria-hidden='true'
                  />
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
