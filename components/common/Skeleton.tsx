import React from 'react'
import classNames from 'classnames'

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'avatar'
  width?: string | number
  height?: string | number
  className?: string
  count?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className,
  count = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-600'
  
  const getSkeletonClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full'
      case 'avatar':
        return 'rounded-full h-12 w-12'
      case 'rectangular':
        return 'rounded'
      case 'text':
      default:
        return 'h-4 rounded'
    }
  }
  
  const style: React.CSSProperties = {}
  if (width) style.width = width
  if (height && variant !== 'avatar') style.height = height
  
  const skeletonClasses = classNames(baseClasses, getSkeletonClasses(), className)
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} style={style} />
      ))}
    </>
  )
}

export const CallSkeleton: React.FC = () => {
  return (
    <div className='flex justify-between gap-3'>
      <div className='flex shrink-0 h-min items-center min-w-[48px]'>
        <div className='h-2 w-2 flex'>
          <span className='h-2 w-2'></span>
        </div>
        <Skeleton variant='avatar' />
      </div>
      <div className='flex flex-col gap-1.5 min-w-0 flex-1'>
        <Skeleton width='75%' />
        <Skeleton width='50%' />
        <Skeleton width='25%' />
        <Skeleton width='25%' />
      </div>
    </div>
  )
}
