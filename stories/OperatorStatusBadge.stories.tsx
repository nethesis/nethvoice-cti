// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { OperatorStatusBadge, OperatorStatusBadgeProps } from '../components/operators'
import { Story, Meta } from '@storybook/react'

const meta = {
  title: 'Components/OperatorStatusBadge',
  component: OperatorStatusBadge,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<OperatorStatusBadgeProps> = (args) => (
  <OperatorStatusBadge {...args}>OperatorStatusBadge</OperatorStatusBadge>
)

const onlineOperator = {
  name: 'Test operator',
  username: 'operator1',
  mainPresence: 'online',
  presence: 'online',
  endpoints: {
    email: [],
    jabber: [],
    extension: [
      {
        id: '234',
        type: 'webrtc',
        username: '234',
        description: 'Janus WebRTC Server SIP Plugin 0.0.8',
      },
    ],
    cellphone: [],
    voicemail: [],
    mainextension: [
      {
        id: '234',
        description: 'Janus WebRTC Server SIP Plugin 0.0.8',
      },
    ],
  },
  presenceOnBusy: 'online',
  presenceOnUnavailable: 'online',
  recallOnBusy: 'enabled',
  group: 'Test group',
}

const defaultArgs = {
  size: 'base',
  callEnabled: false,
  onCall: undefined,
  currentUsername: 'test',
  operator: onlineOperator,
}

const cellphoneOperator = { ...onlineOperator, mainPresence: 'cellphone' }
const callforwardOperator = { ...onlineOperator, mainPresence: 'callforward' }
const voicemailOperator = { ...onlineOperator, mainPresence: 'voicemail' }
const incomingOperator = { ...onlineOperator, mainPresence: 'incoming' }
const ringingOperator = { ...onlineOperator, mainPresence: 'ringing' }
const busyOperator = { ...onlineOperator, mainPresence: 'busy' }
const dndOperator = { ...onlineOperator, mainPresence: 'dnd' }
const offlineOperator = { ...onlineOperator, mainPresence: 'offline' }

export const CallEnabled = Template.bind({})
// @ts-ignore
CallEnabled.args = {
  ...defaultArgs,
  callEnabled: true,
  operator: onlineOperator,
}

export const Online = Template.bind({})
// @ts-ignore
Online.args = {
  ...defaultArgs,
  operator: onlineOperator,
}

export const Cellphone = Template.bind({})
// @ts-ignore
Cellphone.args = {
  ...defaultArgs,
  operator: cellphoneOperator,
}

export const Callforward = Template.bind({})
// @ts-ignore
Callforward.args = {
  ...defaultArgs,
  operator: callforwardOperator,
}

export const Voicemail = Template.bind({})
// @ts-ignore
Voicemail.args = {
  ...defaultArgs,
  operator: voicemailOperator,
}

export const Incoming = Template.bind({})
// @ts-ignore
Incoming.args = {
  ...defaultArgs,
  operator: incomingOperator,
}

export const Ringing = Template.bind({})
// @ts-ignore
Ringing.args = {
  ...defaultArgs,
  operator: ringingOperator,
}

export const Busy = Template.bind({})
// @ts-ignore
Busy.args = {
  ...defaultArgs,
  operator: busyOperator,
}

export const Dnd = Template.bind({})
// @ts-ignore
Dnd.args = {
  ...defaultArgs,
  operator: dndOperator,
}

export const Offline = Template.bind({})
// @ts-ignore
Offline.args = {
  ...defaultArgs,
  operator: offlineOperator,
}
