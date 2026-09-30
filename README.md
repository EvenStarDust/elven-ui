# Elven UI

A Middle-earth themed, accessible React component library that looks like an
old film: parchment, sepia ink, gilt frames and gold leaf.

> 🚧 Work in progress. `0.1.0` is on the way.

## Themes

Themes are plain CSS. Set `data-elven-theme` on any element, and themes can be
nested.

- **Rivendell** (default): late autumn, warm ivory parchment and weathered rust
- **Lothlórien**: sunlit parchment and gold leaf
- **Mirkwood**: dark, ink black and firelight amber

Every text color meets WCAG AA contrast in every theme, and a test enforces it.

## Usage

```tsx
import '@evenstardust/elven-ui/styles.css'
import { Button } from '@evenstardust/elven-ui'

export function App() {
  return (
    <main data-elven-theme="lothlorien">
      <Button>Enter Imladris</Button>
    </main>
  )
}
```

All library styles live in the `elven` cascade layer, so your own CSS always
wins without `!important`.

The library loads no fonts. It is designed for
[Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond)
(weights 500 and 600) and falls back to system serifs without it.

## Button

```tsx
<Button variant="secondary" size="lg">Ask Elrond</Button>
<Button frame="vine">Walk in Lórien</Button>
<Button clickEffect="stardust">Make a wish</Button>
<Button loading>Send</Button>
<Button asChild><a href="/rivendell">Enter Imladris</a></Button>
```

| Prop          | Values                                                                | Default     |
| ------------- | --------------------------------------------------------------------- | ----------- |
| `variant`     | `primary` `secondary` `ghost` `danger`                                | `primary`   |
| `size`        | `sm` `md` `lg`                                                        | `md`        |
| `frame`       | `scooped` `pointed` `simple` `none` `vine` `gate`                     | `scooped`   |
| `vineLeaves`  | `mixed` `green` `gold`                                                | `mixed`     |
| `clickEffect` | `ripple` `stardust` `leaves` `signature` `bow` `velvet` `none`        | `ripple`, or `none` on `vine` and `gate` |
| `loading`     | `boolean`                                                             | `false`     |
| `loadingLabel`| `string`, announced while loading                                     | `'Loading'` |
| `asChild`     | `boolean`, renders the child element (such as a link) as the button   | `false`     |

Every animation respects `prefers-reduced-motion`.

## Icons

A set of 23 icons in the same old-world style: thin outlines that take the
text color, each with one gold detail from the theme.

```tsx
import { QuillIcon, CloseIcon } from '@evenstardust/elven-ui'

<Button><QuillIcon /> Sign the letter</Button>
<Button variant="ghost" aria-label="Close"><CloseIcon /></Button>
<QuillIcon size={32} aria-label="Write a letter" />
```

Icons are `1em` by default and decorative (`aria-hidden`). Give an icon an
`aria-label` when it stands on its own. Unused icons are tree-shaken away.

## Development

```bash
pnpm install
pnpm storybook   # component playground
pnpm test        # unit tests
pnpm build       # library build → dist/
```

Architecture decisions are recorded in [`docs/adr`](docs/adr).

## License

MIT
