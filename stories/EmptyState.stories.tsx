import { EmptyState, EmptyStateProps } from '../components/common'
import { Meta, Story } from '@storybook/react'
import { MdFolderSpecial } from 'react-icons/md'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<EmptyStateProps> = (args) => (
  <EmptyState {...args}>{args.children}</EmptyState>
)

const icon = <MdFolderSpecial className='mx-auto h-12 w-12' aria-hidden='true' />

export const WithIcon = Template.bind({})
WithIcon.args = {
  title: 'No projects',
  description: 'Get started by creating a new project',
  icon: icon,
}

const button = (
  <button
    type='button'
    className='inline-flex items-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2'
  >
    <FontAwesomeIcon icon={faPlus} className='mr-2 h-4 w-4' aria-hidden='true' />
    New project
  </button>
)

export const WithChildren = Template.bind({})
WithChildren.args = {
  title: 'No projects',
  description: 'Get started by creating a new project',
  icon: icon,
  children: button,
}
