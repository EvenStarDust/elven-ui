'use client'

import { forwardRef, useState, type KeyboardEvent } from 'react'
import { HourglassIcon } from '../../icons'
import { PickerField, type PickerFieldInputProps } from '../PickerField'
import styles from './TimePicker.module.css'

export interface TimePickerProps extends PickerFieldInputProps {
  /** The chosen time as `HH:MM` on a 24-hour clock, or an empty string for none. */
  value?: string
  /** The time chosen at first, for an uncontrolled picker. */
  defaultValue?: string
  /** Called with `HH:MM` when the time changes. */
  onValueChange?: (value: string) => void
  /**
   * The gap between the minutes on offer.
   * @default 5
   */
  minuteStep?: number
  /** Submits the value with forms under this name. */
  name?: string
  /**
   * Names of the picker's parts, for translation. Give only the ones you want
   * to change; the rest stay in English.
   */
  labels?: Partial<TimePickerLabels>
}

export interface TimePickerLabels {
  /** The button that opens the picker. */
  open: string
  hours: string
  minutes: string
}

const DEFAULT_LABELS: TimePickerLabels = { open: 'Choose time', hours: 'Hours', minutes: 'Minutes' }

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/
const pad = (value: number) => String(value).padStart(2, '0')

/** Parses `HH:MM` into hours and minutes, or returns null when it isn't a time. */
export function parseTime(value: string | null | undefined): { hours: number; minutes: number } | null {
  const match = value ? TIME.exec(value) : null
  return match ? { hours: Number(match[1]), minutes: Number(match[2]) } : null
}

/**
 * Scrolls an option into view inside its own list only. `scrollIntoView` would
 * also scroll every ancestor, including the parchment while it unrolls.
 */
function reveal(option: HTMLElement | undefined, position: 'center' | 'nearest') {
  const list = option?.parentElement
  if (!option || !list) return
  // The list is the option's offset parent, so this is already measured from the list's top.
  const top = option.offsetTop
  if (position === 'center') {
    list.scrollTop = top - (list.clientHeight - option.offsetHeight) / 2
  } else if (top < list.scrollTop) {
    list.scrollTop = top
  } else if (top + option.offsetHeight > list.scrollTop + list.clientHeight) {
    list.scrollTop = top + option.offsetHeight - list.clientHeight
  }
}

interface ColumnProps {
  label: string
  values: number[]
  selected: number | null
  onPick: (value: number, byPointer: boolean) => void
}

/** A list of numbers where the arrow keys move and choose at once, as in a listbox. */
function Column({ label, values, selected, onPick }: ColumnProps) {
  // With nothing chosen yet, the first option is the one in the tab order.
  const tabStop = selected !== null && values.includes(selected) ? selected : values[0]

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = values.indexOf(tabStop)
    const targets: Record<string, number> = {
      ArrowUp: Math.max(index - 1, 0),
      ArrowDown: Math.min(index + 1, values.length - 1),
      Home: 0,
      End: values.length - 1,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    onPick(values[target], false)
    const option = event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]')[target]
    option?.focus({ preventScroll: true })
    reveal(option, 'nearest')
  }

  return (
    <div className={styles.column} role="listbox" aria-label={label} aria-orientation="vertical" onKeyDown={onKeyDown}>
      {values.map((value) => (
        <button
          key={value}
          type="button"
          role="option"
          className={styles.option}
          aria-selected={value === selected}
          tabIndex={value === tabStop ? 0 : -1}
          onClick={() => onPick(value, true)}
        >
          {pad(value)}
        </button>
      ))}
    </div>
  )
}

/**
 * A time field whose hours and minutes unroll on a sheet of parchment. The
 * value is `HH:MM` on a 24-hour clock, as with a native time input. The ref
 * points to the visible, read-only field.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    value,
    defaultValue = '',
    onValueChange,
    minuteStep = 5,
    name,
    labels,
    ...field
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const current = value ?? uncontrolled
  const time = parseTime(current)
  const [open, setOpen] = useState(false)
  const text = { ...DEFAULT_LABELS, ...labels }

  const step = Math.min(Math.max(Math.floor(minuteStep), 1), 30)
  const hours = Array.from({ length: 24 }, (_, hour) => hour)
  const minutes = Array.from({ length: Math.ceil(60 / step) }, (_, index) => index * step)

  const commit = (next: string) => {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  return (
    <PickerField
      ref={ref}
      {...field}
      text={time ? current : ''}
      open={open}
      onOpenChange={setOpen}
      icon={<HourglassIcon />}
      openLabel={text.open}
      dialogLabel={text.open}
      name={name}
      formValue={time ? current : ''}
      onClear={() => commit('')}
      onOpened={(dialog) => {
        const options = dialog.querySelectorAll<HTMLElement>('[role="option"][aria-selected="true"]')
        options.forEach((option) => reveal(option, 'center'))
        ;(options[0] ?? dialog.querySelector<HTMLElement>('[role="option"]'))?.focus({ preventScroll: true })
      }}
    >
      <div className={styles.picker}>
        <div className={styles.readout} aria-hidden="true">
          {time ? `${pad(time.hours)} : ${pad(time.minutes)}` : '-- : --'}
        </div>
        <div className={styles.columns}>
          <Column
            label={text.hours}
            values={hours}
            selected={time?.hours ?? null}
            onPick={(hour) => commit(`${pad(hour)}:${pad(time?.minutes ?? 0)}`)}
          />
          <span className={styles.separator} aria-hidden="true">
            :
          </span>
          <Column
            label={text.minutes}
            values={minutes}
            selected={time?.minutes ?? null}
            onPick={(minute, byPointer) => {
              commit(`${pad(time?.hours ?? 0)}:${pad(minute)}`)
              // Hours come first, so choosing the minutes with the pointer finishes the job.
              if (byPointer) setOpen(false)
            }}
          />
        </div>
      </div>
    </PickerField>
  )
})

TimePicker.displayName = 'TimePicker'
