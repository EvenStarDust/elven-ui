'use client'

import {
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { clsx } from 'clsx'
import { CloseIcon, ErrorIcon, EyeIcon, EyeOffIcon, MinusIcon, PlusIcon } from '../../icons'
import styles from './Input.module.css'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputFrame = 'line' | 'box'
export type InputLabelPlacement = 'outside' | 'inside'

export interface InputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  /**
   * Visible label, linked to the input. Without it, pass `aria-label` so the
   * field still has a name.
   */
  label?: ReactNode
  /** Extra guidance shown under the field and read out with it. */
  hint?: ReactNode
  /**
   * Error message. When set, the field is marked invalid and the message is
   * read out with it.
   */
  error?: ReactNode
  /**
   * Height and text size. Matches buttons of the same size.
   * @default 'md'
   */
  size?: InputSize
  /**
   * `line` is a single ruled line under the text, `box` a border on all four
   * sides. Both turn to gold on focus, with a light travelling across.
   * @default 'line'
   */
  frame?: InputFrame
  /**
   * `outside` puts the label above the field. `inside` writes it in the field
   * while it is empty, and lifts it onto the line or into the frame once the
   * field gains focus or a value. A `placeholder` then only shows on focus.
   * @default 'outside'
   */
  labelPlacement?: InputLabelPlacement
  /** Decorative icon before the text. */
  startIcon?: ReactNode
  /** Decorative icon after the text. Replaced by the built-in controls where a type has them. */
  endIcon?: ReactNode
  /**
   * Buttons placed after the text, such as the one that opens a picker. Unlike
   * icons they are interactive and take the field's button style.
   */
  endAction?: ReactNode
  /**
   * Whether the field gets the built-in buttons of its type: show/hide on
   * `password`, clear on `search`, decrease/increase on `number`.
   * @default true
   */
  controls?: boolean
  /**
   * Name of the button that reveals a password. Translate it for your app.
   * @default 'Show password'
   */
  showPasswordLabel?: string
  /**
   * Name of the button that hides a password again.
   * @default 'Hide password'
   */
  hidePasswordLabel?: string
  /**
   * Name of the button that empties a search field.
   * @default 'Clear'
   */
  clearLabel?: string
  /**
   * Name of the button that lowers a number by one step.
   * @default 'Decrease'
   */
  decrementLabel?: string
  /**
   * Name of the button that raises a number by one step.
   * @default 'Increase'
   */
  incrementLabel?: string
}

// Types whose empty field still shows browser-drawn text or a widget, so an inside label can never rest over it.
const DRAWN_TYPES = new Set(['date', 'datetime-local', 'month', 'week', 'time', 'color', 'file', 'range'])

// React only notices a value set from code when the native setter is used and an input event follows.
const setNativeValue = Object.getOwnPropertyDescriptor(globalThis.HTMLInputElement?.prototype ?? {}, 'value')?.set
const notifyChange = (input: HTMLInputElement) => input.dispatchEvent(new Event('input', { bubbles: true }))

/**
 * A text field with its label, hint and error built in, written on a ruled
 * line or inside a box. It takes every native `type`; `password`, `search` and
 * `number` get their own controls. `className` and `style` go on the wrapper;
 * every other prop and the ref go on the `<input>` itself.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    size = 'md',
    frame = 'line',
    labelPlacement = 'outside',
    startIcon,
    endIcon,
    endAction,
    controls = true,
    showPasswordLabel = 'Show password',
    hidePasswordLabel = 'Hide password',
    clearLabel = 'Clear',
    decrementLabel = 'Decrease',
    incrementLabel = 'Increase',
    type = 'text',
    id,
    className,
    style,
    disabled,
    readOnly,
    value,
    defaultValue,
    placeholder,
    onInput,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const invalid = Boolean(error)

  const [revealed, setRevealed] = useState(false)
  // Whether there is anything to clear. Tracked here for uncontrolled fields, read from `value` otherwise.
  const [typed, setTyped] = useState(defaultValue != null && String(defaultValue) !== '')
  const hasValue = value !== undefined ? String(value) !== '' : typed

  const locked = disabled || readOnly
  const builtIn = controls && (type === 'password' || type === 'search' || type === 'number') ? type : undefined

  const clear = () => {
    const input = inputRef.current
    if (!input) return
    setNativeValue?.call(input, '')
    notifyChange(input)
    input.focus()
  }

  const step = (direction: 1 | -1) => {
    const input = inputRef.current
    if (!input) return
    if (direction > 0) input.stepUp()
    else input.stepDown()
    notifyChange(input)
  }

  const inside = labelPlacement === 'inside' && Boolean(label)
  // A plain-text inside label is split into letters that rise one after another. Screen readers get the
  // whole word from a hidden copy, as some read separately wrapped letters one by one.
  const lettered = inside && typeof label === 'string'
  const labelElement = label && (
    <label className={clsx(styles.label, lettered && styles.lettered)} htmlFor={inputId}>
      {lettered ? (
        <>
          <span className={styles.visuallyHidden}>{label}</span>
          <span aria-hidden="true">
            {Array.from(label, (letter, index) => (
              <span key={index} className={styles.letter} style={{ '--_i': index } as CSSProperties}>
                {letter}
              </span>
            ))}
          </span>
        </>
      ) : (
        label
      )}
    </label>
  )

  return (
    <div
      className={clsx(styles.field, className)}
      style={style}
      data-size={size}
      data-frame={frame}
      // Without a label there is nothing to place inside, so the field behaves as `outside`.
      data-label-placement={inside ? 'inside' : 'outside'}
      data-label-raised={inside && DRAWN_TYPES.has(type) ? '' : undefined}
      data-controls={builtIn}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
    >
      {!inside && labelElement}
      <div className={styles.control}>
        {startIcon && (
          <span className={styles.adornment} aria-hidden="true">
            {startIcon}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type={builtIn === 'password' && revealed ? 'text' : type}
          className={styles.input}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          // An inside label rests over an empty field. A blank placeholder lets the CSS tell it is empty with :placeholder-shown.
          placeholder={inside ? (placeholder ?? ' ') : placeholder}
          onInput={(event) => {
            setTyped(event.currentTarget.value !== '')
            onInput?.(event)
          }}
          aria-invalid={ariaInvalid ?? (invalid || undefined)}
          // The error comes first so it is read before the general hint.
          aria-describedby={clsx(describedBy, error && errorId, hint && hintId) || undefined}
          {...rest}
        />
        {/* After the input, so the CSS can lift it from the input's state with sibling selectors. */}
        {inside && labelElement}
        {builtIn === 'password' && (
          <button
            type="button"
            className={styles.action}
            aria-label={revealed ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={revealed}
            disabled={disabled}
            onClick={() => setRevealed((shown) => !shown)}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
        {builtIn === 'search' && hasValue && !locked && (
          <button type="button" className={styles.action} aria-label={clearLabel} onClick={clear}>
            <CloseIcon />
          </button>
        )}
        {builtIn === 'number' && (
          // The arrow keys already step the value, so these stay out of the tab order.
          <span className={styles.stepper}>
            <button
              type="button"
              className={styles.action}
              aria-label={decrementLabel}
              tabIndex={-1}
              disabled={locked}
              onClick={() => step(-1)}
            >
              <MinusIcon />
            </button>
            <button
              type="button"
              className={styles.action}
              aria-label={incrementLabel}
              tabIndex={-1}
              disabled={locked}
              onClick={() => step(1)}
            >
              <PlusIcon />
            </button>
          </span>
        )}
        {endAction && <span className={styles.actions}>{endAction}</span>}
        {!builtIn && endIcon && (
          <span className={styles.adornment} aria-hidden="true">
            {endIcon}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          <ErrorIcon />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
