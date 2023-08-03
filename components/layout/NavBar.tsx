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
import { Tooltip } from 'react-tooltip'

interface NavBarProps {
  items: NavItemsProps[]
}

const activeStyles = {
  width: '.25rem',
  height: '2.25rem',
  left: '0',
  top: '.44rem',
  borderRadius: '0rem .375rem .375rem 0rem',
  position: 'absolute',
} as React.CSSProperties

export const NavBar: FC<NavBarProps> = ({ items }) => {
  return (
    <div className='hidden w-20 overflow-y-auto md:block border-r border-gray-200 bg-white dark:bg-gray-700'>
      <div className='flex w-full flex-col items-center py-2 h-full'>
        <div className='flex flex-shrink-0 items-center'>
          <Link href='/operators'>
            <div>
              {/* Nextjs <Image> is not suitable for rebranding: it always uses the aspect ratio of the original logo  */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className='px-2.5 w-auto cursor-pointer object-contain object-top'
                src='/navbar_logo.svg'
                alt='logo'
              />
            </div>
          </Link>
        </div>
        <div className='mt-6 w-fit h-full flex flex-col space-y-5 px-2.5 justify-center'>
          {items.map((item, index: number) => (
            <div key={index}>
              <Link href={item.href}>
                <a
                  className={classNames(
                    item.current
                      ? 'text-grey-900 bg-gray-100 dark:bg-gray-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-500',
                    'group rounded-md flex flex-col items-center text-xs font-medium justify-center',
                    `tooltip-${item.name}`,
                    'relative'
                  )}
                  style={{
                    height: '3.125rem',
                    width: '3.125rem'
                  }}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <FontAwesomeIcon
                    icon={item.current ? item.iconActive : item.icon}
                    className='h-6 w-6'
                    aria-hidden='true'
                  />
                  {item.current && <div style={activeStyles} className='bg-primary' />}
                </a>
              </Link>
              <Tooltip anchorSelect={`.tooltip-${item.name}`} place='right' offset={20}>
                {item.name}
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
