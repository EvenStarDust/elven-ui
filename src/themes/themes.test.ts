import { readFileSync } from 'node:fs'

const THEMES = ['rivendell', 'lothlorien', 'mirkwood'] as const

const readCss = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8')

/** Collects `--name: value;` declarations, ignoring comments. */
function parseDeclarations(css: string): Map<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const declarations = new Map<string, string>()
  for (const [, name, value] of withoutComments.matchAll(/(--elven-[\w-]+)\s*:\s*([^;]+);/g)) {
    declarations.set(name, value.trim())
  }
  return declarations
}

const primitives = parseDeclarations(readCss('../tokens/primitives.css'))

/** Resolves a semantic token of a theme to its hex value. */
function resolve(theme: Map<string, string>, token: string): string {
  const value = theme.get(token)
  if (!value) throw new Error(`Token ${token} is not defined`)
  const reference = value.match(/^var\((--elven-[\w-]+)\)$/)
  if (!reference) throw new Error(`${token} must reference a primitive, got "${value}"`)
  const hex = primitives.get(reference[1])
  if (!hex) throw new Error(`${token} references unknown primitive ${reference[1]}`)
  return hex
}

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

// WCAG 2.2 AA: 4.5:1 for text (SC 1.4.3), 3:1 for UI indicators like focus rings (SC 1.4.11).
const TEXT = 4.5
const UI = 3

const PAIRS: Array<[foreground: string, background: string, minimum: number]> = [
  ['--elven-color-text', '--elven-color-bg', TEXT],
  ['--elven-color-text', '--elven-color-surface', TEXT],
  ['--elven-color-text-muted', '--elven-color-bg', TEXT],
  ['--elven-color-text-muted', '--elven-color-surface', TEXT],
  ['--elven-color-accent-text', '--elven-color-bg', TEXT],
  ['--elven-color-accent-text', '--elven-color-surface', TEXT],
  ['--elven-color-on-accent', '--elven-color-accent', TEXT],
  ['--elven-color-on-accent', '--elven-color-accent-hover', TEXT],
  ['--elven-color-on-danger', '--elven-color-danger', TEXT],
  ['--elven-color-on-danger', '--elven-color-danger-hover', TEXT],
  ['--elven-color-accent-text', '--elven-color-accent-subtle', TEXT],
  ['--elven-color-danger', '--elven-color-surface', TEXT],
  ['--elven-color-success', '--elven-color-surface', TEXT],
  ['--elven-color-on-success', '--elven-color-success', TEXT],
  ['--elven-color-vellum-ink', '--elven-color-vellum', TEXT],
  ['--elven-color-vellum-ink', '--elven-color-vellum-light', TEXT],
  ['--elven-color-rubric', '--elven-color-vellum', TEXT],
  ['--elven-color-on-wax', '--elven-color-wax', TEXT],
  ['--elven-color-icon-accent', '--elven-color-bg', UI],
  ['--elven-color-icon-accent', '--elven-color-surface', UI],
  ['--elven-color-focus', '--elven-color-bg', UI],
  ['--elven-color-focus', '--elven-color-surface', UI],
]

const themes = new Map(THEMES.map((name) => [name, parseDeclarations(readCss(`./${name}.css`))]))

describe('themes', () => {
  it('all define exactly the same semantic tokens', () => {
    const [first, ...rest] = [...themes.values()].map((theme) => [...theme.keys()].sort())
    for (const tokens of rest) expect(tokens).toEqual(first)
  })

  it('only reference primitive tokens', () => {
    for (const theme of themes.values()) {
      for (const token of theme.keys()) expect(() => resolve(theme, token)).not.toThrow()
    }
  })

  describe.each(THEMES)('%s', (name) => {
    it.each(PAIRS)('%s on %s meets %d:1', (foreground, background, minimum) => {
      const theme = themes.get(name)!
      const ratio = contrast(resolve(theme, foreground), resolve(theme, background))
      expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(minimum)
    })
  })
})
