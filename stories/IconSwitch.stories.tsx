// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { IconSwitch, IconSwitchProps } from '../components/common'
import { Story, Meta } from '@storybook/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarLight } from '@nethesis/nethesis-light-svg-icons'

const meta = {
  title: 'Components/IconSwitch',
  component: IconSwitch,
  argTypes: {
    size: {
      options: ['small', 'base', 'large', 'extra_large'],
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<IconSwitchProps> = (args) => <IconSwitch {...args} />

export const On = Template.bind({})
On.args = {
  on: true,
  size: 'extra_large',
  disabled: false,
  onIcon: <FontAwesomeIcon icon={faStarSolid} />,
  offIcon: <FontAwesomeIcon icon={faStarLight} />,
  changed: (enabled) => {
    console.log('IconSwitch changed', enabled)
  },
}

export const Off = Template.bind({})
Off.args = {
  ...On.args,
  on: false,
  onIcon: <FontAwesomeIcon icon={faStarSolid} />,
  offIcon: <FontAwesomeIcon icon={faStarLight} />,
}

export const OnDisabled = Template.bind({})
OnDisabled.args = {
  ...On.args,
  disabled: true,
}

export const OffDisabled = Template.bind({})
OffDisabled.args = {
  ...On.args,
  on: false,
  disabled: true,
  onIcon: <FontAwesomeIcon icon={faStarSolid} />,
  offIcon: <FontAwesomeIcon icon={faStarLight} />,
}

export const LighterOnDark = Template.bind({})
LighterOnDark.args = {
  ...On.args,
  lighterOnDark: true,
}
