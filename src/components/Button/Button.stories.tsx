import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Enter Imladris',
    onClick: fn(),
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    frame: { control: 'inline-radio', options: ['scooped', 'pointed', 'simple', 'none', 'vine', 'gate'] },
    vineLeaves: { control: 'inline-radio', options: ['mixed', 'green', 'gold'] },
    clickEffect: {
      control: 'inline-radio',
      options: ['none', 'ripple', 'stardust', 'leaves', 'signature', 'bow', 'velvet'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const row = { display: 'flex', gap: 'var(--elven-space-4)', alignItems: 'center', flexWrap: 'wrap' } as const

export const Playground: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary">
        Enter Imladris
      </Button>
      <Button {...args} variant="secondary">
        Ask Elrond
      </Button>
      <Button {...args} variant="ghost">
        Rest awhile
      </Button>
      <Button {...args} variant="danger">
        Break the sword
      </Button>
    </div>
  ),
}

const column = { display: 'grid', gap: 'var(--elven-space-6)' } as const

/** Ornate gilt frames (`scooped`, `pointed`), plain ones (`simple`, `none`), the `vine` and the `gate`. */
export const Frames: Story = {
  render: (args) => (
    <div style={column}>
      {(['scooped', 'pointed', 'simple', 'none', 'vine', 'gate'] as const).map((frame) => (
        <div key={frame} style={row}>
          <Button {...args} frame={frame} variant="primary">
            Enter Imladris
          </Button>
          <Button {...args} frame={frame} variant="secondary">
            Ask Elrond
          </Button>
          <Button {...args} frame={frame} variant="danger">
            Break the sword
          </Button>
        </div>
      ))}
    </div>
  ),
}

/** Hover or tab to a button: a golden ivy winds around its bark border. */
export const Vine: Story = {
  args: { frame: 'vine' },
  render: (args) => (
    <div style={{ ...column, padding: 'var(--elven-space-6)' }}>
      {(['mixed', 'green', 'gold'] as const).map((vineLeaves) => (
        <div key={vineLeaves} style={{ ...row, gap: 'var(--elven-space-8)' }}>
          <Button {...args} vineLeaves={vineLeaves} variant="primary">
            Enter Imladris
          </Button>
          <Button {...args} vineLeaves={vineLeaves} variant="secondary">
            Ask Elrond
          </Button>
          <Button {...args} vineLeaves={vineLeaves} variant="danger" size="sm">
            Break the sword
          </Button>
        </div>
      ))}
    </div>
  ),
}

/** Hover or tab to a button: the gilded gate slides open. */
export const Gate: Story = {
  args: { frame: 'gate' },
  render: (args) => (
    <div style={column}>
      <div style={row}>
        <Button {...args} variant="primary">
          Enter Imladris
        </Button>
        <Button {...args} variant="secondary">
          Ask Elrond
        </Button>
        <Button {...args} variant="danger">
          Break the sword
        </Button>
      </div>
      <div style={row}>
        <Button {...args} size="sm">
          Small
        </Button>
        <Button {...args} size="md">
          Medium
        </Button>
        <Button {...args} size="lg">
          Large
        </Button>
      </div>
    </div>
  ),
}

/** Click each button (or press Enter on it) to see its effect. */
export const ClickEffects: Story = {
  render: (args) => (
    <div style={{ ...row, gap: 'var(--elven-space-8)', padding: 'var(--elven-space-8) 0' }}>
      <Button {...args} clickEffect="ripple">
        Ripple
      </Button>
      <Button {...args} clickEffect="stardust">
        Stardust
      </Button>
      <Button {...args} clickEffect="leaves">
        Leaves
      </Button>
      <Button {...args} clickEffect="signature">
        Seal the decree
      </Button>
      <Button {...args} clickEffect="bow">
        Bow
      </Button>
      <Button {...args} clickEffect="velvet">
        Velvet
      </Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
}

export const PointedSizes: Story = {
  args: { frame: 'pointed' },
  render: Sizes.render,
}

/** With `asChild`, a link (or any element) takes on the button's look, frames and effects. */
export const AsLink: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} asChild>
        <a href="#rivendell">Enter Imladris</a>
      </Button>
      <Button {...args} asChild variant="secondary" frame="pointed">
        <a href="#lorien">Walk to Lórien</a>
      </Button>
    </div>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} variant="primary" disabled>
        Primary
      </Button>
      <Button {...args} variant="secondary" disabled>
        Secondary
      </Button>
      <Button {...args} variant="ghost" disabled>
        Ghost
      </Button>
      <Button {...args} variant="danger" disabled>
        Danger
      </Button>
    </div>
  ),
}
