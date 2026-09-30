'use client'

import { forwardRef, useId, useImperativeHandle, useRef, type ComponentPropsWithoutRef } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { clsx } from 'clsx'
import { useClickEffect, type ClickEffect } from './ClickEffect'
import { useVine, type VineLeaves } from './Vine'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonFrame = 'scooped' | 'pointed' | 'simple' | 'none' | 'vine' | 'gate'
export type { ClickEffect, VineLeaves }

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  /**
   * Visual weight of the button. Use one `primary` per view for the main action.
   * @default 'primary'
   */
  variant?: ButtonVariant
  /**
   * Height and text size. Matches the other form controls of the same size.
   * @default 'md'
   */
  size?: ButtonSize
  /**
   * Border style. `scooped` and `pointed` are ornate gilt frames, `simple` is a
   * single thin line and `none` is a plain fill. `vine` is a bark border that a
   * golden ivy grows around on hover and keyboard focus. `gate` is a gilded
   * openwork gate that slides open on hover and keyboard focus. Ghost buttons
   * are always frameless.
   * @default 'scooped'
   */
  frame?: ButtonFrame
  /**
   * Leaf colors of the `vine` frame: all gold, all green (with a green stem
   * and a sunlight sheen) or a mix of both. Ignored by other frames.
   * @default 'mixed'
   */
  vineLeaves?: VineLeaves
  /**
   * A short effect played on click. `ripple` spreads two gilt rings, `stardust`
   * flares an Evenstar, `leaves` sheds golden leaves, `signature` draws a quill
   * flourish under the label, `bow` makes the button bow, and `velvet` sends a
   * wave across it like silk. Keyboard clicks play from the center. Nothing
   * plays when the user prefers reduced motion.
   * @default 'ripple', or 'none' for the `vine` and `gate` frames, which already animate on hover
   */
  clickEffect?: ClickEffect
  /**
   * Render the single child element (such as a link) as the button, keeping
   * the button's styles, frames and effects. The child keeps its own props.
   * @default false
   * @example <Button asChild><a href="/rivendell">Enter Imladris</a></Button>
   */
  asChild?: boolean
  /**
   * Shows a quill writing a line of ink in place of the label and keeps the
   * button's width. The button stays focusable but ignores clicks, and is marked
   * `aria-busy`.
   * @default false
   */
  loading?: boolean
  /**
   * Announced by screen readers while `loading`, as the button's description
   * (its name stays the same). Translate it for your app.
   * @default 'Loading'
   */
  loadingLabel?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    frame = 'scooped',
    vineLeaves = 'mixed',
    clickEffect,
    asChild = false,
    loading = false,
    loadingLabel = 'Loading',
    // Native buttons default to type="submit", which silently submits enclosing forms.
    type = 'button',
    className,
    children,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    onPointerDown,
    onClick,
    ...rest
  },
  ref,
) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement)

  const vine = useVine(buttonRef, frame === 'vine' && variant !== 'ghost' && !loading, vineLeaves)
  // Frames with their own hover animation stay quiet on click unless asked otherwise.
  const hasHoverEffect = frame === 'vine' || frame === 'gate'
  const effect = useClickEffect(buttonRef, loading ? 'none' : (clickEffect ?? (hasHoverEffect ? 'none' : 'ripple')))

  const Root = asChild ? Slot : 'button'
  // While loading, the name stays the same and "Loading" is announced as a description.
  const loadingId = useId()
  const describedBy = [rest['aria-describedby'], loading && loadingId].filter(Boolean).join(' ') || undefined

  return (
    <Root
      ref={buttonRef}
      // type only means something on a <button>; a slotted link must not get it.
      type={asChild ? undefined : type}
      data-variant={variant}
      data-size={size}
      data-frame={frame}
      data-vine={vine.state}
      data-vine-leaves={vine.state && vineLeaves}
      data-loading={loading || undefined}
      // Not the native disabled attribute: that would drop focus while the work finishes.
      aria-busy={loading || undefined}
      aria-disabled={loading || rest['aria-disabled'] || undefined}
      className={clsx(styles.button, className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        // A tap would grow the vine only to wither it a moment later.
        if (event.pointerType !== 'touch') vine.grow()
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        vine.wither()
      }}
      onFocus={(event) => {
        onFocus?.(event)
        // Only keyboard focus grows the vine; a mouse click is already covered by hover.
        if (event.currentTarget.matches(':focus-visible')) vine.grow()
      }}
      onBlur={(event) => {
        onBlur?.(event)
        vine.wither()
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        // Played on pointerdown rather than click, so the effect never lags the press.
        if (event.button === 0) effect.playAt(event.clientX, event.clientY)
      }}
      onClick={(event) => {
        if (loading) {
          event.preventDefault()
          return
        }
        onClick?.(event)
        // A click with no pointer behind it (detail 0) came from Enter or Space.
        if (event.detail === 0) effect.playCentered()
      }}
      {...rest}
      aria-describedby={describedBy}
    >
      {/* Holds the inner gilt line of ornate frames; purely decorative. */}
      <span className={styles.frame} aria-hidden="true" />
      {vine.element}
      {effect.bursts}
      {loading && (
        <span className={styles.spinner}>
          {/* A quill writing a line of ink, lifting at the end and starting over. */}
          <svg viewBox="0 0 60 30" aria-hidden="true" focusable="false">
            <path className={styles.ink} d="M14 24C18 20 20 26 24 22S30 20 33 23S38 25 42 21" />
            <g className={styles.quill}>
              <path className={styles.nib} d="M14 24L17 16" />
              <path className={styles.vane} d="M17 16C18 9 22 1 31 -5C29 2 25 10 19 17Z" />
              <path className={styles.shaft} d="M17 16C21 9 25 2 31 -5M20 12L23 11M22 8L25 7M24 4L27 3" />
            </g>
          </svg>
        </span>
      )}
      {/* With asChild, the slotted element becomes the root and its own children go in the label. */}
      <Slottable child={children}>
        {(content) => (
          <span className={styles.label}>
            {content}
            {/*
             * Hidden from the name computation, but still read through
             * aria-describedby, which also follows hidden elements.
             */}
            {loading && (
              <span id={loadingId} className={styles.visuallyHidden} aria-hidden="true">
                {loadingLabel}
              </span>
            )}
            {effect.signature}
          </span>
        )}
      </Slottable>
    </Root>
  )
})

Button.displayName = 'Button'
