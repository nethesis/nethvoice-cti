// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 *
 * The SideDrawer component
 *
 */

import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react'
import { FC, Fragment } from 'react'
import { ShowOperatorDrawerContent } from '../operators/ShowOperatorDrawerContent'
import { CreateOrEditContactDrawerContent } from '../phonebook/CreateOrEditContactDrawerContent'
import { ShowContactDrawerContent } from '../phonebook/ShowContactDrawerContent'
import { CreateOrEditSpeedDialDrawerContent } from './speed_dial/CreateOrEditSpeedDialDrawerContent'
import { ShowHistoryDrawerContent } from '../history/ShowHistoryDrawerContent'
import { NotificationsDrawerContent } from './NotificationsDrawerContent'
import { AddToPhonebookDrawerContent } from '../history/AddToPhonebookDrawer'
import { ShowQueueCallDrawerContent } from '../queues'
import { ShowPhoneLinesDrawerContent } from '../lines/ShowPhoneLinesDrawerContent'
import { EditAnnouncementDrawerContent } from '../lines'
import { ShowRuleDetailsContent } from '../lines'
import { SaveRecordedAnnouncementDrawerContent } from '../lines'
import { ShowMultiplePhoneLinesDrawerContent } from '../lines'
import { GravatarIconDrawerContent } from '../common/ProfilePicture/GravatarIconDrawerContent'
import { SelectProfilePictureDrawerContent } from '../common/ProfilePicture/SelectProfilePictureDrawerContent'
import { EditPhysicalPhoneDrawerContent } from '../devices/EditPhysicalPhoneDrawerContent'
import { SwitchInputOutputDrawerContent } from '../devices/SwitchInputOutputDrawerContent'
import { DownloadDesktopLinkContent } from '../devices/DownloadDesktopLinkContent'
import { UploadVoicemail } from '../lines/UploadVoicemail'

interface SideDrawerProps {
  isShown: boolean
  contentType: string
  config: any
  drawerClosed: () => void
}

export const SideDrawer: FC<SideDrawerProps> = ({ isShown, contentType, config, drawerClosed }) => {
  return (
    <>
      <Transition show={isShown} as={Fragment}>
        <Dialog as='div' className='relative z-20' onClose={drawerClosed}>
          <div className='fixed top-16 right-0 bottom-0 z-40 flex'>
            <TransitionChild
              as={Fragment}
              enter='transition ease-in-out duration-300 transform'
              enterFrom='translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='translate-x-full'
            >
              <DialogPanel className='relative flex w-[80vw] md:w-[60vw] lg:w-[40vw] 2xl:w-[33vw] 3xl:w-[36rem] flex-1 flex-col shadow-[0px_20px_40px_0_rgba(0,0,0,0.2)] bg-white dark:bg-gray-900 dark:shadow-[0px_20px_40px_0_rgba(0,0,0,0.6)]'>
                <div className='h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'>
                  <nav className='flex h-full flex-col'>
                    <div className='relative'>
                      {contentType === 'createOrEditContact' ? (
                        <CreateOrEditContactDrawerContent config={config} />
                      ) : contentType === 'showContact' ? (
                        <ShowContactDrawerContent config={config} />
                      ) : contentType === 'createOrEditSpeedDial' ? (
                        <CreateOrEditSpeedDialDrawerContent config={config} />
                      ) : contentType === 'showOperator' ? (
                        <ShowOperatorDrawerContent config={config} />
                      ) : contentType === 'showContactHistory' ? (
                        <ShowHistoryDrawerContent config={config} />
                      ) : contentType === 'notifications' ? (
                        <NotificationsDrawerContent />
                      ) : contentType === 'addToPhonebookDrawer' ? (
                        <AddToPhonebookDrawerContent config={config} />
                      ) : contentType === 'showQueueCall' ? (
                        <ShowQueueCallDrawerContent config={config} />
                      ) : contentType === 'showPhoneLines' ? (
                        <ShowPhoneLinesDrawerContent config={config} />
                      ) : contentType === 'showMultiplePhoneLines' ? (
                        <ShowMultiplePhoneLinesDrawerContent config={config} />
                      ) : contentType === 'showTelephoneAnnouncement' ? (
                        <EditAnnouncementDrawerContent config={config} />
                      ) : contentType === 'showSaveRecordedAnnouncement' ? (
                        <SaveRecordedAnnouncementDrawerContent config={config} />
                      ) : contentType === 'showRuleDetails' ? (
                        <ShowRuleDetailsContent config={config} />
                      ) : contentType === 'showGravatar' ? (
                        <GravatarIconDrawerContent config={config} />
                      ) : contentType === 'showUploadProfilePicture' ? (
                        <SelectProfilePictureDrawerContent config={config} />
                      ) : contentType === 'showEditPhysicalPhone' ? (
                        <EditPhysicalPhoneDrawerContent config={config} />
                      ) : contentType === 'showSwitchDeviceInputOutput' ? (
                        <SwitchInputOutputDrawerContent config={config} />
                      ) : contentType === 'showDownloadLinkContent' ? (
                        <DownloadDesktopLinkContent config={config} />
                      ) : contentType === 'showUploadVoicemail' ? (
                        <UploadVoicemail config={config} />
                      ) : null}
                    </div>
                  </nav>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
