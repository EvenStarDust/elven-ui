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
          sideOffset={10}
          collisionPadding={12}
          onOpenAutoFocus={(event) => {
            if (!onOpened || !dialogRef.current) return
            event.preventDefault()
            onOpened(dialogRef.current)
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
