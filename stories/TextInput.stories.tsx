// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { TextInput, TextInputProps } from '../components/common'
import {
  faMagnifyingGlass,
  faEnvelope,
  faCircleExclamation,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons'

const meta = {
  title: 'Components/TextInput',
  component: TextInput,
  argTypes: {
    onIconClick: {
      table: {
        category: 'Events',
        subcategory: 'Icon Events',
      },
      action: 'icon clicked',
    },
    squared: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const Template: Story<TextInputProps> = (args) => <TextInput {...args} />

export const Base = Template.bind({})
Base.args = {
  placeholder: 'This is a placeholder',
}

export const Large = Template.bind({})
Large.args = {
  placeholder: 'This is a placeholder',
  name: 'test',
  size: 'large',
}

export const FullRounded = Template.bind({})
FullRounded.args = {
  placeholder: 'This is a placeholder',
  name: 'test',
  rounded: 'full',
}

export const WithLabel = Template.bind({})
WithLabel.args = {
  label: 'This is a label',
  placeholder: 'This is a placeholder',
  name: 'test',
}

export const WithLeadingIcon = Template.bind({})
WithLeadingIcon.args = {
  ...WithLabel.args,
  icon: faMagnifyingGlass,
}

export const WithTrailingIcon = Template.bind({})
WithTrailingIcon.args = {
  ...WithLabel.args,
  icon: faEnvelope,
  trailingIcon: true,
}

export const WithError = Template.bind({})
WithError.args = {
  ...WithLabel.args,
  error: true,
}

export const ErrorWithHelper = Template.bind({})
ErrorWithHelper.args = {
  ...WithLabel.args,
  helper: 'This is a helper text',
  error: true,
}

export const ErrorHelperWithIcon = Template.bind({})
ErrorHelperWithIcon.args = {
  ...WithLabel.args,
  icon: faCircleExclamation,
  trailingIcon: true,
  helper: 'This is a helper text',
  error: true,
}

export const Squared = Template.bind({})
Squared.args = {
  ...WithLabel.args,
  squared: 'bottom',
}

export const InputGroup: Story = () => {
  const [pwdVisible, setPwdVisible] = useState(false)

  return (
    <div className='flex flex-col -space-y-1.5'>
      <TextInput placeholder='Enter your username' name='username' squared='bottom' />

      <div className='pt-px'>
        <TextInput
          placeholder='Enter your password'
          name='password'
          squared='top'
          type={pwdVisible ? 'text' : 'password'}
          icon={pwdVisible ? faEye : faEyeSlash}
          onIconClick={() => setPwdVisible(!pwdVisible)}
          trailingIcon={true}
        />
      </div>
    </div>
  )
}
