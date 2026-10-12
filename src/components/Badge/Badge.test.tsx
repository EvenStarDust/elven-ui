import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its label as plain text', () => {
    render(<Badge>Sealed</Badge>)
    expect(screen.getByText('Sealed')).toBeInTheDocument()
  })

  it('defaults to the neutral variant, soft appearance, ribbon shape and medium size', () => {
    render(<Badge>Sealed</Badge>)
    const badge = screen.getByText('Sealed').parentElement
    expect(badge).toHaveAttribute('data-variant', 'neutral')
    expect(badge).toHaveAttribute('data-appearance', 'soft')
    expect(badge).toHaveAttribute('data-shape', 'ribbon')
    expect(badge).toHaveAttribute('data-size', 'md')
  })

  it.each(['neutral', 'accent', 'success', 'warning', 'danger'] as const)('exposes the %s variant', (variant) => {
    render(<Badge variant={variant}>Sealed</Badge>)
    expect(screen.getByText('Sealed').parentElement).toHaveAttribute('data-variant', variant)
  })

  it.each(['soft', 'solid'] as const)('exposes the %s appearance', (appearance) => {
    render(<Badge appearance={appearance}>Sealed</Badge>)
    expect(screen.getByText('Sealed').parentElement).toHaveAttribute('data-appearance', appearance)
  })

  it.each(['ribbon', 'shield', 'round', 'scalloped'] as const)('exposes the %s shape', (shape) => {
    render(<Badge shape={shape}>Sealed</Badge>)
    expect(screen.getByText('Sealed').parentElement).toHaveAttribute('data-shape', shape)
  })

  it.each(['sm', 'md'] as const)('exposes the %s size', (size) => {
    render(<Badge size={size}>Sealed</Badge>)
    expect(screen.getByText('Sealed').parentElement).toHaveAttribute('data-size', size)
  })

  it('forwards its ref to the root span', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>Sealed</Badge>)
    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current).toContainElement(screen.getByText('Sealed'))
  })

  it('merges className and passes native props through', () => {
    render(
      <Badge className="custom" title="The ring is sealed" lang="sjn">
        Sealed
      </Badge>,
    )
    const badge = screen.getByTitle('The ring is sealed')
    expect(badge).toHaveClass('custom')
    expect(badge).toHaveAttribute('lang', 'sjn')
  })

  it('stays out of the tab order, since it is not interactive', async () => {
    render(
      <>
        <Badge>Sealed</Badge>
        <button type="button">Open</button>
      </>,
    )
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Open' })).toHaveFocus()
  })
})
