import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { clsx } from 'clsx'
import styles from './Badge.module.css'

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'
export type BadgeSize = 'sm' | 'md'
export type BadgeAppearance = 'soft' | 'solid'
export type BadgeShape = 'ribbon' | 'shield' | 'round' | 'scalloped'

export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  /**
   * Color of the badge. The label must still say what it means on its own,
   * since color alone is not enough to tell the tones apart.
   * @default 'neutral'
   */
  variant?: BadgeVariant
  /**
   * How strongly the tone is painted: `soft` is a pale tint lettered in the
   * tone's ink, `solid` a full fill that stands out more.
   * @default 'soft'
   */
  appearance?: BadgeAppearance
  /**
   * Outline of the badge, each with a gilt edge and a stitched thread inside:
   * a `ribbon` with swallowtail ends, a flat-topped `shield`, a `round` pill
   * or a `scalloped` patch with bitten top and bottom edges.
   * @default 'ribbon'
   */
  shape?: BadgeShape
  /**
   * Height and text size.
   * @default 'md'
   */
  size?: BadgeSize
}

/**
 * A short label stitched on a small patch with a gilt edge, for statuses,
 * counts and categories. It is plain text to assistive technology; it is
 * not interactive.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'neutral', appearance = 'soft', shape = 'ribbon', size = 'md', className, children, ...rest },
  ref,
) {
  return (
    <span
      ref={ref}
      data-variant={variant}
      data-appearance={appearance}
      data-shape={shape}
      data-size={size}
      className={clsx(styles.badge, className)}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
    </span>
  )
})

Badge.displayName = 'Badge'
