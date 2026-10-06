'use client'

import {
  createContext,
  forwardRef,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type CSSProperties,
  type ForwardedRef,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { clsx } from 'clsx'
import { SWORD_OVER_ACCENT, SWORD_OVER_LINE, SWORD_UNDER_ACCENT, SWORD_UNDER_LINE } from '../../icons/icons'
import { doorGeometry, type DoorFrame } from './door-geometry'
import styles from './Dialog.module.css'

export type DialogSize = 'sm' | 'md' | 'lg'
export type DialogFrame = DoorFrame

// The trigger, if there is one, so the dialog can take its theme along into the portal.
const TriggerContext = createContext<MutableRefObject<HTMLButtonElement | null> | null>(null)

function mergeRefs<T>(...refs: Array<ForwardedRef<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

/**
 * The engraved door behind the content. It measures the content box and
 * draws the door at exactly that size (see door-geometry.ts), and hands the
 * room the content must keep back to the box as custom properties.
 */
function useDoor(frame: DoorFrame) {
  const [node, setNode] = useState<HTMLDivElement | null>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    if (!node) return
    const measure = () => {
      const next = { width: node.offsetWidth, height: node.offsetHeight }
      // Nothing to draw before layout (or where there is none, as in tests).
      if (!next.width || !next.height) return
      setSize((last) => (last && last.width === next.width && last.height === next.height ? last : next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [node])

  const geometry = useMemo(() => (size ? doorGeometry(size.width, size.height, frame) : null), [size, frame])
  return { setNode, size, geometry }
}

export interface DialogProps {
  /** The trigger and the content. */
  children?: ReactNode
  /** Whether the dialog is open, when you control it. */
  open?: boolean
  /**
   * Whether the dialog starts open, when it controls itself.
   * @default false
   */
  defaultOpen?: boolean
  /** Called with the new state whenever the dialog opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * When `true`, the rest of the page is inert while the dialog is open:
   * focus stays inside, and screen readers only see the dialog.
   * @default true
   */
  modal?: boolean
}

/**
 * A modal window shaped as a gilt-engraved door: an arch, or an arched
 * doorway between columns, whose engraving appears as it opens. Compose it from `DialogTrigger`,
 * `DialogContent`, `DialogTitle`, `DialogDescription` and `DialogClose`.
 */
export function Dialog({ children, ...props }: DialogProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  return (
    <TriggerContext.Provider value={triggerRef}>
      <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
    </TriggerContext.Provider>
  )
}

Dialog.displayName = 'Dialog'

export interface DialogTriggerProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {
  /**
   * Render the single child element (such as a `Button`) as the trigger.
   * @default false
   */
  asChild?: boolean
}

/** The button that opens the dialog. Focus returns to it when the dialog closes. */
export const DialogTrigger = forwardRef<ComponentRef<typeof DialogPrimitive.Trigger>, DialogTriggerProps>(function DialogTrigger(
  props,
  ref,
) {
  const triggerRef = useContext(TriggerContext)
  return <DialogPrimitive.Trigger ref={mergeRefs(ref, triggerRef ?? undefined)} {...props} />
})

DialogTrigger.displayName = 'DialogTrigger'

export interface DialogContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /**
   * Width of the dialog. The arch grows with it.
   * @default 'md'
   */
  size?: DialogSize
  /**
   * The door the dialog is shaped as. `arch` is a single arched panel with a
   * double gilt line: the lightest, for dialogs with a lot of content.
   * `portal` is an arched doorway between two fluted columns. `grand` is the
   * portal carved: leafy capitals, a leaf band round the arch, a fanlight, a
   * crest and panelled door leaves. Narrow screens leave out the columns.
   * @default 'portal'
   */
  frame?: DialogFrame
  /**
   * Name of the built-in close button. Translate it for your app.
   * @default 'Close'
   */
  closeLabel?: string
}

/**
 * The dialog itself, with the dimmed page behind it and a close button. It
 * is rendered at the end of `<body>`, in the theme of its trigger. Give it a
 * `DialogTitle`, and a `DialogDescription` if a sentence explains it.
 */
export const DialogContent = forwardRef<ComponentRef<typeof DialogPrimitive.Content>, DialogContentProps>(function DialogContent(
  { size = 'md', frame = 'portal', closeLabel = 'Close', className, style, children, ...rest },
  ref,
) {
  const triggerRef = useContext(TriggerContext)
  const { setNode, size: measured, geometry } = useDoor(frame)
  // A stable ref, so React doesn't detach and reattach the node on every render.
  const contentRef = useMemo(() => mergeRefs(ref, setNode), [ref, setNode])

  // The portal sits outside every themed ancestor, so the layer copies the
  // theme of whatever opened it: the trigger, or else the element that had
  // focus. Set on the node as it mounts, so it is right before the first paint.
  const takeTheme = (layer: HTMLDivElement | null) => {
    if (!layer) return
    const opener = triggerRef?.current ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    const theme = opener?.closest('[data-elven-theme]')?.getAttribute('data-elven-theme')
    if (theme) layer.setAttribute('data-elven-theme', theme)
    else layer.removeAttribute('data-elven-theme')
  }

  return (
    <DialogPrimitive.Portal>
      {/* The content sits inside the overlay, which scrolls when the dialog is taller than the screen. */}
      <DialogPrimitive.Overlay ref={takeTheme} className={styles.overlay}>
        <DialogPrimitive.Content
          ref={contentRef}
          className={clsx(styles.content, className)}
          data-size={size}
          data-frame={frame}
          style={{ ...doorSpace(geometry), ...style }}
          {...rest}
        >
          {geometry && measured && (
            <svg
              className={styles.engraving}
              width={measured.width}
              height={measured.height}
              viewBox={`0 0 ${measured.width} ${measured.height}`}
              aria-hidden="true"
              focusable="false"
            >
              <path className={styles.stone} d={geometry.stone} />
              <path className={styles.doorway} d={geometry.door} />
              <path className={styles.faint} d={geometry.faint} />
              <path className={styles.hair} d={geometry.hair} />
              <path className={styles.line} d={geometry.line} />
              <path className={styles.carving} d={geometry.carving} />
              <path className={styles.accent} d={geometry.accent} />
            </svg>
          )}
          {children}
          {/* Last, so opening moves focus to the dialog's own first control. A seal crowning the end column. */}
          <DialogPrimitive.Close className={styles.close} aria-label={closeLabel}>
            <svg className={styles.swords} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {/* The two swords apart, so each can swing from its own hilt when the seal is hovered. */}
              <g className={styles.over}>
                <path className={styles.blade} d={SWORD_OVER_LINE} />
                <path className={styles.gilding} d={SWORD_OVER_ACCENT} />
              </g>
              <g className={styles.under}>
                <path className={styles.blade} d={SWORD_UNDER_LINE} />
                <path className={styles.gilding} d={SWORD_UNDER_ACCENT} />
              </g>
            </svg>
            {/* The swords are no universal sign for closing, so the seal names itself on hover and focus. */}
            <span className={styles.note} aria-hidden="true">
              {closeLabel}
            </span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
})

DialogContent.displayName = 'DialogContent'

/** The room the door leaves for the content, and where the close seal sits, as custom properties. */
function doorSpace(geometry: ReturnType<typeof doorGeometry> | null): CSSProperties | undefined {
  if (!geometry) return undefined
  return {
    '--_door-top': `${geometry.inset.top}px`,
    '--_door-inline': `${geometry.inset.inline}px`,
    '--_door-bottom': `${geometry.inset.bottom}px`,
    '--_seal-top': `${geometry.seal.top}px`,
    '--_seal-end': `${geometry.seal.end}px`,
    '--_seal-radius': `${geometry.seal.radius}px`,
  } as CSSProperties
}

export type DialogTitleProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Title>

/** The dialog's heading, inscribed under the arch. It names the dialog for screen readers. */
export const DialogTitle = forwardRef<ComponentRef<typeof DialogPrimitive.Title>, DialogTitleProps>(function DialogTitle(
  { className, ...rest },
  ref,
) {
  return <DialogPrimitive.Title ref={ref} className={clsx(styles.title, className)} {...rest} />
})

DialogTitle.displayName = 'DialogTitle'

export type DialogDescriptionProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Description>

/** A sentence under the title, read out with it when the dialog opens. */
export const DialogDescription = forwardRef<ComponentRef<typeof DialogPrimitive.Description>, DialogDescriptionProps>(
  function DialogDescription({ className, ...rest }, ref) {
    return <DialogPrimitive.Description ref={ref} className={clsx(styles.description, className)} {...rest} />
  },
)

DialogDescription.displayName = 'DialogDescription'

export interface DialogCloseProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {
  /**
   * Render the single child element (such as a `Button`) as the close button.
   * @default false
   */
  asChild?: boolean
}

/** Closes the dialog. Wrap your own buttons in it, such as "Cancel" or "Done". */
export const DialogClose = forwardRef<ComponentRef<typeof DialogPrimitive.Close>, DialogCloseProps>(function DialogClose(props, ref) {
  return <DialogPrimitive.Close ref={ref} {...props} />
})

DialogClose.displayName = 'DialogClose'
