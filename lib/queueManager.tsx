// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMissed } from '@nethesis/nethesis-solid-svg-icons'
import { faXmark, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { cloneDeep } from 'lodash'
import { store } from '../store'
import { exactDistanceToNowLoc, formatDurationLoc } from './dateTime'
import { loadPreference, savePreference } from './storage'
import { handleNetworkError } from './utils'
import { formatDuration, intervalToDuration, format } from 'date-fns'

export const PAGE_SIZE = 10
export const DEFAULT_OUTCOME_FILTER = 'lost'
export const DEFAULT_CALLS_REFRESH_INTERVAL = 20
export const DEFAULT_CALLS_LOAD_PERIOD = 12
export const INFINITE_SCROLL_QUEUE_OPERATORS_PAGE_SIZE = 15
export const DEFAULT_SORT_BY_QUEUE_MANAGEMENT = 'name'
export const DEFAULT_STATUS_FILTER_QUEUE_MANAGEMENT = 'connected'
export const DEFAULT_SORT_BY_SUMMARY = 'name'
export const DEFAULT_STATUS_FILTER_SUMMARY = 'all'

export const searchStringInQueue = (queue: any, queryText: string) => {
  const regex = /[^a-zA-Z0-9]/g
  queryText = queryText.replace(regex, '')
  let found = false

  // search in string attributes
  found = ['name', 'queue'].some((attrName) => {
    return new RegExp(queryText, 'i').test(queue[attrName]?.replace(regex, ''))
  })

  if (found) {
    return true
  }
  return false
}

export const processQueues = (
  queuesData: any,
  username: string,
  mainextension: string,
  operators: any,
) => {
  let queues: any = {}

  // keep only user queues

  Object.values(queuesData).forEach((queue: any) => {
    if (queue.members[mainextension]) {
      queues[queue.queue] = queue
    }
  })

  Object.values(queues).forEach((queueData: any) => {
    store.dispatch.queues.processQueue({ queueData, username, mainextension, operators })
  })

  store.dispatch.queues.setLoaded(true)
  store.dispatch.queues.setLoading(false)
}

export const retrieveQueues = async (username: string, mainextension: string, operators: any) => {
  store.dispatch.queues.setLoading(true)
  store.dispatch.queues.setLoaded(false)
  store.dispatch.queues.setErrorMessage('')
  let queuesData: any = null

  try {
    const res = await axios.get('/astproxy/queues')
    queuesData = res.data
  } catch (error) {
    handleNetworkError(error)
    store.dispatch.queues.setErrorMessage('Cannot retrieve queues')
    store.dispatch.queues.setLoaded(true)
    store.dispatch.queues.setLoading(false)
  }

  // favorite queues

  const favoriteQueues = loadPreference('favoriteQueues', username) || []
  store.dispatch.queues.setFavoriteQueues(favoriteQueues)

  // expanded queues

  const expandedQueues = loadPreference('expandedQueues', username) || []
  store.dispatch.queues.setExpandedQueues(expandedQueues)

  processQueues(queuesData, username, mainextension, operators)
}

export const retrieveAndFilterQueueCalls = async (
  pageNum: number,
  textFilter: string,
  outcomeFilter: string,
  selectedQueues: string[],
  numHours: number,
  pageSize: number = PAGE_SIZE,
) => {
  try {
    // this api doesn't support text filter, so we need to retrieve a large page of elements, then filter results and keep only PAGE_SIZE elements

    const queues = selectedQueues.join(',')

    const { data } = await axios.get(
      `/astproxy/qmanager_queue_recall/${numHours}/${queues}/${outcomeFilter}?limit=200&offset=0`,
    )

    const allFilteredCalls = data.rows.filter((call: any) => {
      return searchStringInCall(call, textFilter)
    })
    data.count = allFilteredCalls.length
    data.totalPages = Math.ceil(allFilteredCalls.length / pageSize)

    // select page
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    data.rows = allFilteredCalls.slice(start, end)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const retrieveQueueStats = async () => {
  try {
    let { data } = await axios.get('/astproxy/queue_astats')

    // compute missing stats

    let lastLogin = 0
    let lastLogout = 0
    let lastCall = 0
    let answeredCalls = 0
    let missedCalls = 0

    Object.keys(data).map((queueNum: string) => {
      const queue = data[queueNum]

      // last login
      if (queue.last_login_time) {
        if (!lastLogin || lastLogin < queue.last_login_time) {
          lastLogin = queue.last_login_time
        }
      }

      // last logout
      if (queue.last_logout_time) {
        if (!lastLogout || lastLogout < queue.last_logout_time) {
          lastLogout = queue.last_logout_time
        }
      }

      // last call
      if (queue.last_call_time) {
        if (!lastCall || lastCall < queue.last_call_time) {
          lastCall = queue.last_call_time
        }
      }

      // answered calls
      if (queue.calls_taken) {
        answeredCalls += queue.calls_taken
      }

      // missed calls
      if (queue.no_answer_calls) {
        missedCalls += queue.no_answer_calls
      }
    })

    if (lastLogin) {
      data.lastLogin = new Date(lastLogin * 1000).toLocaleTimeString()
    }

    if (lastLogout) {
      data.lastLogout = new Date(lastLogout * 1000).toLocaleTimeString()
    }

    if (lastCall) {
      data.fromLastCall = exactDistanceToNowLoc(new Date(lastCall * 1000))
    }

    data.answeredCalls = answeredCalls
    data.missedCalls = missedCalls

    // time at phone
    data.timeAtPhone = formatDurationLoc(
      (data.outgoingCalls?.duration_outgoing || 0) + (data.incomingCalls?.duration_incoming || 0),
    )

    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const getFilterValues = (currentUsername: string) => {
  const outcome = loadPreference('queuesOutcomeFilter', currentUsername) || DEFAULT_OUTCOME_FILTER
  const selectedQueues = loadPreference('queuesSelectedQueues', currentUsername) || []
  return { outcome, selectedQueues }
}

export const getFilterValuesQueuesManagement = (currentUsername: string) => {
  const status =
    loadPreference('queueManagementStatusFilter', currentUsername) ||
    DEFAULT_STATUS_FILTER_QUEUE_MANAGEMENT
  const sortBy =
    loadPreference('queueManagementSortBy', currentUsername) || DEFAULT_SORT_BY_QUEUE_MANAGEMENT
  return { status, sortBy }
}

export function searchStringInQueuesMembers(operator: any, queryText: string) {
  const regex = /[^a-zA-Z0-9]/g
  queryText = queryText.replace(regex, '')
  let found = false

  // search in string attributes
  found = ['name', 'member'].some((attrName) => {
    return new RegExp(queryText, 'i').test(operator[attrName]?.replace(regex, ''))
  })

  if (found) {
    return true
  }
}

export const searchStringInCall = (call: any, queryText: string) => {
  const regex = /[^a-zA-Z0-9]/g
  queryText = queryText.replace(regex, '')
  let found = false

  // search in string attributes
  found = ['name', 'company', 'cid'].some((attrName) => {
    return new RegExp(queryText, 'i').test(call[attrName]?.replace(regex, ''))
  })

  if (found) {
    return true
  }
  return false
}

export const getCallIcon = (call: any) => {
  switch (call.direction) {
    case 'IN':
      if (
        ['ANSWERED', 'DONE', 'COMPLETEAGENT', 'COMPLETECALLER', 'CONNECT', 'ENTERQUEUE'].includes(
          call.event,
        )
      ) {
        // positive outcome
        return (
          <FontAwesomeIcon
            icon={faArrowLeft}
            className='mr-2 h-5 w-3.5 -rotate-45 text-green-600 dark:text-green-400'
            aria-hidden='true'
          />
        )
      } else {
        // negative outcome
        return (
          <FontAwesomeIcon
            icon={faMissed}
            className='mr-2 h-5 w-4 text-red-400 dark:text-red-500'
            aria-hidden='true'
          />
        )
      }
      break
    case 'OUT':
      if (
        ['ANSWERED', 'DONE', 'COMPLETEAGENT', 'COMPLETECALLER', 'CONNECT', 'ENTERQUEUE'].includes(
          call.event,
        )
      ) {
        // positive outcome
        return (
          <FontAwesomeIcon
            icon={faArrowLeft}
            className='mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-400'
            aria-hidden='true'
          />
        )
      } else {
        // negative outcome
        return (
          <FontAwesomeIcon
            icon={faXmark}
            className='mr-2 h-5 w-4 text-red-400 dark:text-red-500'
            aria-hidden='true'
          />
        )
      }
      break
  }
}

export const openShowQueueCallDrawer = (call: any, queues: any) => {
  if (!call.cid) {
    return
  }
  const config = { ...call, queues: cloneDeep(queues) }

  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'showQueueCall',
    config: config,
  })
}

export const retrieveQueueCallInfo = async (
  phoneNumber: string,
  queueId: string,
  numHours: number,
) => {
  try {
    const { data } = await axios.get(`/astproxy/qrecall_info/${numHours}/${phoneNumber}/${queueId}`)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const addQueueToFavorites = (queueId: string, currentUsername: string) => {
  const favoriteQueues = loadPreference('favoriteQueues', currentUsername) || []
  favoriteQueues.push(queueId)
  savePreference('favoriteQueues', favoriteQueues, currentUsername)
  store.dispatch.queues.setFavoriteQueues(favoriteQueues)
}

export const removeQueueFromFavorites = (queueId: string, currentUsername: string) => {
  let favoriteQueues = loadPreference('favoriteQueues', currentUsername) || []
  favoriteQueues = favoriteQueues.filter((q: string) => q !== queueId)
  savePreference('favoriteQueues', favoriteQueues, currentUsername)
  store.dispatch.queues.setFavoriteQueues(favoriteQueues)
}

export const addQueueToExpanded = (queueId: string, currentUsername: string) => {
  const expandedQueues = loadPreference('expandedQueues', currentUsername) || []

  if (!expandedQueues.includes(queueId)) {
    expandedQueues.push(queueId)
  }
  savePreference('expandedQueues', expandedQueues, currentUsername)
  store.dispatch.queues.setExpandedQueues(expandedQueues)
}

export const removeQueueFromExpanded = (queueId: string, currentUsername: string) => {
  let expandedQueues = loadPreference('expandedQueues', currentUsername) || []
  expandedQueues = expandedQueues.filter((q: string) => q !== queueId)
  savePreference('expandedQueues', expandedQueues, currentUsername)
  store.dispatch.queues.setExpandedQueues(expandedQueues)
}

/**
 * Get operator status on a queue
 */
export const getLoggedStatus = (operator: any) => {
  if (!operator.loggedIn) {
    return 'loggedOut'
  } else {
    if (operator.paused) {
      return 'paused'
    } else {
      return 'loggedIn'
    }
  }
}

// Get queueManager alarm
export async function getAlarm() {
  try {
    const { data } = await axios.get('/astproxy/qalarms')
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

// Get queueManager queues information
export const getQueues = async () => {
  try {
    const { data } = await axios.get('/astproxy/qmanager_queues')
    return data
  } catch (error) {
    handleNetworkError(error)
  }
}

// Get queueManager queues history
export const getQueuesHistory = async () => {
  try {
    const { data } = await axios.get('/astproxy/qmanager_qcalls_hist')
    return data
  } catch (error) {
    handleNetworkError(error)
  }
}

//get queues status
export const getQueueStats = async (qid: any) => {
  try {
    const { data } = await axios.get('/astproxy/qmanager_qstats/' + qid)
    return data
  } catch (error) {
    handleNetworkError(error)
  }
}

// Get queueManager queues information
export const getAgentsStats = async () => {
  try {
    const { data } = await axios.get('/astproxy/qmanager_astats')
    return data
  } catch (error) {
    handleNetworkError(error)
  }
}

//Get total number of type for each failed calls
export function getTotalsForEachKey(callbackTimeRank: any) {
  let n = 0
  let list = {} as Record<string, any>
  for (let q in callbackTimeRank) {
    for (let v in callbackTimeRank[q].values) {
      list[n] = {
        name: callbackTimeRank[q].name,
        queue: callbackTimeRank[q].queue,
        note: v,
        values: {
          value: callbackTimeRank[q].values[v],
        },
      }
      n++
    }
  }

  return list
}

export function sortAgentsData(data: any[], sortOrder: any) {
  const sortedData = data.sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.values - b.values
    } else {
      return b.values - a.values
    }
  })

  return sortedData.slice(0, 5)
  // return sortedData
}

//convert from seconds to human readable format
export function convertToHumanReadable(seconds: number | undefined) {
  if (seconds === 0) {
    return '00:00:00'
  }

  if (seconds === undefined) {
    return '00:00:00'
  }

  const duration = intervalToDuration({ start: 0, end: seconds * 1000 })

  // Extract the hours, minutes and seconds from the formatted string
  const hours = duration.hours?.toString().padStart(2, '0') || '00'
  const minutes = duration.minutes?.toString().padStart(2, '0') || '00'
  const secondsTest = duration.seconds?.toString().padStart(2, '0') || '00'

  return `${hours}:${minutes}:${secondsTest}`
}

//Get chart values for each hours
export const groupDataByHour = (data: any) => {
  const dataArray = Array.isArray(data) ? data : data.data
  const groupedData: Record<string, any> = {}

  dataArray.forEach((item: any) => {
    const { date, stack, views } = item

    if (!groupedData[date]) {
      groupedData[date] = {}
    }

    groupedData[date][stack] = views
  })

  return groupedData
}
