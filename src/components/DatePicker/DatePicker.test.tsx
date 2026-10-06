import { createRef } from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePicker } from './DatePicker'

// Wednesday, 30 September 2026. Only Date is faked, so timers and user events keep working.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 8, 30, 10, 0))
})
afterEach(() => vi.useRealTimers())

const open = async (user = userEvent.setup()) => {
  await user.click(screen.getByRole('button', { name: 'Choose date' }))
  return { user, dialog: screen.getByRole('dialog', { name: 'Choose date' }) }
}
// Matches a day by its full spoken name, so that "1 October" doesn't also match "11 October".
const dayButton = (name: RegExp) => screen.getByRole('button', { name: new RegExp(`(^|\\D)${name.source}`) })

describe('DatePicker', () => {
  it('shows the chosen day written out in the locale', () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-30" />)
    expect(screen.getByRole('textbox', { name: 'Council' })).toHaveValue('30 September 2026')
  })

  it('is empty without a value, or with one that is not a date', () => {
    const { rerender } = render(<DatePicker label="Council" locale="en-GB" />)
    expect(screen.getByRole('textbox')).toHaveValue('')
    rerender(<DatePicker label="Council" locale="en-GB" value="soon" />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('has no dialog until it is opened', () => {
    render(<DatePicker label="Council" locale="en-GB" />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Choose date' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens on the month of the chosen day, with focus on that day', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-03-25" />)
    const { dialog } = await open()
    expect(within(dialog).getByRole('grid', { name: 'March 2026' })).toBeInTheDocument()
    expect(dayButton(/25 March 2026/)).toHaveFocus()
    expect(screen.getByRole('gridcell', { selected: true })).toHaveTextContent('25')
  })

  it('opens on today when nothing is chosen', async () => {
    render(<DatePicker label="Council" locale="en-GB" />)
    await open()
    const today = dayButton(/30 September 2026/)
    expect(today).toHaveFocus()
    expect(today).toHaveAttribute('aria-current', 'date')
  })

  it('also opens from the field itself, by click or arrow key', async () => {
    const user = userEvent.setup()
    render(<DatePicker label="Council" locale="en-GB" />)
    await user.click(screen.getByRole('textbox'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()

    screen.getByRole('textbox').focus()
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('chooses a day, reports it as an ISO date and closes', async () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Council" locale="en-GB" onValueChange={onValueChange} />)
    const { user } = await open()
    await user.click(dayButton(/12 September 2026/))

    expect(onValueChange).toHaveBeenCalledWith('2026-09-12')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('textbox')).toHaveValue('12 September 2026')
  })

  it('leaves the value to its owner when controlled', async () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Council" locale="en-GB" value="2026-09-30" onValueChange={onValueChange} />)
    const { user } = await open()
    await user.click(dayButton(/12 September 2026/))
    expect(onValueChange).toHaveBeenCalledWith('2026-09-12')
    expect(screen.getByRole('textbox')).toHaveValue('30 September 2026')
  })

  it('moves between days with the arrow keys, and weeks with up and down', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-16" />)
    const { user } = await open()
    await user.keyboard('{ArrowRight}')
    expect(dayButton(/17 September 2026/)).toHaveFocus()
    await user.keyboard('{ArrowDown}')
    expect(dayButton(/24 September 2026/)).toHaveFocus()
    await user.keyboard('{ArrowLeft}{ArrowUp}')
    expect(dayButton(/16 September 2026/)).toHaveFocus()
  })

  it('jumps to the ends of the week with Home and End', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-16" weekStartsOn={1} />)
    const { user } = await open()
    await user.keyboard('{Home}')
    expect(dayButton(/Monday,? 14 September 2026/)).toHaveFocus()
    await user.keyboard('{End}')
    expect(dayButton(/Sunday,? 20 September 2026/)).toHaveFocus()
  })

  it('turns the page with Page Up and Page Down, and a year with Shift', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-01-31" />)
    const { user } = await open()
    await user.keyboard('{PageDown}')
    expect(screen.getByRole('grid', { name: 'February 2026' })).toBeInTheDocument()
    expect(dayButton(/28 February 2026/)).toHaveFocus()
    await user.keyboard('{PageUp}{PageUp}')
    expect(screen.getByRole('grid', { name: 'December 2025' })).toBeInTheDocument()
    await user.keyboard('{Shift>}{PageDown}{/Shift}')
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument()
  })

  it('crosses into the next month with the arrow keys', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-30" />)
    const { user } = await open()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
    expect(dayButton(/1 October 2026/)).toHaveFocus()
  })

  it('chooses the focused day with Enter', async () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-16" onValueChange={onValueChange} />)
    const { user } = await open()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(onValueChange).toHaveBeenCalledWith('2026-09-17')
  })

  it('changes month with the header buttons', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-16" />)
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    await user.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByRole('grid', { name: 'August 2026' })).toBeInTheDocument()
  })

  it('keeps exactly one day in the tab order', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-16" />)
    await open()
    const days = within(screen.getByRole('grid')).getAllByRole('button')
    expect(days).toHaveLength(30)
    expect(days.filter((day) => day.tabIndex === 0)).toHaveLength(1)
  })

  it('closes with Escape and returns focus to the button', async () => {
    render(<DatePicker label="Council" locale="en-GB" />)
    const { user } = await open()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Choose date' })).toHaveFocus()
  })

  it('disables days outside min and max and keeps the keyboard inside the range', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-11" min="2026-09-10" max="2026-09-20" />)
    const { user } = await open()
    expect(dayButton(/9 September 2026/)).toBeDisabled()
    expect(dayButton(/21 September 2026/)).toBeDisabled()
    expect(dayButton(/10 September 2026/)).toBeEnabled()
    await user.keyboard('{ArrowUp}')
    expect(dayButton(/10 September 2026/)).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled()
  })

  it('chooses today and clears from the footer', async () => {
    const onValueChange = vi.fn()
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-03-25" onValueChange={onValueChange} />)
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(onValueChange).toHaveBeenLastCalledWith('2026-09-30')

    await user.click(screen.getByRole('button', { name: 'Choose date' }))
    await user.click(screen.getByRole('button', { name: 'Clear' }))
    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('clears from the field with Backspace', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-03-25" onValueChange={onValueChange} />)
    screen.getByRole('textbox').focus()
    await user.keyboard('{Backspace}')
    expect(onValueChange).toHaveBeenCalledWith('')
  })

  it('is English by default, whatever the browser language', async () => {
    render(<DatePicker label="Council" defaultValue="2026-09-30" />)
    expect(screen.getByRole('textbox')).toHaveValue('30 September 2026')
    await open()
    expect(screen.getByRole('grid', { name: 'September 2026' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')[0]).toHaveAccessibleName('Monday')
  })

  it('writes month and weekday names in the given locale', async () => {
    render(<DatePicker label="Toplantı" locale="tr" defaultValue="2026-09-30" />)
    expect(screen.getByRole('textbox')).toHaveValue('30 Eylül 2026')
    await open()
    expect(screen.getByRole('grid', { name: 'Eylül 2026' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Pazartesi' })).toBeInTheDocument()
  })

  it('starts the week on the requested day', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-30" weekStartsOn={0} />)
    await open()
    expect(screen.getAllByRole('columnheader')[0]).toHaveAccessibleName('Sunday')
  })

  it('can write days in Roman numerals while keeping their spoken names', async () => {
    render(<DatePicker label="Council" locale="en-GB" defaultValue="2026-09-14" numerals="roman" />)
    await open()
    expect(dayButton(/14 September 2026/)).toHaveTextContent('XIV')
  })

  it('submits the ISO date with forms under its name', async () => {
    const { container } = render(<DatePicker label="Council" locale="en-GB" name="council" defaultValue="2026-09-30" />)
    const hidden = container.querySelector('input[type="hidden"]')
    expect(hidden).toHaveAttribute('name', 'council')
    expect(hidden).toHaveValue('2026-09-30')
    expect(screen.getByRole('textbox')).not.toHaveAttribute('name')
  })

  it('opens clear of the label, hint and error of its field', async () => {
    // The popover is anchored to the whole field, so its own text stays readable while choosing.
    const { container } = render(<DatePicker label="Council" hint="In autumn" error="Too late" />)
    const field = container.firstElementChild as HTMLElement
    const measure = vi.spyOn(field, 'getBoundingClientRect')
    await open()
    expect(measure).toHaveBeenCalled()
  })

  describe('when the parchment fits neither above nor below the field', () => {
    // jsdom has no layout: a 600px tall page that can scroll, a 400px parchment, and a field placed per test.
    const page = document.documentElement
    let scrollBy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      scrollBy = vi.fn()
      Object.defineProperty(document, 'scrollingElement', { value: page, configurable: true })
      Object.defineProperty(page, 'scrollBy', { value: scrollBy, configurable: true })
      vi.spyOn(page, 'clientHeight', 'get').mockReturnValue(600)
      vi.spyOn(page, 'scrollHeight', 'get').mockReturnValue(2000)
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400)
    })
    afterEach(() => {
      vi.restoreAllMocks()
      Reflect.deleteProperty(document, 'scrollingElement')
      Reflect.deleteProperty(page, 'scrollBy')
    })

    const placeField = (container: HTMLElement, top: number) =>
      vi.spyOn(container.firstElementChild as HTMLElement, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, top, 300, 60))

    it('scrolls the page just enough to open below the field', async () => {
      const { container } = render(<DatePicker label="Council" />)
      placeField(container, 300)
      await open()
      // 360 (field bottom) + 10 (gap) + 400 (parchment) + 12 (margin) - 600 (screen)
      expect(scrollBy).toHaveBeenCalledWith({ top: 182, behavior: 'instant' })
    })

    it('never scrolls the field itself out of view', async () => {
      const { container } = render(<DatePicker label="Council" />)
      placeField(container, 100)
      vi.spyOn(page, 'clientHeight', 'get').mockReturnValue(380)
      await open()
      // 202 would be needed, but the field's top may only rise to the 12px margin.
      expect(scrollBy).toHaveBeenCalledWith({ top: 88, behavior: 'instant' })
    })

    it('leaves the page alone when the parchment fits above', async () => {
      const { container } = render(<DatePicker label="Council" />)
      placeField(container, 450)
      await open()
      expect(scrollBy).not.toHaveBeenCalled()
    })
  })

  it('cannot be opened when disabled', async () => {
    const user = userEvent.setup()
    render(<DatePicker label="Council" locale="en-GB" disabled />)
    expect(screen.getByRole('button', { name: 'Choose date' })).toBeDisabled()
    await user.click(screen.getByRole('textbox'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('passes field props through and forwards its ref to the field', () => {
    const ref = createRef<HTMLInputElement>()
    render(<DatePicker ref={ref} label="Council" locale="en-GB" hint="In autumn" error="Too late" frame="box" />)
    const field = screen.getByRole('textbox', { name: 'Council' })
    expect(ref.current).toBe(field)
    expect(field).toBeInvalid()
    expect(field).toHaveAccessibleDescription('Too late In autumn')
  })

  it('uses translated names for its buttons', async () => {
    render(
      <DatePicker
        label="Toplantı"
        locale="tr"
        labels={{ open: 'Tarih seç', clear: 'Temizle', today: 'Bugün', previousMonth: 'Önceki ay', nextMonth: 'Sonraki ay' }}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Tarih seç' }))
    for (const name of ['Temizle', 'Bugün', 'Önceki ay', 'Sonraki ay']) expect(screen.getByRole('button', { name })).toBeInTheDocument()
  })

  describe('choosing a month and a year', () => {
    it('turns to the twelve months from the month title, with focus on the current one', async () => {
      render(<DatePicker label="Council" defaultValue="2026-09-16" />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: 'September 2026. Choose month' }))

      const months = within(screen.getByRole('group', { name: '2026' })).getAllByRole('button')
      expect(months).toHaveLength(12)
      expect(screen.getByRole('button', { name: 'September 2026' })).toHaveFocus()
      expect(screen.getByRole('button', { name: 'September 2026' })).toHaveAttribute('aria-pressed', 'true')
      expect(screen.queryByRole('grid')).toBeNull()
    })

    it('goes back to the days of the chosen month', async () => {
      const onValueChange = vi.fn()
      render(<DatePicker label="Council" defaultValue="2026-09-16" onValueChange={onValueChange} />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: /Choose month/ }))
      await user.click(screen.getByRole('button', { name: 'March 2026' }))

      expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument()
      expect(dayButton(/16 March 2026/)).toHaveFocus()
      // Choosing a month only turns the page; the value changes when a day is chosen.
      expect(onValueChange).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('steps through years with the arrows on the months page', async () => {
      render(<DatePicker label="Council" defaultValue="2026-09-16" />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: /Choose month/ }))
      await user.click(screen.getByRole('button', { name: 'Next year' }))
      expect(screen.getByRole('group', { name: '2027' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Previous year' }))
      await user.click(screen.getByRole('button', { name: 'Previous year' }))
      expect(screen.getByRole('group', { name: '2025' })).toBeInTheDocument()
    })

    it('turns to a dozen years from the year title, and back to that year', async () => {
      render(<DatePicker label="Council" defaultValue="2026-09-16" />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: /Choose month/ }))
      await user.click(screen.getByRole('button', { name: '2026. Choose year' }))

      const years = within(screen.getByRole('group', { name: '2016 – 2027' })).getAllByRole('button')
      expect(years.map((year) => year.textContent)).toEqual(['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027'])
      expect(screen.getByRole('button', { name: '2026' })).toHaveFocus()

      await user.click(screen.getByRole('button', { name: 'Previous years' }))
      expect(screen.getByRole('group', { name: '2004 – 2015' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: '2009' }))
      expect(screen.getByRole('group', { name: '2009' })).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'June 2009' }))
      expect(screen.getByRole('grid', { name: 'June 2009' })).toBeInTheDocument()
    })

    it('moves between months and years with the keyboard', async () => {
      render(<DatePicker label="Council" defaultValue="2026-09-16" />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: /Choose month/ }))
      await user.keyboard('{ArrowRight}')
      expect(screen.getByRole('button', { name: 'October 2026' })).toHaveFocus()
      await user.keyboard('{ArrowUp}')
      expect(screen.getByRole('button', { name: 'July 2026' })).toHaveFocus()
      await user.keyboard('{End}')
      expect(screen.getByRole('button', { name: 'December 2026' })).toHaveFocus()
      await user.keyboard('{PageDown}{Home}')
      expect(screen.getByRole('button', { name: 'January 2027' })).toHaveFocus()
      await user.keyboard('{Enter}')
      expect(screen.getByRole('grid', { name: 'January 2027' })).toBeInTheDocument()
    })

    it('keeps one month and one year in the tab order', async () => {
      render(<DatePicker label="Council" defaultValue="2026-09-16" />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: /Choose month/ }))
      const tabStops = () => within(screen.getByRole('group')).getAllByRole('button').filter((tile) => tile.tabIndex === 0)
      expect(tabStops()).toHaveLength(1)
      await user.click(screen.getByRole('button', { name: /Choose year/ }))
      expect(tabStops()).toHaveLength(1)
    })

    it('disables months and years that lie wholly outside min and max', async () => {
      render(<DatePicker label="Council" defaultValue="2026-09-16" min="2026-08-20" max="2027-02-10" />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: /Choose month/ }))
      expect(screen.getByRole('button', { name: 'July 2026' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'August 2026' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'December 2026' })).toBeEnabled()

      await user.click(screen.getByRole('button', { name: /Choose year/ }))
      expect(screen.getByRole('button', { name: '2025' })).toBeDisabled()
      expect(screen.getByRole('button', { name: '2026' })).toBeEnabled()
      expect(screen.getByRole('button', { name: '2027' })).toBeEnabled()
    })

    it('opens on the days again every time', async () => {
      render(<DatePicker label="Council" defaultValue="2026-09-16" />)
      const { user } = await open()
      await user.click(screen.getByRole('button', { name: /Choose month/ }))
      await user.keyboard('{Escape}')
      await user.click(screen.getByRole('button', { name: 'Choose date' }))
      expect(screen.getByRole('grid', { name: 'September 2026' })).toBeInTheDocument()
    })
  })
})
