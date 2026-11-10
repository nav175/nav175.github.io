import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../lib/cn'
import {
  commandForSuggestion,
  completeCommand,
  INTRO_COMMANDS,
  runCommand,
  SUGGESTED_COMMANDS,
} from './commands'

interface Entry {
  id: number
  command: string
  output: ReactNode
}

type Frame = 'open' | 'min' | 'zoom'

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Chip typing stays under ~700ms so resume's window.open keeps user activation. */
const CHIP_CHAR_MS = 28
const CHIP_COMMIT_MS = 120

function Prompt() {
  return (
    <span aria-hidden="true" className="mr-[1ch] shrink-0 select-none">
      <span className="text-fog">~</span> <span className="text-smoke">$</span>
    </span>
  )
}

function Cursor() {
  return <span aria-hidden="true" className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-blink bg-mist/85" />
}

/** macOS traffic-light glyphs: ×, −, expand (out), restore (in). */
function WindowGlyph({ kind }: { kind: 'close' | 'minimize' | 'expand' | 'restore' }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className="size-3 opacity-0 transition-opacity duration-150 group-hover/lights:opacity-100 group-focus-within/lights:opacity-100"
    >
      {kind === 'close' ? (
        <path d="M3.15 3.15 8.85 8.85M8.85 3.15 3.15 8.85" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      ) : null}
      {kind === 'minimize' ? (
        <path d="M3.05 6h5.9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ) : null}
      {kind === 'expand' ? (
        <path
          d="M6.45 1.7h3.85V5.55M10.15 1.85 6.2 5.8M5.55 10.3H1.7V6.45M1.85 10.15 5.8 6.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {kind === 'restore' ? (
        <path
          d="M6.35 3.15V5.6h2.45M6.45 5.5 9.95 2M5.65 8.85V6.4H3.2M5.55 6.5 2.05 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  )
}

export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>(() =>
    prefersReducedMotion()
      ? INTRO_COMMANDS.map((command, id) => ({ id, command, output: runCommand(command).output }))
      : [],
  )
  const [step, setStep] = useState(() => (prefersReducedMotion() ? INTRO_COMMANDS.length : 0))
  const [typed, setTyped] = useState(0)
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [chipCommand, setChipCommand] = useState<string | null>(null)
  const [chipTyped, setChipTyped] = useState(0)
  const [frame, setFrame] = useState<Frame>('open')

  const nextId = useRef(INTRO_COMMANDS.length)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const collapseRef = useRef<HTMLDivElement>(null)
  const previousFrame = useRef<Frame>(frame)
  const zoomedFocus = useRef(false)
  const busyRef = useRef(false)
  const [minSettled, setMinSettled] = useState(false)

  const introDone = step >= INTRO_COMMANDS.length
  const chipBusy = chipCommand !== null
  const promptLocked = !introDone || chipBusy

  const append = useCallback((command: string) => {
    const result = runCommand(command)
    if (result.clear) {
      setEntries([])
      return
    }
    const id = nextId.current++
    setEntries((previous) => [...previous, { id, command, output: result.output }])
  }, [])

  useEffect(() => {
    if (introDone || chipBusy || frame === 'min') return
    const command = INTRO_COMMANDS[step]
    const typing = typed < command.length
    const delay = typing ? (typed === 0 ? (step === 0 ? 900 : 550) : 45 + Math.random() * 55) : 380
    const timer = window.setTimeout(() => {
      if (typing) {
        setTyped(typed + 1)
        return
      }
      append(command)
      setTyped(0)
      setStep(step + 1)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [append, chipBusy, frame, introDone, step, typed])

  useEffect(() => {
    if (!chipCommand) return
    const typing = chipTyped < chipCommand.length
    const delay = typing ? CHIP_CHAR_MS : CHIP_COMMIT_MS
    const timer = window.setTimeout(() => {
      if (typing) {
        setChipTyped(chipTyped + 1)
        return
      }
      const command = chipCommand
      setChipCommand(null)
      setChipTyped(0)
      busyRef.current = false
      setHistory((previous) => [...previous, command])
      append(command)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [append, chipCommand, chipTyped])

  useLayoutEffect(() => {
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [entries, typed, chipTyped, introDone, chipBusy])

  const finishIntro = () => {
    if (introDone) return
    INTRO_COMMANDS.slice(step).forEach(append)
    setStep(INTRO_COMMANDS.length)
    setTyped(0)
  }

  const submit = (raw: string) => {
    if (busyRef.current || chipBusy) return
    finishIntro()
    const command = raw.trim()
    setValue('')
    setHistoryIndex(-1)
    if (!command) {
      const id = nextId.current++
      setEntries((previous) => [...previous, { id, command: '', output: null }])
      return
    }
    setHistory((previous) => [...previous, command])
    append(command)
  }

  const zoomed = frame === 'zoom'

  useEffect(() => {
    if (!zoomed) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setFrame('open')
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [zoomed])

  useLayoutEffect(() => {
    if (!zoomed) {
      zoomedFocus.current = false
      return
    }
    if (step < INTRO_COMMANDS.length) {
      INTRO_COMMANDS.slice(step).forEach(append)
      setStep(INTRO_COMMANDS.length)
      setTyped(0)
      return
    }
    if (chipCommand !== null) return
    if (zoomedFocus.current) return
    const input = inputRef.current
    if (!input) return
    zoomedFocus.current = true
    input.focus({ preventScroll: true })
  }, [append, chipCommand, step, zoomed])

  useEffect(() => {
    const from = previousFrame.current
    previousFrame.current = frame
    if (frame !== 'min') {
      setMinSettled(false)
      return
    }
    // Closing the zoomed overlay remounts the bar already collapsed, so skip the wait.
    if (from === 'zoom' || prefersReducedMotion()) {
      setMinSettled(true)
      return
    }
    const el = collapseRef.current
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      setMinSettled(true)
    }
    const onEnd = (event: globalThis.TransitionEvent) => {
      if (event.target !== el || event.propertyName !== 'grid-template-rows') return
      finish()
    }
    el?.addEventListener('transitionend', onEnd)
    const timer = window.setTimeout(finish, 560)
    return () => {
      el?.removeEventListener('transitionend', onEnd)
      window.clearTimeout(timer)
    }
  }, [frame])

  const closeWindow = () => {
    busyRef.current = false
    setChipCommand(null)
    setChipTyped(0)
    finishIntro()
    setEntries([])
    setValue('')
    setHistoryIndex(-1)
    setFrame('min')
    inputRef.current?.blur()
  }

  const playSuggestion = (suggestion: string) => {
    if (busyRef.current || chipBusy) return
    finishIntro()
    const command = commandForSuggestion(suggestion)
    setValue('')
    setHistoryIndex(-1)
    if (prefersReducedMotion()) {
      setHistory((previous) => [...previous, command])
      append(command)
      return
    }
    busyRef.current = true
    setChipTyped(0)
    setChipCommand(command)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (chipBusy) {
      event.preventDefault()
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      submit(value)
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (history.length === 0) return
      event.preventDefault()
      const index =
        event.key === 'ArrowUp'
          ? historyIndex === -1
            ? history.length - 1
            : Math.max(0, historyIndex - 1)
          : historyIndex === -1 || historyIndex >= history.length - 1
            ? -1
            : historyIndex + 1
      setHistoryIndex(index)
      setValue(index === -1 ? '' : history[index])
    } else if (event.key === 'Tab' && !event.shiftKey) {
      // Only claim Tab when there is something to complete, so keyboard users can still tab past.
      const completion = completeCommand(value)
      if (completion && completion !== value) {
        event.preventDefault()
        setValue(completion)
      }
    } else if (event.key === 'Escape') {
      inputRef.current?.blur()
    }
  }

  const focusInput = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return
    if (window.getSelection()?.toString()) return
    if (chipBusy) return
    finishIntro()
    inputRef.current?.focus({ preventScroll: true })
  }

  const livePrompt = chipBusy
    ? chipCommand.slice(0, chipTyped)
    : !introDone
      ? INTRO_COMMANDS[step].slice(0, typed)
      : null

  const shell = (
    <div
      role={zoomed ? 'dialog' : undefined}
      aria-modal={zoomed || undefined}
      aria-label={zoomed ? 'Terminal' : undefined}
      className={cn(
        'group/terminal glass relative flex flex-col overflow-hidden rounded-2xl transition-[border-color] duration-300 focus-within:border-overlay/20',
        frame === 'min' && 'hover:border-overlay/25',
        zoomed && 'isolate h-full bg-graphite bg-none shadow-[0_40px_100px_-28px_rgb(0_0_0/0.55)] backdrop-blur-none',
      )}
      style={zoomed ? { background: 'var(--graphite)', backdropFilter: 'none', WebkitBackdropFilter: 'none' } : undefined}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-overlay/45 to-transparent"
      />

      <div
        className={cn(
          'relative flex h-11 items-center px-2.5',
          !(frame === 'min' && minSettled) && 'border-b border-line',
        )}
      >
        <div
          className={cn(
            'group/lights relative z-10 flex transition-opacity duration-300 motion-reduce:transition-none',
            minSettled && 'opacity-0',
          )}
          inert={frame === 'min' ? true : undefined}
          aria-hidden={minSettled || undefined}
        >
          {(
            [
              ['close', 'Close terminal', 'bg-[#ff5f57]', 'close'],
              ['minimize', 'Minimize terminal', 'bg-[#febc2e]', 'minimize'],
              ['zoom', zoomed ? 'Restore terminal size' : 'Maximize terminal', 'bg-[#28c840]', zoomed ? 'restore' : 'expand'],
            ] as const
          ).map(([id, label, color, glyph]) => {
            const inactive = zoomed && id === 'minimize'
            const unavailable = 'Unavailable while maximized'
            return (
              <button
                key={id}
                type="button"
                aria-label={inactive ? `${label}, ${unavailable.toLowerCase()}` : label}
                title={inactive ? unavailable : label}
                disabled={inactive}
                aria-pressed={id === 'zoom' ? zoomed : undefined}
                onClick={(event) => {
                  event.stopPropagation()
                  if (id === 'close') closeWindow()
                  else if (id === 'minimize') {
                    setFrame('min')
                    inputRef.current?.blur()
                  } else setFrame((current) => (current === 'zoom' ? 'open' : 'zoom'))
                }}
                className="grid size-6 place-items-center rounded-full disabled:cursor-default"
              >
                <span
                  className={cn(
                    'grid size-3 place-items-center rounded-full text-black/80',
                    inactive ? 'bg-[#8d939c]' : color,
                  )}
                >
                  {inactive ? null : <WindowGlyph kind={glyph} />}
                </span>
              </button>
            )
          })}
        </div>
        <p className="pointer-events-none absolute inset-0 grid place-items-center px-16 font-mono text-[12px]">
          <span
            className={cn(
              'col-start-1 row-start-1 text-smoke transition-opacity duration-200',
              frame === 'min' && 'group-hover/terminal:opacity-0 group-focus-within/terminal:opacity-0',
            )}
          >
            navjot@portfolio: ~
          </span>
          {frame === 'min' ? (
            <span className="col-start-1 row-start-1 text-mist opacity-0 transition-opacity duration-200 group-hover/terminal:opacity-100 group-focus-within/terminal:opacity-100">
              Open terminal
            </span>
          ) : null}
        </p>
        {frame === 'min' ? (
          <span className="pointer-events-none relative z-30 ml-auto pr-1.5 font-mono text-[11px] text-smoke transition-opacity duration-200 group-hover/terminal:opacity-0 group-focus-within/terminal:opacity-0">
            open
          </span>
        ) : null}
        {frame === 'min' ? (
          <button
            type="button"
            aria-label="Open terminal"
            title="Open terminal"
            onClick={() => setFrame('open')}
            className="absolute inset-0 z-20 cursor-pointer"
          />
        ) : null}
      </div>

      <div
        ref={collapseRef}
        className={cn(
          'grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
          frame === 'min' ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
          zoomed && 'min-h-0 flex-1',
        )}
        inert={frame === 'min' ? true : undefined}
      >
      <div className={cn('min-h-0 overflow-hidden', zoomed && 'flex h-full flex-col')}>
      <div
        ref={bodyRef}
        onClick={focusInput}
        className={cn(
          'scrollbar-none cursor-text overflow-y-auto overscroll-contain px-4 py-4 font-mono text-[12.5px] leading-[1.7] sm:px-5 sm:text-[13px]',
          zoomed ? 'min-h-0 flex-1' : 'h-[19.5rem] sm:h-[21rem]',
        )}
      >
        <div role="log" aria-label="Terminal output" className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id}>
              <p className="flex">
                <Prompt />
                <span className="text-mist">{entry.command}</span>
              </p>
              {entry.output ? <div className="mt-0.5">{entry.output}</div> : null}
            </div>
          ))}
        </div>

        <div className={cn(entries.length > 0 && 'mt-3')}>
          {promptLocked ? (
            <p aria-hidden="true" className="flex">
              <Prompt />
              <span className="text-mist">{livePrompt}</span>
              <Cursor />
            </p>
          ) : (
            <label className="flex items-center">
              <Prompt />
              <span className="sr-only">Type a command, for example help, then press Enter</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder="type help"
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                enterKeyHint="go"
                className="min-w-0 flex-1 bg-transparent text-mist caret-signal outline-none placeholder:text-smoke/80"
              />
            </label>
          )}
        </div>
      </div>

      <div className="scrollbar-none flex items-center gap-1.5 overflow-x-auto border-t border-line px-3 py-2.5 max-sm:[mask-image:linear-gradient(to_right,#000_82%,transparent)]">
        <span className="shrink-0 px-1 font-mono text-[11.5px] text-smoke">try</span>
        {SUGGESTED_COMMANDS.map((command) => (
          <button
            key={command}
            type="button"
            disabled={chipBusy}
            onClick={() => playSuggestion(command)}
            className="shrink-0 rounded-md border border-line bg-overlay/[0.02] px-2 py-1 font-mono text-[11.5px] leading-none text-fog transition-[color,background-color,border-color,transform] duration-200 hover:border-overlay/20 hover:bg-overlay/[0.05] hover:text-mist active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50"
          >
            {command}
          </button>
        ))}
      </div>
      </div>
      </div>
    </div>
  )

  if (!zoomed) return shell

  return (
    <>
      <div aria-hidden="true" className="h-[25rem] sm:h-[26.5rem]" />
      {createPortal(
        <div className="fixed inset-0 z-[80] p-3 sm:p-6 lg:p-10">
          <button
            type="button"
            aria-label="Restore terminal size"
            onClick={() => setFrame('open')}
            className="absolute inset-0 bg-black/45 backdrop-blur-xl supports-[backdrop-filter]:bg-black/20"
          />
          <div className="relative z-10 h-full">{shell}</div>
        </div>,
        document.body,
      )}
    </>
  )
}
