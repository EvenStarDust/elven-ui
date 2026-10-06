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

The library loads no fonts of its own, with one tiny exception: password
fields draw their mask as a gilt star from a ~1 KB font built into
`styles.css` (set `--elven-font-password: var(--elven-font-body)` for the
browser's dots). It is designed for
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
<Input label="Your name" frame="box" labelPlacement="inside" />
<Input label="Secret word" type="password" />
<Input label="Search" type="search" startIcon={<SeeingStoneIcon />} />
<Input label="Rings" type="number" min={0} max={20} />
```

With `labelPlacement="inside"` the label rests in the empty field and rises
onto the line, or into a gap in the frame, letter by letter, on focus or once
the field has a value.

Every native `type` works. `password` gets a show/hide button and masks what
is typed with gilt stars, `search` a clear button and `number`
decrease/increase buttons; `controls={false}` turns the buttons off.
`className` and `style` go on the wrapper, everything else on the `<input>`.

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

## Dialog

A modal shaped as a gilt-engraved door. The dialog has no box of its own: it
takes the shape of the door, and the page shows between its parts. Its
engraving is lit from the threshold up as it opens, and the close seal, a
pair of crossed swords, crowns the end column.

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Answer the summons</Button>
  </DialogTrigger>
  <DialogContent frame="portal" size="md">
    <DialogTitle>The Council of Elrond</DialogTitle>
    <DialogDescription>Who will carry the burden south?</DialogDescription>
    <DialogClose asChild>
      <Button>I will take it</Button>
    </DialogClose>
  </DialogContent>
</Dialog>
```

`frame` picks the door: `arch`, a plain arched panel that leaves the most room
for content; `portal`, an arched doorway between fluted columns (the default);
or `grand`, the portal carved, with a fanlight, a crest and panelled leaves.
Narrow screens leave out the columns. It is a Radix Dialog underneath: focus
moves in and is kept there, Escape closes it and focus returns to the trigger.
It takes the theme of its trigger into the portal. Control it with `open` and
`onOpenChange`, and translate the seal's name with `closeLabel`.

## Tooltip

A short note in ink with a gilt edge and a gilt clasp pointing at its
trigger. It opens on hover after a short delay and at once on keyboard focus,
and closes with Escape.

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" aria-label="Write a letter"><QuillIcon /></Button>
  </TooltipTrigger>
  <TooltipContent side="top">Write a letter</TooltipContent>
</Tooltip>
```

A tip only adds to its trigger, so an icon-only trigger still needs its own
`aria-label`. Wrap a group of tooltips (or the whole app) in
`TooltipProvider` so that once one tip has opened, the next opens without
waiting. The tip takes the theme of its trigger into the portal.

## Icons

A set of 56 icons in the same old-world style: thin outlines that take the
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
