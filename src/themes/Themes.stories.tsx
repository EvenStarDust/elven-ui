import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties, ReactNode } from 'react'

const meta = {
  title: 'Foundations/Themes',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SEMANTIC_COLORS = [
  'bg',
  'surface',
  'border',
  'ornament',
  'ornament-highlight',
  'ornament-shade',
  'ornament-gleam',
  'icon-accent',
  'leaf',
  'leaf-highlight',
  'leaf-gleam',
  'leaf-shade',
  'bark',
  'bark-light',
  'text',
  'text-muted',
  'accent',
  'accent-hover',
  'on-accent',
  'accent-text',
  'accent-subtle',
  'focus',
  'danger',
  'danger-hover',
  'on-danger',
  'success',
  'on-success',
]

const color = (name: string) => `var(--elven-color-${name})`

/**
 * Mask that scoops a concave quarter circle out of every corner.
 *
 * Each layer of the frame is inset by `offset` from the outer edge. Centering
 * its circles on the *outer* corner (hence the negative offset) and growing
 * the radius by the same offset keeps every line equally thick along the curve.
 * Border and outline can't follow a concave corner in our target browsers
 * (`corner-shape: scoop` is Chromium-only), so the lines are stacked layers.
 */
function scoopMask(offset: string): string {
  const radius = `calc(var(--elven-ornament-notch) + ${offset})`
  const near = `calc(${offset} * -1)`
  const far = `calc(100% + ${offset})`
  const corner = (x: string, y: string, position: string) =>
    `radial-gradient(circle at ${x} ${y}, #0000 ${radius}, #000 calc(${radius} + 0.5px)) ${position} / 51% 51% no-repeat`
  return [
    corner(near, near, '0 0'),
    corner(far, near, '100% 0'),
    corner(near, far, '0 100%'),
    corner(far, far, '100% 100%'),
  ].join(', ')
}

/*
 * Gold leaf: a soft diagonal reflection instead of a flat color. The light
 * band sits off-center so it reads as a highlight, not a stripe.
 */
const GOLD_SHEEN = `linear-gradient(135deg,
  ${color('ornament-shade')} 0%,
  ${color('ornament')} 22%,
  ${color('ornament-highlight')} 42%,
  ${color('ornament')} 58%,
  ${color('ornament-shade')} 82%,
  ${color('ornament')} 100%)`

const FRAME_LAYERS = [
  { offset: '0px', fill: GOLD_SHEEN, padding: 'var(--elven-ornament-width)' },
  { offset: 'var(--elven-ornament-width)', fill: color('surface'), padding: 'var(--elven-ornament-gap)' },
  {
    offset: 'calc(var(--elven-ornament-width) + var(--elven-ornament-gap))',
    fill: GOLD_SHEEN,
    padding: 'var(--elven-ornament-width)',
  },
  {
    offset: 'calc(var(--elven-ornament-width) * 2 + var(--elven-ornament-gap))',
    fill: color('surface'),
    padding: 'var(--elven-space-6)',
  },
]

// A stand-in for the future Card: the intertitle frame with scooped corners.
function Frame({ children }: { children: ReactNode }) {
  return FRAME_LAYERS.reduceRight<ReactNode>((inner, layer) => {
    const mask = scoopMask(layer.offset)
    return (
      <div style={{ background: layer.fill, padding: layer.padding, mask, WebkitMask: mask }}>{inner}</div>
    )
  }, children)
}

const smallCaps: CSSProperties = {
  fontFamily: 'var(--elven-font-display)',
  fontVariantCaps: 'all-small-caps',
  letterSpacing: 'var(--elven-letter-spacing-caps)',
  fontSize: 'var(--elven-font-size-md)',
}

function Specimen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ maxWidth: '26rem' }}>
      <Frame>
        <h2
          style={{
            fontFamily: 'var(--elven-font-display)',
            fontWeight: 'var(--elven-font-weight-medium)',
            fontSize: 'var(--elven-font-size-2xl)',
            lineHeight: 'var(--elven-line-height-tight)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: 'var(--elven-font-display)',
            fontStyle: 'italic',
            fontSize: 'var(--elven-font-size-lg)',
            color: color('text-muted'),
            margin: 'var(--elven-space-1) 0 var(--elven-space-4)',
          }}
        >
          {subtitle}
        </p>
        <hr
            style={{
              border: 0,
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${color('ornament')} 15%, ${color('ornament-highlight')} 45%, ${color('ornament')} 75%, transparent)`,
              margin: '0 0 var(--elven-space-4)',
            }}
          />
        <p style={{ fontFamily: 'var(--elven-font-body)', lineHeight: 'var(--elven-line-height-normal)', margin: '0 0 var(--elven-space-4)' }}>
          Body text in the theme's ink. <span style={{ color: color('accent-text') }}>Accent text</span> for links and
          highlights.
        </p>
        <div style={{ display: 'flex', gap: 'var(--elven-space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
          <span
            style={{
              ...smallCaps,
              background: color('accent'),
              color: color('on-accent'),
              padding: 'var(--elven-space-1) var(--elven-space-4)',
              borderRadius: 'var(--elven-radius-sm)',
            }}
          >
            Accent fill
          </span>
          <span
            style={{
              ...smallCaps,
              background: color('danger'),
              color: color('on-danger'),
              padding: 'var(--elven-space-1) var(--elven-space-4)',
              borderRadius: 'var(--elven-radius-sm)',
            }}
          >
            Danger
          </span>
          <span
            style={{
              ...smallCaps,
              background: color('success'),
              color: color('on-success'),
              padding: 'var(--elven-space-1) var(--elven-space-4)',
              borderRadius: 'var(--elven-radius-sm)',
            }}
          >
            Success
          </span>
        </div>
      </Frame>
    </div>
  )
}

function Swatches() {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(9rem, 1fr))',
        gap: 'var(--elven-space-3)',
        margin: 'var(--elven-space-8) 0 0',
        fontFamily: 'var(--elven-font-body)',
        fontSize: 'var(--elven-font-size-xs)',
      }}
    >
      {SEMANTIC_COLORS.map((name) => (
        <div key={name}>
          <div
            aria-hidden
            style={{
              height: '2.5rem',
              background: color(name),
              border: `1px solid ${color('border')}`,
              borderRadius: 'var(--elven-radius-sm)',
            }}
          />
          <dt style={{ marginTop: 'var(--elven-space-1)', fontFamily: 'var(--elven-font-mono)' }}>{name}</dt>
        </div>
      ))}
    </dl>
  )
}

const SPECIMENS = {
  rivendell: { label: 'Rivendell', title: "Welcome to Imladris", subtitle: 'The Last Homely House' },
  lothlorien: { label: 'Lothlórien', title: 'The Golden Wood', subtitle: 'Beneath the mallorn trees' },
  mirkwood: { label: 'Mirkwood', title: 'Into the dark forest', subtitle: 'Do not leave the path' },
} as const

/** The theme selected in the toolbar, with every semantic color token. */
export const Current: Story = {
  render: (_, { globals }) => {
    const specimen = SPECIMENS[globals.theme as keyof typeof SPECIMENS] ?? SPECIMENS.rivendell
    return (
      <>
        <Specimen title={specimen.title} subtitle={specimen.subtitle} />
        <Swatches />
      </>
    )
  },
}

/** All three themes next to each other. Themes can be nested on any element. */
export const SideBySide: Story = {
  parameters: { themeDecorator: false },
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', minHeight: '100vh' }}>
      {Object.entries(SPECIMENS).map(([theme, specimen]) => (
        <section key={theme} data-elven-theme={theme} aria-label={specimen.label} style={{ padding: '2rem' }}>
          <Specimen title={specimen.title} subtitle={specimen.subtitle} />
        </section>
      ))}
    </div>
  ),
}
