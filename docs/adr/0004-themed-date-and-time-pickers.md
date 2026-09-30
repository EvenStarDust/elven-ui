# 0004. Our own date and time pickers, on a read-only field

- Status: Accepted
- Date: 2026-09-30

## Context

`<input type="date">` and `<input type="time">` open a picker that belongs
to the browser. Its colors, fonts and shape cannot be changed with CSS, so
in a themed form it is the one thing that looks like it came from somewhere
else. The only way to theme it is to build the picker ourselves.

## Decision

- `DatePicker` and `TimePicker` are separate components. `Input` keeps
  passing `date` and `time` through to the browser for those who want the
  native behaviour.
- The field is our `Input`, read-only, with a button that opens the picker
  (the "date picker dialog" pattern). Clicking the field or pressing the
  down arrow also opens it. The field is not typed into.
- The popup is a Radix Popover. It is rendered in a portal at the end of
  `<body>`, outside any `data-elven-theme` ancestor, so the picker copies
  the field's theme onto the popover when it opens.
- Values are plain strings, as with the native inputs: `YYYY-MM-DD` and
  `HH:MM`. A hidden input submits them with forms.
- There is no date library. Month grids are built with `Date`, and every
  name comes from `Intl.DateTimeFormat`. All text is English by default
  (`locale="en-GB"` and English labels), so nothing is half translated;
  `locale` and `labels` localise it together.
- The calendar has three pages (days, months, years), each a grid with one
  cell in the tab order and arrow-key movement.
- The parchment keeps its full size from the moment it appears. Unrolling
  is drawn by revealing the page with `clip-path` while a curtain of the
  same height slides down with the lower roll on its edge.

## Consequences

- The pickers look like the rest of the library and are fully keyboard
  operable, with tests for every key.
- A date cannot be typed by hand yet. People who know the date must still
  pick it; typing can be added later by parsing the locale's format.
- An earlier version animated the height of the page (`grid-template-rows`
  from `0fr` to `1fr`). The lower roll drifted away from the page's edge
  mid-animation and focus inside scrolled the half-open page, which is why
  the size is now fixed and only painting is animated.
- `@radix-ui/react-popover` is a new dependency. Tooltip and Dialog will
  share most of what it brings in.
- The manuscript look wants two more fonts (Uncial Antiqua, IM Fell
  English). The library still loads none; without them it falls back to
  the display font.
