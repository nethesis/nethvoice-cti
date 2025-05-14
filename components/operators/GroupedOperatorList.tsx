import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Badge } from '../common'
import CompactOperatorCard from './CompactOperatorCard'
import { useGridClasses } from '../../lib/operators/layoutUtils'

interface GroupedOperatorListProps {
  operators: any[]
  hasMore: boolean
  showMore: () => void
  isLoading?: boolean
  upperCaseFirstLetter: (string: string) => string
}

const GroupedOperatorList = ({
  operators,
  hasMore,
  showMore,
  isLoading = false,
  upperCaseFirstLetter,
}: GroupedOperatorListProps) => {
  const authUsername = useSelector((state: RootState) => state.authentication.username)
  const authUserMainPresence = useSelector(
    (state: RootState) => state.operators?.operators[state.authentication.username]?.mainPresence,
  )
  const actionInformation = useSelector((state: RootState) => state.userActions)
  const isSidebarOpen = useSelector((state: RootState) => state.rightSideMenu.isShown)

  const mainUserIsBusy = useMemo(() => authUserMainPresence === 'busy', [authUserMainPresence])

  const gridClasses = useGridClasses('grouped', isSidebarOpen)

  if (isLoading) {
    return (
      <ul role='list' className={gridClasses}>
        {Array.from(Array(24)).map((e, index) => (
          <li key={index} className='px-1'>
            <button
              type='button'
              className='group flex w-full items-center justify-between space-x-3 rounded-lg p-2 text-left focus:outline-none focus:ring-2 focus:ring-offset-2 bg-cardBackgroud dark:bg-cardBackgroudDark cursor-default'
            >
              <div className='flex min-w-0 flex-1 items-center space-x-3'>
                <div className='block flex-shrink-0'>
                  <div className='animate-pulse rounded-full h-10 w-10 mx-auto bg-gray-300 dark:bg-gray-600'></div>
                </div>
                <span className='block min-w-0 flex-1'>
                  <div className='animate-pulse h-4 rounded bg-gray-300 dark:bg-gray-600'></div>
                </span>
              </div>
              <span className='inline-flex h-10 w-10 flex-shrink-0 items-center justify-center'>
                <FontAwesomeIcon
                  icon={faChevronRight}
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
      {operators.map((category: any, categoryIndex: number) => (
        <div key={categoryIndex} className='mb-4'>
          <div className='flex items-start'>
            <Badge
              size='small'
              variant='category'
              rounded='full'
              className='overflow-hidden ml-1 mb-5 mt-4'
            >
              <div className='w-auto max-w-[150px] px-1 truncate'>
                {upperCaseFirstLetter(category?.category)}
              </div>
            </Badge>
          </div>

          <ul role='list' className={gridClasses}>
            {category?.members?.map((operator: any, operatorIndex: number) => (
              <li key={operatorIndex} className='px-1'>
                <CompactOperatorCard
                  operator={operator}
                  authUsername={authUsername}
                  mainUserIsBusy={mainUserIsBusy}
                  actionInformation={actionInformation}
                  index={`${categoryIndex}-${operatorIndex}`}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </InfiniteScroll>
  )
}

export default React.memo(GroupedOperatorList)

GroupedOperatorList.displayName = 'GroupedOperatorList'
