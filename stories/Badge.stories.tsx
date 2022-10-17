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
        'offline',
        'rounded',
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
  rounded: 'full',
}

export const Large = Template.bind({})
Large.args = {
  children: 'Badge',
  variant: 'available',
  size: 'large',
  rounded: 'full'
}

export const Rounded = Template.bind({})
Rounded.args = {
  children: 'Badge',
  variant: 'available'
}