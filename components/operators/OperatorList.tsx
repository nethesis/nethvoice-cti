import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import OperatorCard from './OperatorCard'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useGridClasses } from '../../lib/operators/layoutUtils'

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

  const mainUserIsBusy = useMemo(() => authUserMainPresence === 'busy', [authUserMainPresence])

  const gridClasses = useGridClasses('standard', isSidebarOpen)

  if (isLoading) {
    return (
      <div className='space-y-8 sm:space-y-12 py-8'>
        <ul role='list' className={gridClasses}>
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
        dataLength={operators.length}
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
        <ul role='list' className={gridClasses}>
          {operators.map((operator, index) => (
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
