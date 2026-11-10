import type { HTMLAttributes, PointerEvent } from 'react'
import { cn } from '../../lib/cn'

interface SpotlightCardProps extends HTMLAttributes<HTMLElement> {
  as?: 'article' | 'div'
}

function trackPointer(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
  el.style.setProperty('--my', `${event.clientY - rect.top}px`)
}

export function SpotlightCard({ as: Tag = 'article', className, children, ...rest }: SpotlightCardProps) {
  return (
    <Tag className={cn('spotlight glass rounded-2xl', className)} onPointerMove={trackPointer} {...rest}>
      {children}
    </Tag>
  )
}
