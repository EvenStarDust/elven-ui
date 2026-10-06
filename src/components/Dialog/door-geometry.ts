// The dialog's door, drawn as gilt engraving. There is no wall: the dialog
// takes the shape of the structure itself, and the page shows between its
// parts. Everything is derived from the door's measured size, so the carving
// keeps its spacing at every size instead of being stretched. Pure, no DOM.
// See docs/adr/0007.
//
// - `arch`: a single arched panel with a double gilt line and the Evenstar.
// - `portal`: an arched doorway of mouldings with a keystone, between two
//   fluted columns, on a stepped threshold.
// - `grand`: the portal, carved: leafy capitals, a leaf band round the arch,
//   a fanlight over a beaded transom, a crest, leafy drums on the columns and
//   panelled door leaves behind the content.

export type DoorFrame = 'arch' | 'portal' | 'grand'

export interface DoorGeometry {
  /** The structure: columns, archivolt, steps. Filled like stone. */
  stone: string
  /** The door itself, inside the arch and jambs, where the content sits. */
  door: string
  /** Heavier outlines. */
  line: string
  /** Fine lines. */
  hair: string
  /** Leaves, beads and scrolls of the carving. */
  carving: string
  /** Faint panels behind the content (grand only). */
  faint: string
  /** The few filled gilt accents: the stars. */
  accent: string
  /** Room the content must keep from each edge, in px. */
  inset: { top: number; inline: number; bottom: number }
  /** Centre of the close seal, measured from the top and from the end edge. */
  seal: { top: number; end: number; radius: number }
}

/** Below this width the columns are left out. */
export const COMPACT_BELOW = 400

const COLUMN = 40
const COLUMN_MARGIN = 6
const COLUMN_GAP = 14
const THRESHOLD = 20
const SEAL = 15
// Distances in from the outer edge of the archivolt to each moulding line.
const OUTER = 0.75
const OUTER_FILLET = 6
const BAND_INNER = 22
const INNER_FILLET = 26
const BAND_MIDDLE = (OUTER_FILLET + BAND_INNER) / 2

const f = (n: number) => (Math.round(n * 10) / 10).toString()

interface Point {
  x: number
  y: number
}

/** A lens-shaped leaf from `p` along `angle` (radians). */
function leaf(p: Point, angle: number, length: number, width: number) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  const end = { x: p.x + dx * length, y: p.y + dy * length }
  const mid = { x: p.x + (dx * length) / 2, y: p.y + (dy * length) / 2 }
  const nx = -dy * width
  const ny = dx * width
  return (
    `M${f(p.x)},${f(p.y)}Q${f(mid.x + nx)},${f(mid.y + ny)} ${f(end.x)},${f(end.y)}` +
    `Q${f(mid.x - nx)},${f(mid.y - ny)} ${f(p.x)},${f(p.y)}Z`
  )
}

/** A volute: a spiral that winds in towards its centre. */
function volute(center: Point, radius: number, clockwise: boolean, start = 0) {
  const steps = 48
  const turns = 1.75
  const sign = clockwise ? 1 : -1
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const t = start + sign * (i / steps) * turns * Math.PI * 2
    const r = radius * (1 - (i / steps) * 0.82)
    d += `${i ? 'L' : 'M'}${f(center.x + r * Math.cos(t))},${f(center.y + r * Math.sin(t))}`
  }
  return d
}

function circle(c: Point, r: number) {
  return `M${f(c.x - r)},${f(c.y)}a${f(r)},${f(r)} 0 1 0 ${f(r * 2)},0a${f(r)},${f(r)} 0 1 0 ${f(-r * 2)},0Z`
}

/** A rectangle, drawn clockwise like every other filled shape, so overlaps never cut holes. */
function rect(x: number, y: number, width: number, height: number) {
  return `M${f(x)},${f(y)}h${f(width)}v${f(height)}h${f(-width)}Z`
}

/** A four-pointed star, as the Evenstar of the icon set. */
function star(c: Point, r: number) {
  const i = r * 0.24
  return (
    `M${f(c.x)},${f(c.y - r)}L${f(c.x + i)},${f(c.y - i)}L${f(c.x + r)},${f(c.y)}L${f(c.x + i)},${f(c.y + i)}` +
    `L${f(c.x)},${f(c.y + r)}L${f(c.x - i)},${f(c.y + i)}L${f(c.x - r)},${f(c.y)}L${f(c.x - i)},${f(c.y - i)}Z`
  )
}

/** Points evenly spaced along a polyline, with the direction of travel at each. */
function along(points: Point[], spacing: number) {
  const lengths = [0]
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
  }
  const total = lengths[lengths.length - 1]
  // A whole number of steps, so the carving ends exactly where it starts on the other side.
  const count = Math.max(1, Math.round(total / spacing))
  const result: Array<Point & { angle: number; share: number }> = []
  let segment = 1
  for (let k = 0; k <= count; k++) {
    const at = (k / count) * total
    while (segment < points.length - 1 && lengths[segment] < at) segment++
    const a = points[segment - 1]
    const b = points[segment]
    const span = lengths[segment] - lengths[segment - 1] || 1
    const t = (at - lengths[segment - 1]) / span
    result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, angle: Math.atan2(b.y - a.y, b.x - a.x), share: k / count })
  }
  return result
}

/** How far down an ellipse's top edge lies at `x`, from its crown. */
function sag(x: number, cx: number, rx: number, ry: number) {
  const u = Math.min(1, Math.abs(x - cx) / rx)
  return ry * (1 - Math.sqrt(1 - u * u))
}

/** The plain arched panel: the first door, for dialogs with a lot to say. */
function archGeometry(width: number, height: number): DoorGeometry {
  const cx = width / 2
  const rise = Math.min(width * 0.28, height * 0.6)
  const corner = 6
  const outline = (inset: number) => {
    const rx = cx - inset
    const ry = rise - inset
    return (
      `M${f(inset)},${f(height - inset - corner)}V${f(rise)}A${f(rx)},${f(ry)} 0 0 1 ${f(width - inset)},${f(rise)}` +
      `V${f(height - inset - corner)}Q${f(width - inset)},${f(height - inset)} ${f(width - inset - corner)},${f(height - inset)}` +
      `H${f(inset + corner)}Q${f(inset)},${f(height - inset)} ${f(inset)},${f(height - inset - corner)}Z`
    )
  }
  // The seal sits on the frame line itself, at the shoulder of the arch.
  const sealEnd = width * 0.12
  return {
    stone: '',
    door: outline(0),
    line: outline(0.75),
    hair: outline(4.5),
    carving: star({ x: cx, y: 22 }, 9),
    faint: '',
    accent: star({ x: cx, y: 22 }, 2.6),
    inset: { top: Math.ceil(rise * 0.5), inline: 24, bottom: 24 },
    seal: { top: sag(width - sealEnd, cx, cx, rise) + 0.75, end: sealEnd, radius: SEAL },
  }
}

export function doorGeometry(width: number, height: number, frame: DoorFrame): DoorGeometry {
  if (frame === 'arch') return archGeometry(width, height)

  const compact = width < COMPACT_BELOW
  const grand = frame === 'grand'
  // Room above the crown for the keystone, and on the grand door for its crest.
  const top = grand ? 36 : 8
  const cx = width / 2

  const stone: string[] = []
  const line: string[] = []
  const hair: string[] = []
  const carving: string[] = []
  const faint: string[] = []
  const accent: string[] = []

  // The arch over the doorway, with its crown at `top`.
  const side = compact ? COLUMN_MARGIN : COLUMN_MARGIN + COLUMN + COLUMN_GAP
  const rx = cx - side
  const ry = Math.min(rx, rx * 0.42 + 60)
  const spring = top + ry
  const foot = height - THRESHOLD

  const archPoints = (inset: number, steps = 96) => {
    const points: Point[] = []
    for (let i = 0; i <= steps; i++) {
      const t = Math.PI + (i / steps) * Math.PI
      points.push({ x: cx + (rx - inset) * Math.cos(t), y: spring + (ry - inset) * Math.sin(t) })
    }
    return points
  }
  const moulding = (inset: number) =>
    `M${f(side + inset)},${f(foot)}V${f(spring)}A${f(rx - inset)},${f(ry - inset)} 0 0 1 ${f(width - side - inset)},${f(spring)}V${f(foot)}`

  stone.push(`${moulding(OUTER)}Z`)
  const door = `${moulding(INNER_FILLET)}Z`
  line.push(moulding(OUTER), moulding(BAND_INNER))
  hair.push(moulding(OUTER_FILLET), moulding(INNER_FILLET))

  if (grand) {
    // The carved band: leaf and bead running up one jamb, over the arch and
    // down the other, every leaf pointing up towards the keystone.
    const bandPath = [
      { x: side + BAND_MIDDLE, y: foot - 6 },
      ...archPoints(BAND_MIDDLE),
      { x: width - side - BAND_MIDDLE, y: foot - 6 },
    ]
    const bandStops = along(bandPath, 15)
    bandStops.forEach((stop, i) => {
      const towardsKeystone = stop.share <= 0.5 ? stop.angle : stop.angle + Math.PI
      const back = { x: stop.x - Math.cos(towardsKeystone) * 4.5, y: stop.y - Math.sin(towardsKeystone) * 4.5 }
      carving.push(leaf(back, towardsKeystone, 9, 3.2))
      const next = bandStops[i + 1]
      if (next) carving.push(circle({ x: (stop.x + next.x) / 2, y: (stop.y + next.y) / 2 }, 1.1))
    })

    // Fanlight: a frame and spokes from a half-rosette, scalloped between the spoke ends.
    const fanX = rx - INNER_FILLET - 8
    const fanY = ry - INNER_FILLET - 8
    line.push(`M${f(cx - fanX)},${f(spring)}A${f(fanX)},${f(fanY)} 0 0 1 ${f(cx + fanX)},${f(spring)}`)
    const innerX = fanX - 7
    const innerY = fanY - 7
    hair.push(`M${f(cx - innerX)},${f(spring)}A${f(innerX)},${f(innerY)} 0 0 1 ${f(cx + innerX)},${f(spring)}`)
    const rosette = Math.min(30, fanY * 0.32)
    const spokes = 13
    const ends: Point[] = []
    for (let k = 0; k <= spokes + 1; k++) {
      const t = Math.PI + (k / (spokes + 1)) * Math.PI
      const end = { x: cx + innerX * Math.cos(t), y: spring + innerY * Math.sin(t) }
      ends.push(end)
      if (k === 0 || k === spokes + 1) continue
      hair.push(`M${f(cx + (rosette + 4) * Math.cos(t))},${f(spring + (rosette + 4) * Math.sin(t))}L${f(end.x)},${f(end.y)}`)
    }
    for (let k = 1; k < ends.length; k++) {
      const a = ends[k - 1]
      const b = ends[k]
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      hair.push(`M${f(a.x)},${f(a.y)}Q${f(mid.x + (cx - mid.x) * 0.08)},${f(mid.y + (spring - mid.y) * 0.08)} ${f(b.x)},${f(b.y)}`)
    }
    line.push(`M${f(cx - rosette)},${f(spring)}A${f(rosette)},${f(rosette)} 0 0 1 ${f(cx + rosette)},${f(spring)}`)
    hair.push(`M${f(cx - rosette - 4)},${f(spring)}A${f(rosette + 4)},${f(rosette + 4)} 0 0 1 ${f(cx + rosette + 4)},${f(spring)}`)
    for (let k = 0; k < 7; k++) {
      carving.push(leaf({ x: cx, y: spring }, Math.PI + ((k + 0.5) / 7) * Math.PI, rosette * 0.82, rosette * 0.16))
    }
    accent.push(star({ x: cx, y: spring - rosette * 0.42 }, rosette * 0.36))

    // Transom: a beaded bar under the fanlight, spanning the opening.
    const transomX = rx - INNER_FILLET
    line.push(rect(cx - transomX, spring, transomX * 2, 12))
    const beads = Math.floor((transomX * 2 - 8) / 9)
    for (let i = 0; i <= beads; i++) {
      carving.push(circle({ x: cx - transomX + 4 + (i * (transomX * 2 - 8)) / beads, y: spring + 6 }, 2.1))
    }
  }

  // Keystone: a console standing proud of the crown and reaching down into the arch.
  const keyTop = top - 6
  const keyBottom = top + BAND_INNER + 12
  const keyHalfTop = 15
  const keyHalfBottom = 11
  const keystone = `M${f(cx - keyHalfTop)},${f(keyTop)}H${f(cx + keyHalfTop)}L${f(cx + keyHalfBottom)},${f(keyBottom)}H${f(cx - keyHalfBottom)}Z`
  stone.push(keystone)
  line.push(keystone)
  if (grand) {
    carving.push(leaf({ x: cx, y: keyBottom - 9 }, -Math.PI / 2, keyBottom - keyTop - 18, 4.5))
    carving.push(volute({ x: cx - 6, y: keyBottom - 6 }, 4.5, false), volute({ x: cx + 6, y: keyBottom - 6 }, 4.5, true, Math.PI))

    // Crest: a small segmental arch on the keystone, scrolls at its feet and a star at its crown.
    const half = Math.min(56, width * 0.11)
    const crest = `M${f(cx - half)},${f(keyTop)}Q${f(cx)},${f(keyTop - 36)} ${f(cx + half)},${f(keyTop)}Z`
    stone.push(crest)
    line.push(crest)
    hair.push(`M${f(cx - half + 9)},${f(keyTop)}Q${f(cx)},${f(keyTop - 26)} ${f(cx + half - 9)},${f(keyTop)}`)
    carving.push(volute({ x: cx - half - 1, y: keyTop - 6 }, 6, false), volute({ x: cx + half + 1, y: keyTop - 6 }, 6, true, Math.PI))
    accent.push(star({ x: cx, y: keyTop - 9 }, 5.5))
  } else {
    accent.push(star({ x: cx, y: (keyTop + keyBottom) / 2 }, 6))
  }

  // Threshold: two steps under the doorway.
  const steps = [rect(side - 8, foot, width - (side - 8) * 2, 7), rect(side - 16, foot + 7, width - (side - 16) * 2, 9)]
  stone.push(...steps)
  line.push(...steps)

  // The columns rise beside the arch to about half its height, each crowned
  // with a ring: the left one holds the Evenstar, the right one the close seal.
  const capitalTop = spring - ry * 0.55
  const ringCentre = capitalTop - SEAL - 4

  if (!compact) {
    for (const mirror of [false, true]) {
      const x = (value: number) => (mirror ? width - value : value)
      const left = (a: number, b: number) => Math.min(x(a), x(b))
      const x0 = COLUMN_MARGIN
      const middle = x(x0 + COLUMN / 2)

      // Crowning ring, on a small pedestal over the abacus.
      stone.push(circle({ x: middle, y: ringCentre }, SEAL + 1), rect(left(x0 + 8, x0 + COLUMN - 8), ringCentre + SEAL - 2, COLUMN - 16, 6))
      line.push(rect(left(x0 + 8, x0 + COLUMN - 8), ringCentre + SEAL - 2, COLUMN - 16, 6))
      if (!mirror) {
        line.push(circle({ x: middle, y: ringCentre }, SEAL))
        hair.push(circle({ x: middle, y: ringCentre }, SEAL - 3.5))
        accent.push(star({ x: middle, y: ringCentre }, SEAL * 0.55))
      }

      // Capital: abacus and a pair of volutes joined by a curved channel; the grand one adds acanthus.
      const capitalHeight = grand ? 58 : 26
      const capitalFoot = capitalTop + capitalHeight
      stone.push(rect(left(x0 - 4, x0 + COLUMN + 4), capitalTop, COLUMN + 8, capitalHeight + 4))
      line.push(rect(left(x0 - 4, x0 + COLUMN + 4), capitalTop, COLUMN + 8, 7))
      carving.push(
        volute({ x: x(x0 + 4), y: capitalTop + 15 }, 6, !mirror),
        volute({ x: x(x0 + COLUMN - 4), y: capitalTop + 15 }, 6, mirror),
        circle({ x: middle, y: capitalTop + 3.5 }, 2),
      )
      hair.push(`M${f(x(x0 + 4))},${f(capitalTop + 8.5)}Q${f(middle)},${f(capitalTop + 14)} ${f(x(x0 + COLUMN - 4))},${f(capitalTop + 8.5)}`)
      if (grand) {
        ;[30, 22, 15].forEach((length, row) => {
          const count = row % 2 ? 2 : 3
          for (let i = 0; i < count; i++) {
            const spread = count === 3 ? (i - 1) * 12 : (i - 0.5) * 16
            const lean = (spread / 12) * 0.22
            carving.push(leaf({ x: x(x0 + COLUMN / 2 + spread), y: capitalFoot }, -Math.PI / 2 + (mirror ? -lean : lean), length, 4.4 - row * 0.6))
          }
        })
      }
      line.push(rect(left(x0, x0 + COLUMN), capitalFoot, COLUMN, 4))

      // Shaft: an outline with five rounded flutes.
      const shaftTop = capitalFoot + 4
      const baseTop = height - 46
      stone.push(rect(left(x0 + 3, x0 + COLUMN - 3), shaftTop, COLUMN - 6, baseTop - shaftTop))
      line.push(rect(left(x0 + 3, x0 + COLUMN - 3), shaftTop, COLUMN - 6, baseTop - shaftTop))
      const flutes = 5
      const fluteWidth = 3.6
      const fluteGap = (COLUMN - 12 - flutes * fluteWidth) / (flutes - 1)
      const fluteBottom = grand ? baseTop - 46 : baseTop - 8
      for (let i = 0; i < flutes; i++) {
        const start = x0 + 6 + i * (fluteWidth + fluteGap)
        const fx = left(start, start + fluteWidth)
        const r = fluteWidth / 2
        hair.push(`M${f(fx)},${f(shaftTop + 8)}a${f(r)},${f(r)} 0 0 1 ${f(fluteWidth)},0V${f(fluteBottom)}a${f(r)},${f(r)} 0 0 1 ${f(-fluteWidth)},0Z`)
      }
      if (grand) {
        // A leafy drum at the foot of the shaft.
        hair.push(`M${f(x(x0 + 3))},${f(baseTop - 40)}H${f(x(x0 + COLUMN - 3))}`)
        for (let i = 0; i < 3; i++) carving.push(leaf({ x: x(x0 + COLUMN / 2 + (i - 1) * 11), y: baseTop - 3 }, -Math.PI / 2, 30, 4.2))
      }

      // Base: a torus, a fillet and a plinth with a sunk panel.
      const torus = rect(left(x0, x0 + COLUMN), baseTop, COLUMN, 6)
      stone.push(torus, rect(left(x0 - 4, x0 + COLUMN + 4), baseTop + 6, COLUMN + 8, height - baseTop - 6))
      line.push(torus, rect(left(x0 - 4, x0 + COLUMN + 4), baseTop + 12, COLUMN + 8, height - 2 - baseTop - 12))
      hair.push(`M${f(x(x0 + 2))},${f(baseTop + 9)}H${f(x(x0 + COLUMN - 2))}`, rect(left(x0, x0 + COLUMN), baseTop + 16, COLUMN, height - 2 - baseTop - 20))
      if (grand) accent.push(star({ x: middle, y: (baseTop + 12 + height - 2) / 2 }, 5))
    }
  }

  if (grand) {
    // Door leaves behind the content: two panels with rosettes, drawn faintly.
    const panelTop = spring + 26
    const panelBottom = foot - 12
    const innerLeft = side + INNER_FILLET + 12
    const panelWidth = (width - innerLeft * 2 - 10) / 2
    if (panelBottom - panelTop > 60) {
      for (const px of [innerLeft, innerLeft + panelWidth + 10]) {
        faint.push(rect(px, panelTop, panelWidth, panelBottom - panelTop), rect(px + 6, panelTop + 6, panelWidth - 12, panelBottom - panelTop - 12))
        const centre = { x: px + panelWidth / 2, y: (panelTop + panelBottom) / 2 }
        const r = Math.min(20, panelWidth / 4)
        faint.push(circle(centre, r))
        for (let k = 0; k < 8; k++) faint.push(leaf(centre, (k / 8) * Math.PI * 2, r * 0.85, r * 0.2))
      }
    }
  }

  return {
    stone: stone.join(''),
    door,
    line: line.join(''),
    hair: hair.join(''),
    carving: carving.join(''),
    faint: faint.join(''),
    accent: accent.join(''),
    inset: {
      // Under the fanlight on the grand door; on the portal the text rises into the arch, where it is still wide enough.
      top: Math.ceil(grand ? spring + 12 + 18 : spring - (ry - INNER_FILLET) * 0.55),
      inline: Math.ceil(side + INNER_FILLET + 14),
      bottom: THRESHOLD + 18,
    },
    // Without columns the seal sits on the arch's outer line, at its shoulder.
    seal: compact
      ? { top: top + sag(width - side - rx * 0.24, cx, rx, ry), end: side + rx * 0.24, radius: SEAL }
      : { top: ringCentre, end: COLUMN_MARGIN + COLUMN / 2, radius: SEAL },
  }
}
