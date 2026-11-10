import { cn } from '../../lib/cn'

interface MonogramProps {
  size?: 'sm' | 'lg'
  className?: string
}

export function Monogram({ size = 'sm', className }: MonogramProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'monogram relative inline-grid shrink-0 place-items-center font-semibold text-mist select-none',
        size === 'sm' ? 'size-8 rounded-[9px] text-[12.5px] tracking-[-0.06em]' : 'size-11 rounded-xl text-base tracking-[-0.06em]',
        className,
      )}
    >
      NS
    </span>
  )
}
