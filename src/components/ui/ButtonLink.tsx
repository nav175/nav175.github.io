import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ghost'
type Size = 'md' | 'sm'

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  external?: boolean
}

const variants: Record<Variant, string> = {
  primary: 'bg-mist text-ink shadow-[0_0_0_1px_rgb(var(--overlay)/0.12),0_10px_30px_-10px_rgb(var(--overlay)/0.28)] hover:opacity-90',
  ghost: 'border border-line-strong bg-overlay/[0.025] text-mist hover:border-overlay/25 hover:bg-overlay/[0.07]',
}

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-8 px-3.5 text-[13px]',
}

/** `className` is for layout only (margins, visibility variants); size and colour come from props. */
export function ButtonLink({
  variant = 'ghost',
  size = 'md',
  icon,
  external = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={cn(
        'group inline-flex items-center gap-2 rounded-full font-medium whitespace-nowrap',
        'transition-[background-color,border-color,box-shadow,transform,opacity] duration-200 ease-out active:scale-[0.97]',
        sizes[size],
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {external ? <span className="sr-only">(opens in a new tab)</span> : null}
    </a>
  )
}
