'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { createRandom } from './vine-geometry'
import styles from './ClickEffect.module.css'

export type ClickEffect = 'none' | 'ripple' | 'stardust' | 'leaves' | 'signature' | 'bow' | 'velvet'

/** Effects drawn as short-lived particles at the point of the click. */
type BurstEffect = Extract<ClickEffect, 'ripple' | 'stardust' | 'leaves' | 'velvet'>

interface Burst {
  id: number
  effect: BurstEffect
  x: number
  y: number
  width: number
  height: number
}

// Long enough for the slowest particle (a falling leaf) to finish.
const BURST_LIFETIME = 1600

const BURST_EFFECTS: ReadonlySet<ClickEffect> = new Set(['ripple', 'stardust', 'leaves', 'velvet'])

// A small bow, as a prince might give: tip forward, hold, straighten up.
const BOW: Keyframe[] = [
  { transform: 'perspective(500px)' },
  { transform: 'perspective(500px) translateY(3px) rotateX(24deg) scale(0.97)', offset: 0.35 },
  { transform: 'perspective(500px) translateY(3px) rotateX(24deg) scale(0.97)', offset: 0.55 },
  { transform: 'perspective(500px)' },
]

const vars = (values: Record<string, string | number>) => values as CSSProperties

function Sparks({ burst }: { burst: Burst }) {
  const random = createRandom(burst.id)
  return (
    <>
      <span className={styles.star} />
      {Array.from({ length: 9 }, (_, i) => {
        const angle = random() * Math.PI * 2
        const distance = 22 + random() * 26
        return (
          <span
            key={i}
            className={styles.spark}
            style={vars({
              '--_dx': `${Math.round(Math.cos(angle) * distance)}px`,
              '--_dy': `${Math.round(Math.sin(angle) * distance)}px`,
              animationDelay: `${Math.round(random() * 80)}ms`,
            })}
          />
        )
      })}
    </>
  )
}

function Leaves({ burst }: { burst: Burst }) {
  const random = createRandom(burst.id)
  return (
    <>
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          className={styles.fallingLeaf}
          style={vars({
            // Leaves break away from anywhere along the bottom edge, not just the click.
            insetInlineStart: `${Math.round(burst.width * (0.2 + random() * 0.6))}px`,
            insetBlockStart: `${burst.height - 4}px`,
            '--_sway': `${Math.round((8 + random() * 10) * (random() < 0.5 ? -1 : 1))}px`,
            '--_turn': `${Math.round(random() * 80 - 40)}deg`,
            '--_fall': `${Math.round(900 + random() * 400)}ms`,
            animationDelay: `${i * 90}ms`,
          })}
        />
      ))}
    </>
  )
}

function BurstView({ burst }: { burst: Burst }) {
  // Ripples and waves stay inside the button; sparks and leaves may fly past its edges.
  const contained = burst.effect === 'ripple' || burst.effect === 'velvet'
  if (burst.effect === 'leaves') {
    return (
      <span className={styles.free} aria-hidden="true">
        <Leaves burst={burst} />
      </span>
    )
  }
  return (
    <span
      className={contained ? styles.contained : styles.free}
      // Lets the button cut contained effects to the shape of ornate frames.
      data-burst={contained ? 'contained' : 'free'}
      aria-hidden="true"
    >
      <span
        className={styles.origin}
        style={{ insetInlineStart: burst.x, insetBlockStart: burst.y }}
        data-effect={burst.effect}
      >
        {burst.effect === 'ripple' && (
          <>
            <span className={styles.ring} />
            <span className={styles.ring} />
          </>
        )}
        {burst.effect === 'velvet' && (
          <>
            <span className={styles.wave} />
            <span className={styles.wave} />
          </>
        )}
        {burst.effect === 'stardust' && <Sparks burst={burst} />}
      </span>
    </span>
  )
}

/**
 * Plays the button's click effect. Particle effects are rendered as short-lived
 * bursts; `bow` and `signature` are played with the Web Animations API so that
 * rapid clicks restart them cleanly without re-rendering.
 */
export function useClickEffect(buttonRef: RefObject<HTMLButtonElement | null>, effect: ClickEffect) {
  const reducedMotion = useReducedMotion()
  const [bursts, setBursts] = useState<Burst[]>([])
  const signatureRef = useRef<SVGSVGElement>(null)
  const nextId = useRef(1)
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const play = useCallback(
    (clientX?: number, clientY?: number) => {
      const button = buttonRef.current
      if (!button || effect === 'none' || reducedMotion) return

      if (effect === 'bow') {
        button.animate?.(BOW, { duration: 550, easing: 'cubic-bezier(0.35, 0, 0.25, 1)' })
        return
      }

      if (effect === 'signature') {
        // Drawn left to right by unclipping it, like a quill stroke, then it fades as the ink dries.
        signatureRef.current?.animate?.(
          [
            { clipPath: 'inset(0 100% 0 0)', opacity: 1 },
            { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.4 },
            { clipPath: 'inset(0 0 0 0)', opacity: 1, offset: 0.55 },
            { clipPath: 'inset(0 0 0 0)', opacity: 0 },
          ],
          { duration: 900, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
        )
        return
      }

      if (!BURST_EFFECTS.has(effect)) return
      const rect = button.getBoundingClientRect()
      // Screen pixels to the button's own CSS pixels, in case an ancestor is zoomed or scaled.
      const width = button.offsetWidth
      const height = button.offsetHeight
      const scaleX = rect.width ? width / rect.width : 1
      const scaleY = rect.height ? height / rect.height : 1
      const id = nextId.current++
      const burst: Burst = {
        id,
        effect: effect as BurstEffect,
        // Keyboard clicks have no pointer position, so they play from the center.
        x: clientX === undefined ? width / 2 : (clientX - rect.left) * scaleX,
        y: clientY === undefined ? height / 2 : (clientY - rect.top) * scaleY,
        width,
        height,
      }
      setBursts((current) => [...current, burst])

      const timer = setTimeout(() => {
        timers.current.delete(timer)
        setBursts((current) => current.filter((item) => item.id !== id))
      }, BURST_LIFETIME)
      timers.current.add(timer)
    },
    [buttonRef, effect, reducedMotion],
  )

  return {
    /** For pointerdown: plays at the pointer. */
    playAt: useCallback((x: number, y: number) => play(x, y), [play]),
    /** For keyboard-initiated clicks: plays from the center. */
    playCentered: useCallback(() => play(), [play]),
    bursts: bursts.map((burst) => <BurstView key={burst.id} burst={burst} />),
    /** A flourish under the label, only for the `signature` effect. */
    signature:
      effect === 'signature' ? (
        <svg
          ref={signatureRef}
          className={styles.signature}
          viewBox="0 0 100 8"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            vectorEffect="non-scaling-stroke"
            d="M2 5C14 2 22 7 34 4.5S56 2 66 5C74 7 82 3 88 4C94 5 96 7 92 6.5C89 6 91 3 98 3.5"
          />
        </svg>
      ) : null,
  }
}
