import { createRef, useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from './Dialog'

function Council(props: { closeLabel?: string; size?: 'sm' | 'md' | 'lg'; frame?: 'arch' | 'portal' | 'grand' }) {
  return (
    <Dialog>
      <DialogTrigger>Answer the summons</DialogTrigger>
      <DialogContent {...props}>
        <DialogTitle>The Council of Elrond</DialogTitle>
        <DialogDescription>Who will carry the burden south?</DialogDescription>
        <input aria-label="Your name" />
        <DialogClose>Not this time</DialogClose>
      </DialogContent>
    </Dialog>
  )
}

const open = async (user = userEvent.setup()) => {
  await user.click(screen.getByRole('button', { name: 'Answer the summons' }))
  return { user, dialog: screen.getByRole('dialog') }
}

describe('Dialog', () => {
  it('has no dialog until it is opened', () => {
    render(<Council />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Answer the summons' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('opens as a modal dialog named by its title and described by its description', async () => {
    render(<Council />)
    const { dialog } = await open()
    expect(dialog).toHaveAccessibleName('The Council of Elrond')
    expect(dialog).toHaveAccessibleDescription('Who will carry the burden south?')
    expect(screen.getByRole('heading', { name: 'The Council of Elrond' })).toBeInTheDocument()
  })

  it('moves focus to its first control, not to the close seal', async () => {
    render(<Council />)
    await open()
    expect(screen.getByRole('textbox', { name: 'Your name' })).toHaveFocus()
  })

  it('closes with Escape and returns focus to the trigger', async () => {
    render(<Council />)
    const { user } = await open()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: 'Answer the summons' })).toHaveFocus()
  })

  it('closes from its seal and from DialogClose', async () => {
    render(<Council />)
    const { user } = await open()
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    await open(user)
    await user.click(screen.getByRole('button', { name: 'Not this time' }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('names the close seal with a translated label', async () => {
    render(<Council closeLabel="Kapat" />)
    await open()
    expect(screen.getByRole('button', { name: 'Kapat' })).toBeInTheDocument()
  })

  it('keeps the seal and the engraving out of the accessibility tree as images', async () => {
    render(<Council />)
    const { dialog } = await open()
    expect(screen.queryByRole('img')).toBeNull()
    for (const svg of dialog.querySelectorAll('svg')) expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults to the medium portal and exposes size and frame', async () => {
    const { unmount } = render(<Council />)
    let { dialog } = await open()
    expect(dialog).toHaveAttribute('data-size', 'md')
    expect(dialog).toHaveAttribute('data-frame', 'portal')
    unmount()
    render(<Council size="lg" frame="grand" />)
    ;({ dialog } = await open())
    expect(dialog).toHaveAttribute('data-size', 'lg')
    expect(dialog).toHaveAttribute('data-frame', 'grand')
  })

  it('forwards its ref, className and props to the dialog element', async () => {
    const ref = createRef<HTMLDivElement>()
    render(
      <Dialog defaultOpen>
        <DialogContent ref={ref} className="custom" data-testid="door">
          <DialogTitle>Speak, friend</DialogTitle>
        </DialogContent>
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog')
    expect(ref.current).toBe(dialog)
    expect(dialog).toHaveClass('custom')
    expect(dialog).toHaveAttribute('data-testid', 'door')
  })

  it('can be controlled', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    function Controlled() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Summon</button>
          <Dialog
            open={open}
            onOpenChange={(next) => {
              onOpenChange(next)
              setOpen(next)
            }}
          >
            <DialogContent>
              <DialogTitle>Speak, friend</DialogTitle>
            </DialogContent>
          </Dialog>
        </>
      )
    }
    render(<Controlled />)
    await user.click(screen.getByRole('button', { name: 'Summon' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('takes the theme of its trigger into the portal', async () => {
    render(
      <div data-elven-theme="mirkwood">
        <Council />
      </div>,
    )
    const { dialog } = await open()
    expect(dialog.closest('[data-elven-theme]')).toHaveAttribute('data-elven-theme', 'mirkwood')
  })
})
