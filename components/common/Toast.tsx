import React, { FC, ComponentProps } from 'react'
import { useTheme } from '../../theme/Context'
import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClose,
  faCircle,
  faCircleInfo,
  faTriangleExclamation,
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons'
import { t } from 'i18next'
import { ProgressionRing } from './ProgressionRing'

export interface ToastProps extends ComponentProps<'div'> {
  type: 'info' | 'warning' | 'success' | 'error' | 'failed'
  title: string
  children: React.ReactNode
  className?: string
  onClose: () => void
  show: boolean
  timeout: number
}

export const Toast: FC<ToastProps> = ({
  type,
  title,
  children,
  className,
  onClose,
  show,
  timeout,
}): JSX.Element => {
  const { toast: theme } = useTheme().theme

  let checkIcon =
    type === 'info' ? (
      <div className={`bg-blue-100 text-white rounded-full py-2 px-3`}>
        <FontAwesomeIcon
          icon={faCircleInfo}
          className={theme?.iconStyle[type]}
          aria-hidden='true'
        />
      </div>
    ) : type === 'warning' ? (
      <div className={`bg-yellow-100 text-white rounded-full py-2 px-3`}>
        <FontAwesomeIcon
          icon={faTriangleExclamation}
          className={theme?.iconStyle[type]}
          aria-hidden='true'
        />
      </div>
    ) : type === 'success' ? (
      <div className={`bg-emerald-100 text-white rounded-full py-2 px-3`}>
        <FontAwesomeIcon
          icon={faCircleCheck}
          className={theme?.iconStyle[type]}
          aria-hidden='true'
        />
      </div>
    ) : (
      <div className={`bg-blue-100 text-white rounded-full py-2 px-3`}>
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
      >
        <div>{checkIcon}</div>
        <div className='ml-6 mr-12 flex-1 pt-0.5'>
          <p className='text-sm font-medium text-gray-900'>{title}</p>
          <p className='mt-1 text-sm text-gray-500'>{children}</p>
        </div>
        <div className='absolute top-0 right-0 mt-4 mr-1'>
          <ProgressionRing seconds={timeout} size={20} />
        </div>
      </div>
    </Transition>
  )
}

export default Toast
