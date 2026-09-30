import { buildVine, createRandom, hashSeed, type VineGeometry } from './vine-geometry'

const options = { width: 180, height: 44, radius: 6, seed: 42, greenShare: 0.5 }

const allStems = (vine: VineGeometry) => [...vine.back.stems, ...vine.front.stems]
const allLeaves = (vine: VineGeometry) => [...vine.back.leaves, ...vine.front.leaves]

describe('createRandom', () => {
  it('is deterministic for a seed and stays within [0, 1)', () => {
    const a = createRandom(7)
    const b = createRandom(7)
    for (let i = 0; i < 100; i++) {
      const value = a()
      expect(value).toBe(b())
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('hashSeed', () => {
  it('gives the same seed for the same string and different seeds for different strings', () => {
    expect(hashSeed(':r1:')).toBe(hashSeed(':r1:'))
    expect(hashSeed(':r1:')).not.toBe(hashSeed(':r2:'))
  })
})

describe('buildVine', () => {
  it('builds nothing for a button that has no size yet', () => {
    const vine = buildVine({ ...options, width: 0 })
    expect(allStems(vine)).toHaveLength(0)
    expect(allLeaves(vine)).toHaveLength(0)
  })

  it('is deterministic, so the vine does not change between renders', () => {
    expect(buildVine(options)).toEqual(buildVine(options))
  })

  it('gives different buttons different vines', () => {
    expect(buildVine({ ...options, seed: 1 }).front.leaves).not.toEqual(buildVine({ ...options, seed: 2 }).front.leaves)
  })

  it('winds the stem in front of and behind the button', () => {
    const vine = buildVine(options)
    expect(vine.front.stems.length).toBeGreaterThan(2)
    expect(vine.back.stems.length).toBeGreaterThan(2)
  })

  it('grows each stem continuously over the full duration', () => {
    const duration = 1000
    const vine = buildVine({ ...options, duration })
    const stems = allStems(vine).sort((a, b) => a.delay - b.delay)

    expect(stems[0].delay).toBe(0)
    const end = Math.max(...stems.map((stem) => stem.delay + stem.duration))
    expect(end).toBeGreaterThan(duration * 0.95)
    expect(end).toBeLessThanOrEqual(duration + 2)
    for (const stem of stems) expect(stem.length).toBeGreaterThan(0)
  })

  it('keeps every leaf within the space around the button', () => {
    const vine = buildVine(options)
    const maxX = options.width + vine.pad * 2
    const maxY = options.height + vine.pad * 2
    for (const leaf of allLeaves(vine)) {
      expect(leaf.x).toBeGreaterThanOrEqual(0)
      expect(leaf.x).toBeLessThanOrEqual(maxX)
      expect(leaf.y).toBeGreaterThanOrEqual(0)
      expect(leaf.y).toBeLessThanOrEqual(maxY)
    }
  })

  it('sprouts leaves after the stem reaches them', () => {
    const vine = buildVine(options)
    const leaves = allLeaves(vine)
    expect(leaves.length).toBeGreaterThan(10)
    for (const leaf of leaves) expect(leaf.delay).toBeGreaterThan(0)
  })

  it.each([
    [0, 'gold'],
    [1, 'green'],
  ] as const)('with a green share of %d, every leaf is %s', (greenShare, color) => {
    const vine = buildVine({ ...options, greenShare })
    for (const leaf of allLeaves(vine)) expect(leaf.color).toBe(color)
  })

  it('roughly follows the requested green share', () => {
    const leaves = allLeaves(buildVine({ ...options, width: 600, greenShare: 0.75 }))
    const green = leaves.filter((leaf) => leaf.color === 'green').length / leaves.length
    expect(green).toBeGreaterThan(0.55)
    expect(green).toBeLessThan(0.95)
  })
})

describe('leaf direction', () => {
  it('points every leaf away from the button so the label stays readable', () => {
    const vine = buildVine(options)
    const cx = vine.pad + options.width / 2
    const cy = vine.pad + options.height / 2
    for (const leaf of allLeaves(vine)) {
      const radians = (leaf.angle * Math.PI) / 180
      // The leaf tip should end up further from the button's center than its base.
      const tipX = leaf.x + Math.cos(radians) * 16 * leaf.scale
      const tipY = leaf.y + Math.sin(radians) * 16 * leaf.scale
      const outward = (x: number, y: number) =>
        Math.max(Math.abs(x - cx) - options.width / 2, Math.abs(y - cy) - options.height / 2)
      expect(outward(tipX, tipY)).toBeGreaterThan(outward(leaf.x, leaf.y))
    }
  })
})
