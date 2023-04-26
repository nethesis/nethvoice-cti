// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { SpeedDialType } from '../services/types'
import { store } from '../store'

/**
 * This method sorts the speed dials
 *
 * @param speedDials - The list of speed dials
 * @returns The sorted list of speed dials
 *
 */
export const sortSpeedDials = (
  speedDials: SpeedDialType[] = [],
  field: keyof SpeedDialType = 'name',
) => {
  if (speedDials.length > 0) {
    return speedDials.sort((a, b) => {
      // @ts-ignore
      var textA = isNaN(a[field]) ? a[field].toLowerCase() : a[field]
      // @ts-ignore
      var textB = isNaN(b[field]) ? b[field].toLowerCase() : b[field]
      return textA < textB ? -1 : textA > textB ? 1 : 0
    })
  } else {
    return speedDials
  }
}

export const openCreateSpeedDialDrawer = () => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditSpeedDial',
    config: { isEdit: false },
  })
}

export const openEditSpeedDialDrawer = (speedDial: any) => {
  store.dispatch.sideDrawer.update({
    isShown: true,
    contentType: 'createOrEditSpeedDial',
    config: { isEdit: true, speedDial: speedDial },
  })
}

export function reloadSpeedDial() {
  store.dispatch.speedDial.reload()
}

export function exportSpeedDial(speedDial: any) {
  let temp: any
  let headers: any
  let formattedData = speedDial.map(function (speed: any) {
    temp = {}
    headers = []
    for (const k in speed) {
      if (k !== '$$hashKey' && k !== 'id') {
        headers.push(k)
        temp[k] = speed[k]
      }
    }
    return temp
  })
  exportCSVFile(headers, formattedData, 'speeddial')
}

function exportCSVFile(headers: string[], items: any[], fileTitle: string): void {
  if (headers) {
    items.unshift(headers)
  }
  // Convert Object to JSON
  const jsonObject = JSON.stringify(items)
  const csv = convertToCSV(jsonObject)
  const exportedFilename = fileTitle + '.csv' || 'export.csv'
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', exportedFilename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

function convertToCSV(objArray: any) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray
  let str = ''

  for (let i = 0; i < array.length; i++) {
    let line = ''
    for (const index in array[i]) {
      if (line !== '') {
        line += ','
      }
      line += array[i][index] === null ? '' : array[i][index]
    }
    str += line + '\r\n'
  }
  return str
}
