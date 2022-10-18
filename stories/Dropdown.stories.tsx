// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react'
import { Dropdown, DropdownProps, Button } from '../components/common'
import { Story, Meta } from '@storybook/react'

import {
  MdOutlineExpandMore,
  MdOutlineEdit,
  MdContentCopy,
  MdOutlineArchive,
  MdOutlineExpand,
  MdDeleteOutline,
} from 'react-icons/md'

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  argTypes: {
    onClick: { action: 'clicked' },
    enabled: {
      control: {
        type: 'boolean',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<DropdownProps> = (args) => {
  return (
    <Dropdown {...args}>
      <Button variant='white'>
        Actions
        <MdOutlineExpandMore className='-mr-1 ml-2 h-5 w-5' aria-hidden='true' />
      </Button>
    </Dropdown>
  )
}

export const Base = Template.bind({})
Base.args = {
  items: (
    <>
      <Dropdown.Item>Call</Dropdown.Item>
      <Dropdown.Item>Chat</Dropdown.Item>
    </>
  ),
}

export const WithDivider = Template.bind({})
WithDivider.args = {
  items: (
    <>
      <Dropdown.Item>Edit</Dropdown.Item>
      <div>
        <Dropdown.Item>Duplicate</Dropdown.Item>
        <Dropdown.Item>Archive</Dropdown.Item>
      </div>
      <div>
        <Dropdown.Item>Move</Dropdown.Item>
      </div>
      <div>
        <Dropdown.Item>Delete</Dropdown.Item>
      </div>
    </>
  ),
  divider: true,
}

export const WithIcon = Template.bind({})
WithIcon.args = {
  items: (
    <>
      <Dropdown.Item icon={MdOutlineEdit}>Edit</Dropdown.Item>
      <div>
        <Dropdown.Item icon={MdContentCopy}>Duplicate</Dropdown.Item>
        <Dropdown.Item icon={MdOutlineArchive}>Archive</Dropdown.Item>
      </div>
      <div>
        <Dropdown.Item icon={MdOutlineExpand}>Move</Dropdown.Item>
      </div>
      <div>
        <Dropdown.Item icon={MdDeleteOutline}>Delete</Dropdown.Item>
      </div>
    </>
  ),
  divider: true,
}

export const WithHeader = Template.bind({})
WithHeader.args = {
  items: (
    <>
      <Dropdown.Header>
        <span className='block text-sm'>Signed in as</span>
        <span className='block text-sm font-medium truncate'>john.doe@example.com</span>
      </Dropdown.Header>
      <div>
        <Dropdown.Item>Profile</Dropdown.Item>
        <Dropdown.Item>Settings</Dropdown.Item>
      </div>
      <div>
        <Dropdown.Item>Sign out</Dropdown.Item>
      </div>
    </>
  ),
  divider: true,
}

export const PositionLeft = Template.bind({})
PositionLeft.args = {
  items: (
    <>
      <Dropdown.Header>
        <span className='block text-sm'>Signed in as</span>
        <span className='block text-sm font-medium truncate'>john.doe@example.com</span>
      </Dropdown.Header>
      <div>
        <Dropdown.Item>Profile</Dropdown.Item>
        <Dropdown.Item>Settings</Dropdown.Item>
      </div>
      <div>
        <Dropdown.Item>Sign out</Dropdown.Item>
      </div>
    </>
  ),
  divider: true,
  position: 'left',
}
