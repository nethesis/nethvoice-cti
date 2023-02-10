// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Switch, SwitchProps } from '../components/common'
import { Meta, Story } from '@storybook/react'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  argTypes: {
    changed: {
      action: 'changed',
      table: {
        category: 'Events',
        subcategory: 'Button Events',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<SwitchProps> = (args) => <Switch {...args} />

export const Off = Template.bind({})
Off.args = {}

export const On = Template.bind({})
On.args = {
  on: true,
}

export const OffDisabled = Template.bind({})
OffDisabled.args = {
  disabled: true,
}

export const OnDisabled = Template.bind({})
OnDisabled.args = {
  on: true,
  disabled: true,
}

export const WithLabel = Template.bind({})
WithLabel.args = {
  label: 'Enable notifications',
}
