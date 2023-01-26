import { StatusDot, statusDotProps } from '../components/common'
import { Meta, Story } from '@storybook/react'

const meta = {
  title: 'Components/StatusDot',
  component: StatusDot,
  argTypes: {
    status: {
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
      type: 'select',
    },
    size: {
      options: ['extra_small', 'small', 'base', 'large', 'extra_large'],
      type: 'select',
    },
  },
}

export default meta as Meta

const Template: Story<statusDotProps> = (args) => <StatusDot {...args} />

export const WithStatus = Template.bind({})
WithStatus.args = {
  status: 'available',
  size: 'small',
}
