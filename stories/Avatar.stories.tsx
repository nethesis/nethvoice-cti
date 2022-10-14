import React from 'react';
import { Avatar, AvatarProps } from '../components/common';
import { Story, Meta } from '@storybook/react';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
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
        'offline',
      ],
      type: 'select',
    },
    size: {
      options: ['small', 'base', 'large'],
      type: 'select',
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};
export default meta as Meta;

const Template: Story<AvatarProps> = (args) => <Avatar {...args} />;

export const Circular = Template.bind({});
Circular.args = {
  rounded: 'full',
  src: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  unoptimized: true
};

export const Rounded = Template.bind({});
Rounded.args = {
  rounded: 'base',
  src: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  unoptimized: true
};

export const WithStatus = Template.bind({});
WithStatus.args = {
  status: 'available',
  src: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  unoptimized: true
};

export const WithInitials = Template.bind({});
WithInitials.args = {
  initials: 'TW',
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  placeholder: () => (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_7835_217)">
        <rect width="48" height="48" rx="24" fill="#F4F4F5" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M-3 50C-3 47.0124 -2.30162 44.0541 -0.944747 41.294C0.41213 38.5338 2.40093 36.0259 4.90812 33.9133C7.4153 31.8008 10.3918 30.125 13.6675 28.9817C16.9433 27.8384 20.4543 27.25 24 27.25C27.5457 27.25 31.0567 27.8384 34.3325 28.9817C37.6082 30.125 40.5847 31.8008 43.0919 33.9133C45.5991 36.0259 47.5879 38.5338 48.9447 41.294C50.3016 44.0541 51 47.0124 51 50H-3Z"
          fill="#D4D4D8"
        />
        <path
          d="M29.6569 21.6569C28.1566 23.1571 26.1217 24 24 24C21.8783 24 19.8434 23.1571 18.3431 21.6569C16.8429 20.1566 16 18.1217 16 16C16 13.8783 16.8429 11.8434 18.3431 10.3431C19.8434 8.84285 21.8783 8 24 8C26.1217 8 28.1566 8.84285 29.6569 10.3431C31.1571 11.8434 32 13.8783 32 16C32 18.1217 31.1571 20.1566 29.6569 21.6569Z"
          fill="#D4D4D8"
        />
      </g>
      <defs>
        <clipPath id="clip0_7835_217">
          <rect width="48" height="48" rx="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ),
  size: 'base'
};

const sources = [
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
];

export const AvatarGroup: Story<AvatarProps> = (args) => (
  <Avatar.Group>
    {sources.map((source, i) => (
      <Avatar key={i} src={source} {...args}/>
    ))}
  </Avatar.Group>
);
AvatarGroup.args = {
  bordered: true,
  unoptimized: true
}

export const AvatarGroupReverse: Story = (args) => (
  <Avatar.Group reversed={true}>
    {sources.map((source, i) => (
      <Avatar key={i} src={source} {...args}/>
    ))}
  </Avatar.Group>
);
AvatarGroupReverse.args = {
  bordered: true,
  unoptimized: true
}