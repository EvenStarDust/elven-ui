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
(weights 500, 600 and 700) and falls back to system serifs without it.

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

## Input

A text field written on a ruled line, with its label, hint and error built
in. On focus the line turns to gold and a light runs along it.

```tsx
<Input label="Your name" hint="As written in the Red Book" />
<Input label="Your name" frame="box" error="The doors stay shut" />
<Input label="Secret word" type="password" />
<Input label="Search" type="search" startIcon={<SeeingStoneIcon />} />
<Input label="Rings" type="number" min={0} max={20} />
```

Every native `type` works. `password` gets a show/hide button, `search` a
clear button and `number` decrease/increase buttons; `controls={false}` turns
them off. `className` and `style` go on the wrapper, everything else on the
`<input>`.

## DatePicker and TimePicker

The browser's own date and time pickers cannot be themed, so these unroll
their own: a page of a medieval calendar on a scroll of parchment.

```tsx
<DatePicker label="Day of the council" defaultValue="2026-09-30" />
<DatePicker label="Day" min="2026-09-10" max="2026-10-05" numerals="roman" />
<TimePicker label="Hour of departure" defaultValue="09:30" minuteStep={15} />
```

Values are strings like the native inputs' (`YYYY-MM-DD`, `HH:MM`), reported
through `onValueChange` and submitted with forms under `name`. Click the month
to choose among months and years. Arrow keys move between days, Page Up and
Page Down between months. Everything is English by default; pass `locale` and
`labels` together to localise. For the manuscript look, load Uncial Antiqua
and IM Fell English alongside Cormorant Garamond.

## Icons

A set of 55 icons in the same old-world style: thin outlines that take the
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
