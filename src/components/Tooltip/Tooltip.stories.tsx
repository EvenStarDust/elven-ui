import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookIcon, MapIcon, QuillIcon } from '../../icons'
import { Button } from '../Button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip'

const meta = {
  title: 'Components/Tooltip',
  component: TooltipContent,
  subcomponents: { Tooltip, TooltipTrigger, TooltipProvider },
  tags: ['autodocs'],
  args: { variant: 'ink', side: 'top', sideOffset: 8 },
  argTypes: {
    variant: { control: 'inline-radio', options: ['ink', 'parchment', 'label'] },
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: 'var(--elven-space-8) var(--elven-space-8)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TooltipContent>

export default meta
type Story = StoryObj<typeof meta>

/** Hover or focus the button. An icon-only trigger keeps its own `aria-label`; the tip only adds to it. */
export const Playground: Story = {
  render: (args) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary" aria-label="Write a letter">
          <QuillIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent {...args}>Write a letter</TooltipContent>
    </Tooltip>
  ),
}

/**
 * `ink` stands apart from any page; `parchment` is the page's own surface in
 * a double gilt line; `label` letters the parchment in small caps, for a word or two.
 */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'calc(var(--elven-space-8) * 3)', paddingBlockStart: 'var(--elven-space-8)' }}>
      {(['ink', 'parchment', 'label'] as const).map((variant) => (
        <Tooltip key={variant} defaultOpen>
          <TooltipTrigger asChild>
            <Button variant="secondary">{variant}</Button>
          </TooltipTrigger>
          <TooltipContent {...args} variant={variant}>
            Write a letter
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

/** The tip opens on any side and turns to the other when there is no room. */
export const Sides: Story = {
  render: (args) => (
    // Wide gaps, so the tips opening to the side don't cover the neighbouring buttons.
    <div style={{ display: 'flex', gap: 'calc(var(--elven-space-8) * 4)', padding: 'var(--elven-space-8)' }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} defaultOpen>
          <TooltipTrigger asChild>
            <Button variant="secondary">{side}</Button>
          </TooltipTrigger>
          <TooltipContent {...args} side={side}>
            Opens {side}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
}

/** Inside a `TooltipProvider`, once one tip has opened the next opens at once. */
export const Toolbar: Story = {
  render: (args) => (
    <TooltipProvider>
      <div style={{ display: 'flex', gap: 'var(--elven-space-2)' }}>
        {[
          { label: 'Write a letter', Icon: QuillIcon },
          { label: 'Read the Red Book', Icon: BookIcon },
          { label: 'Open the map', Icon: MapIcon },
        ].map(({ label, Icon }) => (
          <Tooltip key={label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" aria-label={label}>
                <Icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent {...args}>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
}

/** Longer notes wrap at a readable width. */
export const LongText: Story = {
  render: (args) => (
    <Tooltip defaultOpen>
      <TooltipTrigger asChild>
        <Button variant="secondary">The road</Button>
      </TooltipTrigger>
      <TooltipContent {...args}>The road goes ever on from the door where it began, over the hills and under the trees.</TooltipContent>
    </Tooltip>
  ),
}
