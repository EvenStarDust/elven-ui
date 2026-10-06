'use client'

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type ForwardedRef,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { clsx } from 'clsx'
import styles from './Tooltip.module.css'

export type TooltipVariant = 'ink' | 'parchment' | 'label'

// Whether a TooltipProvider is already above, so a lone Tooltip can bring its own.
const ProvidedContext = createContext(false)
// The trigger, so the tip can take its theme along into the portal.
const TriggerContext = createContext<MutableRefObject<HTMLButtonElement | null> | null>(null)

function mergeRefs<T>(...refs: Array<ForwardedRef<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }
  }
}

export interface TooltipProviderProps {
  children: ReactNode
  /**
   * How long the pointer rests on a trigger before its tip opens, in ms.
   * @default 500
   */
  delayDuration?: number
  /**
   * How long after one tip closes the next opens without waiting again, in ms.
   * @default 300
   */
  skipDelayDuration?: number
}

/**
 * Optional. Wrap your app (or a toolbar) in it so that once one tip has
 * opened, moving to the next opens it at once. Without it each tooltip
 * keeps its own delay.
 */
export function TooltipProvider({ children, delayDuration = 500, skipDelayDuration = 300 }: TooltipProviderProps) {
  return (
    <ProvidedContext.Provider value={true}>
      <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
        {children}
      </TooltipPrimitive.Provider>
    </ProvidedContext.Provider>
  )
}

TooltipProvider.displayName = 'TooltipProvider'

export interface TooltipProps {
  /** The trigger and the content. */
  children?: ReactNode
  /** Whether the tip is shown, when you control it. */
  open?: boolean
  /**
   * Whether the tip starts shown, when it controls itself.
   * @default false
   */
  defaultOpen?: boolean
  /** Called with the new state whenever the tip opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * How long the pointer rests on the trigger before the tip opens, in ms.
   * Overrides the provider's.
   * @default 500
   */
  delayDuration?: number
}

/**
 * A short note in ink that names or explains its trigger on hover and on
 * keyboard focus. Compose it from `TooltipTrigger` and `TooltipContent`. It
 * only adds to what the trigger already says: give an icon-only trigger its
 * own `aria-label` too.
 */
export function Tooltip({ children, ...props }: TooltipProps) {
  const provided = useContext(ProvidedContext)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const root = (
    <TriggerContext.Provider value={triggerRef}>
      <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>
    </TriggerContext.Provider>
  )
  return provided ? root : <TooltipProvider>{root}</TooltipProvider>
}

Tooltip.displayName = 'Tooltip'

export interface TooltipTriggerProps extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {
  /**
   * Render the single child element (such as a `Button`) as the trigger.
   * @default false
   */
  asChild?: boolean
}

/** The element the tip belongs to. */
export const TooltipTrigger = forwardRef<ComponentRef<typeof TooltipPrimitive.Trigger>, TooltipTriggerProps>(function TooltipTrigger(
  props,
  ref,
) {
  const triggerRef = useContext(TriggerContext)
  const mergedRef = useMemo(() => mergeRefs(ref, triggerRef ?? undefined), [ref, triggerRef])
  return <TooltipPrimitive.Trigger ref={mergedRef} {...props} />
})

TooltipTrigger.displayName = 'TooltipTrigger'

export interface TooltipContentProps extends ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  /**
   * `ink` is dark on light themes and light on Mirkwood, the inverse of the
   * page, so it stands out anywhere. `parchment` is the page's own surface in
   * a double gilt line, quieter. `label` is the parchment lettered in small
   * caps, for one or two words.
   * @default 'ink'
   */
  variant?: TooltipVariant
  /**
   * Which side of the trigger the tip opens on. It moves to the other side when there is no room.
   * @default 'top'
   */
  side?: 'top' | 'right' | 'bottom' | 'left'
  /**
   * Gap between the trigger and the tip, in px.
   * @default 8
   */
  sideOffset?: number
}

/**
 * The tip itself: a note with a gilt edge and a gilt clasp pointing at its
 * trigger. It is rendered at the end of `<body>`, in the theme of its
 * trigger.
 */
export const TooltipContent = forwardRef<ComponentRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(function TooltipContent(
  { variant = 'ink', side = 'top', sideOffset = 8, className, children, ...rest },
  ref,
) {
  const triggerRef = useContext(TriggerContext)
  // The portal sits outside every themed ancestor, so the tip copies its trigger's theme as it mounts.
  const contentRef = useMemo(
    () =>
      mergeRefs<HTMLDivElement>(ref, (node) => {
        if (!node) return
        const theme = triggerRef?.current?.closest('[data-elven-theme]')?.getAttribute('data-elven-theme')
        if (theme) node.setAttribute('data-elven-theme', theme)
        else node.removeAttribute('data-elven-theme')
      }),
    [ref, triggerRef],
  )

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={contentRef}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={clsx(styles.content, className)}
        data-variant={variant}
        {...rest}
      >
        {children}
        <TooltipPrimitive.Arrow asChild width={10} height={5}>
          <span className={styles.clasp} aria-hidden="true" />
        </TooltipPrimitive.Arrow>
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
})

TooltipContent.displayName = 'TooltipContent'
