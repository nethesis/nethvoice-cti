// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEarListen,
  faTicket,
  faPhoneSlash,
  faPhone,
  faEllipsisVertical,
  faHandPointUp,
  faArrowLeft,
  faCirclePause,
  faMicrophoneSlash,
  faRecordVinyl,
} from '@fortawesome/free-solid-svg-icons'
import { Button, Dropdown } from '../common'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { CallDuration } from '../operators/CallDuration'
import { isEmpty } from 'lodash'
import { postRecallOnBusy, hangup, startListen, toggleRecord, intrude } from '../../lib/operators'
import { eventDispatch } from '../../lib/hooks/eventDispatch'
import { openToast } from '../../lib/utils'

interface ActionCallProps {
  config: any
}

export const ActionCall: React.FC<ActionCallProps> = ({ config }) => {
  const { t } = useTranslation()
  const operators = useSelector((state: RootState) => state.operators)
  const profile = useSelector((state: RootState) => state.user)
  const auth = useSelector((state: RootState) => state.authentication)
  const username = auth.username

  async function recallOnBusyPost() {
    let recallOnBusyInformations: any = {}
    if (profile?.mainextension && operators?.operators[config?.username]?.conversations[0]?.id) {
      //create object with information for recall on busy post api
      //caller is user main extension
      //called is main extension of user that is busy
      recallOnBusyInformations = {
        caller: profile?.mainextension,
        called: operators?.operators[config?.username]?.endpoints?.mainextension[0]?.id,
      }
      if (!isEmpty(recallOnBusyInformations)) {
        try {
          const res = await postRecallOnBusy(recallOnBusyInformations)

          let waitingNumber = res.waitingExtensions
          showToast(waitingNumber)
        } catch (e) {
          console.error(e)
          return []
        }
      }
    }
  }

  async function hangupConversation() {
    if (
      operators?.operators[config?.username]?.conversations[0]?.id &&
      operators?.operators[config?.username]?.conversations[0]?.owner
    ) {
      const conversationId = operators?.operators[config?.username]?.conversations[0]?.id
      let numberToClose = operators?.operators[config?.username]?.conversations[0]?.owner
      if (conversationId && numberToClose) {
        const hangupInformations = {
          convid: conversationId.toString(),
          endpointId: numberToClose.toString(),
        }

        if (!isEmpty(hangupInformations)) {
          try {
            await hangup(hangupInformations)
          } catch (e) {
            console.error(e)
            return []
          }
        }
      }
    }
  }

  async function listenConversation() {
    // if main user is not in conversation enable listen conversation

    if (
      !!operators?.operators[config?.username]?.conversations?.length &&
      (operators?.operators[config?.username]?.conversations[0]?.connected ||
        operators?.operators[config?.username]?.conversations[0]?.inConference ||
        operators?.operators[config?.username]?.conversations[0]?.chDest?.inConference == true ||
        !isEmpty(operators?.operators[config?.username]?.conversations[0]))
    ) {
      const conversationId = operators?.operators[config?.username]?.conversations[0].id
      let numberToSendCall = ''
      if (!isEmpty(profile?.default_device)) {
        numberToSendCall = profile?.default_device?.id?.toString()
      }
      if (conversationId) {
        const numberToListen = conversationId?.match(/\/(\d+)-/)
        if (numberToListen) {
          const endpointId = numberToListen[1]

          const listenInformations = {
            convid: conversationId.toString(),
            destId: numberToSendCall,
            endpointId: endpointId.toString(),
          }

          let listeningInformations: any = {}
          listeningInformations = {
            isListening: true,
            listening_id: conversationId.toString(),
          }
          store.dispatch.userActions.updateListeningInformation(listeningInformations)

          if (!isEmpty(listenInformations)) {
            try {
              await startListen(listenInformations)
              eventDispatch('phone-island-listen-call', { to: listenInformations?.endpointId })
            } catch (e) {
              console.error(e)
              return []
            }
          }
        }
      }
    }
  }

  async function intrudeConversation() {
    // if main user is not in conversation enable intrude in to conversation

    if (
      !!operators?.operators[config?.username]?.conversations?.length &&
      (operators?.operators[config?.username]?.conversations[0]?.connected ||
        operators?.operators[config?.username]?.conversations[0]?.inConference ||
        operators?.operators[config?.username]?.conversations[0]?.chDest?.inConference == true ||
        !isEmpty(operators?.operators[config?.username]?.conversations[0]))
    ) {
      const conversationId = operators?.operators[config?.username]?.conversations[0]?.id
      let numberToSendCall = ''
      if (!isEmpty(profile?.default_device)) {
        numberToSendCall = profile?.default_device?.id?.toString()
      }
      if (conversationId) {
        const numberToIntrude = conversationId?.match(/\/(\d+)-/)
        if (numberToIntrude) {
          const endpointId = numberToIntrude[1]

          const intrudeInformations = {
            convid: conversationId.toString(),
            destId: numberToSendCall,
            endpointId: endpointId.toString(),
          }

          let iconIntrudeInformations: any = {}
          iconIntrudeInformations = {
            isIntrude: true,
            intrude_id: conversationId.toString(),
          }
          store.dispatch.userActions.updateIntrudeInformation(iconIntrudeInformations)

          if (!isEmpty(intrudeInformations)) {
            try {
              await intrude(intrudeInformations)
              eventDispatch('phone-island-intrude-call', { to: intrudeInformations?.endpointId })
            } catch (e) {
              console.error(e)
              return []
            }
          }
        }
      }
    }
  }

  async function recordConversation() {
    // if main user is not in conversation enable listen conversation

    if (
      !!operators?.operators[config?.username]?.conversations?.length &&
      (operators?.operators[config?.username]?.conversations[0]?.connected ||
        operators?.operators[config?.username]?.conversations[0]?.inConference ||
        operators?.operators[config?.username]?.conversations[0]?.chDest?.inConference == true ||
        !isEmpty(operators?.operators[config?.username]?.conversations[0]))
    ) {
      const conversationId = operators?.operators[config?.username]?.conversations[0]?.id
      if (conversationId) {
        const numberToSendCall = conversationId?.match(/\/(\d+)-/)
        if (numberToSendCall) {
          const endpointId = numberToSendCall[1]
          const listenInformations = {
            convid: conversationId.toString(),
            endpointId: endpointId.toString(),
          }
          let recordingValues = ''
          switch (operators?.operators[config?.username]?.conversations[0]?.recording) {
            case 'false':
              recordingValues = 'not_started'
              break
            case 'true':
              recordingValues = 'started'
              break
            case 'mute':
              recordingValues = 'muted'
              break
            default:
              recordingValues = ''
              break
          }

          if (!isEmpty(listenInformations)) {
            try {
              await toggleRecord(recordingValues, listenInformations)
            } catch (e) {
              console.error(e)
              return []
            }
          }
        }
      }
    }
  }

  const showToast = (extensionWaiting: any) => {
    openToast(
      'success',
      `${t('Operators.Recall on busy message', { extensionWaiting })}`,
      `${t('Operators.Recall on busy', { extensionWaiting })}`,
    )
  }

  const getCallActionsMenu = (configAction: any) => {
    return (
      <>
        {profile?.recallOnBusy && (
          <>
            <Dropdown.Item icon={faTicket} onClick={() => recallOnBusyPost()}>
              {t('OperatorDrawer.Book')}
            </Dropdown.Item>
          </>
        )}
        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.hangup?.value && (
          <Dropdown.Item icon={faPhoneSlash} onClick={() => hangupConversation()}>
            {t('OperatorDrawer.Hangup')}
          </Dropdown.Item>
        )}
        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.spy?.value && (
          <Dropdown.Item icon={faEarListen} onClick={() => listenConversation()}>
            {t('OperatorDrawer.Listen')}
          </Dropdown.Item>
        )}
        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.intrude?.value && (
          <Dropdown.Item icon={faHandPointUp} onClick={() => intrudeConversation()}>
            {' '}
            {t('OperatorDrawer.Intrude')}
          </Dropdown.Item>
        )}

        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.ad_recording?.value && (
          <Dropdown.Item
            icon={
              operators?.operators[config.username]?.conversations &&
              operators?.operators[config.username]?.conversations[0]?.recording &&
              operators?.operators[config.username]?.conversations[0]?.recording === 'true'
                ? faCirclePause
                : operators?.operators[config.username]?.conversations &&
                  operators?.operators[config.username]?.conversations[0]?.recording === 'false'
                ? faRecordVinyl
                : faMicrophoneSlash
            }
            onClick={() => recordConversation()}
          >
            {operators?.operators[config.username]?.conversations &&
            operators?.operators[config.username]?.conversations[0]?.recording &&
            operators?.operators[config.username]?.conversations[0]?.recording === 'true'
              ? t('OperatorDrawer.Stop recording')
              : operators?.operators[config.username]?.conversations &&
                operators?.operators[config.username]?.conversations[0]?.recording === 'false'
              ? t('OperatorDrawer.Start recording')
              : t('OperatorDrawer.Restart recording')}
          </Dropdown.Item>
        )}
      </>
    )
  }

  return (
    <div>
      <div className='mt-6 flex items-end justify-between'>
        <h4 className='text-base font-medium text-gray-700 dark:text-gray-200'>
          {t('OperatorDrawer.Current call')}
        </h4>
        <div>
          {operators?.operators[config?.username]?.conversations[0]?.chDest?.callerName !=
            profile?.name &&
            operators?.operators[config?.username]?.conversations[0]?.chSource?.callerName !=
              profile?.name && (
              <>
                {/* ongoing call menu */}
                <Dropdown items={getCallActionsMenu(config)} position='left'>
                  <Button variant='ghost'>
                    <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                    <span className='sr-only'>{t('OperatorDrawer.Open call actions menu')}</span>
                  </Button>
                </Dropdown>
              </>
            )}
        </div>
      </div>
      <div className='mt-4 border-t border-gray-200 dark:border-gray-700'>
        <dl>
          {/*  contact */}
          <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
            <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              {t('OperatorDrawer.Contact')}
            </dt>
            <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
              {operators?.operators[config?.username]?.conversations[0]?.counterpartName !==
                operators?.operators[config?.username]?.conversations[0]?.counterpartNum && (
                <div className='mb-1.5 flex items-center text-sm'>
                  <span className='truncate'>
                    {operators?.operators[config?.username]?.conversations[0]?.counterpartName ||
                      '-'}
                  </span>
                </div>
              )}
              {/*  number */}
              <div className='flex items-center text-sm'>
                <FontAwesomeIcon
                  icon={faPhone}
                  className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                  aria-hidden='true'
                />
                <span className='truncate'>
                  {operators?.operators[config?.username]?.conversations[0]?.counterpartNum || '-'}
                </span>
              </div>
            </dd>
          </div>
          {/*  direction */}
          <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
            <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              {t('OperatorDrawer.Direction')}
            </dt>
            <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
              {operators?.operators[config?.username]?.conversations[0]?.direction == 'out' && (
                <div className='flex items-center text-sm'>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className='mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500'
                    aria-hidden='true'
                  />
                  <span className='truncate'> {t('OperatorDrawer.Outgoing')}</span>
                </div>
              )}
              {operators?.operators[config?.username]?.conversations[0]?.direction == 'in' && (
                <div className='flex items-center text-sm'>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    className='mr-2 h-5 w-3.5 -rotate-45 text-green-600 dark:text-green-500'
                    aria-hidden='true'
                  />
                  <span className='truncate'>{t('OperatorDrawer.Incoming')}</span>
                </div>
              )}
            </dd>
          </div>
          {/*  duration */}
          <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
            <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
              {t('OperatorDrawer.Duration')}
            </dt>
            <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
              <div
                className='flex items-center text-sm'
                key={`callDuration-${operators?.operators[config?.username]?.username}`}
              >
                <CallDuration
                  startTime={operators?.operators[config?.username]?.conversations[0]?.startTime}
                />
              </div>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

ActionCall.displayName = 'ActionCall'
