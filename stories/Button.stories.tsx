import { Button, ButtonProps } from '../components/common'
import { MdRefresh } from 'react-icons/md'
import { Story, Meta } from '@storybook/react'

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
    <MdRefresh className='-ml-1 mr-2 h-5 w-5' />
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
    <MdRefresh className='ml-2 -mr-1 h-5 w-5' />
  </Button>
)

export const WithIconRight = TemplateWithChildRight.bind({})
WithIconRight.args = {
  size: 'base',
  variant: 'primary',
}
