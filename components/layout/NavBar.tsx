// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The Sidebar component
 *
 * @param items - The array with the navigation info
 *
 */

import { FC } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import type { NavItemsProps } from '../../config/routes'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface NavBarProps {
  items: NavItemsProps[]
}

export const NavBar: FC<NavBarProps> = ({ items }) => {
  return (
    <div className='hidden w-28 overflow-y-auto bg-primary md:block'>
      <div className='flex w-full flex-col items-center py-6 h-full'>
        <div className='flex flex-shrink-0 items-center'>
          <Image
            className='h-8 w-auto'
            src='https://tailwindui.com/img/logos/mark.svg?color=white'
            alt='Your Company'
            unoptimized={true}
            width={37.6}
            height={32}
          />
        </div>
        <div className='mt-6 w-full h-full flex flex-col space-y-1 px-2 justify-center'>
          {items.map((item) => (
            <Link key={item.name} href={item.href}>
              <a
                className={classNames(
                  item.current
                    ? 'bg-primaryDark text-white'
                    : 'text-gray-100 hover:bg-primaryDark hover:text-white',
                  'group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium',
                )}
                aria-current={item.current ? 'page' : undefined}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className={classNames(
                    item.current ? 'text-white' : 'text-gray-100 group-hover:text-white',
                    'h-6 w-6',
                  )}
                  aria-hidden='true'
                />
                <span className='mt-2'>{item.name}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
