// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ComponentProps, useState, useEffect } from 'react'
import classNames from 'classnames'
import { formatDuration } from '../../lib/dateTime'

export interface CallDurationProps extends ComponentProps<'div'> {
  startTime: number
}

export const CallDuration: FC<CallDurationProps> = ({ startTime, className }): JSX.Element => {
  const [duration, setDuration]: any = useState(0)
  const [firstRender, setFirstRender]: any = useState(true)

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    updateDuration()
    const id = setInterval(updateDuration, 1000)

    return () => {
      clearInterval(id)
    }
  }, [firstRender])

  const updateDuration = () => {
    const d = (new Date().getTime() - startTime) / 1000
    setDuration(d)
  }

  return (
    <>
      <div className={classNames(className)}>{formatDuration(duration)}</div>
    </>
  )
}

CallDuration.displayName = 'CallDuration'
