export const THEME_STORAGE_KEY = 'portfolio-theme'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_CYCLE: ThemePreference[] = ['light', 'dark', 'system']

export function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemePreference(stored)) return stored
  } catch {
    // private mode / blocked storage
  }
  return 'light'
}

export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return preference
}

/** Point the tab icon at the light or dark mark. Filenames share the `favicon-light` / `favicon-dark` token. */
export function syncFavicon(resolved: ResolvedTheme) {
  const tone = resolved === 'dark' ? 'dark' : 'light'
  document.querySelectorAll<HTMLLinkElement>('link[data-favicon]').forEach((link) => {
    const href = link.getAttribute('href')
    if (!href) return
    const next = href.replace(/favicon-(light|dark)/, `favicon-${tone}`)
    if (next !== href) link.setAttribute('href', next)
  })
}

export function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference)
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
  root.dataset.theme = preference
  syncFavicon(resolved)
}

export function nextTheme(current: ThemePreference): ThemePreference {
  const index = THEME_CYCLE.indexOf(current)
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length]
}
