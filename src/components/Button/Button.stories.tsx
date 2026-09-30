import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
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

/** A turning Evenstar replaces the label while work is in progress; the width stays the same. */
export const Loading: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args} loading>
        Enter Imladris
      </Button>
      <Button {...args} loading variant="secondary">
        Ask Elrond
      </Button>
      <Button {...args} loading variant="danger" frame="pointed">
        Break the sword
      </Button>
    </div>
  ),
}

function SaveButton(props: React.ComponentProps<typeof Button>) {
  const [loading, setLoading] = useState(false)
  return (
    <Button
      {...props}
      loading={loading}
      onClick={() => {
        setLoading(true)
        setTimeout(() => setLoading(false), 2000)
      }}
    >
      Send the message
    </Button>
  )
}

/** Click to start two seconds of work. */
export const LoadingOnClick: Story = {
  render: (args) => <SaveButton {...args} />,
}

const icon = { width: '0.9em', height: '0.9em', 'aria-hidden': true } as const

const QuillIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...icon}>
    <path d="M20 3C13 5 8 10 6 17L4 21" />
    <path d="M6 17C10 16 14 13 16 9" />
  </svg>
)

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...icon}>
    <path d="M4 12H20M14 6L20 12L14 18" />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...icon}>
    <path d="M6 6L18 18M18 6L6 18" />
  </svg>
)

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...icon}>
    <path d="M12 2L13.8 10.2L22 12L13.8 13.8L12 22L10.2 13.8L2 12L10.2 10.2Z" />
  </svg>
)

/**
 * Icons go next to the label as children. Mark decorative icons `aria-hidden`.
 * An icon-only button has no visible text, so it must have an `aria-label`
 * that says what it does.
 */
export const WithIcons: Story = {
  render: (args) => (
    <div style={row}>
      <Button {...args}>
        <QuillIcon />
        Sign the letter
      </Button>
      <Button {...args} variant="secondary">
        Onward
        <ArrowIcon />
      </Button>
      <Button {...args} variant="ghost" aria-label="Close">
        <CloseIcon />
      </Button>
      <Button {...args} variant="secondary" frame="simple" aria-label="Add to favourites">
        <StarIcon />
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
