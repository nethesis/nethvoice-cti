// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { UserLastCallsContent } from '../common/UserRightSideMenu/UserLastCallsContent'

export const UserLastCalls = () => {
  return (
    <>
      {/* Secondary column (hidden on smaller screens) */}
      <aside className='relative z-20 hidden lg:w-72 xl:w-80 2xl:w-96 border-l lg:block h-full border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
        {' '}
        <UserLastCallsContent />
      </aside>
    </>
  )
}
