// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { closeSideDrawer } from '../../lib/utils'
import { t } from 'i18next'
import { DrawerHeader } from '../common/DrawerHeader'
import { SummaryView } from './SummaryView'
import { TranscriptionView } from './TranscriptionView'

export interface CallSummaryDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const CallSummaryDrawerContent = forwardRef<
  HTMLButtonElement,
  CallSummaryDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const isSummary = config?.isSummary || false
  const uniqueid: string | undefined = config?.uniqueid
  const linkedid: string | undefined = config?.linkedid

  const drawerTitle = isSummary
    ? t('Summary.Call summary') || 'Call summary'
    : t('Summary.Call transcription') || 'Call transcription'

  return (
    <>
      <DrawerHeader title={drawerTitle} onClose={closeSideDrawer} />
      <div className={classNames(className, 'px-5')} {...props}>
        {isSummary && uniqueid ? (
          <SummaryView uniqueid={uniqueid} linkedid={linkedid} />
        ) : uniqueid ? (
          <TranscriptionView uniqueid={uniqueid} linkedid={linkedid} />
        ) : null}
      </div>
    </>
  )
})

CallSummaryDrawerContent.displayName = 'CallSummaryDrawerContent'
