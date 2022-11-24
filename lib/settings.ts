// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

interface NewIslandConfigTypes {
  hostname: string
  username: string
  auth_token: string
  sip_exten: string
  sip_secret: string
}

export function newIslandConfig(obj: NewIslandConfigTypes): string {
  return btoa(
    `${obj.hostname}:${obj.username}:${obj.auth_token}:${obj.sip_exten}:${obj.sip_secret}`,
  )
}
