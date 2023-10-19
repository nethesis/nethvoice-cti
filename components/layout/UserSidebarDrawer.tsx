// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Transition, Dialog } from '@headlessui/react'
import { FC, Fragment, useState } from 'react'
import { SpeedDialContent } from '../common/UserRightSideMenu/SpeedDialContent'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { UserLastCallsContent } from '../common/UserRightSideMenu/UserLastCallsContent'

interface UserSidebarDrawerProps {
  isShown: boolean
}

export const UserSidebarDrawer: FC<UserSidebarDrawerProps> = ({ isShown }) => {
  const rightSideStatus: any = useSelector((state: RootState) => state.rightSideMenu)

  let [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <Transition.Root show={isShown} as={Fragment}>
        <Dialog
          as='div'
          className={`${rightSideStatus.isShown ? 'relative z-20 lg:hidden' : 'hidden'}`}
          onClose={() => setIsOpen(false)}
        >
          <div className='fixed top-16 right-[3.2rem] bottom-0 z-40 flex'>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-300 transform'
              enterFrom='translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='translate-x-full'
            >
              <Dialog.Panel className='relative flex w-72 lg:w-72 xl:w-80 2xl:w-96 flex-1 flex-col shadow-[0px_20px_40px_0_rgba(0,0,0,0.2)] bg-white dark:bg-gray-900 dark:shadow-[0px_20px_40px_0_rgba(0,0,0,0.6)]'>
                <div className='h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                  <nav className='flex h-full flex-col'>
                    <div className='overflow-x-hidden relative'>
                      {rightSideStatus?.actualTab && rightSideStatus?.actualTab === 'speed_dial' ? (
                        <SpeedDialContent />
                      ) : rightSideStatus?.actualTab &&
                        rightSideStatus?.actualTab === 'last_calls' ? (
                        <UserLastCallsContent />
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
