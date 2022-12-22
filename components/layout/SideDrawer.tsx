// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * The SideDrawer component
 *
 */
import { Transition, Dialog } from '@headlessui/react'
import { FC, Fragment } from 'react'
import { ShowOperatorDrawerContent } from '../operators/ShowOperatorDrawerContent'
import { CreateOrEditContactDrawerContent } from '../phonebook/CreateOrEditContactDrawerContent'
import { ShowContactDrawerContent } from '../phonebook/ShowContactDrawerContent'
import { CreateOrEditSpeedDialDrawerContent } from './speed_dial/CreateOrEditSpeedDialDrawerContent'
import { ShowContactHistory } from '../history/ShowContactHistory'

interface SideDrawerProps {
  isShown: boolean
  contentType: string
  config: any
  drawerClosed: () => void
}

export const SideDrawer: FC<SideDrawerProps> = ({ isShown, contentType, config, drawerClosed }) => {
  return (
    <>
      <Transition.Root show={isShown} as={Fragment}>
        <Dialog as='div' className='relative z-20' onClose={drawerClosed}>
          <div className='fixed top-16 right-0 bottom-0 z-40 flex'>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-300 transform'
              enterFrom='translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='translate-x-full'
            >
              <Dialog.Panel className='relative flex w-80 md:w-96 lg:w-[33vw] 2xl:w-[30vw] flex-1 flex-col p-5 shadow-[0px_20px_40px_0_rgba(0,0,0,0.2)] bg-white dark:bg-gray-900 dark:shadow-[0px_20px_40px_0_rgba(0,0,0,0.6)]'>
                <div className='h-0 flex-1 overflow-y-auto'>
                  <nav className='flex h-full flex-col'>
                    <div className='space-y-1'>
                      {contentType === 'createOrEditContact' ? (
                        <CreateOrEditContactDrawerContent config={config} />
                      ) : contentType === 'showContact' ? (
                        <ShowContactDrawerContent config={config} />
                      ) : contentType === 'createOrEditSpeedDial' ? (
                        <CreateOrEditSpeedDialDrawerContent config={config} />
                      ) : contentType === 'showOperator' ? (
                        <ShowOperatorDrawerContent config={config} />
                      ) : contentType === 'showContactHistory' ? (
                        <ShowContactHistory config={config} />
                      ) : null}
                    </div>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
