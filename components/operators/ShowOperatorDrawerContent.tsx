// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef } from 'react'
import classNames from 'classnames'
import { SideDrawerCloseIcon } from '../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { LastCallsDrawerTable } from '../history/LastCallsDrawerTable'
import { startOfDay, subDays } from 'date-fns'
import { OperatorSummary } from './OperatorSummary'
import { useTranslation } from 'react-i18next'

export interface ShowOperatorDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowOperatorDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowOperatorDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const profile = useSelector((state: RootState) => state.user)

  const { t } = useTranslation()

  const auth = useSelector((state: RootState) => state.authentication)

  return (
    <>
      <div className='bg-elevationL1 dark:bg-elevationL1Dark pt-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-primaryNeutralDark text-primaryNeutral'>
            {t('OperatorDrawer.Operator details')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon className='p-0.5' />
          </div>
        </div>
      </div>
      <div className={classNames('px-6 bg-elevationL1 dark:bg-elevationL1Dark', className)} {...props}>
        {/* divider */}
        <div className='relative pb-8'>
          <div className='absolute inset-0 flex items-center' aria-hidden='true'>
            <div className='w-full border-t border-layoutDivider dark:border-layoutDividerDark' />
          </div>
        </div>
        <OperatorSummary operator={config} isShownFavorite={true} isShownSideDrawerLink={false} />

        {/* last calls: search all operator extensions */}
        {profile?.profile?.macro_permissions?.cdr?.permissions?.ad_cdr?.value && (
          <LastCallsDrawerTable
            callType={config?.lastCallsType || 'switchboard'}
            dateFrom={startOfDay(subDays(new Date(), 7))}
            dateTo={new Date()}
            phoneNumbers={config?.endpoints?.extension?.map((ext: any) => ext.id)}
            limit={10}
          />
        )}
      </div>
    </>
  )
})

ShowOperatorDrawerContent.displayName = 'ShowOperatorDrawerContent'
