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
  title: 'Some useful information',
  type: 'info',
  children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
}

export const Warning = Template.bind({})
Warning.args = {
  title: 'Something needs attention',
  type: 'warning',
  children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
}

export const Error = Template.bind({})
Error.args = {
  title: 'Something went wrong',
  type: 'error',
  children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
}

export const Success = Template.bind({})
Success.args = {
  title: 'Something good has happened',
  type: 'success',
  children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
}

export const NoChildren = Template.bind({})
NoChildren.args = {
  title: 'Some useful information',
  type: 'info',
  children: null,
}
