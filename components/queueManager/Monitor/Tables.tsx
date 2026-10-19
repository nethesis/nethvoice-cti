// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, CSSProperties } from 'react'
import { MonitorQueueCard } from './MonitorQueueCard'

export interface MonitorCard {
  id: number
  queue: any
}

export interface MonitorTablesProps {
  isFullscreen: boolean
  selectedRow: number
  cards: MonitorCard[]
  onQueueChange: (cardId: number, queue: any) => void
  onRemove: (cardId: number) => void
}

const getFullscreenColumns = (cardCount: number) => {
  if (cardCount <= 2) {
    return 2
  }
  if (cardCount === 3) {
    return 3
  }
  return Math.ceil(Math.sqrt(cardCount))
}

export const MonitorTables: FC<MonitorTablesProps> = ({
  isFullscreen,
  selectedRow,
  cards,
  onQueueChange,
  onRemove,
}): JSX.Element => {
  const isSingleCard = cards.length === 1

  const gridStyle: CSSProperties | undefined = isFullscreen
    ? { gridTemplateColumns: `repeat(${getFullscreenColumns(cards.length)}, minmax(0, 1fr))` }
    : undefined

  return (
    <div
      className='grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2'
      style={gridStyle}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className={`${!isFullscreen ? 'pt-8' : 'pt-1'} ${isSingleCard ? 'col-span-2' : 'col-span-1'}`}
        >
          <MonitorQueueCard
            queue={card.queue}
            rowCount={selectedRow}
            isFullscreen={isFullscreen}
            onQueueChange={(queue) => onQueueChange(card.id, queue)}
            onRemove={isSingleCard ? undefined : () => onRemove(card.id)}
          />
        </div>
      ))}
    </div>
  )
}

MonitorTables.displayName = 'MonitorTables'
