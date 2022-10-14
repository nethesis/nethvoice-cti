/**
 *
 * The Modal component shows elements in foreground
 *
 * @param show - The parameter to show the modal.
 * @param size - The size of the modal.
 * @param focus - The size of the modal.
 * @param onClose - The size of the modal.
 *
 */

import { FC, ComponentProps, PropsWithChildren, RefObject } from 'react'
import React, { Fragment, createRef } from 'react'
import { useTheme } from '../../../theme/Context'
import { cleanClassName } from '../../../lib/utils'
import { ModalContent } from './ModalContent'
import { ModalActions } from './ModalActions'
import { Transition, Dialog } from '@headlessui/react'

export interface ModalProps extends PropsWithChildren<Omit<ComponentProps<'div'>, 'className'>> {
  show?: boolean
  size?: 'base' | 'large'
  focus?: RefObject<HTMLElement>
  onClose: () => void
}

const ModalComponent: FC<ModalProps> = ({
  children,
  show,
  size = 'base',
  focus = createRef(),
  onClose,
  ...props
}) => {
  const { modal: theme } = useTheme().theme
  const cleanProps = cleanClassName(props)

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-10'
        onClose={() => onClose()}
        initialFocus={focus && focus}
        {...cleanProps}
      >
        <Transition.Child as={Fragment} {...theme.panel.transition}>
          <div className={theme.background.base} />
        </Transition.Child>
        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
            <Transition.Child as={Fragment} {...theme.background.transition}>
              <Dialog.Panel className={theme.panel.base}>{children}</Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

ModalComponent.displayName = 'Modal'
ModalContent.displayName = 'Modal.Content'
ModalActions.displayName = 'Modal.Actions'

export const Modal = Object.assign(ModalComponent, {
  Content: ModalContent,
  Actions: ModalActions,
})
