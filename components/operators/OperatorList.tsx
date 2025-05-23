import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import OperatorCard from './OperatorCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import InfiniteScroll from 'react-infinite-scroll-component'

interface OperatorListProps {
  operators: any[]
  hasMore: boolean
  showMore: () => void
  isLoading?: boolean
}

const OperatorList = ({ operators, hasMore, showMore, isLoading = false }: OperatorListProps) => {
  const authUsername = useSelector((state: RootState) => state.authentication.username)
  const authUserMainPresence = useSelector(
    (state: RootState) => state.operators?.operators[state.authentication.username]?.mainPresence,
  )
  const actionInformation = useSelector((state: RootState) => state.userActions)
  const isSidebarOpen = useSelector((state: RootState) => state.rightSideMenu.isShown)

  // Filter out the current user from the operators list
  const filteredOperators = useMemo(() => {
    return operators.filter((operator) => operator?.username !== authUsername)
  }, [operators, authUsername])

  const mainUserIsBusy = useMemo(() => authUserMainPresence === 'busy', [authUserMainPresence])

  if (isLoading) {
    return (
      <div className='space-y-8 sm:space-y-12 py-8'>
        <ul
          role='list'
          className={`${
            isSidebarOpen
              ? 'mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-5xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-5 5xl:grid-cols-6 5xl:max-w-screen-2xl'
              : 'mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-7xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-7 5xl:grid-cols-8 5xl:max-w-screen-2xl 6xl:grid-cols-9 7xl:grid-cols-10'
          }`}
        >
          {Array.from(Array(15)).map((e, index) => (
            <li key={index}>
              <div className='space-y-4'>
                {/* avatar skeleton */}
                <div className='animate-pulse rounded-full h-24 w-24 mx-auto bg-gray-300 dark:bg-gray-600'></div>
                <div className='space-y-2'>
                  {/* name skeleton */}
                  <div className='animate-pulse h-3 rounded bg-gray-300 dark:bg-gray-600'></div>
                  {/* status skeleton */}
                  <div>
                    <div className='animate-pulse h-8 rounded-full bg-gray-300 dark:bg-gray-600'></div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className='space-y-8 sm:space-y-12 py-8'>
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
              ? 'mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-5xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-5 5xl:grid-cols-6 5xl:max-w-screen-2xl'
              : 'mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-7xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-7 5xl:grid-cols-8 5xl:max-w-screen-2xl 6xl:grid-cols-9 7xl:grid-cols-10'
          }`}
        >
          {filteredOperators.map((operator, index) => (
            <li key={operator?.username || index}>
              <OperatorCard
                operator={operator}
                authUsername={authUsername}
                mainUserIsBusy={mainUserIsBusy}
                actionInformation={actionInformation}
              />
            </li>
          ))}
        </ul>
      </InfiniteScroll>
    </div>
  )
}

export default React.memo(OperatorList)

OperatorList.displayName = 'OperatorList'
