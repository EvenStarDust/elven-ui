# 0003. Two mechanisms for click effects

- Status: Accepted
- Date: 2026-09-30

## Context

Button has six click effects. Four of them (`ripple`, `stardust`, `leaves`,
`velvet`) are particles drawn at the point of the click. Two of them (`bow`,
`signature`) animate something that already exists: the button itself, or a
flourish under its label. Rapid clicks must never lag the press, stack up
without limit, or leave stale elements behind.

## Decision

- **Particle effects are short-lived React state.** Each click adds a burst
  with the click position and a seed; it renders its particles with CSS
  keyframes and is removed by a timer once the slowest one has finished.
  Bursts that must stay inside the button are marked `data-burst="contained"`
  so ornate frames can cut them to their own shape.
- **`bow` and `signature` use the Web Animations API** on the existing
  element. Calling `animate()` again simply starts a new animation, so rapid
  clicks restart them cleanly without re-rendering.
- Effects start on `pointerdown` (primary button only), not on `click`, so
  they never trail the press. Keyboard clicks are detected by
  `event.detail === 0` and play from the center.
- Nothing plays under `prefers-reduced-motion`, while loading, or by
  default on the `vine` and `gate` frames, which already animate on hover.

## Consequences

- Particles work with server rendering (they only exist after a click) and
  can be tested with fake timers.
- Click positions are converted to the button's own CSS pixels, so effects
  land in the right place even inside zoomed or scaled containers.
- A new particle effect needs a burst component and its keyframes. A new
  effect that animates an existing element needs only an `animate()` call.
