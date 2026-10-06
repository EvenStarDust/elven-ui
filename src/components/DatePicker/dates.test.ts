import { addDays, addMonths, clampDate, formatDate, isOutOfRange, isSameDay, monthGrid, parseDate, startOfWeek, toRoman, weekStartFor } from './dates'

const day = (iso: string) => parseDate(iso)!

describe('parseDate and formatDate', () => {
  it('round-trips an ISO date as a local day', () => {
    const date = day('2026-09-30')
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 8, 30])
    expect(formatDate(date)).toBe('2026-09-30')
  })

  it.each(['', '2026-9-3', '30.09.2026', '2026-02-30', '2026-13-01', 'not a date', null, undefined])(
    'rejects %s',
    (value) => expect(parseDate(value)).toBeNull(),
  )

  it('pads early years and single digits', () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('moving between days and months', () => {
  it('crosses month and year boundaries', () => {
    expect(formatDate(addDays(day('2026-12-31'), 1))).toBe('2027-01-01')
    expect(formatDate(addDays(day('2026-03-01'), -1))).toBe('2026-02-28')
  })

  it('keeps the day when the target month has it and clamps when it does not', () => {
    expect(formatDate(addMonths(day('2026-01-15'), 1))).toBe('2026-02-15')
    expect(formatDate(addMonths(day('2026-01-31'), 1))).toBe('2026-02-28')
    expect(formatDate(addMonths(day('2024-01-31'), 1))).toBe('2024-02-29')
    expect(formatDate(addMonths(day('2026-03-31'), -1))).toBe('2026-02-28')
    expect(formatDate(addMonths(day('2026-11-30'), 14))).toBe('2028-01-30')
  })

  it('compares days, ignoring nulls', () => {
    expect(isSameDay(day('2026-09-30'), new Date(2026, 8, 30, 18, 45))).toBe(true)
    expect(isSameDay(day('2026-09-30'), day('2026-09-29'))).toBe(false)
    expect(isSameDay(null, day('2026-09-30'))).toBe(false)
  })
})

describe('monthGrid', () => {
  it('starts the week on the requested day', () => {
    // 30 September 2026 is a Wednesday.
    expect(formatDate(startOfWeek(day('2026-09-30'), 1))).toBe('2026-09-28')
    expect(formatDate(startOfWeek(day('2026-09-30'), 0))).toBe('2026-09-27')
  })

  it('always has six weeks of seven days that cover the whole month', () => {
    for (const weekStart of [0, 1, 6] as const) {
      const grid = monthGrid(2026, 8, weekStart)
      expect(grid).toHaveLength(6)
      for (const week of grid) expect(week).toHaveLength(7)
      const days = grid.flat().map(formatDate)
      expect(days).toContain('2026-09-01')
      expect(days).toContain('2026-09-30')
      expect(grid[0][0].getDay()).toBe(weekStart)
    }
  })

  it('matches September 2026 with weeks starting on Monday', () => {
    const grid = monthGrid(2026, 8, 1)
    expect(formatDate(grid[0][0])).toBe('2026-08-31')
    expect(formatDate(grid[5][6])).toBe('2026-10-11')
  })
})

describe('range checks', () => {
  const min = day('2026-09-10')
  const max = day('2026-09-20')

  it('knows which days are outside the range', () => {
    expect(isOutOfRange(day('2026-09-09'), min, max)).toBe(true)
    expect(isOutOfRange(day('2026-09-10'), min, max)).toBe(false)
    expect(isOutOfRange(day('2026-09-20'), min, max)).toBe(false)
    expect(isOutOfRange(day('2026-09-21'), min, max)).toBe(true)
    expect(isOutOfRange(day('1900-01-01'), null, null)).toBe(false)
  })

  it('clamps into the range', () => {
    expect(formatDate(clampDate(day('2026-09-01'), min, max))).toBe('2026-09-10')
    expect(formatDate(clampDate(day('2026-09-25'), min, max))).toBe('2026-09-20')
    expect(formatDate(clampDate(day('2026-09-15'), min, max))).toBe('2026-09-15')
  })
})

describe('toRoman', () => {
  it.each([
    [1, 'I'], [4, 'IV'], [9, 'IX'], [14, 'XIV'], [30, 'XXX'], [31, 'XXXI'], [2026, 'MMXXVI'], [1999, 'MCMXCIX'],
  ])('writes %d as %s', (value, numeral) => expect(toRoman(value)).toBe(numeral))
})

describe('weekStartFor', () => {
  it('returns a valid weekday and falls back to Monday for nonsense', () => {
    expect([0, 1, 2, 3, 4, 5, 6]).toContain(weekStartFor('en-GB'))
    expect(weekStartFor('not a locale!')).toBe(1)
  })
})
