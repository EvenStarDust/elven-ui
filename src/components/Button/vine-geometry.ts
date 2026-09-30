/**
 * Geometry for the golden ivy that wraps a button on hover.
 *
 * Two stems start at the middle of the left edge and grow around the rounded
 * rectangle in opposite directions, meeting on the right. Each stem winds
 * around the edge like a helix: it wobbles across the border line, and the
 * wobble's phase decides whether that stretch is in front of the button or
 * behind it. Leaves sprout along the stem as it grows.
 *
 * This module is pure (no DOM, seeded randomness) so it can be unit tested
 * and gives the same vine for the same button on every render.
 */

export type LeafColor = 'gold' | 'green'

export interface StemSegment {
  /** SVG path data */
  d: string
  length: number
  /** When this stretch starts growing, in ms */
  delay: number
  /** How long this stretch takes to grow, in ms */
  duration: number
}

export interface Leaf {
  x: number
  y: number
  /** Degrees; the leaf's base is at (x, y) and it points along this angle */
  angle: number
  scale: number
  color: LeafColor
  delay: number
}

export interface Tendril {
  x: number
  y: number
  angle: number
  delay: number
}

export interface VineLayer {
  stems: StemSegment[]
  leaves: Leaf[]
  tendrils: Tendril[]
}

export interface VineGeometry {
  width: number
  height: number
  /** Space around the button the vine may grow into, on every side */
  pad: number
  greenShare: number
  /** Stretches behind the button, drawn under its fill */
  back: VineLayer
  /** Stretches in front of the button, drawn over it */
  front: VineLayer
}

export interface VineOptions {
  width: number
  height: number
  radius: number
  seed: number
  /** Share of leaves that are green rather than gold, from 0 to 1 */
  greenShare: number
  /** Time for each stem to reach the far side, in ms */
  duration?: number
  amplitude?: number
  wavelength?: number
  pad?: number
}

const SAMPLE_STEP = 1.5

/** Small, fast, seedable PRNG (mulberry32). */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Turns any string (such as a React id) into a seed. */
export function hashSeed(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619)
  return hash >>> 0
}

interface EdgePoint {
  x: number
  y: number
  /** Unit tangent in clockwise direction */
  tx: number
  ty: number
}

type Piece =
  | { kind: 'line'; length: number; from: [number, number]; to: [number, number] }
  | { kind: 'arc'; length: number; center: [number, number]; start: number }

/**
 * Perimeter of a rounded rectangle, walked clockwise starting at the middle of
 * the left edge. Returns the total length and a function that maps a distance
 * along the perimeter to a point and its tangent.
 */
function roundedRectPerimeter(x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2))
  const x1 = x + w
  const y1 = y + h
  const arc = (Math.PI * r) / 2
  const line = (from: [number, number], to: [number, number]): Piece => ({
    kind: 'line',
    length: Math.hypot(to[0] - from[0], to[1] - from[1]),
    from,
    to,
  })
  const corner = (cx: number, cy: number, start: number): Piece => ({
    kind: 'arc',
    length: arc,
    center: [cx, cy],
    start,
  })

  const pieces: Piece[] = [
    line([x, y + h / 2], [x, y + r]),
    corner(x + r, y + r, Math.PI),
    line([x + r, y], [x1 - r, y]),
    corner(x1 - r, y + r, (Math.PI * 3) / 2),
    line([x1, y + r], [x1, y1 - r]),
    corner(x1 - r, y1 - r, 0),
    line([x1 - r, y1], [x + r, y1]),
    corner(x + r, y1 - r, Math.PI / 2),
    line([x, y1 - r], [x, y + h / 2]),
  ]
  const total = pieces.reduce((sum, piece) => sum + piece.length, 0)

  function at(distance: number): EdgePoint {
    let s = ((distance % total) + total) % total
    for (const piece of pieces) {
      if (s > piece.length && piece !== pieces[pieces.length - 1]) {
        s -= piece.length
        continue
      }
      if (piece.kind === 'line') {
        const t = piece.length === 0 ? 0 : s / piece.length
        const dx = piece.to[0] - piece.from[0]
        const dy = piece.to[1] - piece.from[1]
        const len = piece.length || 1
        return { x: piece.from[0] + dx * t, y: piece.from[1] + dy * t, tx: dx / len, ty: dy / len }
      }
      const angle = piece.start + (r === 0 ? 0 : s / r)
      return {
        x: piece.center[0] + Math.cos(angle) * r,
        y: piece.center[1] + Math.sin(angle) * r,
        tx: -Math.sin(angle),
        ty: Math.cos(angle),
      }
    }
    throw new Error('unreachable')
  }

  return { total, at }
}

interface StemPoint {
  x: number
  y: number
  /** Distance travelled along this stem */
  k: number
  /** Positive in front of the button, negative behind it */
  depth: number
  /** Unit tangent in the direction of growth */
  tx: number
  ty: number
  /** Outward unit normal of the button's edge */
  nx: number
  ny: number
}

const round = (n: number) => Math.round(n * 10) / 10

function toPath(points: StemPoint[]): string {
  return points.map((p, i) => `${i ? 'L' : 'M'}${round(p.x)},${round(p.y)}`).join('')
}

function polylineLength(points: StemPoint[]): number {
  let length = 0
  for (let i = 1; i < points.length; i++)
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y)
  return length
}

const emptyLayer = (): VineLayer => ({ stems: [], leaves: [], tendrils: [] })

export function buildVine({
  width,
  height,
  radius,
  seed,
  greenShare,
  duration = 1150,
  amplitude = 4.2,
  wavelength = 34,
  pad = 16,
}: VineOptions): VineGeometry {
  const geometry: VineGeometry = { width, height, pad, greenShare, back: emptyLayer(), front: emptyLayer() }
  if (width <= 0 || height <= 0) return geometry

  const random = createRandom(seed)
  const perimeter = roundedRectPerimeter(pad, pad, width, height, radius)
  const half = perimeter.total / 2
  const timeAt = (k: number) => (k / half) * duration

  for (const direction of [1, -1]) {
    const points: StemPoint[] = []
    for (let k = 0; k <= half; k += SAMPLE_STEP) {
      const edge = perimeter.at(direction * k)
      // Outward normal of the clockwise tangent; the same for both directions.
      const nx = edge.ty
      const ny = -edge.tx
      const phase = (k / wavelength) * Math.PI * 2 + 0.6
      const offset = amplitude * Math.sin(phase)
      points.push({
        x: edge.x + nx * offset,
        y: edge.y + ny * offset,
        k,
        depth: Math.cos(phase),
        tx: edge.tx * direction,
        ty: edge.ty * direction,
        nx,
        ny,
      })
    }

    // Split the stem wherever it passes from the front of the button to the back.
    let run: StemPoint[] = [points[0]]
    const flush = () => {
      if (run.length < 2) return
      const layer = run[Math.floor(run.length / 2)].depth > 0 ? geometry.front : geometry.back
      const start = run[0].k
      const end = run[run.length - 1].k
      layer.stems.push({
        d: toPath(run),
        length: round(polylineLength(run)),
        delay: Math.round(timeAt(start)),
        duration: Math.max(1, Math.round(timeAt(end) - timeAt(start))),
      })
    }
    for (let i = 1; i < points.length; i++) {
      run.push(points[i])
      if (points[i].depth > 0 !== points[i - 1].depth > 0) {
        flush()
        run = [points[i]]
      }
    }
    flush()

    let side = 1
    for (let i = 6; i < points.length; i += Math.round(7 + random() * 4)) {
      const point = points[i]
      side *= -1
      // Leaves just past the edge still read as in front, which keeps the vine lush.
      const inFront = point.depth > -0.25
      const layer = inFront ? geometry.front : geometry.back
      // Leaves fan outwards so they never cover the label.
      const angle = (Math.atan2(point.ny, point.nx) * 180) / Math.PI + side * (15 + random() * 40)
      const delay = Math.round(timeAt(point.k) + 60)

      layer.leaves.push({
        x: round(point.x),
        y: round(point.y),
        angle: Math.round(angle),
        scale: Math.round(((inFront ? 0.62 : 0.5) + random() * 0.35) * 100) / 100,
        color: random() < greenShare ? 'green' : 'gold',
        delay,
      })

      if (inFront && random() < 0.25) {
        layer.tendrils.push({
          x: round(point.x),
          y: round(point.y),
          angle: Math.round(angle - side * 60),
          delay: delay + 80,
        })
      }
    }

    // A last leaf where the two stems meet, so the far side is as lush as the start.
    const tip = points[points.length - 1]
    geometry.front.leaves.push({
      x: round(tip.x),
      y: round(tip.y),
      angle: Math.round((Math.atan2(tip.ny, tip.nx) * 180) / Math.PI + direction * 25),
      scale: 0.85,
      color: random() < greenShare ? 'green' : 'gold',
      delay: Math.round(duration + 40),
    })
  }

  return geometry
}
