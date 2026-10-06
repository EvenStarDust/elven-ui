// Builds "Elven Mask", a one-glyph font that draws password masks as the
// Evenstar, and writes it into src/tokens/mask-font.css as a data URI.
// Browsers mask password fields with U+2022 (Chrome, Safari) or U+25CF
// (Firefox), drawn in the field's own font, so mapping both to the star is
// all it takes. See docs/adr/0005-password-mask-font.md.
//
// Plain Node, no dependencies: run `node scripts/build-mask-font.mjs`.
import { writeFileSync } from 'node:fs'

const UNITS_PER_EM = 1000
const ASCENT = 800
const DESCENT = 200
const MASK_CHARACTERS = [0x2022, 0x25cf]

// The Evenstar of the icon set (EvenstarIcon): a four-pointed star whose
// inner corners sit 0.24 of the radius from the centre. Here it is centred
// on the middle of a lowercase letter, so it lines up like a bullet.
const ADVANCE = 760
const CENTER_X = ADVANCE / 2
const CENTER_Y = 290
const RADIUS = 270
const INNER = Math.round(RADIUS * (2.3 / 9.6))

// Clockwise from the top point, as TrueType expects for a filled outline.
const STAR = [
  [CENTER_X, CENTER_Y + RADIUS],
  [CENTER_X + INNER, CENTER_Y + INNER],
  [CENTER_X + RADIUS, CENTER_Y],
  [CENTER_X + INNER, CENTER_Y - INNER],
  [CENTER_X, CENTER_Y - RADIUS],
  [CENTER_X - INNER, CENTER_Y - INNER],
  [CENTER_X - RADIUS, CENTER_Y],
  [CENTER_X - INNER, CENTER_Y + INNER],
]
const X_MIN = CENTER_X - RADIUS
const X_MAX = CENTER_X + RADIUS
const Y_MIN = CENTER_Y - RADIUS
const Y_MAX = CENTER_Y + RADIUS

class Writer {
  bytes = []
  u8(value) {
    this.bytes.push(value & 0xff)
    return this
  }
  u16(value) {
    return this.u8(value >> 8).u8(value)
  }
  i16(value) {
    return this.u16(value < 0 ? value + 0x10000 : value)
  }
  u32(value) {
    return this.u16(value >>> 16).u16(value & 0xffff)
  }
  tag(text) {
    for (const char of text) this.u8(char.charCodeAt(0))
    return this
  }
  pad(alignment) {
    while (this.bytes.length % alignment) this.u8(0)
    return this
  }
}

const table = (build) => {
  const writer = new Writer()
  build(writer)
  return writer.bytes
}

// Glyph 0 is the required, empty .notdef; glyph 1 is the star.
const glyph = table((w) => {
  w.i16(1).i16(X_MIN).i16(Y_MIN).i16(X_MAX).i16(Y_MAX)
  w.u16(STAR.length - 1) // last point of the only contour
  w.u16(0) // no hinting instructions
  for (let i = 0; i < STAR.length; i++) w.u8(0x01) // every point on the curve: straight edges
  // Coordinates are stored as differences from the previous point, x and y apart.
  STAR.forEach(([x], i) => w.i16(x - (i ? STAR[i - 1][0] : 0)))
  STAR.forEach(([, y], i) => w.i16(y - (i ? STAR[i - 1][1] : 0)))
  w.pad(4)
})

const tables = {
  'OS/2': table((w) => {
    w.u16(4).i16(ADVANCE).u16(400).u16(5).u16(0) // version, average width, regular weight, normal width, installable
    w.i16(650).i16(600).i16(0).i16(75).i16(650).i16(600).i16(0).i16(350) // sub- and superscript boxes
    w.i16(50).i16(CENTER_Y) // strikeout
    w.i16(0) // family class
    for (let i = 0; i < 10; i++) w.u8(0) // panose
    w.u32(0).u32(0).u32(0).u32(0) // unicode ranges
    w.tag('NONE')
    w.u16(0x40) // regular
    w.u16(Math.min(...MASK_CHARACTERS)).u16(Math.max(...MASK_CHARACTERS))
    w.i16(ASCENT).i16(-DESCENT).i16(0) // typographic metrics
    w.u16(ASCENT).u16(DESCENT)
    w.u32(1).u32(0) // code pages: Latin 1
    w.i16(500).i16(700).u16(0).u16(0x20).u16(1) // x-height, cap height, default and break characters, context
  }),
  cmap: table((w) => {
    const segments = [...MASK_CHARACTERS.map((code) => [code, code, (1 - code + 0x10000) % 0x10000]), [0xffff, 0xffff, 1]]
    const count = segments.length
    const searchRange = 2 ** Math.floor(Math.log2(count)) * 2
    w.u16(0).u16(1) // version, one encoding
    w.u16(3).u16(1).u32(12) // Windows, Unicode BMP
    w.u16(4).u16(16 + count * 8).u16(0) // format 4, length, language
    w.u16(count * 2).u16(searchRange).u16(Math.log2(searchRange / 2)).u16(count * 2 - searchRange)
    for (const [, end] of segments) w.u16(end)
    w.u16(0)
    for (const [start] of segments) w.u16(start)
    for (const [, , delta] of segments) w.u16(delta)
    for (let i = 0; i < count; i++) w.u16(0)
  }),
  glyf: glyph,
  head: table((w) => {
    w.u32(0x00010000).u32(0x00010000).u32(0) // version, revision, checksum adjustment (filled in below)
    w.u32(0x5f0f3cf5).u16(0x000b).u16(UNITS_PER_EM)
    w.u32(0).u32(0).u32(0).u32(0) // created, modified
    w.i16(X_MIN).i16(Y_MIN).i16(X_MAX).i16(Y_MAX)
    w.u16(0).u16(8).i16(2).i16(0).i16(0) // style, smallest size, direction, short loca, glyph format
  }),
  hhea: table((w) => {
    w.u32(0x00010000).i16(ASCENT).i16(-DESCENT).i16(0)
    w.u16(ADVANCE).i16(0).i16(ADVANCE - X_MAX).i16(X_MAX)
    w.i16(1).i16(0).i16(0) // upright caret
    w.i16(0).i16(0).i16(0).i16(0).i16(0) // reserved, metric data format
    w.u16(2)
  }),
  hmtx: table((w) => {
    w.u16(ADVANCE).i16(0) // .notdef
    w.u16(ADVANCE).i16(X_MIN)
  }),
  loca: table((w) => {
    w.u16(0).u16(0).u16(glyph.length / 2)
  }),
  maxp: table((w) => {
    w.u32(0x00010000).u16(2).u16(STAR.length).u16(1)
    w.u16(0).u16(0).u16(2) // no composites, two zones
    for (let i = 0; i < 8; i++) w.u16(0)
  }),
  name: table((w) => {
    const names = [
      [1, 'Elven Mask'],
      [2, 'Regular'],
      [3, 'Elven Mask Regular'],
      [4, 'Elven Mask'],
      [6, 'ElvenMask-Regular'],
    ]
    const encoded = names.map(([id, text]) => [id, [...text].flatMap((char) => [0, char.charCodeAt(0)])])
    w.u16(0).u16(names.length).u16(6 + names.length * 12)
    let offset = 0
    for (const [id, bytes] of encoded) {
      w.u16(3).u16(1).u16(0x409).u16(id).u16(bytes.length).u16(offset)
      offset += bytes.length
    }
    for (const [, bytes] of encoded) for (const byte of bytes) w.u8(byte)
  }),
  post: table((w) => {
    w.u32(0x00030000).u32(0).i16(-100).i16(50)
    w.u32(0).u32(0).u32(0).u32(0).u32(0)
  }),
}

const checksum = (bytes) => {
  let sum = 0
  for (let i = 0; i < bytes.length; i += 4) {
    sum = (sum + ((bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | (bytes[i + 3] ?? 0))) >>> 0
  }
  return sum
}

const tags = Object.keys(tables).sort()
const font = new Writer()
const searchRange = 2 ** Math.floor(Math.log2(tags.length)) * 16
font.u32(0x00010000).u16(tags.length).u16(searchRange).u16(Math.log2(searchRange / 16)).u16(tags.length * 16 - searchRange)
// Each table starts on a 4-byte boundary; the padding isn't part of its length.
const padded = (bytes) => [...bytes, ...Array((4 - (bytes.length % 4)) % 4).fill(0)]
let offset = 12 + tags.length * 16
const offsets = {}
for (const tag of tags) {
  const bytes = tables[tag]
  offsets[tag] = offset
  font.tag(tag).u32(checksum(padded(bytes))).u32(offset).u32(bytes.length)
  offset += padded(bytes).length
}
for (const tag of tags) font.bytes.push(...padded(tables[tag]))

const headOffset = offsets.head
const adjustment = (0xb1b0afba - checksum(font.bytes) + 0x100000000) % 0x100000000
font.bytes.splice(headOffset + 8, 4, adjustment >>> 24, (adjustment >>> 16) & 0xff, (adjustment >>> 8) & 0xff, adjustment & 0xff)

const base64 = Buffer.from(font.bytes).toString('base64')
const css = `/*
 * Generated by scripts/build-mask-font.mjs. Do not edit by hand.
 *
 * "Elven Mask" draws password masks as the Evenstar. It only covers the two
 * characters browsers mask passwords with, so nothing else ever uses it.
 * See docs/adr/0005-password-mask-font.md.
 */
@font-face {
  font-family: 'Elven Mask';
  font-display: block;
  src: url(data:font/ttf;base64,${base64}) format('truetype');
  unicode-range: ${MASK_CHARACTERS.map((code) => `U+${code.toString(16).toUpperCase()}`).join(', ')};
}
`
writeFileSync(new URL('../src/tokens/mask-font.css', import.meta.url), css)
console.log(`Elven Mask: ${font.bytes.length} bytes, ${base64.length} as base64`)
