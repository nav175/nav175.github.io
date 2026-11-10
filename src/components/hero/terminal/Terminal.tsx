import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
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
  const busyRef = useRef(false)

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

  return (
    <div className="group/terminal glass relative overflow-hidden rounded-2xl transition-[border-color] duration-300 focus-within:border-overlay/20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-overlay/45 to-transparent"
      />

      <div className={cn('relative flex h-11 items-center px-2.5', frame !== 'min' && 'border-b border-line')}>
        <div className="relative z-10 flex">
          {(
            [
              ['close', frame === 'min' ? 'Open a new session' : 'Close terminal', 'bg-[#ff5f57]'],
              ['minimize', frame === 'min' ? 'Restore terminal' : 'Minimize terminal', 'bg-[#febc2e]'],
              ['zoom', frame === 'zoom' ? 'Restore terminal size' : 'Zoom terminal', 'bg-[#28c840]'],
            ] as const
          ).map(([id, label, color]) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={id === 'zoom' ? frame === 'zoom' : undefined}
              onClick={(event) => {
                event.stopPropagation()
                if (id === 'close') {
                  if (frame === 'min') setFrame('open')
                  else closeWindow()
                } else if (id === 'minimize') {
                  setFrame((current) => (current === 'min' ? 'open' : 'min'))
                  inputRef.current?.blur()
                } else {
                  setFrame((current) => (current === 'zoom' ? 'open' : 'zoom'))
                }
              }}
              className="group/light grid size-6 place-items-center rounded-full"
            >
              <span
                className={cn(
                  'size-2.5 rounded-full transition-transform duration-200 group-hover/light:scale-125 group-active/light:scale-90',
                  color,
                )}
              />
            </button>
          ))}
        </div>
        <p className="pointer-events-none absolute inset-x-0 text-center font-mono text-[12px] text-smoke">navjot@portfolio: ~</p>
        {frame === 'min' ? (
          <button type="button" aria-label="Restore terminal" onClick={() => setFrame('open')} className="absolute inset-0" />
        ) : null}
      </div>

      <div className={cn(frame === 'min' && 'hidden')}>
      <div
        ref={bodyRef}
        onClick={focusInput}
        className={cn(
          'scrollbar-none cursor-text overflow-y-auto overscroll-contain px-4 py-4 font-mono text-[12.5px] leading-[1.7] sm:px-5 sm:text-[13px]',
          frame === 'zoom' ? 'h-[28rem] sm:h-[34rem]' : 'h-[19.5rem] sm:h-[21rem]',
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
  )
}
