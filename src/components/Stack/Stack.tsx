import { Children, forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { clsx } from 'clsx'
import styles from './Stack.module.css'

export type StackDirection = 'column' | 'row'
/** A step of the spacing scale: `4` is `--elven-space-4`. */
export type StackGap = 1 | 2 | 3 | 4 | 5 | 6 | 8
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline'
export type StackJustify = 'start' | 'center' | 'end' | 'between'

export interface StackProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Lays the children out top to bottom (`column`) or along the line of text
   * (`row`, which follows `dir="rtl"`).
   * @default 'column'
   */
  direction?: StackDirection
  /**
   * Space between the children, as a step of the spacing scale.
   * @default 4
   */
  gap?: StackGap
  /**
   * Alignment of the children across the direction, as in `align-items`.
   * @default 'stretch'
   */
  align?: StackAlign
  /**
   * Distribution of the children along the direction, as in
   * `justify-content`. `between` pushes the first and last to the ends.
   * @default 'start'
   */
  justify?: StackJustify
  /**
   * Lets the children wrap onto more lines when they do not fit.
   * @default false
   */
  wrap?: boolean
  /**
   * Draws a fine gilt rule with the Evenstar between the children. It is
   * decorative and hidden from assistive technology. Not available with
   * `asChild`, since the children then belong to the child element.
   * @default false
   */
  separator?: boolean
  /**
   * Render the single child element (such as a `ul`) as the stack, keeping
   * the stack's layout. The child keeps its own props.
   * @default false
   * @example <Stack asChild gap={2}><ul>…</ul></Stack>
   */
  asChild?: boolean
}

/** Places a run of separators between the children; empty children get none. */
function withSeparators(children: ReactNode) {
  return Children.toArray(children).flatMap((child, index) =>
    index === 0
      ? [child]
      : [<span key={`separator-${index}`} className={styles.separator} aria-hidden="true" />, child],
  )
}

/**
 * Lays out its children in a column or a row with even spacing from the
 * spacing scale, optionally with a gilt rule between them.
 */
export const Stack = forwardRef<HTMLDivElement, StackProps>(function Stack(
  {
    direction = 'column',
    gap = 4,
    align = 'stretch',
    justify = 'start',
    wrap = false,
    separator = false,
    asChild = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const Root = asChild ? Slot : 'div'
  return (
    <Root
      ref={ref}
      data-direction={direction}
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap || undefined}
      className={clsx(styles.stack, className)}
      {...rest}
    >
      {separator && !asChild ? withSeparators(children) : children}
    </Root>
  )
})

Stack.displayName = 'Stack'
