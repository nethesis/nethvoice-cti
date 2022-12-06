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

const cellphoneOperator = { ...onlineOperator, mainPresence: 'cellphone' }
const callforwardOperator = { ...onlineOperator, mainPresence: 'callforward' }
const voicemailOperator = { ...onlineOperator, mainPresence: 'voicemail' }
const incomingOperator = { ...onlineOperator, mainPresence: 'incoming' }
const busyOperator = { ...onlineOperator, mainPresence: 'busy' }
const dndOperator = { ...onlineOperator, mainPresence: 'dnd' }
const offlineOperator = { ...onlineOperator, mainPresence: 'offline' }

export const Online = Template.bind({})
Online.args = {
  operator: onlineOperator,
  currentUsername: 'test',
}

export const Cellphone = Template.bind({})
Cellphone.args = {
  operator: cellphoneOperator,
  currentUsername: 'test',
}

export const Callforward = Template.bind({})
Callforward.args = {
  operator: callforwardOperator,
  currentUsername: 'test',
}

export const Voicemail = Template.bind({})
Voicemail.args = {
  operator: voicemailOperator,
  currentUsername: 'test',
}

export const Incoming = Template.bind({})
Incoming.args = {
  operator: incomingOperator,
  currentUsername: 'test',
}

export const Busy = Template.bind({})
Busy.args = {
  operator: busyOperator,
  currentUsername: 'test',
}

export const Dnd = Template.bind({})
Dnd.args = {
  operator: dndOperator,
  currentUsername: 'test',
}

export const Offline = Template.bind({})
Offline.args = {
  operator: offlineOperator,
  currentUsername: 'test',
}
