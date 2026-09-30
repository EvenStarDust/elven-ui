# 0001. Ship all library styles inside `@layer elven`

- Status: Accepted
- Date: 2026-09-30

## Context

Consumers of a component library always end up customising it. With plain
CSS Modules, the library's selectors compete with the consumer's selectors on
specificity and source order. The outcome depends on bundler import order,
which leads to `!important`, doubled class selectors, or wrapper hacks.

Cascade layers (`@layer`) give styles in a named layer lower priority than
any unlayered styles, whatever their specificity. All evergreen browsers
support them.

## Decision

All CSS that Elven UI ships (theme variables and component CSS Modules) is
wrapped in `@layer elven`. Inside it, sub-layers set the internal order:

```css
@layer elven.themes, elven.components;
```

Consumer CSS that isn't in a layer overrides library styles automatically.
Consumers who use layers themselves can position `elven` wherever they want.

## Consequences

- A simple `.my-button { background: … }` beats any library selector, with no
  specificity tricks needed.
- Library selectors can stay simple, since we don't need to guard against
  being overridden.
- Browsers without `@layer` support (older than 2022) are not supported.
- Consumers who put their own styles inside a layer declared *before*
  `elven` will lose to the library. The docs have to explain this.
