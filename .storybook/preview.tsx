import type { Preview } from '@storybook/react-vite'
import '../src/index'

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i } },
    a11y: { test: 'error' },
  },
  globalTypes: {
    theme: {
      description: 'Elven UI theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'rivendell', title: 'Rivendell' },
          { value: 'lothlorien', title: 'Lothlórien' },
          { value: 'mirkwood', title: 'Mirkwood' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'rivendell' },
  decorators: [
    (Story, { globals, parameters }) =>
      // Stories that render their own themes (like the side-by-side overview) opt out.
      parameters.themeDecorator === false ? (
        <Story />
      ) : (
        <div data-elven-theme={globals.theme} style={{ minHeight: '100vh', padding: '2rem' }}>
          <Story />
        </div>
      ),
  ],
}

export default preview
