// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPhoneArrowDown,
  faPhoneArrowUp,
  faPhoneMissed,
  faPhoneXmark,
} from '@nethesis/nethesis-solid-svg-icons'
import axios from 'axios'
import { cloneDeep } from 'lodash'
import { store } from '../store'
import { exactDistanceToNowLoc, formatDurationLoc } from './dateTime'
import { loadPreference, savePreference } from './storage'
import { handleNetworkError, sortByProperty } from './utils'

export const PAGE_SIZE = 10
export const DEFAULT_OUTCOME_FILTER = 'lost'

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

  ////
  // Object.values(queues).forEach((queue: any) => {
  //   // convert caller position to number ////
  //   Object.values(queue.waitingCallers).forEach((caller: any) => {
  //     caller.position = parseInt(caller.position)
  //   })

  //   ////
  //   if (Object.values(queue.waitingCallers).length) {
  //     console.log('!! waitingCallers', Object.values(queue.waitingCallers)) ////
  //   }

  //   // sort waiting callers
  //   queue.waitingCallersList = Object.values(queue.waitingCallers)
  //   queue.waitingCallersList.sort(sortByProperty('position'))

  //   // compute active operators
  //   let numActiveOperators = 0

  //   Object.values(queue.members).forEach((operator: any) => {
  //     if (operator.loggedIn && !operator.paused) {
  //       numActiveOperators++
  //     }
  //   })
  //   queue.numActiveOperators = numActiveOperators

  //   // compute connected calls
  //   let connectedCalls: any[] = []

  //   Object.values(operators).forEach((operator: any) => {
  //     operator.conversations?.forEach((conversation: any) => {
  //       if (conversation.queueId === queue.queue) {
  //         connectedCalls.push({ conversation, operatorUsername: operator.username })
  //       }
  //     })
  //   })
  //   queue.connectedCalls = connectedCalls

  //   // expanded sections
  //   queue.waitingCallsExpanded = true
  //   queue.connectedCallsExpanded = true
  //   queue.operatorsExpanded = true
  // })

  // favorite queues
  // retrieveAndSetFavoriteQueues(queues, username) ////

  // expanded queues
  // retrieveAndSetExpandedQueues(queues, username) ////

  // store.dispatch.queues.setQueues(queues) ////

  store.dispatch.queues.setLoaded(true)
  store.dispatch.queues.setLoading(false)

  // console.log('queues', queues) ////
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

    //// fix hours argument
    const { data } = await axios.get(
      `/astproxy/queue_recall/12/${queues}/${outcomeFilter}?limit=200&offset=0`,
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
            icon={faPhoneArrowDown}
            className='mr-2 h-5 w-3.5 text-green-600 dark:text-green-400'
            aria-hidden='true'
          />
        )
      } else {
        // negative outcome
        return (
          <FontAwesomeIcon
            icon={faPhoneMissed}
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
            icon={faPhoneArrowUp}
            className='mr-2 h-5 w-3.5 text-green-600 dark:text-green-400'
            aria-hidden='true'
          />
        )
      } else {
        // negative outcome
        return (
          <FontAwesomeIcon
            icon={faPhoneXmark}
            className='mr-2 h-5 w-4 text-red-400 dark:text-red-500'
            aria-hidden='true'
          />
        )
      }
      break
  }
}

export const loginToQueue = async (endpointId: string, queueId: string) => {
  try {
    const { data, status } = await axios.post('/astproxy/queuemember_add', {
      endpointId,
      queueId,
    })
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const logoutFromQueue = async (endpointId: string, queueId: string) => {
  try {
    const { data, status } = await axios.post('/astproxy/queuemember_remove', {
      endpointId,
      queueId,
    })
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const pauseQueue = async (endpointId: string, queueId: string) => {
  try {
    const { data, status } = await axios.post('/astproxy/queuemember_pause', {
      endpointId,
      queueId,
    })
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

export const unpauseQueue = async (endpointId: string, queueId: string) => {
  try {
    const { data, status } = await axios.post('/astproxy/queuemember_unpause', {
      endpointId,
      queueId,
    })
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
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
}

export const removeQueueFromFavorites = (queueId: string, currentUsername: string) => {
  let favoriteQueues = loadPreference('favoriteQueues', currentUsername) || []
  favoriteQueues = favoriteQueues.filter((q: string) => q !== queueId)
  savePreference('favoriteQueues', favoriteQueues, currentUsername)
}

////
// export const retrieveAndSetFavoriteQueues = (queues: any, username: any) => {
//   const favoriteQueues = loadPreference('favoriteQueues', username) || []

//   favoriteQueues.forEach((queueId: string) => {
//     if (queues[queueId]) {
//       queues[queueId].favorite = true
//     }
//   })
// }

////
// export const retrieveAndSetExpandedQueues = (queues: any, username: any) => {
//   const expandedQueues = loadPreference('expandedQueues', username) || []

//   expandedQueues.forEach((queueId: string) => {
//     if (queues[queueId]) {
//       queues[queueId].expanded = true
//     }
//   })
// }

export const addQueueToExpanded = (queueId: string, currentUsername: string) => {
  const expandedQueues = loadPreference('expandedQueues', currentUsername) || []

  if (!expandedQueues.includes(queueId)) {
    expandedQueues.push(queueId)
  }
  savePreference('expandedQueues', expandedQueues, currentUsername)
}

export const removeQueueFromExpanded = (queueId: string, currentUsername: string) => {
  let expandedQueues = loadPreference('expandedQueues', currentUsername) || []
  expandedQueues = expandedQueues.filter((q: string) => q !== queueId)
  savePreference('expandedQueues', expandedQueues, currentUsername)
}
