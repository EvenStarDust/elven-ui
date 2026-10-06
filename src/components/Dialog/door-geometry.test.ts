import { COMPACT_BELOW, doorGeometry } from './door-geometry'

describe('doorGeometry', () => {
  it('is the same drawing for the same door', () => {
    expect(doorGeometry(608, 420, 'grand')).toEqual(doorGeometry(608, 420, 'grand'))
  })

  it('keeps the content between the columns, and closer to the edge without them', () => {
    const wide = doorGeometry(608, 420, 'portal')
    const narrow = doorGeometry(COMPACT_BELOW - 40, 420, 'portal')
    expect(wide.inset.inline).toBeGreaterThan(narrow.inset.inline)
  })

  it('leaves the columns out on narrow screens, seal and all', () => {
    const wide = doorGeometry(608, 420, 'portal')
    const narrow = doorGeometry(COMPACT_BELOW - 40, 420, 'portal')
    // With columns the seal crowns the end column; without, it sits further in, on the arch.
    expect(narrow.seal.end).toBeGreaterThan(wide.seal.end)
    expect(narrow.stone.length).toBeLessThan(wide.stone.length)
  })

  it('starts the content under the fanlight on the grand door, and up in the arch on the portal', () => {
    const portal = doorGeometry(608, 420, 'portal')
    const grand = doorGeometry(608, 420, 'grand')
    expect(grand.inset.top).toBeGreaterThan(portal.inset.top)
    expect(grand.faint).not.toBe('')
    expect(portal.faint).toBe('')
  })

  it('carves only the grand door', () => {
    expect(doorGeometry(608, 420, 'grand').carving.length).toBeGreaterThan(doorGeometry(608, 420, 'portal').carving.length * 4)
  })

  it('draws the arch as a single panel with no stone around it', () => {
    const arch = doorGeometry(608, 300, 'arch')
    expect(arch.stone).toBe('')
    expect(arch.door).not.toBe('')
    expect(arch.inset.inline).toBeLessThan(doorGeometry(608, 300, 'portal').inset.inline)
  })

  it('places the seal inside the door', () => {
    for (const frame of ['arch', 'portal', 'grand'] as const) {
      const { seal } = doorGeometry(608, 420, frame)
      expect(seal.top).toBeGreaterThanOrEqual(seal.radius - 2)
      expect(seal.end).toBeGreaterThanOrEqual(seal.radius)
    }
  })
})
