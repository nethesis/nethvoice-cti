import React, { useMemo, useEffect, useState, useRef } from 'react'
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

  const classNameSidebarOpen =
    'grid grid-cols-1 gap-4 2xl:grid-cols-2 3xl:grid-cols-3 5xl:grid-cols-4 6xl:grid-cols-5 7xl:grid-cols-6'
  const classNameSidebarClosed =
    'grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4 5xl:grid-cols-5 6xl:grid-cols-6'

  const [currentCols, setCurrentCols] = useState(1)
  const gridRef = useRef<HTMLUListElement>(null)

  // Detect current breakpoint by checking computed grid-template-columns
  useEffect(() => {
    const detectGridCols = () => {
      if (gridRef.current) {
        const computedStyle = window.getComputedStyle(gridRef.current)
        const gridCols = computedStyle.gridTemplateColumns
        const colCount = gridCols.split(' ').length
        setCurrentCols(colCount)
      }
    }

    detectGridCols()
    window.addEventListener('resize', detectGridCols)
    
    return () => window.removeEventListener('resize', detectGridCols)
  }, [isSidebarOpen])

  // Calculate skeleton items to show exactly 4 rows based on current breakpoint
  const skeletonItemsCount = useMemo(() => {
    const count = currentCols * 8
    return count
  }, [currentCols])

  if (isLoading) {
    return (
      <ul
        ref={gridRef}
        role='list'
        className={`${isSidebarOpen ? classNameSidebarOpen : classNameSidebarClosed}`}
      >
        {Array.from(Array(skeletonItemsCount)).map((_, index) => (
          <li key={`skeleton-${index}`} className='px-1 w-[400px]'>
            <div className='group flex w-full items-center justify-between space-x-3 rounded-lg py-2 pr-2 pl-6 h-20 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cardBackgroud dark:bg-cardBackgroudDark'>
              {/* Avatar skeleton */}
              <span className='flex-shrink-0'>
                <div className='animate-pulse rounded-full h-14 w-14 bg-gray-300 dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-500'></div>
              </span>

              {/* Name and extension skeleton */}
              <div className='flex-1 min-w-0 ml-3'>
                <div className='flex items-center space-x-2'>
                  <div className='animate-pulse h-5 w-32 rounded bg-gray-300 dark:bg-gray-600'></div>
                </div>
                <div className='mt-1'>
                  <div className='animate-pulse h-4 w-20 rounded bg-gray-300 dark:bg-gray-600'></div>
                </div>
              </div>

              {/* Button/status skeleton */}
              <div className='flex items-center space-x-2'>
                <div className='animate-pulse h-8 w-16 rounded bg-gray-300 dark:bg-gray-600'></div>
              </div>

              {/* Details button skeleton */}
              <div className='flex-shrink-0 ml-2'>
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className='h-4 w-4 text-cardIcon dark:text-cardIconDark'
                  aria-hidden='true'
                />
              </div>
            </div>
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
        ref={gridRef}
        role='list'
        className={`${isSidebarOpen ? classNameSidebarOpen : classNameSidebarClosed}`}
      >
        {filteredOperators.map((operator, index) => (
          <li
            key={operator?.username || `compact-op-${index}`}
            className='px-1 w-[400px]'
          >
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
