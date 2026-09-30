import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChainIcon, FeatheredCapIcon, LetterIcon, SeeingStoneIcon } from '../../icons'
import { DatePicker } from '../DatePicker'
import { TimePicker } from '../TimePicker'
import { Input } from './Input'

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    label: 'Your name',
    placeholder: 'Frodo Baggins',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    frame: { control: 'inline-radio', options: ['line', 'box'] },
  },
  decorators: [
    // Fields are narrow by default; a story can ask for more room with `parameters.width`.
    (Story, { parameters }) => (
      <div style={{ maxInlineSize: parameters.width ?? '22rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

const column = { display: 'grid', gap: 'var(--elven-space-6)' } as const

export const Playground: Story = {}

/** Click into the field: a gilt line is drawn over the ruled line. */
export const WithHint: Story = {
  args: { hint: 'As it is written in the Red Book' },
}

/** `error` marks the field invalid and is read out together with it. */
export const Invalid: Story = {
  args: {
    label: 'Password to the West-gate',
    defaultValue: 'friend',
    hint: 'Speak it in Elvish',
    error: 'The doors stay shut. Try "mellon".',
  },
}

/** `line` is a ruled line under the text, `box` a border on all four sides. */
export const Frames: Story = {
  render: (args) => (
    <div style={column}>
      <Input {...args} frame="line" label="Line" hint="Click in: the light runs along the line" />
      <Input {...args} frame="box" label="Box" hint="Click in: the light crosses the frame" />
      <Input {...args} frame="box" label="Box, invalid" defaultValue="friend" error="The doors stay shut." />
      <Input {...args} frame="box" label="Box, password" type="password" defaultValue="mellon" placeholder={undefined} />
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={column}>
      <Input {...args} size="sm" label="Small" />
      <Input {...args} size="md" label="Medium" />
      <Input {...args} size="lg" label="Large" />
    </div>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <div style={column}>
      <Input {...args} label="Search the library" placeholder="Rings of power" startIcon={<SeeingStoneIcon />} />
      <Input {...args} label="Send word to" placeholder="elrond@imladris.me" type="email" endIcon={<LetterIcon />} />
    </div>
  ),
}

/**
 * Every native `type` works. `password`, `search` and `number` get their own
 * buttons (turn them off with `controls={false}`); the others are shown here
 * with a fitting icon. For dates and times, use `DatePicker` and `TimePicker`:
 * the browser's own pickers cannot be themed.
 */
export const Types: Story = {
  args: { placeholder: undefined },
  parameters: { width: '56rem' },
  render: (args) => (
    <div style={{ ...column, gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))' }}>
      <Input {...args} label="Text" placeholder="Frodo Baggins" startIcon={<FeatheredCapIcon />} />
      <Input {...args} label="Email" type="email" placeholder="frodo@bagend.shire" startIcon={<LetterIcon />} autoComplete="email" />
      <Input {...args} label="Password" type="password" defaultValue="mellon" autoComplete="current-password" />
      <Input {...args} label="Search" type="search" defaultValue="Rings of power" startIcon={<SeeingStoneIcon />} />
      <Input {...args} label="Number" type="number" defaultValue={9} min={0} max={20} hint="Between 0 and 20" />
      <Input {...args} label="Telephone" type="tel" placeholder="+90 555 000 00 00" autoComplete="tel" />
      <Input {...args} label="Link" type="url" placeholder="https://imladris.me" startIcon={<ChainIcon />} />
      <DatePicker label="Date" placeholder="Choose a day" size={args.size} frame={args.frame} />
      <TimePicker label="Time" placeholder="Choose a time" size={args.size} frame={args.frame} />
    </div>
  ),
}

/** Password fields get a button that shows and hides what was typed. */
export const Password: Story = {
  args: { label: 'Secret word', type: 'password', defaultValue: 'mellon', placeholder: undefined },
}

export const Disabled: Story = {
  args: { disabled: true, hint: 'The road is closed' },
}
