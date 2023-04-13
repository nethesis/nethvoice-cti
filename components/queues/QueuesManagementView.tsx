// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Button, Dropdown, EmptyState, IconSwitch, TextInput } from '../common'
import { isEmpty, debounce } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { sortByFavorite, sortByProperty } from '../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  addQueueToExpanded,
  addQueueToFavorites,
  loginToQueue,
  logoutFromQueue,
  pauseQueue,
  removeQueueFromExpanded,
  removeQueueFromFavorites,
  searchStringInQueue,
  unpauseQueue,
} from '../../lib/queuesLib'
import {
  faChevronDown,
  faCircleXmark,
  faFilter,
  faHeadset,
  faPause,
  faPhone,
  faStar as faStarSolid,
  faArrowDownLeftAndArrowUpRightToCenter,
  faChevronUp,
  faUserClock,
  faUserCheck,
  faUserXmark,
  faMug,
  faLightEmergencyOn,
  faThumbTack,
  faCircleNotch,
} from '@nethesis/nethesis-solid-svg-icons'
import { faStar as faStarLight } from '@nethesis/nethesis-light-svg-icons'
import { getOperatorByPhoneNumber, openShowOperatorDrawer } from '../../lib/operators'
import classNames from 'classnames'
import { LoggedStatus } from './LoggedStatus'
import { CallDuration } from '../operators/CallDuration'
import { LogoutAllQueuesModal } from './LogoutAllQueuesModal'
import { Tooltip } from 'react-tooltip'
import InfiniteScroll from 'react-infinite-scroll-component'

export interface QueuesManagementViewProps extends ComponentProps<'div'> {}

export const QueuesManagementView: FC<QueuesManagementViewProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [filteredQueues, setFilteredQueues]: any = useState({})
  const { operators } = useSelector((state: RootState) => state.operators)
  const [isApplyingFilters, setApplyingFilters]: any = useState(false)
  const { name, mainPresence, mainextension, avatar, profile } = useSelector(
    (state: RootState) => state.user,
  )
  const authStore = useSelector((state: RootState) => state.authentication)
  const queuesStore = useSelector((state: RootState) => state.queues)

  const [textFilter, setTextFilter]: any = useState('')
  const [debouncedTextFilter, setDebouncedTextFilter] = useState(false)

  const [queuesToLogout, setQueuesToLogout] = useState<any[]>([])
  const [showLogoutAllQueuesModal, setShowLogoutAllQueuesModal] = useState<boolean>(false)

  const toggleDebouncedTextFilter = () => {
    setDebouncedTextFilter(!debouncedTextFilter)
  }

  const changeTextFilter = (event: any) => {
    const newTextFilter = event.target.value
    setTextFilter(newTextFilter)
    debouncedUpdateTextFilter()
  }

  const debouncedUpdateTextFilter = useMemo(
    () => debounce(toggleDebouncedTextFilter, 400),
    [debouncedTextFilter],
  )

  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const clearTextFilter = () => {
    setTextFilter('')
    debouncedUpdateTextFilter()
    textFilterRef.current.focus()
  }

  // stop invocation of debounced function after unmounting
  useEffect(() => {
    return () => {
      debouncedUpdateTextFilter.cancel()
    }
  }, [debouncedUpdateTextFilter])

  const applyFilters = () => {
    setApplyingFilters(true)

    // text filter
    let filteredQueues = Object.values(queuesStore.queues).filter((queue) =>
      searchStringInQueue(queue, textFilter),
    )

    // sort queues
    filteredQueues.sort(sortByProperty('name'))
    filteredQueues.sort(sortByProperty('queue'))
    filteredQueues.sort(sortByFavorite)

    setFilteredQueues(filteredQueues)
    setApplyingFilters(false)
  }

  // filtered queues
  useEffect(() => {
    applyFilters()
  }, [queuesStore.queues, debouncedTextFilter])

  const areAllQueuesExpanded = () => {
    return Object.values(queuesStore.queues).every((queue: any) => queue.expanded)
  }

  const toggleExpandQueue = (queue: any) => {
    const queueId = queue.queue
    const isExpanded = !queue.expanded
    store.dispatch.queues.setQueueExpanded(queueId, isExpanded)

    if (isExpanded) {
      addQueueToExpanded(queueId, authStore.username)
    } else {
      removeQueueFromExpanded(queueId, authStore.username)
    }
    applyFilters()
  }

  const toggleFavoriteQueue = (queue: any) => {
    const queueId = queue.queue
    const isFavorite = !queue.favorite
    store.dispatch.queues.setQueueFavorite(queueId, isFavorite)

    if (isFavorite) {
      addQueueToFavorites(queueId, authStore.username)
    } else {
      removeQueueFromFavorites(queueId, authStore.username)
    }
  }

  const toggleWaitingCallsExpanded = (queue: any) => {
    const queueId = queue.queue
    const isExpanded = !queue.waitingCallsExpanded
    store.dispatch.queues.setWaitingCallsExpanded(queueId, isExpanded)
    applyFilters()
  }

  const toggleConnectedCallsExpanded = (queue: any) => {
    const queueId = queue.queue
    const isExpanded = !queue.connectedCallsExpanded
    store.dispatch.queues.setConnectedCallsExpanded(queueId, isExpanded)
    applyFilters()
  }

  const toggleOperatorsExpanded = (queue: any) => {
    const queueId = queue.queue
    const isExpanded = !queue.operatorsExpanded
    store.dispatch.queues.setOperatorsExpanded(queueId, isExpanded)
    applyFilters()
  }

  const toggleExpandAllQueues = () => {
    if (areAllQueuesExpanded()) {
      // collapse all queues
      Object.keys(queuesStore.queues).map((key: any) => {
        const queue: any = queuesStore.queues[key]
        store.dispatch.queues.setQueueExpanded(queue.queue, false)
        removeQueueFromExpanded(queue.queue, authStore.username)
      })
    } else {
      // expand all queues
      Object.keys(queuesStore.queues).map((key: any) => {
        const queue: any = queuesStore.queues[key]
        store.dispatch.queues.setQueueExpanded(queue.queue, true)
        addQueueToExpanded(queue.queue, authStore.username)
      })
    }
    applyFilters()
  }

  const getQueuesUserLoggedIn = () => {
    return Object.values(queuesStore.queues)
      .filter((queue: any) => {
        return (
          queue.members[mainextension].loggedIn && queue.members[mainextension].type !== 'static'
        )
      })
      .map((queue: any) => queue.queue)
  }

  const getQueuesUserPaused = () => {
    return Object.values(queuesStore.queues)
      .filter((queue: any) => {
        return queue.members[mainextension].paused
      })
      .map((queue: any) => queue.queue)
  }

  const loginAllQueues = () => {
    const queuesToLogin = Object.values(queuesStore.queues).filter((queue: any) => {
      return (
        !getQueuesUserLoggedIn().includes(queue.queue) &&
        queue.members[mainextension].type != 'static'
      )
    })

    queuesToLogin.forEach((queue: any) => {
      loginToQueue(mainextension, queue.queue)
    })
  }

  const prepareLogoutAllQueuesModal = () => {
    const queuesToLogout = Object.values(queuesStore.queues).filter((queue: any) => {
      return getQueuesUserLoggedIn().includes(queue.queue)
    })

    setQueuesToLogout(queuesToLogout)
    setShowLogoutAllQueuesModal(true)
  }

  const logoutAllQueues = () => {
    queuesToLogout.forEach((queue: any) => {
      logoutFromQueue(mainextension, queue.queue)
    })
    setShowLogoutAllQueuesModal(false)
  }

  const loginSingleQueue = (queue: any) => {
    loginToQueue(mainextension, queue.queue)
  }

  const logoutSingleQueue = (queue: any) => {
    logoutFromQueue(mainextension, queue.queue)
  }

  const pauseAllQueues = (reason: string) => {
    const queuesToPause = Object.values(queuesStore.queues).filter((queue: any) => {
      return !getQueuesUserPaused().includes(queue.queue) && queue.members[mainextension].loggedIn
    })

    queuesToPause.forEach((queue: any) => {
      pauseQueue(mainextension, queue.queue, reason)
    })
  }

  const unpauseAllQueues = () => {
    const queuesToUnpause = Object.values(queuesStore.queues).filter((queue: any) => {
      return getQueuesUserPaused().includes(queue.queue)
    })

    queuesToUnpause.forEach((queue: any) => {
      unpauseQueue(mainextension, queue.queue)
    })
  }

  const pauseSingleQueue = (queue: any, reason: string) => {
    pauseQueue(mainextension, queue.queue, reason)
  }

  const unpauseSingleQueue = (queue: any) => {
    unpauseQueue(mainextension, queue.queue)
  }

  const getMinWait = (queue: any) => {
    if (isEmpty(queue.waitingCallersList)) {
      return 0
    }

    return queue.waitingCallersList[queue.waitingCallersList.length - 1].waitingTime
  }

  const getMaxWait = (queue: any) => {
    if (isEmpty(queue.waitingCallersList)) {
      return 0
    }
    return queue.waitingCallersList[0].waitingTime
  }

  const getQueueOperatorTemplate = (queue: any, queueOperator: any, index: number) => {
    const operatorExtension = queueOperator.member
    const operator: any = getOperatorByPhoneNumber(operatorExtension, operators)

    if (!operator) {
      return
    }

    return (
      <div
        key={index}
        className='flex items-center justify-between px-4 py-2 gap-2 hover:bg-gray-100 dark:hover:bg-gray-900'
      >
        <div className='flex items-center gap-3 overflow-hidden'>
          <Avatar
            rounded='full'
            src={operator.avatarBase64}
            placeholderType='operator'
            size='small'
            status={operator.mainPresence}
            onClick={() => openShowOperatorDrawer(operator)}
            className='cursor-pointer'
          />
          <div className='flex flex-col overflow-hidden'>
            <div
              className='truncate cursor-pointer hover:underline'
              onClick={() => openShowOperatorDrawer(operator)}
            >
              {operator.name}
            </div>
            <div className='text-gray-500 dark:text-gray-500'>
              {operator.endpoints.mainextension[0].id}
            </div>
          </div>
        </div>
        <div className='shrink-0'>
          <LoggedStatus loggedIn={queueOperator.loggedIn} paused={queueOperator.paused} />
        </div>
      </div>
    )
  }

  const getPauseAllQueuesItemsMenu = () => (
    <>
      <Dropdown.Item icon={faUserClock} onClick={() => pauseAllQueues('')}>
        {t('Queues.Pause')}
      </Dropdown.Item>
      <Dropdown.Item icon={faMug} onClick={() => pauseAllQueues('Lunch break')}>
        {t('Queues.Lunch break')}
      </Dropdown.Item>
      <Dropdown.Item icon={faLightEmergencyOn} onClick={() => pauseAllQueues('Emergency')}>
        {t('Queues.Emergency')}
      </Dropdown.Item>
      <Dropdown.Item icon={faThumbTack} onClick={() => pauseAllQueues('Backend')}>
        {t('Queues.Backend')}
      </Dropdown.Item>
    </>
  )

  const getPauseSingleQueueItemsMenu = (queue: any) => (
    <>
      <Dropdown.Item icon={faUserClock} onClick={() => pauseSingleQueue(queue, '')}>
        {t('Queues.Pause')}
      </Dropdown.Item>
      <Dropdown.Item icon={faMug} onClick={() => pauseSingleQueue(queue, 'Lunch break')}>
        {t('Queues.Lunch break')}
      </Dropdown.Item>
      <Dropdown.Item icon={faLightEmergencyOn} onClick={() => pauseSingleQueue(queue, 'Emergency')}>
        {t('Queues.Emergency')}
      </Dropdown.Item>
      <Dropdown.Item icon={faThumbTack} onClick={() => pauseSingleQueue(queue, 'Backend')}>
        {t('Queues.Backend')}
      </Dropdown.Item>
    </>
  )

  return (
    <div className={classNames(className)}>
      <LogoutAllQueuesModal
        isShown={showLogoutAllQueuesModal}
        queuesToLogout={queuesToLogout}
        onConfirm={logoutAllQueues}
        onClose={() => setShowLogoutAllQueuesModal(false)}
      />
      <div className='flex justify-between gap-x-4 flex-col-reverse md:flex-row'>
        {/* text filter */}
        <TextInput
          placeholder={t('Queues.Filter queues') || ''}
          value={textFilter}
          onChange={changeTextFilter}
          ref={textFilterRef}
          icon={textFilter.length ? faCircleXmark : undefined}
          onIconClick={() => clearTextFilter()}
          trailingIcon={true}
          className='max-w-sm mb-4'
        />
        {/* login/logout and pause buttons */}
        <div className='flex flex-col md:items-end mb-3 shrink-0'>
          {queuesStore.isLoaded && (
            <div className='flex items-center'>
              {/* login / logout */}
              {isEmpty(getQueuesUserLoggedIn()) ? (
                <>
                  {/* login from all queues */}
                  <Button variant='white' className='mr-2 mb-2' onClick={loginAllQueues}>
                    <FontAwesomeIcon
                      icon={faUserCheck}
                      className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400'
                    />
                    <span>{t('Queues.Login to all queues')}</span>
                  </Button>
                </>
              ) : (
                <>
                  {/* logout from all queues */}
                  <Button
                    variant='white'
                    className='mr-2 mb-2'
                    onClick={prepareLogoutAllQueuesModal}
                  >
                    <FontAwesomeIcon
                      icon={faUserXmark}
                      className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400'
                    />
                    <span>{t('Queues.Logout from all queues')}</span>
                  </Button>
                </>
              )}
              {/* pause / end pause */}
              {isEmpty(getQueuesUserPaused()) ? (
                <>
                  {/* pause on all queues */}
                  <Dropdown items={getPauseAllQueuesItemsMenu()} position='left' className='mb-3'>
                    <Button variant='primary'>
                      <span>{t('Queues.Pause on all queues')}</span>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className='ml-2 h-3 w-3 flex-shrink-0'
                        aria-hidden='true'
                      />
                    </Button>
                  </Dropdown>
                </>
              ) : (
                <>
                  {/* end pause on all queues */}
                  <Button variant='primary' className='mb-3' onClick={unpauseAllQueues}>
                    <FontAwesomeIcon
                      icon={faUserClock}
                      className='h-4 w-4 mr-2 text-white dark:text-white'
                    />
                    <span>{t('Queues.End pause on all queues')}</span>
                  </Button>
                </>
              )}
            </div>
          )}
          {/* expand/collapse all queues */}
          <div
            onClick={() => toggleExpandAllQueues()}
            className='cursor-pointer hover:underline text-sm text-gray-900 dark:text-gray-100'
          >
            {areAllQueuesExpanded()
              ? t('Queues.Collapse all queues')
              : t('Queues.Expand all queues')}
          </div>
        </div>
      </div>
      <div className='mx-auto text-center'>
        {/* no search results */}
        {queuesStore.isLoaded && isEmpty(filteredQueues) && (
          <EmptyState
            title={t('Queues.No queues')}
            description={t('Common.Try changing your search filters') || ''}
            icon={
              <FontAwesomeIcon icon={faFilter} className='mx-auto h-12 w-12' aria-hidden='true' />
            }
          />
        )}
        <ul role='list' className='grid grid-cols-1 gap-6 xl:grid-cols-2 3xl:grid-cols-3'>
          {/* skeleton */}
          {(!queuesStore.isLoaded || isApplyingFilters) &&
            Array.from(Array(3)).map((e, i) => (
              <li
                key={i}
                className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'
              >
                <div className='px-5 py-4'>
                  {Array.from(Array(3)).map((e, j) => (
                    <div key={j} className='space-y-4 mb-4'>
                      <div className='animate-pulse h-5 rounded bg-gray-300 dark:bg-gray-600'></div>
                      <div className='animate-pulse h-5 rounded max-w-[75%] bg-gray-300 dark:bg-gray-600'></div>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          {/* queues */}
          {queuesStore.isLoaded &&
            !isEmpty(filteredQueues) &&
            Object.keys(filteredQueues).map((key) => {
              const queue = filteredQueues[key]
              return (
                <div key={queue.queue}>
                  <li className='col-span-1 rounded-md divide-y shadow divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                    {/* card header */}
                    <div className='flex flex-col pt-3 pb-5 px-5'>
                      <div className='flex w-full items-center justify-between space-x-6'>
                        <div className='flex-1 truncate'>
                          <div className='flex items-center space-x-2 py-1 text-gray-700 dark:text-gray-200'>
                            <h3 className='truncate text-lg leading-6 font-medium'>{queue.name}</h3>
                            <span>{queue.queue}</span>
                            <IconSwitch
                              on={queue.favorite}
                              size='large'
                              onIcon={<FontAwesomeIcon icon={faStarSolid} />}
                              offIcon={<FontAwesomeIcon icon={faStarLight} />}
                              changed={() => toggleFavoriteQueue(queue)}
                              key={queue.queue}
                              className={`tooltip-favorite-${queue.queue}`}
                            >
                              <span className='sr-only'>{t('Queues.Toggle favorite queue')}</span>
                            </IconSwitch>
                            <Tooltip anchorSelect={`.tooltip-favorite-${queue.queue}`} place='top'>
                              {queue.favorite
                                ? t('Common.Remove from favorites') || ''
                                : t('Common.Add to favorites') || ''}
                            </Tooltip>
                          </div>
                        </div>
                        <FontAwesomeIcon
                          icon={queue.expanded ? faChevronUp : faChevronDown}
                          className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                          aria-hidden='true'
                          onClick={() => toggleExpandQueue(queue)}
                        />
                      </div>
                      {/* queue stats */}
                      <div className='flex justify-evenly mt-1 text-gray-500 dark:text-gray-400'>
                        {/* total calls */}
                        <div
                          className={classNames(
                            'flex items-center gap-2',
                            `tooltip-total-calls-${queue.queue}`,
                          )}
                        >
                          <FontAwesomeIcon
                            icon={faPhone}
                            className='h-4 w-4 text-gray-400 dark:text-gray-500'
                          />
                          <span>
                            {queue.waitingCallersList.length + queue.connectedCalls.length}
                          </span>
                        </div>
                        <Tooltip
                          anchorSelect={`.tooltip-total-calls-${queue.queue}`}
                          place='bottom'
                        >
                          {t('Queues.Total calls')}
                        </Tooltip>
                        {/* waiting calls */}
                        <div
                          className={classNames(
                            'flex items-center gap-2',
                            `tooltip-waiting-calls-${queue.queue}`,
                          )}
                        >
                          <FontAwesomeIcon
                            icon={faPause}
                            className='h-4 w-4 text-gray-400 dark:text-gray-500'
                          />
                          <span>{queue.waitingCallersList.length}</span>
                        </div>
                        <Tooltip
                          anchorSelect={`.tooltip-waiting-calls-${queue.queue}`}
                          place='bottom'
                        >
                          {t('Queues.Waiting calls')}
                        </Tooltip>
                        {/* connected calls */}
                        <div
                          className={classNames(
                            'flex items-center gap-2',
                            `tooltip-connected-calls-${queue.queue}`,
                          )}
                        >
                          <FontAwesomeIcon
                            icon={faArrowDownLeftAndArrowUpRightToCenter}
                            className='h-4 w-4 text-gray-400 dark:text-gray-500'
                          />
                          <span>{queue.connectedCalls.length}</span>
                        </div>
                        <Tooltip
                          anchorSelect={`.tooltip-connected-calls-${queue.queue}`}
                          place='bottom'
                        >
                          {t('Queues.Connected calls')}
                        </Tooltip>
                        {/* active operators */}
                        <div
                          className={classNames(
                            'flex items-center gap-2',
                            `tooltip-active-operators-${queue.queue}`,
                          )}
                        >
                          <FontAwesomeIcon
                            icon={faHeadset}
                            className='h-4 w-4 text-gray-400 dark:text-gray-500'
                          />
                          <span>{queue.numActiveOperators}</span>
                        </div>
                        <Tooltip
                          anchorSelect={`.tooltip-active-operators-${queue.queue}`}
                          place='bottom'
                        >
                          {t('Queues.Active operators')}
                        </Tooltip>
                      </div>
                    </div>
                    {/* card body */}
                    <div className='flex flex-col py-5 px-4'>
                      <div className='flex flex-col xl:flex-row justify-between mb-5'>
                        {/* current operator */}
                        <div className='flex items-center justify-center gap-3 overflow-hidden xl:justify-start mb-4 xl:mb-0'>
                          <Avatar
                            rounded='full'
                            src={avatar}
                            placeholderType='operator'
                            size='small'
                            status={mainPresence}
                          />
                          <div className='flex flex-col text-sm overflow-hidden'>
                            <div className='truncate'>{name}</div>
                            <LoggedStatus
                              loggedIn={queue.members[mainextension].loggedIn}
                              paused={queue.members[mainextension].paused}
                            />
                          </div>
                        </div>
                        {/* login/logout and pause buttons */}
                        <div className='flex items-center shrink-0'>
                          {queue.members[mainextension].loggedIn ? (
                            <>
                              {/* logout button */}
                              <Button
                                variant='white'
                                className='mr-2'
                                onClick={() => logoutSingleQueue(queue)}
                                disabled={queue.members[mainextension].type !== 'dynamic'}
                              >
                                <FontAwesomeIcon
                                  icon={faUserXmark}
                                  className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400'
                                />
                                <span>{t('Queues.Logout')}</span>
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* login button */}
                              <Button
                                variant='white'
                                className='mr-2'
                                onClick={() => loginSingleQueue(queue)}
                                disabled={queue.members[mainextension].type !== 'dynamic'}
                              >
                                <FontAwesomeIcon
                                  icon={faUserCheck}
                                  className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400'
                                />
                                <span>{t('Queues.Login')}</span>
                              </Button>
                            </>
                          )}
                          {queue.members[mainextension].paused ? (
                            <>
                              {/* unpause button */}
                              <Button
                                variant='white'
                                onClick={() => unpauseSingleQueue(queue)}
                                disabled={!queue.members[mainextension].loggedIn}
                              >
                                <FontAwesomeIcon
                                  icon={faUserClock}
                                  className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-400'
                                />
                                <span>{t('Queues.End pause')}</span>
                              </Button>
                            </>
                          ) : (
                            <>
                              {/* pause menu */}
                              <Dropdown
                                items={
                                  queue.members[mainextension].loggedIn
                                    ? getPauseSingleQueueItemsMenu(queue)
                                    : null
                                }
                                position='left'
                              >
                                <Button
                                  variant='white'
                                  disabled={!queue.members[mainextension].loggedIn}
                                >
                                  <span>{t('Queues.Pause')}</span>
                                  <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className='ml-2 h-3 w-3 flex-shrink-0'
                                    aria-hidden='true'
                                  />
                                </Button>
                              </Dropdown>
                            </>
                          )}
                        </div>
                      </div>
                      <div className='flex justify-evenly text-sm gap-2 text-gray-500 dark:text-gray-400'>
                        <div className='flex gap-2 items-center'>
                          {t('Queues.Min wait')}
                          <CallDuration startTime={getMinWait(queue)} />
                        </div>
                        <div className='flex gap-2 items-center'>
                          {t('Queues.Max wait')}
                          <CallDuration startTime={getMaxWait(queue)} />
                        </div>
                      </div>
                      {/* expand sections */}
                      {queue.expanded && (
                        <div className='flex flex-col gap-5 mt-5 text-left'>
                          {/* waiting calls */}
                          <div>
                            <div className='flex justify-between items-center'>
                              <div className='font-medium flex items-center'>
                                <FontAwesomeIcon
                                  icon={faPause}
                                  aria-hidden='true'
                                  className='h-4 w-4 mr-2'
                                />
                                <span>{t('Queues.Waiting calls')}</span>
                              </div>
                              <div>
                                <FontAwesomeIcon
                                  icon={queue.waitingCallsExpanded ? faChevronUp : faChevronDown}
                                  onClick={() => toggleWaitingCallsExpanded(queue)}
                                  className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                                  aria-hidden='true'
                                />
                              </div>
                            </div>
                            {/* waiting calls table */}
                            {queue.waitingCallsExpanded && (
                              <div className='text-sm'>
                                <div className='border rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'>
                                  {isEmpty(queue.waitingCallersList) ? (
                                    <div className='p-4'>{t('Queues.No calls')}</div>
                                  ) : (
                                    <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                                        <div className='sm:rounded-md max-h-[12.7rem] overflow-auto'>
                                          <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                                            <thead className='bg-gray-100 dark:bg-gray-800'>
                                              <tr>
                                                <th
                                                  scope='col'
                                                  className='py-3 pl-4 pr-2 text-left font-semibold'
                                                >
                                                  {t('Queues.Caller')}
                                                </th>
                                                <th
                                                  scope='col'
                                                  className='px-2 py-3 text-left font-semibold'
                                                >
                                                  {t('Queues.Position')}
                                                </th>
                                                <th
                                                  scope='col'
                                                  className='pl-2 pr-4 py-3 text-left font-semibold'
                                                >
                                                  {t('Queues.Wait')}
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                                              {queue.waitingCallersList.map(
                                                (call: any, index: number) => (
                                                  <tr key={index}>
                                                    <td className='py-3 pl-4 pr-2'>
                                                      <div className='flex flex-col'>
                                                        <div className='font-medium'>
                                                          {call.name}
                                                        </div>
                                                        {call.name !== call.num && (
                                                          <div>{call.num}</div>
                                                        )}
                                                      </div>
                                                    </td>
                                                    <td className='px-2 py-3'>{call.position}</td>
                                                    <td className='pl-2 pr-4 py-3'>
                                                      <CallDuration startTime={call.waitingTime} />
                                                    </td>
                                                  </tr>
                                                ),
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {/* connected calls */}
                          <div>
                            <div className='flex justify-between items-center'>
                              <div className='font-medium flex items-center'>
                                <FontAwesomeIcon
                                  icon={faArrowDownLeftAndArrowUpRightToCenter}
                                  aria-hidden='true'
                                  className='h-4 w-4 mr-2'
                                />
                                <span>{t('Queues.Connected calls')}</span>
                              </div>
                              <div>
                                <FontAwesomeIcon
                                  icon={queue.connectedCallsExpanded ? faChevronUp : faChevronDown}
                                  onClick={() => toggleConnectedCallsExpanded(queue)}
                                  className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                                  aria-hidden='true'
                                />
                              </div>
                            </div>
                            {/* connected calls table */}
                            {queue.connectedCallsExpanded && (
                              <div className='text-sm'>
                                <div className='border rounded-md border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200'>
                                  {isEmpty(queue.connectedCalls) ? (
                                    <div className='p-4'>{t('Queues.No calls')}</div>
                                  ) : (
                                    <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
                                      <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
                                        <div className='sm:rounded-md max-h-[17rem] overflow-auto'>
                                          <table className='min-w-full divide-y divide-gray-300 dark:divide-gray-600'>
                                            <thead className='bg-gray-100 dark:bg-gray-800'>
                                              <tr>
                                                <th
                                                  scope='col'
                                                  className='py-3 pl-4 pr-2 text-left font-semibold'
                                                >
                                                  {t('Queues.Caller')}
                                                </th>
                                                <th
                                                  scope='col'
                                                  className='px-2 py-3 text-left font-semibold'
                                                >
                                                  {t('Queues.Operator')}
                                                </th>
                                                <th
                                                  scope='col'
                                                  className='pl-2 pr-4 py-3 text-left font-semibold'
                                                >
                                                  {t('Queues.Duration')}
                                                </th>
                                              </tr>
                                            </thead>
                                            <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
                                              {queue.connectedCalls.map(
                                                (call: any, index: number) => (
                                                  <tr key={index}>
                                                    <td className='py-3 pl-4 pr-2'>
                                                      <div className='flex flex-col'>
                                                        <div className='font-medium'>
                                                          {call.conversation.counterpartName}
                                                        </div>
                                                        {call.conversation.counterpartName !==
                                                          call.conversation.counterpartNum && (
                                                          <div>
                                                            {call.conversation.counterpartNum}
                                                          </div>
                                                        )}
                                                      </div>
                                                    </td>
                                                    <td className='px-2 py-3'>
                                                      <div className='flex items-center gap-3 overflow-hidden'>
                                                        <Avatar
                                                          rounded='full'
                                                          src={
                                                            operators[call.operatorUsername]
                                                              .avatarBase64
                                                          }
                                                          placeholderType='operator'
                                                          size='small'
                                                          status={
                                                            operators[call.operatorUsername]
                                                              .mainPresence
                                                          }
                                                        />
                                                        <div className='flex flex-col overflow-hidden'>
                                                          <div>
                                                            {operators[call.operatorUsername].name}
                                                          </div>
                                                          <div className='text-gray-500 dark:text-gray-400'>
                                                            {
                                                              operators[call.operatorUsername]
                                                                .endpoints.mainextension[0].id
                                                            }
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </td>
                                                    <td className='pl-2 pr-4 py-3'>
                                                      <CallDuration
                                                        key={`callDuration-${call.conversation.id}`}
                                                        startTime={call.conversation.startTime}
                                                      />
                                                    </td>
                                                  </tr>
                                                ),
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {/* operators */}
                          {profile.macro_permissions.queue_agent.value &&
                            profile.macro_permissions.queue_agent.permissions.ad_queue_agent
                              .value && (
                              <div>
                                <div className='flex justify-between items-center'>
                                  <div className='font-medium flex items-center'>
                                    <FontAwesomeIcon
                                      icon={faHeadset}
                                      aria-hidden='true'
                                      className='h-4 w-4 mr-2'
                                    />
                                    <span>{t('Queues.Queue operators')}</span>
                                  </div>
                                  <div>
                                    <FontAwesomeIcon
                                      icon={queue.operatorsExpanded ? faChevronUp : faChevronDown}
                                      onClick={() => toggleOperatorsExpanded(queue)}
                                      className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer'
                                      aria-hidden='true'
                                    />
                                  </div>
                                </div>
                                {/* operators table */}
                                {queue.operatorsExpanded && (
                                  <div className='text-sm'>
                                    {isEmpty(queue.members) ? (
                                      <div className='p-4 rounded-md text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-800'>
                                        {t('Queues.No operators')}
                                      </div>
                                    ) : (
                                      <div
                                        id={`queue-operators-${queue.queue}`}
                                        className='flex flex-col gap-2 border rounded-md max-h-56 overflow-auto border-gray-200 dark:border-gray-700'
                                      >
                                        <InfiniteScroll
                                          dataLength={
                                            queue.infiniteScrollOperators.operators.length
                                          }
                                          next={() =>
                                            store.dispatch.queues.showMoreInfiniteScrollOperators(
                                              queue.queue,
                                            )
                                          }
                                          hasMore={queue.infiniteScrollOperators.hasMore}
                                          scrollableTarget={`queue-operators-${queue.queue}`}
                                          loader={
                                            <div className='flex justify-center'>
                                              <FontAwesomeIcon
                                                icon={faCircleNotch}
                                                className='fa-spin h-5 m-5 text-gray-400 dark:text-gray-500'
                                              />
                                            </div>
                                          }
                                        >
                                          {queue.infiniteScrollOperators.operators.map(
                                            (op: any, index: number) => {
                                              return getQueueOperatorTemplate(queue, op, index)
                                            },
                                          )}
                                        </InfiniteScroll>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </li>
                </div>
              )
            })}
        </ul>
      </div>
    </div>
  )
}

QueuesManagementView.displayName = 'QueuesManagementView'
