import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight, faCircleNotch, faUserGroup } from '@fortawesome/free-solid-svg-icons'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Badge } from '../common'
import CompactOperatorCard from './CompactOperatorCard'

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

  // Filter out the current user from all groups with proper type checking
  const filteredOperators = useMemo(() => {
    if (!Array.isArray(operators)) return []

    return operators
      .map((category) => ({
        ...category,
        members: Array.isArray(category.members)
          ? category.members.filter(
              (member: any) =>
                member && typeof member === 'object' && member?.username !== authUsername,
            )
          : [],
      }))
      .filter((category) => category.members.length > 0)
  }, [operators, authUsername])

  const mainUserIsBusy = useMemo(() => authUserMainPresence === 'busy', [authUserMainPresence])

  if (isLoading) {
    return (
      <ul
        role='list'
        className={`${
          isSidebarOpen
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 6xl:grid-cols-5 7xl:grid-cols-6 5xl:max-w-screen-2xl'
            : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 5xl:grid-cols-5 6xl:grid-cols-6 7xl:grid-cols-7 5xl:max-w-screen-2xl'
        }`}
      >
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
      {filteredOperators.map((category: any, categoryIndex: number) => (
        <div key={categoryIndex} className='mb-4'>
          <div className='flex items-start'>
            <Badge
              size='small'
              variant='category'
              rounded='full'
              className='overflow-hidden ml-1 mb-5 mt-4'
              icon={<FontAwesomeIcon icon={faUserGroup} className='h-4 w-4' />}
            >
              <div className='text-xs font-medium leading-4 w-auto max-w-[150px] px-1 truncate'>
                {upperCaseFirstLetter(category?.category)}
              </div>
            </Badge>
          </div>

          <ul
            role='list'
            className={`${
              isSidebarOpen
                ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 6xl:grid-cols-5 7xl:grid-cols-6 5xl:max-w-screen-2xl'
                : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 5xl:grid-cols-5 6xl:grid-cols-6 7xl:grid-cols-7 5xl:max-w-screen-2xl'
            }`}
          >
            {category?.members?.map((operator: any, operatorIndex: number) => (
              <li key={operator?.username || `${categoryIndex}-${operatorIndex}`} className='px-1'>
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
