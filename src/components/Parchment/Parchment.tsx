import { useId, type ComponentPropsWithoutRef } from 'react'
import { clsx } from 'clsx'
import styles from './Parchment.module.css'

export interface ParchmentProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * The scroll unrolls when it appears. Set this to `closed` to roll it back
   * up before it is removed.
   * @default 'open'
   */
  'data-state'?: 'open' | 'closed'
}

/**
 * An unrolled scroll of old vellum: rolled ends, stains, scorched and ragged
 * edges. Internal for now; the date and time pickers show their content on it.
 * It looks the same in every theme, because vellum is vellum.
 */
export function Parchment({ className, children, ...rest }: ParchmentProps) {
  // useId returns characters like ":" that are not safe inside url(#…) references.
  const filterId = `elven-vellum${useId().replace(/[^\w-]/g, '')}`

  return (
    <div className={clsx(styles.scroll, className)} {...rest}>
      {/* Displaces the page's edges so they look torn rather than cut. */}
      <svg className={styles.defs} aria-hidden="true" focusable="false">
        <filter id={filterId} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="5" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
        </filter>
      </svg>
      <div className={styles.roll} />
      <div className={styles.sheet}>
        <div className={styles.leaf}>
          <div className={styles.page} style={{ filter: `url(#${filterId})` }} />
          <div className={styles.content}>{children}</div>
        </div>
        {/* As tall as the page, and carrying the lower roll along its bottom edge. */}
        <div className={styles.curtain}>
          <div className={styles.roll} />
        </div>
      </div>
    </div>
  )
}
