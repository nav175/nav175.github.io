import type { ReactNode } from 'react'
import { ArrowUp, ArrowUpRight, Check, Copy, FileText, MapPin } from 'lucide-react'
import { profile } from '../../data/profile'
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import { devpostMark, gitHubMark, linkedInMark } from '../../lib/brands'
import { BrandIcon } from '../ui/BrandIcon'
import { Monogram } from '../ui/Monogram'
import { Reveal } from '../ui/Reveal'

const contactLinks: { label: string; href: string; icon: ReactNode }[] = [
  { label: 'GitHub', href: profile.links.github, icon: <BrandIcon mark={gitHubMark} className="size-4" /> },
  { label: 'LinkedIn', href: profile.links.linkedin, icon: <BrandIcon mark={linkedInMark} className="size-4" /> },
  { label: 'Devpost', href: profile.links.devpost, icon: <BrandIcon mark={devpostMark} className="size-4" /> },
  { label: 'Resume', href: profile.links.resume, icon: <FileText className="size-4" aria-hidden="true" /> },
]

function EmailPill() {
  const { status, copy } = useCopyToClipboard()
  return (
    <div className="glass flex w-full max-w-md items-center gap-2 rounded-full p-1.5 pl-5 sm:w-auto">
      <a
        href={`mailto:${profile.email}`}
        className="min-w-0 flex-1 truncate font-mono text-[13px] text-mist underline-offset-4 hover:underline sm:text-[14px]"
      >
        {profile.email}
      </a>
      <button
        type="button"
        onClick={() => void copy(profile.email)}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-mist px-3.5 text-[13px] font-medium text-ink transition-[background-color,transform] duration-200 hover:opacity-90 active:scale-[0.97]"
      >
        {status === 'copied' ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        {status === 'copied' ? 'Copied' : 'Copy'}
        <span className="sr-only"> email address</span>
      </button>
      <span role="status" className="sr-only">
        {status === 'copied' ? 'Email address copied to clipboard' : status === 'failed' ? 'Could not copy the email address' : ''}
      </span>
    </div>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="contact" aria-labelledby="contact-title" className="relative overflow-hidden border-t border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[min(56rem,100%)] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(var(--glow)/0.06),transparent)]"
      />
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-10 sm:px-8 lg:pt-24">
        <Reveal className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16">
          <div>
            <h2
              id="contact-title"
              className="text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.04em] text-balance text-mist sm:text-5xl"
            >
              Have a role or a project in mind?
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-pretty text-fog">
              I’m looking for software engineering internships and new-grad roles. Email is the fastest way to reach me.
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <EmailPill />
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex h-9 items-center gap-2 rounded-full border border-line-strong bg-overlay/[0.02] px-3.5 text-[13px] font-medium text-fog transition-[color,background-color,border-color] duration-200 hover:border-overlay/25 hover:bg-overlay/[0.06] hover:text-mist"
                  >
                    {link.icon}
                    {link.label}
                    <ArrowUpRight
                      className="size-3.5 opacity-60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="mt-20 flex flex-col gap-5 border-t border-line pt-6 text-[13px] text-smoke sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Monogram />
            <span>
              © {year} {profile.name}
            </span>
          </div>
          <p className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" aria-hidden="true" />
            {profile.location}
          </p>
          <a href="#top" className="group inline-flex items-center gap-1.5 self-start transition-colors hover:text-mist sm:self-auto">
            Back to top
            <ArrowUp className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
