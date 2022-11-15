// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Button, ButtonProps } from '../components/common'
import { Story, Meta } from '@storybook/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateRight } from '@fortawesome/free-solid-svg-icons'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    onClick: {
      table: {
        category: 'Events',
        subcategory: 'Button Events',
      },
      action: 'clicked',
    },
    variant: {
      options: ['primary', 'secondary', 'white', 'danger'],
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<ButtonProps> = (args) => <Button {...args}>Button</Button>

export const Primary = Template.bind({})
Primary.args = {
  size: 'base',
  variant: 'primary',
  disabled: false,
}

export const Secondary = Template.bind({})
Secondary.args = {
  ...Primary.args,
  variant: 'secondary',
}

export const White = Template.bind({})
White.args = {
  ...Primary.args,
  variant: 'white',
}

export const Danger = Template.bind({})
Danger.args = {
  ...Primary.args,
  variant: 'danger',
}

const TemplateWithChild: Story<ButtonProps> = (args) => (
  <Button {...args}>
    <FontAwesomeIcon icon={faRotateRight} className='mr-2 h-4 w-4' />
    Button
  </Button>
)

export const WithIcon = TemplateWithChild.bind({})
WithIcon.args = {
  size: 'base',
  variant: 'primary',
}

const TemplateWithChildRight: Story<ButtonProps> = (args) => (
  <Button {...args}>
    Button
    <FontAwesomeIcon icon={faRotateRight} className='ml-2 h-4 w-4' />
  </Button>
)

export const WithIconRight = TemplateWithChildRight.bind({})
WithIconRight.args = {
  size: 'base',
  variant: 'primary',
}
