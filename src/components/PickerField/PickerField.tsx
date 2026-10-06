'use client'

import { forwardRef, useImperativeHandle, useRef, useState, type ReactNode, type RefObject } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Input, type InputProps } from '../Input'
import { Parchment } from '../Parchment'
import styles from './PickerField.module.css'

/** The props a picker passes straight through to its field. */
export type PickerFieldInputProps = Pick<
  InputProps,
  'label' | 'hint' | 'error' | 'size' | 'frame' | 'disabled' | 'placeholder' | 'id' | 'className' | 'style' | 'aria-label' | 'aria-labelledby' | 'aria-describedby'
>

interface PickerFieldProps extends PickerFieldInputProps {
  /** What the field shows: the chosen value, written out for people. */
  text: string
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: ReactNode
  /** Name of the button that opens the picker. */
  openLabel: string
  /** Name of the dialog the picker opens. */
  dialogLabel: string
  /** When set, the raw value is submitted with forms under this name. */
  name?: string
  formValue: string
  onClear?: () => void
  /** Called once the dialog is open, to move focus to the right place inside it. */
  onOpened?: (dialog: HTMLElement) => void
  children: ReactNode
}

// Gap between field and parchment, and the margin kept from the edges of the screen.
const SIDE_OFFSET = 10
const COLLISION_PADDING = 12

/** The ancestors of an element that scroll vertically, innermost first, ending with the page. */
function scrollersOf(element: HTMLElement): HTMLElement[] {
  const scrollers: HTMLElement[] = []
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) scrollers.push(node)
  }
  if (document.scrollingElement instanceof HTMLElement) scrollers.push(document.scrollingElement)
  return scrollers
}

/**
 * When the parchment fits neither above nor below the field, scrolls the
 * field up just far enough for it to open below, without pushing the field
 * itself off the top. Whatever room is still missing is left to the CSS,
 * which slides the parchment over the field. The jump is instant: during a
 * smooth scroll Radix would place the parchment above, then flip it below.
 */
function makeRoomBelow(field: HTMLElement, dialog: HTMLElement) {
  const { top, bottom } = field.getBoundingClientRect()
  const needed = SIDE_OFFSET + dialog.offsetHeight + COLLISION_PADDING
  const viewport = document.documentElement.clientHeight
  // It fits on one side, so Radix places it without covering anything.
  if (bottom + needed <= viewport || top - needed >= 0) return

  let remaining = bottom + needed - viewport
  let fieldTop = top
  for (const scroller of scrollersOf(field)) {
    if (remaining <= 0) break
    // The field must stay in view: inside a scrolling box, below that box's top edge.
    const edge = scroller === document.scrollingElement ? 0 : Math.max(0, scroller.getBoundingClientRect().top)
    const distance = Math.min(
      remaining,
      fieldTop - edge - COLLISION_PADDING,
      scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop,
    )
    if (distance <= 0) continue
    scroller.scrollBy({ top: distance, behavior: 'instant' })
    remaining -= distance
    fieldTop -= distance
  }
}

/**
 * The shared shell of the date and time pickers: a read-only field, the button
 * that opens the picker, and a sheet of parchment unrolling in a popover.
 * Internal; not part of the public API.
 */
export const PickerField = forwardRef<HTMLInputElement, PickerFieldProps>(function PickerField(
  { text, open, onOpenChange, icon, openLabel, dialogLabel, name, formValue, onClear, onOpened, children, disabled, ...field },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)
  const dialogRef = useRef<HTMLDivElement>(null)
  // The popover is placed against the whole field, label, hint and error included, so it never covers them.
  const anchorRef = useRef<HTMLElement | null>(null)

  // The popover is rendered at the end of <body>, outside any themed ancestor, so it takes the field's theme along.
  const [theme, setTheme] = useState<string>()
  const change = (next: boolean) => {
    if (next) anchorRef.current = inputRef.current?.parentElement?.parentElement ?? null
    if (next) setTheme(inputRef.current?.closest('[data-elven-theme]')?.getAttribute('data-elven-theme') ?? undefined)
    onOpenChange(next)
  }

  return (
    <Popover.Root open={open} onOpenChange={change}>
      <Popover.Anchor virtualRef={anchorRef as RefObject<HTMLElement>} />
      <Input
          ref={inputRef}
          {...field}
          type="text"
          readOnly
          disabled={disabled}
          value={text}
          onClick={() => change(!open)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              change(true)
            } else if ((event.key === 'Backspace' || event.key === 'Delete') && onClear) {
              event.preventDefault()
              onClear()
            }
          }}
          endAction={
            <Popover.Trigger asChild>
              <button type="button" aria-label={openLabel} disabled={disabled}>
                {icon}
              </button>
            </Popover.Trigger>
          }
        />
      {name && <input type="hidden" name={name} value={formValue} disabled={disabled} />}
      <Popover.Portal>
        <Popover.Content
          ref={dialogRef}
          className={styles.popover}
          data-elven-theme={theme}
          aria-label={dialogLabel}
          align="center"
          sideOffset={SIDE_OFFSET}
          collisionPadding={COLLISION_PADDING}
          onOpenAutoFocus={(event) => {
            const dialog = dialogRef.current
            if (anchorRef.current && dialog) makeRoomBelow(anchorRef.current, dialog)
            if (!onOpened || !dialog) return
            event.preventDefault()
            onOpened(dialog)
          }}
          onPointerDownOutside={(event) => {
            // A click on the field toggles the picker itself; don't also dismiss it here.
            if (inputRef.current?.parentElement?.contains(event.target as Node)) event.preventDefault()
          }}
        >
          <Parchment data-state={open ? 'open' : 'closed'}>{children}</Parchment>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
})

PickerField.displayName = 'PickerField'
