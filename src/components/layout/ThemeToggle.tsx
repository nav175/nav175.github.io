import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import type { ThemePreference } from '../../lib/theme'
import { cn } from '../../lib/cn'

const icons: Record<ThemePreference, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function ThemeToggle({ className }: { className?: string }) {
  const { preference, cycle } = useTheme()
  const Icon = icons[preference]
  const next = preference === 'light' ? 'Dark' : preference === 'dark' ? 'System' : 'Light'
  const description = `Switch to ${next}`

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={description}
      title={description}
      className={cn(
        'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-fog',
        'transition-[color,background-color,border-color,transform] duration-200',
        'hover:border-overlay/25 hover:bg-overlay/[0.06] hover:text-mist active:scale-[0.97]',
        'sm:w-auto sm:gap-1.5 sm:px-2.5',
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="hidden text-[12.5px] font-medium tracking-[-0.01em] sm:inline">{next}</span>
    </button>
  )
}
