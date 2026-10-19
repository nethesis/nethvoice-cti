// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect, useRef, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, ConfirmationModal } from '../../common'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faChevronDown,
  faCheck,
  faExpand,
  faMinus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

import { DEFAULT_REALTIME_QUEUE_SELECTED, getMonitorValue } from '../../../lib/queueManager'

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from '@headlessui/react'

import { savePreference } from '../../../lib/storage'

import { MonitorCard, MonitorTables } from './Tables'

export interface MonitorProps extends ComponentProps<'div'> {}

const numbers = Array.from({ length: 20 }, (_, index) => index + 1)

const MIN_FULLSCREEN_ZOOM = 0.2
const ZOOM_SEARCH_STEPS = 10

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ')
}

export const Monitor: FC<MonitorProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<number>(0)

  const authStore = useSelector((state: RootState) => state.authentication)

  const [isFullscreen, setIsFullscreen] = useState(false)

  // Activate or deactivate fullscreen mode
  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen)
  }

  // on change of selected row numbers
  const handleSelectedRowNumbers = (newRowNumbers: any) => {
    setSelected(newRowNumbers)
    let currentSelectedRowNumbers = newRowNumbers
    savePreference('monitorRowNumbers', currentSelectedRowNumbers, authStore.username)
  }

  const [cards, setCards] = useState<MonitorCard[]>([])
  const [showRemoveAllModal, setShowRemoveAllModal] = useState(false)
  const cancelRemoveAllRef = useRef<HTMLButtonElement>(null)
  const nextCardId = useRef(0)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const tablesRef = useRef<HTMLDivElement>(null)

  const createCard = (queue: any): MonitorCard => ({ id: nextCardId.current++, queue })

  const updateCards = (newCards: MonitorCard[]) => {
    setCards(newCards)
    savePreference(
      'monitorSelectedQueues',
      newCards.map((card) => card.queue),
      authStore.username,
    )
  }

  const addCard = () => {
    updateCards([...cards, createCard(DEFAULT_REALTIME_QUEUE_SELECTED)])
  }

  const removeAllCards = () => {
    updateCards(cards.slice(0, 1))
    setShowRemoveAllModal(false)
  }

  const removeCard = (cardId: number) => {
    updateCards(cards.filter((card) => card.id !== cardId))
  }

  const changeCardQueue = (cardId: number, newQueue: any) => {
    updateCards(
      cards.map((card) => {
        if (card.id !== cardId) {
          return card
        }
        const isSameQueue = !!newQueue?.queue && newQueue.queue === card.queue?.queue
        return { ...card, queue: isSameQueue ? DEFAULT_REALTIME_QUEUE_SELECTED : newQueue }
      }),
    )
  }

  //Load selected row numbers and queues from local storage
  useEffect(() => {
    const monitorLocalStorageValue = getMonitorValue(authStore.username)
    setSelected(monitorLocalStorageValue.rowNumbers)
    setCards(monitorLocalStorageValue.selectedQueues.map((queue: any) => createCard(queue)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const container = fullscreenRef.current
    const content = tablesRef.current
    const grid = content?.firstElementChild as HTMLElement | null
    if (!isFullscreen || !container || !content || !grid) {
      return
    }

    let frame = 0
    const setZoom = (zoom: number) => content.style.setProperty('zoom', String(zoom))
    const setColumns = (columns: number) =>
      grid.style.setProperty('grid-template-columns', `repeat(${columns}, minmax(0, 1fr))`)

    const fits = () =>
      container.scrollHeight <= container.clientHeight &&
      Array.from(
        content.querySelectorAll<HTMLElement>('.overflow-x-auto, [data-monitor-card-header]'),
      ).every((element) => element.scrollWidth <= element.clientWidth)

    const findZoom = () => {
      setZoom(1)
      if (fits()) {
        return 1
      }
      let low = MIN_FULLSCREEN_ZOOM
      let high = 1
      for (let step = 0; step < ZOOM_SEARCH_STEPS; step++) {
        const zoom = (low + high) / 2
        setZoom(zoom)
        if (fits()) {
          low = zoom
        } else {
          high = zoom
        }
      }
      return low
    }

    const fitToScreen = () => {
      const cardCount = grid.childElementCount
      const columnOptions =
        cardCount <= 1
          ? [2]
          : Array.from(
              new Set(
                Array.from({ length: cardCount }, (_, index) => Math.ceil(cardCount / (index + 1))),
              ),
            ).sort((a, b) => a - b)
      let best = { columns: columnOptions[0], zoom: 0 }
      for (const columns of columnOptions) {
        setColumns(columns)
        const zoom = findZoom()
        if (zoom > best.zoom) {
          best = { columns, zoom }
        }
        if (best.zoom === 1) {
          break
        }
      }
      setColumns(best.columns)
      setZoom(best.zoom)
    }

    const scheduleFit = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fitToScreen)
    }

    const resizeObserver = new ResizeObserver(scheduleFit)
    resizeObserver.observe(container)
    resizeObserver.observe(content)
    fitToScreen()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      content.style.removeProperty('zoom')
      grid.style.removeProperty('grid-template-columns')
    }
  }, [isFullscreen])

  //Use escape button to close fullscreen
  useEffect(() => {
    const handleEscKey = (event: any) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false)
      }
    }

    window.addEventListener('keydown', handleEscKey)

    return () => {
      window.removeEventListener('keydown', handleEscKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className='flex space-x-8'>
        <Listbox value={selected} onChange={handleSelectedRowNumbers}>
          {({ open }) => (
            <>
              <div className='flex items-center'>
                <Label className='block text-sm font-medium leading-6 dark:text-gray-200 text-gray-700 mr-8'>
                  {t('QueueManager.Calls to show')}
                </Label>
                <div className='relative'>
                  <ListboxButton className='relative w-full cursor-default rounded-md bg-white dark:bg-gray-950 py-1.5 pl-3 pr-10 text-left text-gray-900 dark:text-gray-300 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm sm:leading-6'>
                    <span className='block truncate mr-1'>{selected}</span>
                    <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className='h-3.5 w-3.5 pl-2 py-2 cursor-pointer flex items-center'
                        aria-hidden='true'
                      />
                    </span>
                  </ListboxButton>

                  <Transition
                    show={open}
                    as={Fragment}
                    leave='transition ease-in duration-100'
                    leaveFrom='opacity-100'
                    leaveTo='opacity-0'
                  >
                    <ListboxOptions className='absolute z-10 mt-1 max-h-60 w-full overflow-auto  scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25 rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 dark:ring-opacity-100 focus:outline-none sm:text-sm'>
                      {numbers.map((number: any) => (
                        <ListboxOption
                          key={number}
                          className='data-[focus]:bg-primary data-[focus]:text-white data-[focus]:dark:text-gray-900 text-gray-900 dark:text-gray-100 relative cursor-default select-none py-2 pl-6'
                          value={number}
                        >
                          {({ selected }) => (
                            <>
                              <span
                                className={classNames(
                                  selected ? 'font-semibold' : 'font-normal',
                                  'block truncate',
                                )}
                              >
                                {number}
                              </span>

                              {selected ? (
                                <span className='data-[focus]:text-white text-primary absolute inset-y-0 left-0 flex items-center'>
                                  <FontAwesomeIcon
                                    icon={faCheck}
                                    className='h-3.5 w-3.5 pl-1 py-2 cursor-pointer flex items-center'
                                    aria-hidden='true'
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </Transition>
                </div>
              </div>
            </>
          )}
        </Listbox>
        {cards.length >= 2 && (
          <Button variant='white' onClick={() => setShowRemoveAllModal(true)}>
            <FontAwesomeIcon icon={faMinus} />
            <span className='ml-2'>{t('QueueManager.Remove all tables')}</span>
          </Button>
        )}
        <Button variant='primary' onClick={toggleFullscreen}>
          <FontAwesomeIcon
            icon={faExpand}
            className='h-5 w-5 mr-2 cursor-pointer flex items-center'
            aria-hidden='true'
          />
          <span>{t('QueueManager.Fullscreen')}</span>
        </Button>
      </div>

      {/* Queue Dashboard*/}
      <div
        ref={fullscreenRef}
        className={`transition-all duration-300 ${
          isFullscreen
            ? 'fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-50 bg-white dark:bg-gray-800 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-thumb-opacity-50 scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-track-rounded-full scrollbar-track-opacity-25'
            : ''
        }`}
      >
        <div>
          {/* Card section */}
          <div className='flex flex-col'>
            {isFullscreen && (
              <div className='flex justify-end'>
                <Button variant='ghost' className='w-8 h-8' onClick={() => setIsFullscreen(false)}>
                  <FontAwesomeIcon
                    className='h-5 w-5 cursor-pointer dark:text-gray-200 text-gray-700'
                    icon={faXmark}
                  />
                </Button>
              </div>
            )}
            <div ref={tablesRef}>
              <MonitorTables
                isFullscreen={isFullscreen}
                selectedRow={selected}
                cards={cards}
                onQueueChange={changeCardQueue}
                onAdd={addCard}
                onRemove={removeCard}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        show={showRemoveAllModal}
        focus={cancelRemoveAllRef}
        onClose={() => setShowRemoveAllModal(false)}
        title={t('QueueManager.Remove all tables')}
        description={t('QueueManager.Remove all tables message')}
        confirmLabel={t('QueueManager.Remove')}
        onConfirm={removeAllCards}
      />
    </>
  )
}

Monitor.displayName = 'Monitor'
