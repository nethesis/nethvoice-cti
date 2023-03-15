import { RangeSlider } from '../components/common'
import { ReactSliderProps } from 'react-slider'
import { Meta, Story } from '@storybook/react'

const meta = {
  title: 'Components/RangeSlider',
  component: RangeSlider,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

const HorizontalTemplate: Story<ReactSliderProps> = (args) => (
  <RangeSlider {...args} className='w-40 h-5' />
)

export const Horizontal = HorizontalTemplate.bind({})
Horizontal.args = {
  defaultValue: 50,
  orientation: 'horizontal',
}

const VerticalTemplate: Story<ReactSliderProps> = (args) => (
  <RangeSlider {...args} className='w-5 h-40' />
)

export const Vertical = VerticalTemplate.bind({})
Vertical.args = {
  defaultValue: 50,
  orientation: 'vertical',
}
