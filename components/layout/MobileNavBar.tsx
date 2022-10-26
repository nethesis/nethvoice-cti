// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The MobileNavBar component for narrow views
 *
 * @param closeMobileMenu - The callback on menu close events
 * @param items - The array with the navigation info
 * @param show - The parameter to show or hide the
 *
 */

import { Transition, Dialog } from '@headlessui/react'
import { FC, Fragment } from 'react'
import classNames from 'classnames'
import type { NavItemsProps } from '../../config/routes'
import Image from 'next/image'
import { MdOutlineClose } from 'react-icons/md'
import Link from 'next/link'

interface MobileNavBarProps {
  show: boolean
  items: NavItemsProps[]
  closeMobileMenu: () => void
}

export const MobileNavBar: FC<MobileNavBarProps> = ({ closeMobileMenu, show, items }) => {
  return (
    <>
      {/* Mobile menu */}
      <Transition.Root show={show} as={Fragment}>
        <Dialog as='div' className='relative z-20 md:hidden' onClose={closeMobileMenu}>
          <Transition.Child
            as={Fragment}
            enter='transition-opacity ease-linear duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity ease-linear duration-300'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-600 bg-opacity-75' />
          </Transition.Child>

          <div className='fixed inset-0 z-40 flex'>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-300 transform'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <Dialog.Panel className='relative flex w-full max-w-xs flex-1 flex-col bg-sky-600 pt-5 pb-4'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-in-out duration-300'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in-out duration-300'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
                >
                  <div className='absolute top-1 right-0 -mr-14 p-1'>
                    <button
                      type='button'
                      className='flex h-12 w-12 items-center justify-center rounded-full'
                      onClick={closeMobileMenu}
                    >
                      <MdOutlineClose className='h-6 w-6 text-white' aria-hidden='true' />
                      <span className='sr-only'>Close sidebar</span>
                    </button>
                  </div>
                </Transition.Child>
                <div className='flex flex-shrink-0 items-center px-4'>
                  <Image
                    className='h-8 w-auto'
                    src='https://tailwindui.com/img/logos/mark.svg?color=white'
                    alt='Your Company'
                    unoptimized={true}
                    width={37.6}
                    height={32}
                  />
                </div>
                <div className='mt-5 h-0 flex-1 overflow-y-auto px-2'>
                  <nav className='flex h-full flex-col'>
                    <div className='space-y-1'>
                      {items.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-sky-700 text-white'
                                : 'text-gray-100 hover:bg-sky-700 hover:text-white',
                              'group py-2 px-3 rounded-md flex items-center text-sm font-medium',
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            <item.icon
                              className={classNames(
                                item.current
                                  ? 'text-white'
                                  : 'text-gray-300 group-hover:text-white',
                                'mr-3 h-6 w-6',
                              )}
                              aria-hidden='true'
                            />
                            <span>{item.name}</span>
                          </a>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className='w-14 flex-shrink-0' aria-hidden='true'>
              {/* Dummy element to force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
