import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { clsx } from 'clsx'
import styles from './Icon.module.css'

export interface IconProps extends ComponentPropsWithoutRef<'svg'> {
  /**
   * Width and height, as a number of pixels or any CSS length.
   * @default '1em', so the icon scales with the text around it
   */
  size?: number | string
}

/**
 * Builds an icon component from its path data: `line` is drawn as a thin
 * outline in the current text color, `accent` is filled with the theme's gold.
 *
 * Icons are decorative by default (`aria-hidden`). Pass `aria-label` to give
 * an icon a meaning of its own; it is then exposed as an image.
 */
export function createIcon(displayName: string, line: string, accent?: string) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size = '1em', className, ...rest }, ref) {
    const labelled = rest['aria-label'] !== undefined || rest['aria-labelledby'] !== undefined
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={clsx(styles.icon, className)}
        role={labelled ? 'img' : undefined}
        aria-hidden={labelled ? undefined : true}
        focusable="false"
        {...rest}
      >
        <path className={styles.line} d={line} />
        {accent && <path className={styles.accent} d={accent} />}
      </svg>
    )
  })
  Icon.displayName = displayName
  return Icon
}
