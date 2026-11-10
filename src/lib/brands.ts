import { siDevpost, siGithub } from 'simple-icons'

export interface BrandMark {
  title: string
  hex: string
  path: string
}

// simple-icons dropped LinkedIn at LinkedIn's request in v11; this is the
// official "in" mark as it shipped in simple-icons@10.4.0 (24x24 viewBox).
export const linkedInMark: BrandMark = {
  title: 'LinkedIn',
  hex: '0A66C2',
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
}

export const gitHubMark: BrandMark = siGithub
export const devpostMark: BrandMark = siDevpost

function channel(value: number): number {
  const s = value / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(hex: string): number {
  const value = Number.parseInt(hex, 16)
  return (
    0.2126 * channel((value >> 16) & 255) +
    0.7152 * channel((value >> 8) & 255) +
    0.0722 * channel(value & 255)
  )
}

/**
 * Brand colours that fail WCAG's 3:1 non-text contrast on the current canvas
 * fall back to the primary text colour. Canvas luminance comes from --canvas-luminance.
 */
export function visibleBrandColor(hex: string): string {
  const root = typeof document !== 'undefined' ? document.documentElement : null
  const canvas = root
    ? Number.parseFloat(getComputedStyle(root).getPropertyValue('--canvas-luminance')) || 0.0027
    : 0.0027
  const luminance = relativeLuminance(hex)
  const lighter = Math.max(luminance, canvas)
  const darker = Math.min(luminance, canvas)
  const contrast = (lighter + 0.05) / (darker + 0.05)
  return contrast < 3 ? 'var(--color-mist)' : `#${hex}`
}
