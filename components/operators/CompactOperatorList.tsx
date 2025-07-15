import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import CompactOperatorCard from './CompactOperatorCard'

const CompactOperatorList = ({ operators, hasMore, showMore, isLoading = false }: any) => {
  const authUsername = useSelector((state: RootState) => state.authentication.username)
  const authUserMainPresence = useSelector(
    (state: RootState) => state.operators?.operators[state.authentication.username]?.mainPresence,
  )
  const actionInformation = useSelector((state: RootState) => state.userActions)
  const isSidebarOpen = useSelector((state: RootState) => state.rightSideMenu.isShown)

  // Filter out the current user from the operators list
  const filteredOperators = useMemo(() => {
    if (!Array.isArray(operators)) return []
    return operators.filter(
      (operator) => operator && typeof operator === 'object' && operator.username !== authUsername,
    )
  }, [operators, authUsername])

  const mainUserIsBusy = useMemo(() => authUserMainPresence === 'busy', [authUserMainPresence])

  if (isLoading) {
    return (
      <ul
        role='list'
        className={`${
          isSidebarOpen
            ? 'grid grid-cols-1 gap-4 2xl:grid-cols-2 3xl:grid-cols-3 5xl:grid-cols-4 6xl:grid-cols-5 7xl:grid-cols-6'
            : 'grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4 5xl:grid-cols-5 6xl:grid-cols-6'
        }`}
      >
        {Array.from(Array(24)).map((e, index) => (
          <li key={index} className='px-1'>
            <button
              type='button'
              className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white dark:bg-gray-900 cursor-default'
            >
              <div className='flex min-w-0 flex-1 items-center space-x-3'>
                <div className='block flex-shrink-0'>
                  <div className='animate-pulse rounded-full h-10 w-10 mx-auto bg-cardBackgroud dark:bg-cardBackgroudDark'></div>
                </div>
                <span className='block min-w-0 flex-1'>
                  <div className='animate-pulse h-4 rounded bg-gray-300 dark:bg-gray-600'></div>
                </span>
              </div>
              <span className='inline-flex h-10 w-10 flex-shrink-0 items-center justify-center'>
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className='h-3 w-3 text-cardIcon dark:text-cardIconDark'
                  aria-hidden='true'
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <InfiniteScroll
      dataLength={filteredOperators?.length}
      next={showMore}
      hasMore={hasMore}
      scrollableTarget='main-content'
      loader={
        <FontAwesomeIcon
          icon={faCircleNotch}
          className='inline-block text-center fa-spin h-8 m-10 text-gray-400 dark:text-gray-500'
        />
      }
    >
      <ul
        role='list'
        className={`${
          isSidebarOpen
            ? 'grid grid-cols-1 gap-4 2xl:grid-cols-2 3xl:grid-cols-3 5xl:grid-cols-4 6xl:grid-cols-5 7xl:grid-cols-6'
            : 'grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4 5xl:grid-cols-5 6xl:grid-cols-6'
        }`}
      >
        {filteredOperators.map((operator, index) => (
          <li key={operator?.username || `compact-op-${index}`} className='px-1 max-w-lg min-w-[400px]'>
            <CompactOperatorCard
              operator={operator}
              authUsername={authUsername}
              mainUserIsBusy={mainUserIsBusy}
              actionInformation={actionInformation}
              index={index}
            />
          </li>
        ))}
      </ul>
    </InfiniteScroll>
  )
}

export default React.memo(CompactOperatorList)

CompactOperatorList.displayName = 'CompactOperatorList'
