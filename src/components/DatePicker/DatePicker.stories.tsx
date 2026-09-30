import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { DatePicker } from './DatePicker'

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  args: {
    label: 'Day of the council',
    placeholder: 'Choose a day',
    defaultValue: '2026-09-30',
    onValueChange: fn(),
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    frame: { control: 'inline-radio', options: ['line', 'box'] },
    numerals: { control: 'inline-radio', options: ['arabic', 'roman'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '22rem', minBlockSize: '30rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Click the field or the calendar button: a page of the calendar unrolls.
 * Click the month to choose among the twelve months, and the year there to
 * choose among the years.
 */
export const Playground: Story = {}

export const Empty: Story = {
  args: { defaultValue: '', hint: 'The council meets in autumn' },
}

/** Days outside `min` and `max` are struck through and cannot be chosen. */
export const MinAndMax: Story = {
  args: { min: '2026-09-10', max: '2026-10-05', hint: 'Between 10 September and 5 October' },
}

/** Days and the year written in Roman numerals. */
export const RomanNumerals: Story = {
  args: { numerals: 'roman' },
}

export const BoxFrame: Story = {
  args: { frame: 'box' },
}

/**
 * Everything is English by default. To localise the picker, set `locale` for
 * the month and weekday names and translate the buttons with `labels`.
 */
export const Localised: Story = {
  args: {
    label: 'Toplantı günü',
    placeholder: 'Bir gün seç',
    locale: 'tr',
    labels: {
      open: 'Tarih seç',
      previousMonth: 'Önceki ay',
      nextMonth: 'Sonraki ay',
      chooseMonth: 'Ay seç',
      previousYear: 'Önceki yıl',
      nextYear: 'Sonraki yıl',
      chooseYear: 'Yıl seç',
      previousYears: 'Önceki yıllar',
      nextYears: 'Sonraki yıllar',
      clear: 'Temizle',
      today: 'Bugün',
    },
  },
}

export const Invalid: Story = {
  args: { error: 'The council cannot meet on that day' },
}

export const Disabled: Story = {
  args: { disabled: true },
}
