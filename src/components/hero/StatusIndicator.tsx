import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, m } from 'motion/react'
import { Check, ChevronDown, Copy, Mail } from 'lucide-react'
import { profile } from '../../data/profile'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { cn } from '../../lib/cn'

function Beacon() {
  return (
    <span aria-hidden="true" className="relative flex size-2">
      <span className="absolute inset-0 animate-beacon rounded-full bg-signal" />
      <span className="relative size-2 rounded-full bg-signal shadow-[0_0_10px_var(--color-signal)]" />
    </span>
  )
}

export function StatusIndicator() {
  const [open, setOpen] = useState(false)
  const { status, copy } = useCopyToClipboard()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex h-8 items-center gap-2.5 rounded-full border border-signal/20 bg-signal/[0.07] pr-2.5 pl-3 text-[13px] font-medium text-mist transition-[background-color,border-color,transform] duration-200 hover:border-signal/40 hover:bg-signal/[0.12] active:scale-[0.98]"
      >
        <Beacon />
        {profile.availability.label}
        <ChevronDown
          className={cn('size-3.5 text-fog transition-transform duration-300 ease-out-expo', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            id={panelId}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.14 } }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 z-50 mt-2.5 w-[min(21rem,calc(100vw-2.5rem))] origin-top-left rounded-2xl border border-line-strong bg-graphite/95 p-4 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] backdrop-blur-xl"
          >
            <p className="text-[12.5px] text-smoke">Looking for</p>
            <p className="mt-1 text-[14.5px] leading-snug text-mist">{profile.availability.seeking}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-line pt-4 text-[13px]">
              <dt className="text-smoke">Based in</dt>
              <dd className="text-fog">{profile.location}</dd>
              <dt className="text-smoke">Studying</dt>
              <dd className="text-fog">Computing Science, SFU</dd>
            </dl>
            <div className="mt-4 flex gap-2">
              <a
                href={`mailto:${profile.email}`}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-mist text-[13px] font-medium text-ink transition-colors hover:opacity-90"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                Email me
              </a>
              <button
                type="button"
                onClick={() => void copy(profile.email)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong text-[13px] font-medium text-mist transition-colors hover:border-overlay/25 hover:bg-overlay/[0.06]"
              >
                {status === 'copied' ? (
                  <Check className="size-3.5 text-signal" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
                {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy email'}
              </button>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
