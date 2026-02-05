import React, { FC, ComponentProps, useRef, useEffect, useState } from 'react'
import { useTheme } from '../../theme/Context'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleInfo,
  faTriangleExclamation,
  faCircleCheck,
  faCircleXmark,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from './Button'

export interface ToastProps extends ComponentProps<'div'> {
  type: 'info' | 'warning' | 'success' | 'error' | 'failed'
  title: string
  children: React.ReactNode
  className?: string
  onClose: () => void
  show: boolean
  timeout: number
  pauseTimerOnHover?: boolean
  onTimerEnd?: () => void
}

export const Toast: FC<ToastProps> = ({
  type,
  title,
  children,
  className,
  onClose,
  show,
  timeout,
  pauseTimerOnHover = false,
  onTimerEnd,
}): JSX.Element => {
  const { toast: theme } = useTheme().theme
  const isTextOnly = typeof children === 'string' || typeof children === 'number'
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [remainingTime, setRemainingTime] = useState(timeout * 1000)

  useEffect(() => {
    if (!show) return

    const handleTimeout = () => {
      onTimerEnd?.()
      onClose()
    }

    if (pauseTimerOnHover && isHovered) {
      // Pause timer when hovering
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    } else {
      // Resume timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(handleTimeout, remainingTime)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [show, isHovered, pauseTimerOnHover, remainingTime, onClose, onTimerEnd])

  const handleMouseEnter = () => {
    if (pauseTimerOnHover) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (pauseTimerOnHover) {
      setIsHovered(false)
    }
  }

  let checkIcon =
    type === 'info' ? (
      <div
        className={`bg-surfaceToastInfo dark:bg-surfaceToastInfoDark text-iconInfo dark:text-iconInfoDark rounded-full py-4 px-4 flex items-center justify-center`}
      >
        <FontAwesomeIcon
          icon={faCircleInfo}
          className={theme?.iconStyle[type]}
          aria-hidden='true'
        />
      </div>
    ) : type === 'warning' ? (
      <div
        className={`bg-surfaceToastWarning dark:bg-surfaceToastWarningDark text-iconWarning dark:text-iconWarningDark rounded-full py-4 px-4 flex items-center justify-center`}
      >
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className={theme?.iconStyle[type]}
          aria-hidden='true'
        />
      </div>
    ) : type === 'success' ? (
      <div
        className={`bg-surfaceToastSuccess dark:bg-surfaceToastSuccessDark text-iconSuccess dark:text-iconSuccessDark rounded-full py-4 px-4 flex items-center justify-center`}
      >
        <FontAwesomeIcon
          icon={faCircleCheck}
          className={theme?.iconStyle[type]}
          aria-hidden='true'
        />
      </div>
    ) : (
      <div className={`bg-blue-100 text-white rounded-full py-2 px-3 flex items-center justify-center`}>
        <FontAwesomeIcon
          icon={faCircleXmark}
          className={theme?.iconStyle[type]}
          aria-hidden='true'
        />
      </div>
    )

  return (
    <Transition
      show={show}
      as={React.Fragment}
      enter='transform ease-out duration-300 transition'
      enterFrom='translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2'
      enterTo='translate-y-0 opacity-100 sm:translate-x-0'
      leave='transition ease-in duration-100'
      leaveFrom='opacity-100'
      leaveTo='opacity-0'
    >
      <div
        className={classNames(
          theme?.base,
          type ? theme?.type[type] : theme.type.success,
          className,
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div>{checkIcon}</div>
        <div className='ml-6 mr-12 flex-1 pt-0.5'>
          <p className='text-lg font-medium leading-5 text-primaryNeutral dark:text-primaryNeutralDark'>
            {title}
          </p>
          {isTextOnly ? (
            <p className='mt-1 text-sm font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'>
              {children}
            </p>
          ) : (
            <div className='mt-1 text-sm font-normal text-secondaryNeutral dark:text-secondaryNeutralDark'>
              {children}
            </div>
          )}
        </div>
        <Button variant='ghost' className='absolute top-2 right-2' onClick={onClose}>
          <FontAwesomeIcon
            icon={faXmark}
            className='h-4 w-4 text-primaryNeutral dark:text-primaryNeutralDark cursor-pointer'
            aria-hidden='true'
          />
        </Button>
      </div>
    </Transition>
  )
}

export default Toast
