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
  let configString: string = `${obj.hostname}:${obj.username}:${obj.auth_token}:${obj.sip_exten}:${obj.sip_secret}`
  // Add janus_host to configuration string
  if (obj.janus_host) {
    configString = `${configString}:${obj.janus_host}`
  }
  // Add janus_port to configuration string
  if (obj.janus_port) {
    configString = `${configString}:${obj.janus_port}`
  }
  // Return the encoded string
  return btoa(configString)
}
