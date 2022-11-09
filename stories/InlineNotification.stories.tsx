import { InlineNotification, InlineNotificationProps } from '../components/common'
import { Meta, Story } from '@storybook/react'

const meta = {
  title: 'Components/InlineNotification',
  component: InlineNotification,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<InlineNotificationProps> = (args) => (
  <InlineNotification {...args}>{args.children}</InlineNotification>
)

export const Information = Template.bind({})
Information.args = {
  children: 'Information',
  type: 'info',
}

export const Warning = Template.bind({})
Warning.args = {
  children: 'Warning',
  type: 'warning',
}

export const Error = Template.bind({})
Error.args = {
  children: 'Error',
  type: 'error',
}

export const Success = Template.bind({})
Success.args = {
  children: 'Success',
  type: 'success',
}
