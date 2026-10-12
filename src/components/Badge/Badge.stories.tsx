import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: 'Sealed',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'warning', 'danger'] },
    appearance: { control: 'inline-radio', options: ['soft', 'solid'] },
    shape: { control: 'inline-radio', options: ['ribbon', 'shield', 'round', 'scalloped'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

const row = { display: 'flex', gap: 'var(--elven-space-4)', alignItems: 'center', flexWrap: 'wrap' } as const
const column = { display: 'grid', gap: 'var(--elven-space-6)' } as const

export const Playground: Story = {}

/** Each tone says what it means in words too; the color only reinforces it. */
export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Badge {...args} variant="neutral">
        Sealed
      </Badge>
      <Badge {...args} variant="accent">
        New
      </Badge>
      <Badge {...args} variant="success">
        Reforged
      </Badge>
      <Badge {...args} variant="warning">
        Orcs near
      </Badge>
      <Badge {...args} variant="danger">
        Lost
      </Badge>
    </div>
  ),
}

/** `soft` (the default) is a pale tint; `solid` paints the full tone for a badge that must stand out. */
export const Appearances: Story = {
  render: (args) => (
    <div style={column}>
      {(['soft', 'solid'] as const).map((appearance) => (
        <div key={appearance} style={row}>
          <Badge {...args} appearance={appearance} variant="neutral">
            Sealed
          </Badge>
          <Badge {...args} appearance={appearance} variant="accent">
            New
          </Badge>
          <Badge {...args} appearance={appearance} variant="success">
            Reforged
          </Badge>
          <Badge {...args} appearance={appearance} variant="warning">
            Orcs near
          </Badge>
          <Badge {...args} appearance={appearance} variant="danger">
            Lost
          </Badge>
        </div>
      ))}
    </div>
  ),
}

/** Every shape has the gilt edge and the stitched thread; both go with `--elven-ornament-width: 0`. */
export const Shapes: Story = {
  render: (args) => (
    <div style={column}>
      {(['ribbon', 'shield', 'round', 'scalloped'] as const).map((shape) => (
        <div key={shape} style={row}>
          <Badge {...args} shape={shape} variant="neutral">
            Sealed
          </Badge>
          <Badge {...args} shape={shape} variant="accent">
            New
          </Badge>
          <Badge {...args} shape={shape} variant="success" appearance="solid">
            Reforged
          </Badge>
          <Badge {...args} shape={shape} variant="warning">
            Orcs near
          </Badge>
          <Badge {...args} shape={shape} variant="danger" size="sm">
            Lost
          </Badge>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={column}>
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} style={row}>
          <Badge {...args} size={size} variant="neutral">
            Sealed
          </Badge>
          <Badge {...args} size={size} variant="accent">
            New
          </Badge>
          <Badge {...args} size={size} variant="warning">
            Orcs near
          </Badge>
        </div>
      ))}
    </div>
  ),
}

/** Sits on the text baseline, so it can follow a heading or a line of text. */
export const InText: Story = {
  render: (args) => (
    <p style={{ margin: 0, fontFamily: 'var(--elven-font-display)', fontSize: 'var(--elven-font-size-xl)' }}>
      The Red Book of Westmarch{' '}
      <Badge {...args} variant="accent">
        New
      </Badge>
    </p>
  ),
}

/** With `--elven-ornament-width: 0` the gilt edge is gone and a plain ribbon remains. */
export const WithoutOrnament: Story = {
  render: (args) => (
    <div style={{ ...row, ['--elven-ornament-width' as string]: '0' }}>
      <Badge {...args} variant="neutral">
        Sealed
      </Badge>
      <Badge {...args} variant="success">
        Reforged
      </Badge>
      <Badge {...args} variant="danger">
        Lost
      </Badge>
    </div>
  ),
}
