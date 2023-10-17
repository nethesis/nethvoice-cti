// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { UserLastCallsContent } from '../common/UserRightSideMenu/UserLastCallsContent'

export const UserLastCalls = () => {
  const rightSideStatus: any = useSelector((state: RootState) => state.rightSideMenu)

  return (
    <>
      {/* Secondary column (hidden on smaller screens) */}
      <aside
        className={`${
          rightSideStatus.isShown
            ? 'relative z-20 hidden lg:w-72 xl:w-80 2xl:w-96 border-l lg:block h-full border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
            : 'hidden'
        }`}
      >
        {' '}
        <UserLastCallsContent />
      </aside>
    </>
  )
}
