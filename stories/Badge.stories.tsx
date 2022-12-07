import { Badge, BadgeProps } from '../components/common'
import { Meta, Story } from '@storybook/react'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    variant: {
      options: [
        'available',
        'dnd',
        'voicemail',
        'cellphone',
        'callforward',
        'busy',
        'incoming',
        'ringing',
        'offline',
      ],
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<BadgeProps> = (args) => <Badge {...args}>{args.children}</Badge>

export const Base = Template.bind({})
Base.args = {
  children: 'Badge',
  variant: 'available',
  size: 'base',
  rounded: 'full',
}

export const Small = Template.bind({})
Small.args = {
  children: 'Badge',
  variant: 'available',
  size: 'small',
  rounded: 'full',
}

export const Large = Template.bind({})
Large.args = {
  children: 'Badge',
  variant: 'available',
  size: 'large',
  rounded: 'full',
}

export const Squared = Template.bind({})
Squared.args = {
  children: 'Badge',
  variant: 'available',
  size: 'base',
  rounded: 'base',
}
