// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * The VoiceMail component
 *
 * @return The fixed right bar with voice mail as the default
 */

import { VoiceMailContent } from '../common/UserRightSideMenu/VoiceMailContent'

export const UserVoiceMail = () => {
  return (
    <>
      <aside className='relative z-20 hidden lg:w-72 xl:w-80 2xl:w-96 border-l lg:block h-full border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
        <VoiceMailContent />
      </aside>
    </>
  )
}
