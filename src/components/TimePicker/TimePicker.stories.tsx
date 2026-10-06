import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { TimePicker } from './TimePicker'

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  tags: ['autodocs'],
  args: {
    label: 'Hour of departure',
    placeholder: 'Choose a time',
    defaultValue: '09:30',
    onValueChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    frame: { control: 'inline-radio', options: ['line', 'box'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '22rem', minBlockSize: '24rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimePicker>

export default meta
type Story = StoryObj<typeof meta>

/** Click the field or the hourglass: choose the hour, then the minutes. */
export const Playground: Story = {}

export const Empty: Story = {
  args: { defaultValue: '', hint: 'The Fellowship leaves at dusk' },
}

/** `minuteStep` sets the gap between the minutes on offer. */
export const QuarterHours: Story = {
  args: { minuteStep: 15, defaultValue: '18:45' },
}

export const BoxFrame: Story = {
  args: { frame: 'box' },
}

export const Disabled: Story = {
  args: { disabled: true },
}
