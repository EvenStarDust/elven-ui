'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EvenstarIcon } from '../../icons'
import { addDays, addMonths, clampDate, formatDate, isOutOfRange, isSameDay, monthGrid, startOfWeek, toRoman, type WeekStart } from './dates'
import styles from './DatePicker.module.css'

export type Numerals = 'arabic' | 'roman'

/** Every piece of text in the calendar that isn't a date. Translate them together with `locale`. */
export interface DatePickerLabels {
  /** The button that opens the calendar. */
  open: string
  previousMonth: string
  nextMonth: string
  /** Added to the month title, which opens the list of months. */
  chooseMonth: string
  previousYear: string
  nextYear: string
  /** Added to the year title, which opens the list of years. */
  chooseYear: string
  previousYears: string
  nextYears: string
  clear: string
  today: string
}

export const DEFAULT_LABELS: DatePickerLabels = {
  open: 'Choose date',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  chooseMonth: 'Choose month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  chooseYear: 'Choose year',
  previousYears: 'Previous years',
  nextYears: 'Next years',
  clear: 'Clear',
  today: 'Today',
}

type View = 'days' | 'months' | 'years'

/** Years are shown a dozen at a time. */
const YEARS_PER_PAGE = 12
const COLUMNS = 3

interface CalendarProps {
  selected: Date | null
  /** The day that holds keyboard focus; its month is the one shown. */
  focused: Date
  onFocusedChange: (date: Date) => void
  onSelect: (date: Date) => void
  onClear: () => void
  today: Date
  min: Date | null
  max: Date | null
  locale?: string
  weekStart: WeekStart
  numerals: Numerals
  labels: DatePickerLabels
}

/**
 * A month written out like a page of a medieval calendar. The month title
 * turns the page to the twelve months, and the year there to a dozen years.
 * Every page follows the grid pattern: one cell is in the tab order, the arrow
 * keys move between cells, Page Up and Page Down turn the page.
 */
export function Calendar({ selected, focused, onFocusedChange, onSelect, onClear, today, min, max, locale, weekStart, numerals, labels }: CalendarProps) {
  const titleId = useId()
  const bodyRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<View>('days')
  // Set when the focused cell changes from the keyboard or the page is turned, so focus follows after the render.
  const moveFocus = useRef(false)

  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    bodyRef.current?.querySelector<HTMLElement>('[data-focused]')?.focus({ preventScroll: true })
  }, [focused, view])

  const formats = useMemo(
    () => ({
      month: new Intl.DateTimeFormat(locale, { month: 'long' }),
      monthShort: new Intl.DateTimeFormat(locale, { month: 'short' }),
      title: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      day: new Intl.DateTimeFormat(locale, { dateStyle: 'full' }),
    }),
    [locale],
  )

  const year = focused.getFullYear()
  const month = focused.getMonth()
  const weeks = useMemo(() => monthGrid(year, month, weekStart), [year, month, weekStart])
  const firstYear = Math.floor(year / YEARS_PER_PAGE) * YEARS_PER_PAGE
  const number = (value: number) => (numerals === 'roman' ? toRoman(value) : String(value))

  const focusOn = (date: Date) => onFocusedChange(clampDate(date, min, max))
  const turnTo = (next: View, date = focused) => {
    moveFocus.current = true
    focusOn(date)
    setView(next)
  }

  // A whole month or year is unavailable when all of it lies outside min and max.
  const monthOutOfRange = (y: number, m: number) =>
    isOutOfRange(new Date(y, m + 1, 0), min, null) || isOutOfRange(new Date(y, m, 1), null, max)
  const yearOutOfRange = (y: number) => monthOutOfRange(y, 11) && monthOutOfRange(y, 0) && (min === null || min.getFullYear() !== y) && (max === null || max.getFullYear() !== y)

  const onKeyDown = (event: KeyboardEvent) => {
    const year12 = event.shiftKey ? 12 : 1
    const moves: Record<View, Record<string, () => Date>> = {
      days: {
        ArrowLeft: () => addDays(focused, -1),
        ArrowRight: () => addDays(focused, 1),
        ArrowUp: () => addDays(focused, -7),
        ArrowDown: () => addDays(focused, 7),
        Home: () => startOfWeek(focused, weekStart),
        End: () => addDays(startOfWeek(focused, weekStart), 6),
        PageUp: () => addMonths(focused, -year12),
        PageDown: () => addMonths(focused, year12),
      },
      months: {
        ArrowLeft: () => addMonths(focused, -1),
        ArrowRight: () => addMonths(focused, 1),
        ArrowUp: () => addMonths(focused, -COLUMNS),
        ArrowDown: () => addMonths(focused, COLUMNS),
        Home: () => addMonths(focused, -month),
        End: () => addMonths(focused, 11 - month),
        PageUp: () => addMonths(focused, -12),
        PageDown: () => addMonths(focused, 12),
      },
      years: {
        ArrowLeft: () => addMonths(focused, -12),
        ArrowRight: () => addMonths(focused, 12),
        ArrowUp: () => addMonths(focused, -12 * COLUMNS),
        ArrowDown: () => addMonths(focused, 12 * COLUMNS),
        Home: () => addMonths(focused, -12 * (year - firstYear)),
        End: () => addMonths(focused, 12 * (firstYear + YEARS_PER_PAGE - 1 - year)),
        PageUp: () => addMonths(focused, -12 * YEARS_PER_PAGE),
        PageDown: () => addMonths(focused, 12 * YEARS_PER_PAGE),
      },
    }
    const move = moves[view][event.key]
    if (!move) return
    event.preventDefault()
    moveFocus.current = true
    focusOn(move())
  }

  // What the header's arrows step by, and what they are called, on each page.
  const paging = {
    days: { step: 1, previous: labels.previousMonth, next: labels.nextMonth },
    months: { step: 12, previous: labels.previousYear, next: labels.nextYear },
    years: { step: 12 * YEARS_PER_PAGE, previous: labels.previousYears, next: labels.nextYears },
  }[view]

  // The first letter of the month is drawn as an illuminated initial, the rest in script.
  const [initial, ...rest] = [...formats.month.format(focused)]
  const range = `${number(firstYear)} – ${number(firstYear + YEARS_PER_PAGE - 1)}`

  return (
    <div className={styles.calendar} data-numerals={numerals} data-view={view}>
      <div className={styles.header}>
        {view === 'days' && (
          <>
            <span className={styles.initial} aria-hidden="true">
              {initial.toLocaleUpperCase(locale)}
            </span>
            <button
              type="button"
              className={styles.title}
              aria-label={`${formats.title.format(focused)}. ${labels.chooseMonth}`}
              onClick={() => turnTo('months')}
            >
              <span>
                {rest.join('')}
                <ChevronDownIcon className={styles.caret} />
              </span>
              <span className={styles.year}>{number(year)}</span>
            </button>
          </>
        )}
        {view === 'months' && (
          <button type="button" className={styles.title} aria-label={`${year}. ${labels.chooseYear}`} onClick={() => turnTo('years')}>
            <span>
              {number(year)}
              <ChevronDownIcon className={styles.caret} />
            </span>
          </button>
        )}
        {view === 'years' && <span className={styles.title}>{range}</span>}
        {/* Names the grid below and announces it when the page is turned. */}
        <span id={titleId} className={styles.visuallyHidden} aria-live="polite">
          {view === 'days' ? formats.title.format(focused) : view === 'months' ? String(year) : `${firstYear} – ${firstYear + YEARS_PER_PAGE - 1}`}
        </span>
        <button type="button" className={styles.nav} aria-label={paging.previous} onClick={() => focusOn(addMonths(focused, -paging.step))}>
          <ChevronLeftIcon />
        </button>
        <button type="button" className={styles.nav} aria-label={paging.next} onClick={() => focusOn(addMonths(focused, paging.step))}>
          <ChevronRightIcon />
        </button>
      </div>

      <div ref={bodyRef} className={styles.body} onKeyDown={onKeyDown}>
        {view === 'days' && (
          <table className={styles.grid} role="grid" aria-labelledby={titleId}>
            <thead>
              <tr>
                {weeks[0].map((date) => (
                  <th key={date.getDay()} scope="col" abbr={formats.weekdayLong.format(date)} aria-label={formats.weekdayLong.format(date)}>
                    {formats.weekdayShort.format(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={formatDate(week[0])}>
                  {week.map((date) => {
                    // Days of the neighbouring months are shown faintly, as on a real page, but are not part of this one.
                    if (date.getMonth() !== month) {
                      return (
                        <td key={formatDate(date)} className={styles.outside} aria-hidden="true">
                          {number(date.getDate())}
                        </td>
                      )
                    }
                    const isSelected = isSameDay(date, selected)
                    const isFocused = isSameDay(date, focused)
                    return (
                      <td key={formatDate(date)} role="gridcell" aria-selected={isSelected}>
                        <button
                          type="button"
                          className={styles.day}
                          tabIndex={isFocused ? 0 : -1}
                          disabled={isOutOfRange(date, min, max)}
                          aria-label={formats.day.format(date)}
                          aria-current={isSameDay(date, today) ? 'date' : undefined}
                          data-focused={isFocused || undefined}
                          data-selected={isSelected || undefined}
                          data-sunday={date.getDay() === 0 || undefined}
                          onClick={() => onSelect(date)}
                        >
                          {number(date.getDate())}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === 'months' && (
          <div className={styles.tiles} role="group" aria-labelledby={titleId}>
            {Array.from({ length: 12 }, (_, index) => {
              const date = new Date(year, index, 1)
              const isSelected = selected !== null && selected.getFullYear() === year && selected.getMonth() === index
              return (
                <button
                  key={index}
                  type="button"
                  className={styles.tile}
                  tabIndex={index === month ? 0 : -1}
                  disabled={monthOutOfRange(year, index)}
                  aria-label={formats.title.format(date)}
                  aria-pressed={isSelected}
                  aria-current={today.getFullYear() === year && today.getMonth() === index ? 'date' : undefined}
                  data-focused={index === month || undefined}
                  data-selected={isSelected || undefined}
                  onClick={() => turnTo('days', addMonths(focused, index - month))}
                >
                  {formats.monthShort.format(date)}
                </button>
              )
            })}
          </div>
        )}

        {view === 'years' && (
          <div className={styles.tiles} role="group" aria-labelledby={titleId}>
            {Array.from({ length: YEARS_PER_PAGE }, (_, index) => {
              const value = firstYear + index
              const isSelected = selected !== null && selected.getFullYear() === value
              return (
                <button
                  key={value}
                  type="button"
                  className={styles.tile}
                  tabIndex={value === year ? 0 : -1}
                  disabled={yearOutOfRange(value)}
                  aria-label={String(value)}
                  aria-pressed={isSelected}
                  aria-current={today.getFullYear() === value ? 'date' : undefined}
                  data-focused={value === year || undefined}
                  data-selected={isSelected || undefined}
                  onClick={() => turnTo('months', addMonths(focused, 12 * (value - year)))}
                >
                  {number(value)}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className={styles.ornament} aria-hidden="true">
        <EvenstarIcon />
      </div>
      <div className={styles.footer}>
        <button type="button" className={styles.link} onClick={onClear}>
          {labels.clear}
        </button>
        <button type="button" className={styles.link} disabled={isOutOfRange(today, min, max)} onClick={() => onSelect(today)}>
          {labels.today}
        </button>
      </div>
    </div>
  )
}
