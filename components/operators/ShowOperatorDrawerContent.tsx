// Copyright (C) 2023 Nethesis S.r.l.
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
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('OperatorDrawer.Operator details')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon className='p-0.5' />
          </div>
        </div>
      </div>
      <div className={classNames('p-5', className)} {...props}>
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
