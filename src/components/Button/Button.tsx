'use client'

import { forwardRef, useImperativeHandle, useRef, type ComponentPropsWithoutRef } from 'react'
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
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    frame = 'scooped',
    vineLeaves = 'mixed',
    clickEffect,
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

  const vine = useVine(buttonRef, frame === 'vine' && variant !== 'ghost', vineLeaves)
  // Frames with their own hover animation stay quiet on click unless asked otherwise.
  const hasHoverEffect = frame === 'vine' || frame === 'gate'
  const effect = useClickEffect(buttonRef, clickEffect ?? (hasHoverEffect ? 'none' : 'ripple'))

  return (
    <button
      ref={buttonRef}
      type={type}
      data-variant={variant}
      data-size={size}
      data-frame={frame}
      data-vine={vine.state}
      data-vine-leaves={vine.state && vineLeaves}
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
        onClick?.(event)
        // A click with no pointer behind it (detail 0) came from Enter or Space.
        if (event.detail === 0) effect.playCentered()
      }}
      {...rest}
    >
      {/* Holds the inner gilt line of ornate frames; purely decorative. */}
      <span className={styles.frame} aria-hidden="true" />
      {vine.element}
      {effect.bursts}
      <span className={styles.label}>
        {children}
        {effect.signature}
      </span>
    </button>
  )
})

Button.displayName = 'Button'
