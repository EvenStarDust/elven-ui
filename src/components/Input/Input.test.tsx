import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders a text field named by its label', () => {
    render(<Input label="Your name" />)
    expect(screen.getByRole('textbox', { name: 'Your name' })).toBeInTheDocument()
  })

  it('can be named with aria-label when there is no visible label', () => {
    render(<Input aria-label="Search" />)
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument()
  })

  it('describes the field with its hint', () => {
    render(<Input label="Name" hint="As written in the Red Book" />)
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('As written in the Red Book')
  })

  it('marks the field invalid and reads the error before the hint', () => {
    render(<Input label="Password" hint="Speak it in Elvish" error="The doors stay shut" />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInvalid()
    expect(input).toHaveAccessibleDescription('The doors stay shut Speak it in Elvish')
  })

  it('is valid and undescribed by default', () => {
    render(<Input label="Name" />)
    const input = screen.getByRole('textbox')
    expect(input).toBeValid()
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('keeps a description passed in alongside its own', () => {
    render(
      <>
        <p id="extra">Shown to the council</p>
        <Input label="Name" hint="Your full name" aria-describedby="extra" />
      </>,
    )
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Shown to the council Your full name')
  })

  it('uses a given id for the label link', () => {
    render(<Input label="Name" id="name" />)
    expect(screen.getByLabelText('Name')).toHaveAttribute('id', 'name')
  })

  it('forwards its ref and native props to the input, and className to the wrapper', () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(<Input ref={ref} label="Name" name="fullName" required className="custom" />)
    const input = screen.getByRole('textbox')
    expect(ref.current).toBe(input)
    expect(input).toHaveAttribute('name', 'fullName')
    expect(input).toBeRequired()
    expect(container.firstChild).toHaveClass('custom')
    expect(container.firstChild).toHaveClass('field')
  })

  it('defaults to the medium size and the line frame', () => {
    const { container } = render(<Input label="Name" />)
    expect(container.firstChild).toHaveAttribute('data-size', 'md')
    expect(container.firstChild).toHaveAttribute('data-frame', 'line')
  })

  it.each(['sm', 'md', 'lg'] as const)('exposes the %s size', (size) => {
    const { container } = render(<Input label="Name" size={size} />)
    expect(container.firstChild).toHaveAttribute('data-size', size)
  })

  it.each(['line', 'box'] as const)('exposes the %s frame', (frame) => {
    const { container } = render(<Input label="Name" frame={frame} />)
    expect(container.firstChild).toHaveAttribute('data-frame', frame)
  })

  describe('inside label', () => {
    it('places the label outside by default', () => {
      const { container } = render(<Input label="Name" />)
      expect(container.firstChild).toHaveAttribute('data-label-placement', 'outside')
    })

    it('still names the field and focuses it when the label is clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(<Input label="Your name" labelPlacement="inside" />)
      expect(container.firstChild).toHaveAttribute('data-label-placement', 'inside')
      const input = screen.getByRole('textbox', { name: 'Your name' })
      await user.click(screen.getByText('Your name'))
      expect(input).toHaveFocus()
    })

    it('gives an empty field a blank placeholder and keeps one passed in', () => {
      const { rerender } = render(<Input label="Name" labelPlacement="inside" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', ' ')
      rerender(<Input label="Name" labelPlacement="inside" placeholder="Frodo Baggins" />)
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Frodo Baggins')
    })

    it('splits a text label into letters but keeps the whole word as the name', () => {
      render(<Input label="Your name" labelPlacement="inside" />)
      expect(screen.getByRole('textbox', { name: 'Your name' })).toBeInTheDocument()
      expect(screen.getByText('Y').parentElement).toHaveAttribute('aria-hidden', 'true')
    })

    it('leaves a label that is not plain text whole', () => {
      render(<Input label={<em>Your name</em>} labelPlacement="inside" />)
      expect(screen.getByRole('textbox', { name: 'Your name' })).toBeInTheDocument()
      expect(screen.queryByText('Y')).not.toBeInTheDocument()
    })

    it('falls back to outside without a visible label', () => {
      const { container } = render(<Input aria-label="Name" labelPlacement="inside" />)
      expect(container.firstChild).toHaveAttribute('data-label-placement', 'outside')
      expect(screen.getByRole('textbox')).not.toHaveAttribute('placeholder')
    })

    it('keeps the label raised on types the browser draws text into', () => {
      const { container, rerender } = render(<Input label="Day" type="date" labelPlacement="inside" />)
      expect(container.firstChild).toHaveAttribute('data-label-raised')
      rerender(<Input label="Name" labelPlacement="inside" />)
      expect(container.firstChild).not.toHaveAttribute('data-label-raised')
    })
  })

  it('accepts typing and reports changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input label="Name" onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'Sam')
    expect(screen.getByRole('textbox')).toHaveValue('Sam')
    expect(onChange).toHaveBeenCalledTimes(3)
  })

  it('cannot be typed in when disabled', async () => {
    const user = userEvent.setup()
    render(<Input label="Name" disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
    await user.type(input, 'Sam')
    expect(input).toHaveValue('')
  })

  it('keeps decorative icons out of the accessibility tree', () => {
    render(<Input label="Search" startIcon={<svg data-testid="start" />} endIcon={<svg data-testid="end" />} />)
    expect(screen.getByTestId('start').parentElement).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByTestId('end').parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  describe('password', () => {
    it('shows and hides what was typed', async () => {
      const user = userEvent.setup()
      render(<Input label="Secret word" type="password" defaultValue="mellon" />)
      const input = screen.getByLabelText('Secret word')
      expect(input).toHaveAttribute('type', 'password')

      await user.click(screen.getByRole('button', { name: 'Show password' }))
      expect(input).toHaveAttribute('type', 'text')

      const hide = screen.getByRole('button', { name: 'Hide password' })
      expect(hide).toHaveAttribute('aria-pressed', 'true')
      await user.click(hide)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('uses translated button names', () => {
      render(<Input label="Parola" type="password" showPasswordLabel="Parolayı göster" />)
      expect(screen.getByRole('button', { name: 'Parolayı göster' })).toBeInTheDocument()
    })

    it('never submits the form from the toggle', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn((event: Event) => event.preventDefault())
      render(
        <form onSubmit={(event) => onSubmit(event.nativeEvent)}>
          <Input label="Secret word" type="password" />
        </form>,
      )
      await user.click(screen.getByRole('button', { name: 'Show password' }))
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('can be rendered without the toggle', () => {
      render(<Input label="Secret word" type="password" controls={false} />)
      expect(screen.queryByRole('button')).toBeNull()
    })

    it('has no toggle on other field types', () => {
      render(<Input label="Name" />)
      expect(screen.queryByRole('button')).toBeNull()
    })
  })

  describe('search', () => {
    it('offers to clear the field only once something is typed', async () => {
      const user = userEvent.setup()
      render(<Input label="Search" type="search" />)
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
      await user.type(screen.getByRole('searchbox'), 'ring')
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
    })

    it('clears the field, reports the change and returns focus to it', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Input label="Search" type="search" defaultValue="ring" onChange={onChange} />)
      const input = screen.getByRole('searchbox')

      await user.click(screen.getByRole('button', { name: 'Clear' }))
      expect(input).toHaveValue('')
      expect(onChange).toHaveBeenCalledOnce()
      expect(input).toHaveFocus()
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
    })

    it('follows a controlled value', () => {
      const { rerender } = render(<Input label="Search" type="search" value="ring" onChange={() => {}} />)
      expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
      rerender(<Input label="Search" type="search" value="" onChange={() => {}} />)
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull()
    })

    it('has no clear button when read-only or when controls are off', () => {
      const { rerender } = render(<Input label="Search" type="search" defaultValue="ring" readOnly />)
      expect(screen.queryByRole('button')).toBeNull()
      rerender(<Input label="Search" type="search" defaultValue="ring" controls={false} />)
      expect(screen.queryByRole('button')).toBeNull()
    })
  })

  describe('number', () => {
    it('steps the value up and down and reports each change', async () => {
      const user = userEvent.setup()
      const onChange = vi.fn()
      render(<Input label="Rings" type="number" defaultValue={3} onChange={onChange} />)
      const input = screen.getByRole('spinbutton', { name: 'Rings' })

      await user.click(screen.getByRole('button', { name: 'Increase' }))
      expect(input).toHaveValue(4)
      await user.click(screen.getByRole('button', { name: 'Decrease' }))
      await user.click(screen.getByRole('button', { name: 'Decrease' }))
      expect(input).toHaveValue(2)
      expect(onChange).toHaveBeenCalledTimes(3)
    })

    it('respects step, min and max', async () => {
      const user = userEvent.setup()
      render(<Input label="Rings" type="number" defaultValue={18} step={2} min={0} max={20} />)
      const input = screen.getByRole('spinbutton')
      const increase = screen.getByRole('button', { name: 'Increase' })
      await user.click(increase)
      await user.click(increase)
      expect(input).toHaveValue(20)
    })

    it('keeps the step buttons out of the tab order', async () => {
      const user = userEvent.setup()
      render(<Input label="Rings" type="number" />)
      await user.tab()
      expect(screen.getByRole('spinbutton')).toHaveFocus()
      await user.tab()
      expect(document.body).toHaveFocus()
    })

    it('disables the step buttons when the field is disabled or read-only', () => {
      const { rerender } = render(<Input label="Rings" type="number" disabled />)
      expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
      rerender(<Input label="Rings" type="number" readOnly />)
      expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
    })

    it('uses translated button names', () => {
      render(<Input label="Yüzük" type="number" incrementLabel="Artır" decrementLabel="Azalt" />)
      expect(screen.getByRole('button', { name: 'Artır' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Azalt' })).toBeInTheDocument()
    })
  })

  it.each([
    ['email', 'textbox'],
    ['tel', 'textbox'],
    ['url', 'textbox'],
  ] as const)('passes the native %s type through', (type, role) => {
    render(<Input label="Field" type={type} />)
    expect(screen.getByRole(role)).toHaveAttribute('type', type)
  })
})
