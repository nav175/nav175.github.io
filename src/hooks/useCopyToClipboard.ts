import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyStatus = 'idle' | 'copied' | 'failed'

export function useCopyToClipboard(resetAfterMs = 2000) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      let next: CopyStatus = 'copied'
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        next = 'failed'
      }
      setStatus(next)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setStatus('idle'), resetAfterMs)
      return next === 'copied'
    },
    [resetAfterMs],
  )

  return { status, copy }
}
