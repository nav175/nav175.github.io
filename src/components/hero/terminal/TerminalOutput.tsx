import type { ReactNode } from 'react'

const linkClass = 'text-mist underline decoration-overlay/25 underline-offset-[3px] transition-colors hover:decoration-mist'

export function Rows({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-0.5">{children}</div>
}

export function Row({ name, children }: { name: ReactNode; children: ReactNode }) {
  return (
    <>
      <span className="text-mist">{name}</span>
      <span className="text-fog">{children}</span>
    </>
  )
}

export function TermLink({ href, external = false, children }: { href: string; external?: boolean; children: ReactNode }) {
  return (
    <a href={href} className={linkClass} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  )
}
