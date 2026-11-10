import { useCallback, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ThemeContext } from '../../lib/theme-context'
import {
  applyTheme,
  isThemePreference,
  nextTheme,
  readStoredTheme,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from '../../lib/theme'

function subscribeSystem(onStoreChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function getSystemSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    typeof window === 'undefined' ? 'light' : readStoredTheme(),
  )
  const systemDark = useSyncExternalStore(subscribeSystem, getSystemSnapshot, () => false)
  const resolved: ResolvedTheme = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    applyTheme(preference)
  }, [preference, systemDark])

  useEffect(() => {
    const onExternal = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail
      if (isThemePreference(String(detail))) setPreferenceState(detail as ThemePreference)
    }
    window.addEventListener('portfolio-theme', onExternal)
    return () => window.removeEventListener('portfolio-theme', onExternal)
  }, [])

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // private mode / blocked storage
    }
    applyTheme(next)
  }, [])

  const cycle = useCallback(() => {
    setPreference(nextTheme(preference))
  }, [preference, setPreference])

  const value = useMemo(
    () => ({ preference, resolved, setPreference, cycle }),
    [preference, resolved, setPreference, cycle],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
