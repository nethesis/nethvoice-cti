// Copyright (C) 2026 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { Button } from '../../common'
import { AccountSection } from '../AccountSection'
import { getPasswordInfo } from '../../../services/password'
import { PasswordInfo } from '../../../services/types/password'
import { formatDateLoc } from '../../../lib/dateTime'
import { store } from '../../../store'

export const ChangePassword: FC = () => {
  const { t } = useTranslation()
  const [info, setInfo] = useState<PasswordInfo | null>(null)

  const loadInfo = async () => {
    try {
      setInfo(await getPasswordInfo())
    } catch (error) {
      console.error('Error loading password info:', error)
    }
  }

  useEffect(() => {
    loadInfo()
  }, [])

  const openDrawer = () => {
    store.dispatch.sideDrawer.update({
      isShown: true,
      contentType: 'changePassword',
      config: { policy: info?.policy || null, onChanged: loadInfo },
    })
  }

  return (
    <AccountSection
      title={t('Password.Change password')}
      description={t('Password.Update the password used to sign in to Web phone and Desktop app.')}
    >
      <div className='flex flex-col gap-10 items-start'>
        {info?.expiration && (
          <div className='flex items-center gap-4 text-sm'>
            <span className='text-tertiaryNeutral dark:text-tertiaryNeutralDark'>
              {t('Password.Password expires on')}
            </span>
            <span className='text-secondaryNeutral dark:text-secondaryNeutralDark'>
              {formatDateLoc(new Date(info.expiration), 'd MMM yyyy')}
            </span>
          </div>
        )}
        <Button variant='white' onClick={openDrawer}>
          <FontAwesomeIcon icon={faKey} className='mr-2 h-4 w-4' />
          {t('Password.Change password')}
        </Button>
      </div>
    </AccountSection>
  )
}
