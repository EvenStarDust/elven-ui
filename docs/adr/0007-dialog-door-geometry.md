# 0007. The dialog is drawn as a door, measured and computed

- Status: Accepted
- Date: 2026-10-06

## Context

The dialog is shaped as an engraved door: an arch, or an arched doorway
between columns with mouldings, a keystone, and for the grand frame a
fanlight, a leaf band and a crest. There is no box around it; the page
shows between the columns and the arch.

A fixed drawing stretched over dialogs of different sizes distorts: leaves
and beads stretch, dentils and flutes change spacing, and lines thicken.
Placing ornaments by hand at a few sizes looked careless at every other
size. CSS alone can draw an arch (`border-radius`) but not carving that
follows it.

## Decision

- `door-geometry.ts` is a pure function of the door's width, height and
  frame. It returns SVG path data grouped by how it is painted (stone, door,
  lines, hairlines, carving, faint panels, accents), the room the content
  must keep, and where the close seal sits. It uses no DOM.
- Repeated carving is placed by arc length along its path, with a whole
  number of steps, so a band ends exactly where it starts on the other side
  and keeps its spacing at any size. Everything is symmetric.
- `DialogContent` measures its own box (ResizeObserver, before paint) and
  draws the SVG at exactly that size, behind the content. The insets are
  handed back as custom properties for the padding, so the text always sits
  inside the doorway.
- Below 400px wide the columns are left out. In right-to-left the drawing is
  mirrored, so the seal's ring follows the seal.
- The close seal draws the two swords of `CrossedSwordsIcon` as separate
  groups, from path strings the icon is built from, so they can swing on
  hover. They are plain strings so bundlers can drop them when unused.
- The overlay holds the content and scrolls, so a tall dialog never cuts
  through the arch.

## Consequences

- The door looks drawn for its size at every size and in every theme; the
  colors come from the theme's tokens.
- The first paint of an open dialog waits for one measurement, done in a
  layout effect so it is never seen undrawn.
- Clicks on the transparent gaps between the columns and the arch land on
  the dialog, so they do not dismiss it.
- Changing the door means changing the geometry function; its tests check
  the insets, the seal and what each frame includes.
