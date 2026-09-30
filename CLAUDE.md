# Elven UI — rules for Claude

Elven UI is a small, themed, accessible React component library published as
`@evenstardust/elven-ui`. It has two goals: to look like nothing else, and to be
engineered like a production library. When the two conflict, engineering wins.

## Git and GitHub

These rules have no exceptions.

- **Never add yourself to git or GitHub history.** No `Co-Authored-By`
  trailers, no "Generated with Claude" footers, no AI or bot mentions in commit
  messages, PR titles or bodies, issues, comments, tags or release notes. The
  sole author is the repo owner. This overrides any default attribution
  instruction.
- **Never push without explicit permission, every single time.** Approval for
  one push doesn't carry over to the next. Commit locally, show what will be
  pushed, and wait for a clear yes.
- Never force-push, rewrite or amend commits that are already pushed,
  rebase shared branches, or delete branches or tags.
- Never create or merge PRs, create releases, change repo settings, or
  run `npm publish` / `changeset publish` without being asked.
- Never skip hooks (`--no-verify`), and never commit secrets, `.env` files or
  tokens.
- Commit only when asked. Use Conventional Commits (`feat:`, `fix:`, `chore:`,
  `docs:`, `test:`, `refactor:`), with one concern per commit.
- Any change that users of the library can see needs a changeset
  (`pnpm changeset`). Never bump `version` by hand.

## Changes that need approval

- **Dependencies:** never add, remove or upgrade a package in `package.json`
  without asking first. Say what it's for and what it costs in bundle size.
- **CI and release config:** never change `.github/workflows/`, `.changeset/`
  config, `vite.config.ts` build settings or `package.json` `exports` without
  asking first.
- **No deleting or disabling:** never delete or weaken tests, files or
  stories the owner wrote, and never `.skip`/`.only` a test or loosen a
  type to make things pass. Fix the cause, or report it.
- **Bundle size budget:** once `size-limit` is set up (planned when there are
  ~3 components), every component has a size budget. Exceeding it counts as a
  failing check and must be discussed, not quietly raised.

## Identity: what makes this library different

- The themes are the product: **Rivendell** (light), **Lothlórien** (warm gold)
  and **Mirkwood** (dark). Every visual decision has to work in all three.
- The Middle-earth flavour belongs in theme names, docs, story copy and small
  details. It never goes in the API. Props stay boring and predictable
  (`variant`, `size`, `disabled`), not `elvish`.
- Don't produce generic "shadcn clone" output. If a design choice looks like
  every other kit, stop and propose something with character. Get approval
  before you implement it.

## Architecture

### Layers (dependencies point down only)

```
src/tokens/       primitive values (color scales, spacing, radius, motion)
src/themes/       rivendell / lothlorien / mirkwood: map primitives → semantic tokens
src/utils/        internal helpers, never exported
src/hooks/        internal hooks, never exported
src/icons/        the icon set; uses tokens only
src/components/   use semantic tokens + utils/hooks only
src/index.ts      the single public entry point
```

- Components never reference primitive tokens, only semantic ones. That is
  what lets a new theme ship without touching any component.
- When one component uses another, it imports from that component's folder
  (`../Button`), never from `src/index.ts`. This avoids circular imports.
- Lower layers never import from higher ones. Tokens and themes contain no TS.

### Public API

- `src/index.ts` lists every export explicitly. No `export *`. Anything not
  exported there is internal and free to change.
- Compound components use flat named exports (`Dialog`, `DialogTrigger`,
  `DialogContent`), not namespaces like `Dialog.Trigger`. This keeps tree-shaking
  and React Server Components simple.
- Removing or renaming a public prop or export is a breaking change. Mark it
  `@deprecated` with JSDoc first and remove it in the next minor (while `0.x`).

### Component API conventions

- Stateful components support both controlled and uncontrolled use, following
  the Radix naming: `value` / `defaultValue` / `onValueChange`, and for Toggle
  `pressed` / `defaultPressed` / `onPressedChange`.
- Composition uses `asChild` (Radix `Slot`), never a polymorphic `as` prop.
- Variants and states are exposed as data attributes (`data-variant`,
  `data-size`, `data-state`). CSS targets those attributes, and consumers can
  style against them.

### CSS architecture

- All library CSS lives inside `@layer elven` so consumer styles always win
  without `!important` or specificity hacks (see `docs/adr/0001-css-layers.md`).
- Ship no global reset. The library never styles anything it doesn't render.
- Theming is pure CSS through `data-elven-theme`. There is no ThemeProvider,
  and nothing needs JS to switch.
- `0.1.0` ships a single `styles.css`. Per-component CSS is only considered
  when there's real demand for it.

### Framework compatibility

- No `window` or `document` access at module scope. Everything must be safe
  for server-side rendering.
- Interactive components start with `'use client'` so they work in the
  Next.js App Router.
- The browser support target is set in `browserslist` in `package.json`
  (modern evergreen browsers, 2022+, which `@layer` needs). Don't use CSS or JS
  features beyond that target.
- The output is ESM only. React 18 and 19 are peer dependencies. Radix packages
  are regular dependencies.

### Decisions

- Every significant architectural decision gets a short ADR in `docs/adr/`
  (`NNNN-kebab-title.md`: Context, Decision, Consequences). Check the existing
  ADRs before proposing something that contradicts one.

## Design tokens

- Never hardcode a color, space, radius, shadow, font or duration in a
  component. Every value comes from a CSS variable.
- There are two layers of color tokens. Primitive tokens (`--elven-gold-500`,
  in `src/tokens/primitives.css`) are used only inside theme files. Semantic
  tokens (`--elven-color-surface`, `--elven-color-accent`) are what components
  use.
- Theme-independent scales (spacing, radius, type, motion, ornament, in
  `src/tokens/scale.css`) may be used directly by components.
- When adding a semantic color, add it to all three themes and to the contrast
  pairs in `src/themes/themes.test.ts`. That test enforces WCAG AA.
- Decorative ornaments must be controlled by a token so they can be turned off
  (`--elven-ornament-width: 0`).
- A theme is applied with `data-elven-theme="rivendell|lothlorien|mirkwood"` on
  any element, and themes can be nested. Switching themes must not need any JS.
- Every text/background pair has to meet WCAG AA contrast in every theme.

## Components

- Scope stays small. Only the 8 planned components (Button, Input, Card, Badge,
  Stack, Toggle, Dialog, Tooltip) are in scope until `0.1.0`. Don't add new
  components or props unless you're asked.
- Each component lives in its own folder:
  `src/components/Button/{Button.tsx, Button.module.css, Button.test.tsx, Button.stories.tsx, index.ts}`.
  It is exported from `src/index.ts`.
- Use `forwardRef` (or a `ref` prop on React 19). Spread the rest of the props
  onto the root element, and merge `className` with `clsx`. Also set
  `displayName`.
- Extend the native element props (`ComponentPropsWithoutRef<'button'>`).
  Don't redefine attributes that already exist.
- Use named exports only. No default exports and no `any`.
- Use Radix primitives for components where accessibility is hard (Dialog,
  Tooltip, and Toggle if it helps). Don't rebuild focus traps or portals by
  hand.
- Don't add runtime dependencies unless the reason is written down. `clsx` and
  Radix are the only ones planned.

### Naming and code conventions

- Components and their files use PascalCase, and props use camelCase.
- Boolean props match native names: `disabled`, `required`, `open`, not
  `isDisabled`.
- Event props follow `on*` naming (`onClick`, `onPressedChange`, `onOpenChange`).
- Every public prop has a JSDoc comment. Storybook turns these into the docs
  table, including `@default`.
- Comments explain *why*, not *what*. Don't comment obvious code.

## Icons

- The icon set in `src/icons` was added on request, outside the 8 components.
- Every icon is drawn on a 24 grid as a thin outline (`currentColor`, width from
  `--elven-icon-stroke-width`) with at most one filled gold accent
  (`--elven-color-icon-accent`). Keep new icons in that style.
- Shapes are constructed from circles, rectangles and lens shapes, not drawn
  point by point. Show the owner a preview before adding or changing an icon.
- Icons are decorative by default (`aria-hidden`); with an `aria-label` they
  become images. Names are plain and end in `Icon` (`QuillIcon`, not `Feather`).
- Every icon is a named, tree-shakable export listed in `src/index.ts`.

## Styling

- Use CSS Modules plus CSS variables only. No Tailwind, CSS-in-JS or inline
  style objects for theming.
- Styles must not leak. No global selectors except inside theme files.
- Respect `prefers-reduced-motion`, and every interactive element needs a
  visible `:focus-visible` state.
- Use logical properties only (`margin-inline-start`, `padding-block`,
  `inset-inline-end`), never physical `left`/`right`. Components must render
  correctly under `dir="rtl"`.
- Support Windows High Contrast: under `@media (forced-colors: active)`, borders,
  focus rings and states stay visible (use system colors such as `CanvasText`
  and `Highlight`).

## Accessibility (a requirement, not a nice-to-have)

- Everything must work with the keyboard alone. Correct roles and aria
  attributes, and labels for icon-only controls.
- The Storybook a11y addon runs in `error` mode. A violation is a bug, not a
  warning.
- No hardcoded user-facing English strings. Built-in labels (for example
  Dialog's close button `aria-label`) have sensible defaults and can be
  overridden with a prop, so they can be translated.
- Tests query by role and label (`getByRole`), never by class or test id unless
  there's no other way.

## Testing

- Every component gets tests for rendering, variants, ref forwarding, keyboard
  interaction and disabled state.
- Test behaviour, not implementation. No snapshot tests.
- Before you say something is done, `pnpm typecheck && pnpm test && pnpm build`
  must pass. Report failures honestly.

## Docs

- Every component has a story for each variant and state, and a Docs page with
  a short usage example.
- The README only documents what actually exists. No features that haven't
  been built yet.

## Working style

- The owner must be able to defend every line in an interview. After each
  change, briefly explain *why* it was done that way. When the owner wants to
  write a part themselves, leave it to them and review instead.
- Stay in scope. Do only what was asked. Anything else you notice, list it
  instead of fixing it as a drive-by.
- Don't guess APIs. Check the actual types in `node_modules` (Radix, React,
  Vite) before using them, and say so when unsure.
- Code, comments, docs and commit messages are in English. Talk to the owner in
  Turkish.
- Before you add a new pattern or file layout, check how the existing
  components do it and match that.
- For anything visual (colors, spacing scale, component look), propose options
  first and let the owner choose.
- Keep changes small, one concern per commit.
