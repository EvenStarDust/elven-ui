'use client'

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { clsx } from 'clsx'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { buildVine, hashSeed, type VineGeometry, type VineLayer } from './vine-geometry'
import styles from './Button.module.css'

export type VineLeaves = 'mixed' | 'green' | 'gold'

const GREEN_SHARE: Record<VineLeaves, number> = { mixed: 0.5, green: 1, gold: 0 }

// An ivy leaf pointing along +x with its base at the origin, and its veins.
const LEAF = 'M0,0C3,-1 4,-6 7,-7C9,-8 11,-6 11,-4C14,-5 17,-3 16,0C17,3 14,5 11,4C11,6 9,8 7,7C4,6 3,1 0,0Z'
const VEINS = 'M1,0L14,0M7,0L9,-5M7,0L9,5'
const TENDRIL = 'M0,0C4,-1 7,1 6,4C5,6 2,5 3,3'

type Stops = Array<[offset: number, color: string]>

const color = (name: string) => `var(--elven-color-${name})`

// The light band is kept narrow and in the metal's own light tone, not white,
// so the reflection reads as a soft glint rather than a flash.
const GOLD: Stops = [
  [0, color('ornament-shade')],
  [0.35, color('ornament')],
  [0.48, color('ornament-highlight')],
  [0.56, color('ornament')],
  [1, color('ornament-shade')],
]

// Green gets a soft touch of warm sunlight rather than a metallic glint.
const GREEN: Stops = [
  [0, color('leaf-shade')],
  [0.35, color('leaf')],
  [0.48, color('leaf-highlight')],
  [0.56, color('leaf')],
  [1, color('leaf-shade')],
]

function Gradient({ id, stops, width, height, shimmer }: { id: string; stops: Stops; width: number; height: number; shimmer: boolean }) {
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1={0}
      y1={0}
      x2={width * 0.6}
      y2={height * 1.2}
      spreadMethod="reflect"
    >
      {stops.map(([offset, stopColor]) => (
        <stop key={offset} offset={offset} style={{ stopColor }} />
      ))}
      {/* A slow band of light sliding across the gold: the reflection. SMIL, because CSS can't animate gradients. */}
      {shimmer && (
        <animateTransform
          attributeName="gradientTransform"
          type="translate"
          from={`${-width} 0`}
          to={`${width} 0`}
          dur="5s"
          repeatCount="indefinite"
        />
      )}
    </linearGradient>
  )
}

const timing = (delay: number, duration?: number) =>
  ({ '--_delay': `${delay}ms`, ...(duration && { '--_duration': `${duration}ms` }) }) as CSSProperties

function Layer({
  layer,
  gold,
  green,
  stem,
  front,
}: {
  layer: VineLayer
  gold: string
  green: string
  stem: string
  front: boolean
}) {
  return (
    <>
      {layer.stems.map((segment, i) => {
        const style = { ...timing(segment.delay, segment.duration), '--_length': segment.length } as CSSProperties
        return (
          <g key={i}>
            <path className={styles.stem} d={segment.d} stroke={`url(#${stem})`} strokeWidth={front ? 2.6 : 1.6} style={style} />
            {/* A thin specular line down the middle makes the stem read as round. */}
            {front && (
              <path
                className={clsx(styles.stem, styles.stemHighlight)}
                d={segment.d}
                strokeWidth={0.7}
                style={style}
              />
            )}
          </g>
        )
      })}
      {layer.leaves.map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}>
          <g className={styles.leaf} data-color={leaf.color} style={timing(leaf.delay)}>
            <path d={LEAF} fill={`url(#${leaf.color === 'green' ? green : gold})`} />
            {front && <path className={styles.vein} d={VEINS} />}
          </g>
        </g>
      ))}
      {layer.tendrils.map((tendril, i) => (
        <g key={i} transform={`translate(${tendril.x} ${tendril.y}) rotate(${tendril.angle})`}>
          <path className={styles.tendril} d={TENDRIL} stroke={`url(#${stem})`} style={timing(tendril.delay)} />
        </g>
      ))}
    </>
  )
}

function Vine({ geometry, id, leaves }: { geometry: VineGeometry; id: string; leaves: VineLeaves }) {
  const reducedMotion = useReducedMotion()
  const { width, height, pad } = geometry
  // An all-green vine gets a green stem; otherwise the stem is gold.
  const stemColor = leaves === 'green' ? 'green' : 'gold'
  const box = { width: width + pad * 2, height: height + pad * 2 }
  const svg = {
    'aria-hidden': true,
    focusable: false,
    width: box.width,
    height: box.height,
    viewBox: `0 0 ${box.width} ${box.height}`,
    style: { insetInlineStart: -pad, insetBlockStart: -pad },
  } as const

  return (
    <>
      <svg className={clsx(styles.vine, styles.vineBack)} {...svg}>
        <defs>
          <Gradient id={`${id}-back-gold`} stops={GOLD} {...box} shimmer={false} />
          <Gradient id={`${id}-back-green`} stops={GREEN} {...box} shimmer={false} />
        </defs>
        <Layer
          layer={geometry.back}
          gold={`${id}-back-gold`}
          green={`${id}-back-green`}
          stem={`${id}-back-${stemColor}`}
          front={false}
        />
      </svg>
      <svg className={clsx(styles.vine, styles.vineFront)} {...svg}>
        <defs>
          <Gradient id={`${id}-gold`} stops={GOLD} {...box} shimmer={!reducedMotion} />
          <Gradient id={`${id}-green`} stops={GREEN} {...box} shimmer={!reducedMotion} />
        </defs>
        <Layer layer={geometry.front} gold={`${id}-gold`} green={`${id}-green`} stem={`${id}-${stemColor}`} front />
      </svg>
    </>
  )
}

/**
 * Drives the vine of a button: builds its geometry lazily on first hover or
 * keyboard focus (so pages with many buttons stay light), then grows and
 * withers it. The vine is sized from the button itself, so it fits any label.
 */
export function useVine(buttonRef: RefObject<HTMLButtonElement | null>, enabled: boolean, leaves: VineLeaves) {
  // useId returns characters like ":" that are not safe inside url(#…) references.
  const id = `elven-vine${useId().replace(/[^\w-]/g, '')}`
  const [geometry, setGeometry] = useState<VineGeometry | null>(null)
  const [grown, setGrown] = useState(false)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const grow = useCallback(() => {
    const button = buttonRef.current
    if (!enabled || !button) return

    const width = button.offsetWidth
    const height = button.offsetHeight
    const greenShare = GREEN_SHARE[leaves]
    setGeometry((current) =>
      current && current.width === width && current.height === height && current.greenShare === greenShare
        ? current
        : buildVine({
            width,
            height,
            radius: parseFloat(getComputedStyle(button).borderTopLeftRadius) || 0,
            seed: hashSeed(id),
            greenShare,
          }),
    )

    // Let the vine mount in its bare state for a frame, so growing is a transition.
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => setGrown(true))
    })
  }, [buttonRef, enabled, leaves, id])

  const wither = useCallback(() => {
    cancelAnimationFrame(frame.current)
    setGrown(false)
  }, [])

  return {
    state: enabled ? (grown ? 'grown' : 'bare') : undefined,
    grow,
    wither,
    element: enabled && geometry ? <Vine geometry={geometry} id={id} leaves={leaves} /> : null,
  }
}
