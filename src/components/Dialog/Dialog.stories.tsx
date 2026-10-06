import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../Button'
import { DatePicker } from '../DatePicker'
import { Input } from '../Input'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './Dialog'

const meta = {
  title: 'Components/Dialog',
  component: DialogContent,
  subcomponents: { Dialog, DialogTrigger, DialogTitle, DialogDescription, DialogClose },
  tags: ['autodocs'],
  args: { size: 'md', frame: 'portal', closeLabel: 'Close' },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    frame: { control: 'inline-radio', options: ['arch', 'portal', 'grand'] },
  },
} satisfies Meta<typeof DialogContent>

export default meta
type Story = StoryObj<typeof meta>

const actions = { display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 'var(--elven-space-3)' } as const

/** Open it: the engraving is lit from the threshold up to the cornice, then glows once. */
export const Playground: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Answer the summons</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogTitle>The Council of Elrond</DialogTitle>
        <DialogDescription>
          Envoys of every free people have gathered in Rivendell. The council asks who will carry the burden south.
        </DialogDescription>
        <div style={actions}>
          <DialogClose asChild>
            <Button variant="secondary">Not this time</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>I will take it</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
}

/** `arch` is the lightest, for a lot of content; `portal` stands between columns; `grand` carves the portal. */
export const Frames: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--elven-space-3)' }}>
      {(['arch', 'portal', 'grand'] as const).map((frame) => (
        <Dialog key={frame}>
          <DialogTrigger asChild>
            <Button variant="secondary">Open {frame}</Button>
          </DialogTrigger>
          <DialogContent {...args} frame={frame}>
            <DialogTitle>The Council of Elrond</DialogTitle>
            <DialogDescription>
              Envoys of every free people have gathered in Rivendell. The council asks who will carry the burden south.
            </DialogDescription>
            <div style={actions}>
              <DialogClose asChild>
                <Button>I will take it</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
}

/** The arch rises with the width. */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--elven-space-3)' }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="secondary">Open {size}</Button>
          </DialogTrigger>
          <DialogContent {...args} size={size}>
            <DialogTitle>Speak, friend</DialogTitle>
            <DialogDescription>The door stays shut until the right word is said in the old tongue.</DialogDescription>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  ),
}

/** Forms work inside, the date picker included. Focus starts on the first field. */
export const WithForm: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Join the Fellowship</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogTitle>Join the Fellowship</DialogTitle>
        <DialogDescription>Nine walkers shall set out from Rivendell.</DialogDescription>
        <Input label="Your name" placeholder="Samwise Gamgee" />
        <DatePicker label="Day of departure" placeholder="Choose a day" />
        <div style={actions}>
          <DialogClose asChild>
            <Button>Set out</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
}

/** Taller than the screen: the overlay scrolls the whole door, so the arch is never cut. */
export const LongContent: Story = {
  render: (args) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Read the Red Book</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogTitle>There and Back Again</DialogTitle>
        {Array.from({ length: 12 }, (_, i) => (
          <p key={i} style={{ margin: 0 }}>
            The road wound on past the last homely house, over the misty mountains and down into the eaves of the
            forest, where the light came green and gold through the leaves and every step was further from home.
          </p>
        ))}
      </DialogContent>
    </Dialog>
  ),
}

/** `defaultOpen` starts it open; it still opens and closes by itself afterwards. */
export const OpenByDefault: Story = {
  render: (args) => (
    <Dialog defaultOpen>
      <DialogTrigger asChild>
        <Button>Reopen</Button>
      </DialogTrigger>
      <DialogContent {...args}>
        <DialogTitle>Speak, friend</DialogTitle>
        <DialogDescription>The door stays shut until the right word is said in the old tongue.</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
}
