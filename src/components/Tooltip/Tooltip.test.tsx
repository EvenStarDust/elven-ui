import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip'

function Quill(props: { side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger aria-label="Write a letter">✒</TooltipTrigger>
      <TooltipContent {...props}>Write a letter</TooltipContent>
    </Tooltip>
  )
}

describe('Tooltip', () => {
  it('shows nothing until its trigger is hovered or focused', () => {
    render(<Quill />)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('opens on keyboard focus and describes its trigger', async () => {
    const user = userEvent.setup()
    render(<Quill />)
    await user.tab()
    const trigger = screen.getByRole('button', { name: 'Write a letter' })
    expect(trigger).toHaveFocus()
    expect(screen.getByRole('tooltip')).toHaveTextContent('Write a letter')
    expect(trigger).toHaveAccessibleDescription('Write a letter')
  })

  it('opens on hover', async () => {
    const user = userEvent.setup()
    render(<Quill />)
    await user.hover(screen.getByRole('button', { name: 'Write a letter' }))
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Write a letter')
  })

  it('closes with Escape, keeping focus on the trigger', async () => {
    const user = userEvent.setup()
    render(<Quill />)
    await user.tab()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).toBeNull()
    expect(screen.getByRole('button', { name: 'Write a letter' })).toHaveFocus()
  })

  it('works with or without a TooltipProvider', async () => {
    const user = userEvent.setup()
    render(
      <TooltipProvider delayDuration={0}>
        <Quill />
      </TooltipProvider>,
    )
    await user.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('opens on the top by default and exposes the side it opened on', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Quill />)
    await user.tab()
    expect(document.querySelector('[data-side]')).toHaveAttribute('data-side', 'top')
    unmount()
    render(<Quill side="bottom" />)
    await user.tab()
    expect(document.querySelector('[data-side]')).toHaveAttribute('data-side', 'bottom')
  })

  it('is ink by default and exposes its variant', () => {
    const ref = createRef<HTMLDivElement>()
    const { rerender } = render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Map</TooltipTrigger>
        <TooltipContent ref={ref}>Open the map</TooltipContent>
      </Tooltip>,
    )
    expect(ref.current).toHaveAttribute('data-variant', 'ink')
    for (const variant of ['parchment', 'label'] as const) {
      rerender(
        <Tooltip defaultOpen>
          <TooltipTrigger>Map</TooltipTrigger>
          <TooltipContent ref={ref} variant={variant}>
            Open the map
          </TooltipContent>
        </Tooltip>,
      )
      expect(ref.current).toHaveAttribute('data-variant', variant)
    }
  })

  it('has a simple frame by default and a scooped one on request', () => {
    const ref = createRef<HTMLDivElement>()
    const { rerender } = render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Map</TooltipTrigger>
        <TooltipContent ref={ref}>Open the map</TooltipContent>
      </Tooltip>,
    )
    expect(ref.current).toHaveAttribute('data-frame', 'simple')
    rerender(
      <Tooltip defaultOpen>
        <TooltipTrigger>Map</TooltipTrigger>
        <TooltipContent ref={ref} frame="scooped">
          Open the map
        </TooltipContent>
      </Tooltip>,
    )
    expect(ref.current).toHaveAttribute('data-frame', 'scooped')
    expect(ref.current).toHaveTextContent('Open the map')
  })

  it('forwards its ref and className to the tip', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Map</TooltipTrigger>
        <TooltipContent ref={ref} className="custom">
          Open the map
        </TooltipContent>
      </Tooltip>,
    )
    expect(ref.current).toHaveClass('custom')
    expect(ref.current).toHaveTextContent('Open the map')
  })

  it('takes the theme of its trigger into the portal', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <div data-elven-theme="lothlorien">
        <Tooltip defaultOpen>
          <TooltipTrigger>Map</TooltipTrigger>
          <TooltipContent ref={ref}>Open the map</TooltipContent>
        </Tooltip>
      </div>,
    )
    expect(ref.current).toHaveAttribute('data-elven-theme', 'lothlorien')
  })

  it('keeps its clasp out of the accessibility tree', () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Map</TooltipTrigger>
        <TooltipContent ref={ref}>Open the map</TooltipContent>
      </Tooltip>,
    )
    expect(ref.current?.querySelector('span[aria-hidden="true"]')).toBeInTheDocument()
  })
})
