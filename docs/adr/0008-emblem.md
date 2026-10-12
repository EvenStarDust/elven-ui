# 0008. Emblem: a large stitched patch, after 0.1.0

- Status: Proposed
- Date: 2026-10-12

## Context

Embroidered merit patches (a shaped cloth patch with a stitched edge, an
emblem, a number and a title) suit the library's old-world look, for
achievements, ranks or titles. `Badge` already borrows their stitching and
outlines, but it is a one-line label that sits in text: it has no room for
an icon, a number or a second line, and adding those would turn its small,
predictable API into a layout component.

## Decision

- Patches become a separate component, `Emblem`, not more `Badge` props.
- It is built only after `0.1.0`, since it is outside the eight planned
  components.
- Sketch of the API, to be confirmed with previews before building:
  `shape` (shared with `Badge`: `shield`, `round`, `scalloped`, plus larger
  outlines), `variant` and `appearance` as on `Badge`, an `icon` slot for an
  icon from the set, an optional `count` and the title as `children`.
- Designs are our own, in the Middle-earth style of the icon set; outside
  references are only used for the general idea of a stitched patch.

## Consequences

- `Badge` stays small and inline.
- `Emblem` can reuse the Badge outlines and stitching. Whether that means a
  shared internal stylesheet or duplicated rules is decided when it is built.
- Curved text along the edge would need SVG `textPath` and is not part of
  the first version.
