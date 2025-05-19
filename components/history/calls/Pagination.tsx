import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { Button } from '../../common'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPreviousPage: () => void
  onNextPage: () => void
  isLoading: boolean
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPreviousPage,
  onNextPage,
  isLoading,
}) => {
  const isPreviousPageButtonDisabled = isLoading || currentPage <= 1
  const isNextPageButtonDisabled = isLoading || currentPage >= totalPages

  return (
    <nav
      className='flex items-center justify-between px-0 py-4 bg-body dark:bg-bodyDark'
      aria-label='Pagination'
    >
      <div className='hidden sm:block'>
        <p className='text-sm text-gray-700 dark:text-gray-200'>
          {t('Common.Showing')}{' '}
          <span className='font-medium'>{pageSize * (currentPage - 1) + 1}</span> -&nbsp;
          <span className='font-medium'>
            {pageSize * (currentPage - 1) + pageSize < totalItems
              ? pageSize * (currentPage - 1) + pageSize
              : totalItems}
          </span>{' '}
          {t('Common.of')} <span className='font-medium'>{totalItems}</span> {t('History.calls')}
        </p>
      </div>
      <div className='flex flex-1 justify-between sm:justify-end'>
        <Button
          type='button'
          variant='white'
          disabled={isPreviousPageButtonDisabled}
          onClick={onPreviousPage}
          className='flex items-center'
        >
          <FontAwesomeIcon icon={faChevronLeft} className='mr-2 h-4 w-4' />
          <span>{t('Common.Previous page')}</span>
        </Button>
        <Button
          type='button'
          variant='white'
          className='ml-3 flex items-center'
          disabled={isNextPageButtonDisabled}
          onClick={onNextPage}
        >
          <span>{t('Common.Next page')}</span>
          <FontAwesomeIcon icon={faChevronRight} className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </nav>
  )
}
