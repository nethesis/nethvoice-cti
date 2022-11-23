// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from 'react'
import { PhoneIsland } from '@nethesis/phone-island'
import { newIslandConfig } from '../../lib/settings'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

export function Island() {
  const [config, setConfig] = useState<string>('')
  const currentUser = useSelector((state: RootState) => state.user)
  const auth = useSelector((state: RootState) => state.authentication)
  const [firstRender, setFirstRender] = useState<boolean>(true)

  useEffect(() => {
    // Create the configuration for the PhoneIsland
    if (!firstRender) {
      const webRTCExtension = currentUser.endpoints.extension.find((el) => el.type === 'webrtc')
      if (auth.token && currentUser.username && webRTCExtension) {
        setConfig(
          newIslandConfig({
            // @ts-ignore
            hostname: window.CONFIG.API_ENDPOINT,
            username: currentUser.username,
            auth_token: auth.token,
            sip_exten: webRTCExtension.id,
            sip_secret: webRTCExtension.secret,
          }),
        )
      }
    }

    setFirstRender(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token, currentUser.endpoints.extension])

  return <>{config && <PhoneIsland dataConfig={config} />}</>
}
