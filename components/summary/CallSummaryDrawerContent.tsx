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
  const uniqueid = config?.uniqueid
  const source = config?.source
  const destination = config?.destination
  const date = config?.date

  const drawerTitle = isSummary
    ? t('Summary.Call summary') || 'Call summary'
    : t('Summary.Call transcription') || 'Call transcription'

  return (
    <>
      <DrawerHeader title={drawerTitle} onClose={closeSideDrawer} />
      <div className={classNames(className, 'px-5')} {...props}>
        {isSummary ? (
          <SummaryView
            uniqueid={uniqueid}
            source={source}
            destination={destination}
            date={date}
          />
        ) : (
          <TranscriptionView
            uniqueid={uniqueid}
            source={source}
            destination={destination}
            date={date}
          />
        )}
      </div>
    </>
  )
})

CallSummaryDrawerContent.displayName = 'CallSummaryDrawerContent'
