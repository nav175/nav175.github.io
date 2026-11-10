import { useEffect, useState } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { FileText } from 'lucide-react'
import { profile } from '../../data/profile'
import { cn } from '../../lib/cn'
import { ButtonLink } from '../ui/ButtonLink'
import { Monogram } from '../ui/Monogram'
import { ThemeToggle } from './ThemeToggle'

const links = [
  { id: 'projects', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 12)
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) setActive('contact')
  })

  useEffect(() => {
    const targets = ['top', ...links.map((link) => link.id)]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) setActive(entry.target.id === 'top' ? null : entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-300',
        scrolled ? 'border-line bg-ink/75 backdrop-blur-xl backdrop-saturate-150' : 'border-transparent',
      )}
    >
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3 rounded-[10px]" aria-label={`${profile.name}, back to top`}>
          <Monogram />
          <span className="hidden text-[14.5px] font-medium tracking-[-0.01em] text-mist sm:inline">{profile.name}</span>
        </a>

        <div className="flex items-center gap-2">
          <ul className="flex items-center">
            {links.map((link) => {
              const current = active === link.id
              return (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    aria-current={current ? 'true' : undefined}
                    className={cn(
                      'relative block rounded-full px-2 py-1.5 text-[13.5px] transition-colors duration-200 sm:px-3',
                      current ? 'text-mist' : 'text-fog hover:text-mist',
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-x-2 -bottom-4 h-px bg-mist transition-opacity duration-300 sm:inset-x-3',
                        current ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </a>
                </li>
              )
            })}
          </ul>
          <ThemeToggle />
          <ButtonLink
            href={profile.links.resume}
            external
            size="sm"
            icon={<FileText className="size-3.5" aria-hidden="true" />}
            className="max-md:hidden"
          >
            Resume
          </ButtonLink>
        </div>
      </nav>
    </header>
  )
}
