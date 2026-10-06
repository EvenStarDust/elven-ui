import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import * as exports from './index'
import { QuillIcon } from './index'

const icons = Object.entries(exports)

describe('icons', () => {
  it('exports the whole set', () => {
    expect(icons).toHaveLength(56)
  })

  describe.each(icons)('%s', (name, Icon) => {
    it('is named after its export and ends in Icon', () => {
      expect(Icon.displayName).toBe(name)
      expect(name).toMatch(/Icon$/)
    })

    it('renders its shape and is hidden from assistive technology by default', () => {
      const { container } = render(<Icon />)
      const svg = container.querySelector('svg')!
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg.querySelector('path')).toHaveAttribute('d')
      expect(screen.queryByRole('img')).toBeNull()
    })
  })

  it('becomes an image with a name when labelled', () => {
    render(<QuillIcon aria-label="Write a letter" />)
    const image = screen.getByRole('img', { name: 'Write a letter' })
    expect(image).not.toHaveAttribute('aria-hidden')
  })

  it('scales with the text by default and accepts a size', () => {
    const { container, rerender } = render(<QuillIcon />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '1em')
    rerender(<QuillIcon size={32} />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '32')
    expect(container.querySelector('svg')).toHaveAttribute('height', '32')
  })

  it('forwards its ref, merges className and passes other props through', () => {
    const ref = createRef<SVGSVGElement>()
    const { container } = render(<QuillIcon ref={ref} className="custom" data-testid="quill" />)
    const svg = container.querySelector('svg')
    expect(ref.current).toBe(svg)
    expect(svg).toHaveClass('custom')
    expect(svg).toHaveClass('icon')
    expect(svg).toHaveAttribute('data-testid', 'quill')
  })
})
