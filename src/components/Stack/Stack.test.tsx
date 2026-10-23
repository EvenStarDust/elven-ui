import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Stack } from './Stack'

describe('Stack', () => {
  it('renders its children in order', () => {
    render(
      <Stack aria-label="Fellowship" role="group">
        <span>Frodo</span>
        <span>Sam</span>
      </Stack>,
    )
    const group = screen.getByRole('group', { name: 'Fellowship' })
    expect(group).toHaveTextContent('FrodoSam')
  })

  it('defaults to a column with gap 4, stretched and packed at the start', () => {
    render(<Stack role="group" aria-label="Fellowship" />)
    const stack = screen.getByRole('group')
    expect(stack).toHaveAttribute('data-direction', 'column')
    expect(stack).toHaveAttribute('data-gap', '4')
    expect(stack).toHaveAttribute('data-align', 'stretch')
    expect(stack).toHaveAttribute('data-justify', 'start')
    expect(stack).not.toHaveAttribute('data-wrap')
  })

  it.each(['column', 'row'] as const)('exposes the %s direction', (direction) => {
    render(<Stack role="group" aria-label="Fellowship" direction={direction} />)
    expect(screen.getByRole('group')).toHaveAttribute('data-direction', direction)
  })

  it.each([1, 2, 3, 4, 5, 6, 8] as const)('exposes gap %s', (gap) => {
    render(<Stack role="group" aria-label="Fellowship" gap={gap} />)
    expect(screen.getByRole('group')).toHaveAttribute('data-gap', String(gap))
  })

  it.each(['start', 'center', 'end', 'stretch', 'baseline'] as const)('exposes the %s alignment', (align) => {
    render(<Stack role="group" aria-label="Fellowship" align={align} />)
    expect(screen.getByRole('group')).toHaveAttribute('data-align', align)
  })

  it.each(['start', 'center', 'end', 'between'] as const)('exposes the %s justification', (justify) => {
    render(<Stack role="group" aria-label="Fellowship" justify={justify} />)
    expect(screen.getByRole('group')).toHaveAttribute('data-justify', justify)
  })

  it('marks wrapping', () => {
    render(<Stack role="group" aria-label="Fellowship" wrap />)
    expect(screen.getByRole('group')).toHaveAttribute('data-wrap')
  })

  it('forwards its ref to the root element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<Stack ref={ref} role="group" aria-label="Fellowship" />)
    expect(ref.current).toBe(screen.getByRole('group'))
  })

  it('merges className and passes native props through', () => {
    render(<Stack role="group" aria-label="Fellowship" className="custom" id="company" />)
    const stack = screen.getByRole('group')
    expect(stack).toHaveClass('custom')
    expect(stack).toHaveAttribute('id', 'company')
  })

  it('renders the child element as the stack with asChild', () => {
    render(
      <Stack asChild gap={2} className="custom">
        <ul aria-label="Fellowship">
          <li>Frodo</li>
          <li>Sam</li>
        </ul>
      </Stack>,
    )
    const list = screen.getByRole('list', { name: 'Fellowship' })
    expect(list).toHaveAttribute('data-gap', '2')
    expect(list).toHaveClass('custom')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('places a hidden separator between each pair of children, skipping empty ones', () => {
    render(
      <Stack role="group" aria-label="Fellowship" separator>
        <span>Frodo</span>
        {null}
        <span>Sam</span>
        {false}
        <span>Merry</span>
      </Stack>,
    )
    const stack = screen.getByRole('group')
    const separators = stack.querySelectorAll('[aria-hidden="true"]')
    expect(separators).toHaveLength(2)
    expect(stack.children).toHaveLength(5)
  })

  it('adds no separator to a single child', () => {
    render(
      <Stack role="group" aria-label="Fellowship" separator>
        <span>Frodo</span>
      </Stack>,
    )
    expect(screen.getByRole('group').children).toHaveLength(1)
  })

  it('leaves the child element untouched with asChild, even with separator', () => {
    render(
      <Stack asChild separator>
        <ul aria-label="Fellowship">
          <li>Frodo</li>
          <li>Sam</li>
        </ul>
      </Stack>,
    )
    expect(screen.getByRole('list').children).toHaveLength(2)
  })

  it('adds no tab stops of its own', async () => {
    render(
      <Stack separator>
        <button type="button">Go</button>
        <button type="button">Stay</button>
      </Stack>,
    )
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Go' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Stay' })).toHaveFocus()
  })
})
