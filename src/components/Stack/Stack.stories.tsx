import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Stack } from './Stack'

const meta = {
  title: 'Components/Stack',
  component: Stack,
  tags: ['autodocs'],
  args: {
    direction: 'column',
    gap: 4,
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['column', 'row'] },
    gap: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6, 8] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch', 'baseline'] },
    justify: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
  },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

/** Plain boxes, so the spacing is easy to see. */
const box = {
  padding: 'var(--elven-space-3) var(--elven-space-4)',
  border: '1px solid var(--elven-color-border)',
  background: 'var(--elven-color-surface)',
  fontFamily: 'var(--elven-font-display)',
} as const

const realms = ['Rivendell', 'Lothlórien', 'Mirkwood']

export const Playground: Story = {
  render: (args) => (
    <Stack {...args}>
      {realms.map((realm) => (
        <div key={realm} style={box}>
          {realm}
        </div>
      ))}
    </Stack>
  ),
}

export const Row: Story = {
  args: { direction: 'row', gap: 2, align: 'center' },
  render: (args) => (
    <Stack {...args}>
      <Button>Enter Imladris</Button>
      <Button variant="secondary">Ask Elrond</Button>
      <Badge variant="accent">New</Badge>
    </Stack>
  ),
}

/** The spacing scale, from `1` to `8`. */
export const Gaps: Story = {
  render: (args) => (
    <Stack gap={6}>
      {([1, 2, 3, 4, 5, 6, 8] as const).map((gap) => (
        <Stack key={gap} {...args} direction="row" gap={gap}>
          {realms.map((realm) => (
            <div key={realm} style={box}>
              {gap}
            </div>
          ))}
        </Stack>
      ))}
    </Stack>
  ),
}

/** `between` pushes the first and last child to the ends. */
export const Justify: Story = {
  args: { direction: 'row', justify: 'between', align: 'center' },
  render: (args) => (
    <Stack {...args}>
      <span style={{ fontFamily: 'var(--elven-font-display)' }}>The Red Book of Westmarch</span>
      <Badge variant="success">Complete</Badge>
    </Stack>
  ),
}

export const Wrap: Story = {
  args: { direction: 'row', gap: 2, wrap: true },
  render: (args) => (
    <div style={{ maxInlineSize: '16rem' }}>
      <Stack {...args}>
        {['Frodo', 'Sam', 'Merry', 'Pippin', 'Gandalf', 'Aragorn', 'Legolas', 'Gimli', 'Boromir'].map((name) => (
          <Badge key={name}>{name}</Badge>
        ))}
      </Stack>
    </div>
  ),
}

/** A fine gilt rule with the Evenstar between the children; `--elven-ornament-width: 0` removes it. */
export const Separator: Story = {
  args: { separator: true },
  render: (args) => (
    <Stack direction="row" gap={8} align="start">
      <div style={{ inlineSize: '12rem' }}>
        <Stack {...args} direction="column">
          {realms.map((realm) => (
            <div key={realm} style={{ fontFamily: 'var(--elven-font-display)' }}>
              {realm}
            </div>
          ))}
        </Stack>
      </div>
      <Stack {...args} direction="row" align="center">
        {realms.map((realm) => (
          <div key={realm} style={{ fontFamily: 'var(--elven-font-display)' }}>
            {realm}
          </div>
        ))}
      </Stack>
    </Stack>
  ),
}

/** With `asChild` the list itself becomes the stack, so its items stay direct children. */
export const AsChild: Story = {
  args: { asChild: true, gap: 2 },
  render: (args) => (
    <Stack {...args}>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {realms.map((realm) => (
          <li key={realm} style={box}>
            {realm}
          </li>
        ))}
      </ul>
    </Stack>
  ),
}
