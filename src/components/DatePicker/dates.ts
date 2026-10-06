/**
 * Date helpers for the calendar. Pure functions on local dates, with no
 * library behind them; dates travel as ISO strings (`YYYY-MM-DD`) like the
 * native date input's value.
 */

/** 0 is Sunday, 1 is Monday, and so on. */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** Parses `YYYY-MM-DD` into a local date, or returns null when it isn't a real date. */
export function parseDate(value: string | null | undefined): Date | null {
  const match = value ? ISO_DATE.exec(value) : null
  if (!match) return null
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(year, month - 1, day)
  // Rejects overflow such as February 30, which Date would roll into March.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function formatDate(date: Date): string {
  const pad = (n: number, length = 2) => String(n).padStart(length, '0')
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return (
    a !== null &&
    b !== null &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Moves by whole months, keeping the day where it exists (January 31 + 1 month is the end of February). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay))
}

export function startOfWeek(date: Date, weekStart: WeekStart): Date {
  return addDays(date, -((date.getDay() - weekStart + 7) % 7))
}

/** Six weeks of seven days covering the month, so the calendar never changes height. */
export function monthGrid(year: number, month: number, weekStart: WeekStart): Date[][] {
  const first = startOfWeek(new Date(year, month, 1), weekStart)
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)))
}

export function isOutOfRange(date: Date, min: Date | null, max: Date | null): boolean {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  return (min !== null && day < min.getTime()) || (max !== null && day > max.getTime())
}

export function clampDate(date: Date, min: Date | null, max: Date | null): Date {
  if (min !== null && date.getTime() < min.getTime()) return min
  if (max !== null && date.getTime() > max.getTime()) return max
  return date
}

const ROMAN: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

export function toRoman(value: number): string {
  let rest = Math.floor(value)
  if (rest <= 0) return String(value)
  let result = ''
  for (const [amount, numeral] of ROMAN) {
    while (rest >= amount) {
      result += numeral
      rest -= amount
    }
  }
  return result
}

/** The first day of the week in a locale, where the browser knows it; Monday otherwise. */
export function weekStartFor(locale?: string): WeekStart {
  try {
    const resolved = new Intl.Locale(locale ?? new Intl.DateTimeFormat().resolvedOptions().locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }
    const firstDay = (resolved.getWeekInfo?.() ?? resolved.weekInfo)?.firstDay
    // Intl counts Monday as 1 and Sunday as 7.
    return typeof firstDay === 'number' ? ((firstDay % 7) as WeekStart) : 1
  } catch {
    return 1
  }
}
