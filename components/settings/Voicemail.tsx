// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  faCircleArrowUp,
  IconDefinition,
  faPlay,
  faEllipsisVertical,
  faVoicemail,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { t } from 'i18next'
import { Button } from '../common'
import { faRecord } from '@nethesis/nethesis-solid-svg-icons'

const STYLES = {
  tableCell: 'px-6 py-4 gap-6 text-sm font-normal font-poppins text-gray-700 dark:text-gray-200',
  tableHeader:
    'text-left relative px-6 py-3 gap-2 bg-gray-100 dark:bg-gray-800 font-poppins font-medium text-sm text-gray-900 dark:text-gray-50',
  iconButton: 'text-emerald-700 dark:text-emerald-500 h-4 w-4',
  buttonText: 'font-poppins text-sm font-medium text-emerald-700 dark:text-emerald-500',
  ghostButton: 'gap-3 px-3 py-2',
}

interface VoicemailTableProps {
  title: string
}

const VoicemailTable = ({ title }: VoicemailTableProps) => {
  return (
    <div>
      <span className='rounded-t-lg bg-indigo-300 dark:bg-indigo-800 pt-1 pb-3 px-6 gap-10 text-base font-normal font-poppins text-gray-900 dark:text-gray-50'>
        {title}
      </span>
      <div className='relative overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700'>
        <table className='w-full'>
          <thead className='border-b border-gray-300 dark:border-gray-700'>
            <tr>
              <th className={STYLES.tableHeader}>{t('Settings.Name')}</th>
              <th className={STYLES.tableHeader}>{t('Settings.Creation date')}</th>
              <th className={STYLES.tableHeader}>{t('Settings.Status')}</th>
              <th className={STYLES.tableHeader}></th>
            </tr>
          </thead>
          <tbody>
            <tr className='border-b border-gray-300 dark:border-gray-700'>
              <td className={STYLES.tableCell}>
                <span>{t('Settings.Default')}</span>
                <FontAwesomeIcon icon={faVoicemail} className='ml-2 h-4 w-4 text-gray-400' />
              </td>
              <td className={STYLES.tableCell}></td>
              <td className={STYLES.tableCell}></td>
              <td className={`${STYLES.tableCell} text-right`}>
                <Button variant='ghost' className={STYLES.ghostButton}>
                  <FontAwesomeIcon icon={faPlay} className={STYLES.iconButton} />
                  <span className={STYLES.buttonText}>Play</span>
                </Button>
                <Button variant='ghost' className={STYLES.ghostButton}>
                  <FontAwesomeIcon icon={faEllipsisVertical} className={STYLES.iconButton} />
                </Button>
              </td>
            </tr>
            <tr>
              <td className={STYLES.tableCell}></td>
              <td className={STYLES.tableCell}></td>
              <td className={STYLES.tableCell}></td>
              <td className={`${STYLES.tableCell} text-right`}>
                <Button variant='ghost' className={STYLES.ghostButton}>
                  <FontAwesomeIcon icon={faPlay} className={STYLES.iconButton} />
                  <span className={STYLES.buttonText}>Play</span>
                </Button>
                <Button variant='ghost' className={STYLES.ghostButton}>
                  <FontAwesomeIcon icon={faEllipsisVertical} className={STYLES.iconButton} />
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const Voicemail = () => {
  return (
    <>
      <div className='gap-8 p-6 flex flex-col'>
        <div>
          <h1 className='text-base font-medium text-gray-700 dark:text-gray-200'>
            {t('Settings.Voicemail')}
          </h1>
        </div>
        <div className='gap-8 flex flex-col'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-medium font-poppins text-gray-700 dark:text-gray-200'>
              {t('Settings.Greeting messages')}
            </h2>
            <div className='gap-4 flex flex-row'>
              <Button variant='ghost' className={STYLES.ghostButton}>
                <FontAwesomeIcon icon={faCircleArrowUp} className={STYLES.iconButton} />
                <span className={STYLES.buttonText}>{t('Settings.Upload message')}</span>
              </Button>
              <Button variant='white' className={STYLES.ghostButton}>
                <FontAwesomeIcon icon={faRecord as IconDefinition} className={STYLES.iconButton} />
                <span className={STYLES.buttonText}>{t('Settings.Record message')}</span>
              </Button>
            </div>
          </div>
          <div className='flex flex-col gap-8'>
            <VoicemailTable title={t('Settings.Busy status')} />
            <VoicemailTable title={t('Settings.Unavailable status')} />
          </div>
        </div>
      </div>
    </>
  )
}
