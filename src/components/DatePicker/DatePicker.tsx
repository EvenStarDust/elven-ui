'use client'

import { forwardRef, useMemo, useState } from 'react'
import { CalendarIcon } from '../../icons'
import { PickerField, type PickerFieldInputProps } from '../PickerField'
import { Calendar, DEFAULT_LABELS, type DatePickerLabels, type Numerals } from './Calendar'
import { clampDate, formatDate, parseDate, weekStartFor, type WeekStart } from './dates'

export type { DatePickerLabels, Numerals, WeekStart }

export interface DatePickerProps extends PickerFieldInputProps {
  /** The chosen day as `YYYY-MM-DD`, or an empty string for none. */
  value?: string
  /** The day chosen at first, for an uncontrolled picker. */
  defaultValue?: string
  /** Called with `YYYY-MM-DD` when a day is chosen, and with an empty string when it is cleared. */
  onValueChange?: (value: string) => void
  /** The earliest day that can be chosen, as `YYYY-MM-DD`. */
  min?: string
  /** The latest day that can be chosen, as `YYYY-MM-DD`. */
  max?: string
  /** Submits the value with forms under this name. */
  name?: string
  /**
   * Language of month and weekday names and of the written-out date, as a
   * BCP 47 tag like `tr` or `de`. The default is English, like the button
   * labels, so nothing is half translated; set both to localise the picker.
   * @default 'en-GB'
   */
  locale?: string
  /**
   * First day of the week: 0 for Sunday, 1 for Monday.
   * @default the locale's own, where the browser knows it; otherwise Monday
   */
  weekStartsOn?: WeekStart
  /**
   * How days and the year are written in the calendar.
   * @default 'arabic'
   */
  numerals?: Numerals
  /**
   * Names of the calendar's buttons, for translation. Give only the ones you
   * want to change; the rest stay in English.
   */
  labels?: Partial<DatePickerLabels>
}

/**
 * A date field whose calendar unrolls as a page of a medieval manuscript. The
 * value is an ISO date string, as with a native date input. The ref points to
 * the visible, read-only field.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value,
    defaultValue = '',
    onValueChange,
    min,
    max,
    name,
    locale = 'en-GB',
    weekStartsOn,
    numerals = 'arabic',
    labels,
    ...field
  },
  ref,
) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const current = value ?? uncontrolled
  const selected = useMemo(() => parseDate(current), [current])
  const minDate = useMemo(() => parseDate(min), [min])
  const maxDate = useMemo(() => parseDate(max), [max])

  const text = useMemo(() => ({ ...DEFAULT_LABELS, ...labels }), [labels])

  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState<Date>(() => new Date())
  const [today, setToday] = useState<Date>(() => new Date())

  const commit = (next: string) => {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  const onOpenChange = (next: boolean) => {
    if (next) {
      // Read the clock when opening rather than on render, so server and client agree.
      const now = new Date()
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      setToday(day)
      setFocused(clampDate(selected ?? day, minDate, maxDate))
    }
    setOpen(next)
  }

  const written = useMemo(
    () => (selected ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(selected) : ''),
    [selected, locale],
  )

  return (
    <PickerField
      ref={ref}
      {...field}
      text={written}
      open={open}
      onOpenChange={onOpenChange}
      icon={<CalendarIcon />}
      openLabel={text.open}
      dialogLabel={text.open}
      name={name}
      formValue={selected ? current : ''}
      onClear={() => commit('')}
      // Without scrolling: the page is still unrolling, and must not be shifted to show the focused day.
      onOpened={(dialog) => dialog.querySelector<HTMLElement>('[data-focused]')?.focus({ preventScroll: true })}
    >
      <Calendar
        selected={selected}
        focused={focused}
        onFocusedChange={setFocused}
        onSelect={(date) => {
          commit(formatDate(date))
          setOpen(false)
        }}
        onClear={() => {
          commit('')
          setOpen(false)
        }}
        today={today}
        min={minDate}
        max={maxDate}
        locale={locale}
        weekStart={weekStartsOn ?? weekStartFor(locale)}
        numerals={numerals}
        labels={text}
      />
    </PickerField>
  )
})

DatePicker.displayName = 'DatePicker'
