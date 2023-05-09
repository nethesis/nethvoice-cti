// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

interface NewIslandConfigTypes {
  hostname: string
  username: string
  auth_token: string
  sip_exten: string
  sip_secret: string
  janus_host: string
  janus_port: string
}

export function newIslandConfig(obj: NewIslandConfigTypes): string {
  // Return the encoded string
  return btoa(
    `${obj.hostname}:${obj.username}:${obj.auth_token}:${obj.sip_exten}:${obj.sip_secret}:${obj.janus_host}:${obj.janus_port}`,
  )
}
