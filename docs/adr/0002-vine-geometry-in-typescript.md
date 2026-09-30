# 0002. Compute the vine's geometry in TypeScript, lazily

- Status: Accepted
- Date: 2026-09-30

## Context

The `vine` frame grows a golden ivy around a button on hover: two stems
wind around the border like a helix, part in front of the button and part
behind it, and leaves sprout as the stems grow.

A pure CSS version can't do this well. Any fixed drawing stretched over
buttons of different widths distorts: leaves stretch on long labels and
crowd on short ones. The helix also has to be split into stretches in front
of the button and behind it, and each stretch has to start growing exactly
when the stem reaches it.

## Decision

- `vine-geometry.ts` is a pure function that takes the button's size and
  returns the stems (split into front and back stretches, with growth
  timing), the leaves and the tendrils. It uses no DOM, and its randomness
  is seeded from the button's React id.
- `Vine.tsx` measures the button and builds the geometry **on the first
  hover or keyboard focus**, not on render. It then mounts the SVG in its
  bare state and grows it on the next frame, so the growth is a CSS
  transition.
- The stretches behind the button are drawn under its fill, so the fill of
  a `vine` button lives on a pseudo-element rather than the button itself.

## Consequences

- The vine fits any label, and the geometry is covered by unit tests
  (determinism, layering, timing, leaves pointing outward).
- Button needs `'use client'`, and the vine never renders on the server.
  It is invisible at rest, so there is nothing to hydrate.
- A page with many `vine` buttons costs nothing until one is hovered.
- The geometry is measured once per size, so a button that changes size
  while hovered keeps its old vine until the next hover.
