import type { Meta, StoryObj } from '@storybook/react-vite'
import * as icons from './index'
import { BellIcon, QuillIcon } from './index'

const meta = {
  title: 'Foundations/Icons',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const text = { fontFamily: 'var(--elven-font-body)', fontSize: 'var(--elven-font-size-xs)' } as const

/** The whole set. Outlines take the text color, the gold detail comes from the theme. */
export const Gallery: Story = {
  render: () => (
    <ul
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(8.5rem, 1fr))',
        gap: 'var(--elven-space-3)',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {Object.entries(icons).map(([name, Icon]) => (
        <li
          key={name}
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 'var(--elven-space-2)',
            padding: 'var(--elven-space-4) var(--elven-space-2)',
            border: '1px solid var(--elven-color-border)',
            borderRadius: 'var(--elven-radius-lg)',
            background: 'var(--elven-color-surface)',
          }}
        >
          <Icon size={32} />
          <code style={{ ...text, fontFamily: 'var(--elven-font-mono)' }}>{name}</code>
        </li>
      ))}
    </ul>
  ),
}

/** Icons are `1em` by default, so they follow the font size. `size` sets an exact size. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--elven-space-6)' }}>
      <QuillIcon size={16} />
      <QuillIcon size={24} />
      <QuillIcon size={32} />
      <QuillIcon size={48} />
      <span style={{ fontFamily: 'var(--elven-font-display)', fontSize: 'var(--elven-font-size-2xl)' }}>
        <QuillIcon /> Beside text
      </span>
    </div>
  ),
}

/** An icon on its own needs a name: pass `aria-label` and it is exposed as an image. */
export const Labelled: Story = {
  render: () => <BellIcon size={32} aria-label="Three new messages" />,
}
