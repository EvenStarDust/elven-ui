# 0006. One output file per source module

- Status: Accepted
- Date: 2026-10-06

## Context

The build bundled the whole library into a single `dist/index.js`. Inside
one file a bundler can only drop code it can prove has no side effects,
and statements such as `Button.displayName = 'Button'` or a `forwardRef()`
call aren't provably pure. Measured with size-limit, importing a single
icon pulled in 30.7 kB (minified, brotli), nearly the whole library
including Radix Popover.

The single file also needed a `'use client'` banner on top, because
bundling drops per-file directives. That made every export client code in
React Server Components, icons included.

## Decision

- The build keeps one output file per source file (Rollup's
  `preserveModules`, rooted at `src`). `sideEffects` in `package.json`
  already marks only CSS as having side effects, so bundlers drop whole
  files a consumer doesn't reach.
- Each file keeps its own `'use client'` directive, so only interactive
  components are client code. The banner is gone.
- The public entry and `exports` don't change: `dist/index.js` and a
  single `styles.css`.

## Consequences

- A single icon now costs 0.6 kB, `Input` 2.2 kB and `Button` 6 kB.
- `dist` holds many small files instead of one. Only `exports` is public,
  so the file layout stays free to change.
- Size budgets per component (size-limit) become meaningful, and guard
  against a change that breaks tree-shaking again.
