import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { parseTime, TimePicker } from './TimePicker'

const open = async (user = userEvent.setup()) => {
  await user.click(screen.getByRole('button', { name: 'Choose time' }))
  return {
    user,
    hours: screen.getByRole('listbox', { name: 'Hours' }),
    minutes: screen.getByRole('listbox', { name: 'Minutes' }),
  }
}

describe('parseTime', () => {
  it('reads a 24-hour time', () => {
    expect(parseTime('09:30')).toEqual({ hours: 9, minutes: 30 })
    expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 })
  })

  it.each(['', '9:30', '24:00', '12:60', 'noon', null, undefined])('rejects %s', (value) => {
    expect(parseTime(value)).toBeNull()
  })
})

describe('TimePicker', () => {
  it('shows the chosen time in the field', () => {
    render(<TimePicker label="Departure" defaultValue="09:30" />)
    expect(screen.getByRole('textbox', { name: 'Departure' })).toHaveValue('09:30')
  })

  it('is empty without a value, or with one that is not a time', () => {
    const { rerender } = render(<TimePicker label="Departure" />)
    expect(screen.getByRole('textbox')).toHaveValue('')
    rerender(<TimePicker label="Departure" value="dusk" />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('opens with every hour, minutes in steps of five, and focus on the chosen hour', async () => {
    render(<TimePicker label="Departure" defaultValue="09:30" />)
    const { hours, minutes } = await open()
    expect(within(hours).getAllByRole('option')).toHaveLength(24)
    expect(within(minutes).getAllByRole('option')).toHaveLength(12)
    expect(within(hours).getByRole('option', { name: '09' })).toHaveFocus()
    expect(within(hours).getByRole('option', { selected: true })).toHaveTextContent('09')
    expect(within(minutes).getByRole('option', { selected: true })).toHaveTextContent('30')
  })

  it('offers the minutes in the requested step', async () => {
    render(<TimePicker label="Departure" minuteStep={15} />)
    const { minutes } = await open()
    expect(within(minutes).getAllByRole('option').map((option) => option.textContent)).toEqual(['00', '15', '30', '45'])
  })

  it('reports each choice and closes once the minutes are clicked', async () => {
    const onValueChange = vi.fn()
    render(<TimePicker label="Departure" defaultValue="09:30" onValueChange={onValueChange} />)
    const { user, hours, minutes } = await open()

    await user.click(within(hours).getByRole('option', { name: '18' }))
    expect(onValueChange).toHaveBeenLastCalledWith('18:30')
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(within(minutes).getByRole('option', { name: '45' }))
    expect(onValueChange).toHaveBeenLastCalledWith('18:45')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('textbox')).toHaveValue('18:45')
  })

  it('starts the other part at zero when only one is chosen', async () => {
    const onValueChange = vi.fn()
    render(<TimePicker label="Departure" onValueChange={onValueChange} />)
    const { user, hours } = await open()
    await user.click(within(hours).getByRole('option', { name: '07' }))
    expect(onValueChange).toHaveBeenCalledWith('07:00')
  })

  it('moves and chooses with the arrow keys, Home and End', async () => {
    const onValueChange = vi.fn()
    render(<TimePicker label="Departure" defaultValue="09:30" onValueChange={onValueChange} />)
    const { user, hours } = await open()

    await user.keyboard('{ArrowDown}')
    expect(onValueChange).toHaveBeenLastCalledWith('10:30')
    expect(within(hours).getByRole('option', { name: '10' })).toHaveFocus()
    await user.keyboard('{ArrowUp}{ArrowUp}')
    expect(onValueChange).toHaveBeenLastCalledWith('08:30')
    await user.keyboard('{End}')
    expect(onValueChange).toHaveBeenLastCalledWith('23:30')
    await user.keyboard('{ArrowDown}{Home}')
    expect(onValueChange).toHaveBeenLastCalledWith('00:30')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('reaches the minutes with Tab, one stop per list', async () => {
    render(<TimePicker label="Departure" defaultValue="09:30" />)
    const { user, minutes } = await open()
    await user.tab()
    expect(within(minutes).getByRole('option', { name: '30' })).toHaveFocus()
  })

  it('leaves the value to its owner when controlled', async () => {
    const onValueChange = vi.fn()
    render(<TimePicker label="Departure" value="09:30" onValueChange={onValueChange} />)
    const { user, hours } = await open()
    await user.click(within(hours).getByRole('option', { name: '18' }))
    expect(onValueChange).toHaveBeenCalledWith('18:30')
    expect(screen.getByRole('textbox')).toHaveValue('09:30')
  })

  it('closes with Escape and returns focus to the button', async () => {
    render(<TimePicker label="Departure" />)
    const { user } = await open()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Choose time' })).toHaveFocus()
  })

  it('clears from the field with Delete', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker label="Departure" defaultValue="09:30" onValueChange={onValueChange} />)
    screen.getByRole('textbox').focus()
    await user.keyboard('{Delete}')
    expect(onValueChange).toHaveBeenCalledWith('')
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('submits the time with forms under its name', () => {
    const { container } = render(<TimePicker label="Departure" name="departure" defaultValue="09:30" />)
    const hidden = container.querySelector('input[type="hidden"]')
    expect(hidden).toHaveAttribute('name', 'departure')
    expect(hidden).toHaveValue('09:30')
  })

  it('cannot be opened when disabled', async () => {
    const user = userEvent.setup()
    render(<TimePicker label="Departure" disabled />)
    expect(screen.getByRole('button', { name: 'Choose time' })).toBeDisabled()
    await user.click(screen.getByRole('textbox'))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('uses translated names', async () => {
    const user = userEvent.setup()
    render(<TimePicker label="Yola çıkış" labels={{ open: 'Saat seç', hours: 'Saat', minutes: 'Dakika' }} />)
    await user.click(screen.getByRole('button', { name: 'Saat seç' }))
    expect(screen.getByRole('listbox', { name: 'Saat' })).toBeInTheDocument()
    expect(screen.getByRole('listbox', { name: 'Dakika' })).toBeInTheDocument()
  })
})
