import { createRef } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders a button with its label as the accessible name', () => {
    render(<Button>Enter Imladris</Button>)
    expect(screen.getByRole('button', { name: 'Enter Imladris' })).toBeInTheDocument()
  })

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('allows overriding the type', () => {
    render(<Button type="submit">Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('defaults to the primary variant and medium size', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-variant', 'primary')
    expect(button).toHaveAttribute('data-size', 'md')
  })

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)('exposes the %s variant', (variant) => {
    render(<Button variant={variant}>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant)
  })

  it.each(['sm', 'md', 'lg'] as const)('exposes the %s size', (size) => {
    render(<Button size={size}>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size)
  })

  it('defaults to the scooped frame', () => {
    render(<Button>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-frame', 'scooped')
  })

  it.each(['scooped', 'pointed', 'simple', 'none', 'vine', 'gate'] as const)('exposes the %s frame', (frame) => {
    render(<Button frame={frame}>Save</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-frame', frame)
  })

  it('keeps decorative frame markup out of the accessibility tree', () => {
    render(<Button>Save</Button>)
    const button = screen.getByRole('button', { name: 'Save' })
    expect(button.querySelector('[aria-hidden="true"]')).toBeEmptyDOMElement()
  })

  it('forwards its ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Save</Button>)
    expect(ref.current).toBe(screen.getByRole('button'))
  })

  it('merges className and passes other props through', () => {
    render(
      <Button className="custom" aria-describedby="hint">
        Save
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom')
    expect(button).toHaveClass('button')
    expect(button).toHaveAttribute('aria-describedby', 'hint')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('can be focused and activated with Enter and Space', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Save</Button>)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('does not respond when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    await user.click(button)
    await user.tab()
    expect(button).not.toHaveFocus()
    expect(onClick).not.toHaveBeenCalled()
  })

  describe('vine frame', () => {
    // jsdom does no layout; give buttons a size so the vine has something to wrap.
    beforeAll(() => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(160)
      vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(40)
    })
    afterAll(() => vi.restoreAllMocks())

    it('renders no vine until the button is hovered', () => {
      const { container } = render(<Button frame="vine">Enter</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-vine', 'bare')
      expect(container.querySelector('svg')).toBeNull()
    })

    it('grows the vine on hover and withers it when the pointer leaves', async () => {
      const user = userEvent.setup()
      const { container } = render(<Button frame="vine">Enter</Button>)
      const button = screen.getByRole('button')

      await user.hover(button)
      await waitFor(() => expect(button).toHaveAttribute('data-vine', 'grown'))
      const svgs = container.querySelectorAll('svg')
      expect(svgs).toHaveLength(2)
      for (const svg of svgs) expect(svg).toHaveAttribute('aria-hidden', 'true')

      await user.unhover(button)
      expect(button).toHaveAttribute('data-vine', 'bare')
    })

    it('does not grow the vine on touch', () => {
      const { container } = render(<Button frame="vine">Enter</Button>)
      fireEvent.pointerEnter(screen.getByRole('button'), { pointerType: 'touch' })
      expect(container.querySelector('svg')).toBeNull()
    })

    it('does not change the accessible name', async () => {
      const user = userEvent.setup()
      render(<Button frame="vine">Enter</Button>)
      await user.hover(screen.getByRole('button'))
      expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument()
    })

    it('still calls the pointer handlers passed in', async () => {
      const user = userEvent.setup()
      const onPointerEnter = vi.fn()
      const onPointerLeave = vi.fn()
      render(
        <Button frame="vine" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave}>
          Enter
        </Button>,
      )
      await user.hover(screen.getByRole('button'))
      await user.unhover(screen.getByRole('button'))
      expect(onPointerEnter).toHaveBeenCalledOnce()
      expect(onPointerLeave).toHaveBeenCalledOnce()
    })

    it('never grows a vine on ghost buttons', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <Button frame="vine" variant="ghost">
          Enter
        </Button>,
      )
      await user.hover(screen.getByRole('button'))
      expect(screen.getByRole('button')).not.toHaveAttribute('data-vine')
      expect(container.querySelector('svg')).toBeNull()
    })
  })

  describe('click effects', () => {
    const decorations = (container: HTMLElement) =>
      container.querySelectorAll('button > [aria-hidden="true"]:not(:empty)')

    afterEach(() => vi.useRealTimers())

    it('plays a ripple by default and clears it afterwards', () => {
      vi.useFakeTimers()
      const { container } = render(<Button>Save</Button>)
      fireEvent.pointerDown(screen.getByRole('button'), { button: 0, clientX: 10, clientY: 10 })
      expect(decorations(container)).toHaveLength(1)

      act(() => vi.advanceTimersByTime(2000))
      expect(decorations(container)).toHaveLength(0)
    })

    it.each(['ripple', 'stardust', 'leaves', 'velvet'] as const)('renders %s particles out of the accessibility tree', (clickEffect) => {
      const { container } = render(<Button clickEffect={clickEffect}>Save</Button>)
      fireEvent.pointerDown(screen.getByRole('button'), { button: 0 })
      const [burst] = decorations(container)
      expect(burst).toHaveAttribute('aria-hidden', 'true')
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('plays from the center for keyboard clicks', async () => {
      const user = userEvent.setup()
      const { container } = render(<Button>Save</Button>)
      await user.tab()
      await user.keyboard('{Enter}')
      expect(decorations(container)).toHaveLength(1)
    })

    it('ignores secondary mouse buttons', () => {
      const { container } = render(<Button>Save</Button>)
      fireEvent.pointerDown(screen.getByRole('button'), { button: 2 })
      expect(decorations(container)).toHaveLength(0)
    })

    it.each(['vine', 'gate'] as const)('plays no click effect by default on the %s frame', (frame) => {
      const { container } = render(<Button frame={frame}>Save</Button>)
      fireEvent.pointerDown(screen.getByRole('button'), { button: 0 })
      expect(decorations(container)).toHaveLength(0)
    })

    it('still plays a click effect on a hover frame when asked to', () => {
      const { container } = render(
        <Button frame="gate" clickEffect="ripple">
          Save
        </Button>,
      )
      fireEvent.pointerDown(screen.getByRole('button'), { button: 0 })
      expect(decorations(container)).toHaveLength(1)
    })

    it('plays nothing with clickEffect="none"', () => {
      const { container } = render(<Button clickEffect="none">Save</Button>)
      fireEvent.pointerDown(screen.getByRole('button'), { button: 0 })
      expect(decorations(container)).toHaveLength(0)
    })

    it('adds a hidden flourish under the label only for the signature effect', () => {
      const { container, rerender } = render(<Button clickEffect="signature">Save</Button>)
      expect(container.querySelector('button svg')).toHaveAttribute('aria-hidden', 'true')
      rerender(<Button clickEffect="ripple">Save</Button>)
      expect(container.querySelector('button svg')).toBeNull()
    })

    it('plays nothing when the user prefers reduced motion', () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
      )
      const { container } = render(<Button clickEffect="stardust">Save</Button>)
      fireEvent.pointerDown(screen.getByRole('button'), { button: 0 })
      expect(decorations(container)).toHaveLength(0)
      vi.unstubAllGlobals()
    })

    it('still calls the pointer and click handlers passed in', async () => {
      const user = userEvent.setup()
      const onPointerDown = vi.fn()
      const onClick = vi.fn()
      render(
        <Button onPointerDown={onPointerDown} onClick={onClick}>
          Save
        </Button>,
      )
      await user.click(screen.getByRole('button'))
      expect(onPointerDown).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledOnce()
    })
  })
})
