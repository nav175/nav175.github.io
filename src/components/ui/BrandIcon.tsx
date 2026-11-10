import type { CSSProperties } from 'react'
import type { BrandMark } from '../../lib/brands'

interface BrandIconProps {
  mark: BrandMark
  className?: string
  style?: CSSProperties
}

export function BrandIcon({ mark, className, style }: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className} style={style}>
      <path d={mark.path} />
    </svg>
  )
}
